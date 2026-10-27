// ============================================================================
// SPACE MONOPOLY PORT — DIALOG LAYER (dialogs.ts) — rev 1
// Extracted from renderer.ts rev 12 (reorganization only; no behavior
// change). Contains ALL modal/dialog presentation + modal queue + dialog CSS.
// Rationale/history: RENDERER-NOTES.md. Scaffold untouched.
// ============================================================================

import type {
  AppState,
  GridType,
  GameType,
  CompanyInfoView,
  FinalStandings,
  Money,
  ScoreRecord,
  Prefs,
} from './scaffold';
import {
  CLASSIC,
  TOURNAMENT,
  SMALL,
  MEDIUM,
  LARGE,
  NUM_COMPANIES,
  GRID_CONFIGS,
  CurrencyUnit,
  getGame,
  companyInfo,
  playerDetailsView,
  highScores,
  openPreferencesDraft,
  savePreferences,
  startGame,
  buyShares,
  sellShares,
  buyMaxShares,
  sellAllShares,
} from './scaffold';

const MAX_PLAYERS = 6; // R6 (renderer-layer limit)

// R15 view-model rows: per-player table content for split/merger dialogs,
// captured EAGERLY in renderer.ts's actionHooks (queued-modal safety);
// presented here.
export interface SplitTableRow {
  playerIndex: number;
  name: string;
  sharesBefore: Money;
  sharesAfter: Money;
}
export interface MergerTableRow {
  playerIndex: number;
  name: string;
  absorbedShares: Money;  // shares in the absorbed company (never zeroed — zombie quirk)
  survivorShares: Money;  // post-conversion holding in the survivor (CLASSIC)
  moneyEarned: Money;     // payout = absorbed shares × pre-merger absorbed value
}

// ============================================================================
// DIALOG CSS — modal/toast/tab classes (rev-3 FIX:[modal-inheritance] rules:
// modals live on document.body, outside .sm-root, so declare own styles).
// Injected by the host (renderer.ts) via injectDialogStyles().
// ============================================================================

const DIALOG_CSS = `
.sm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center; z-index: 100; }
.sm-modal { background: #23233a; border: 1px solid #5a5a85; border-radius: 8px;
  padding: 18px; min-width: 320px; max-width: 520px; max-height: 80vh; overflow: auto;
  color: #e8e8f2; font-family: 'Segoe UI', system-ui, sans-serif; }
.sm-modal button { background: #2a2a44; color: #e8e8f2;
  border: 1px solid #4a4a6a; border-radius: 4px; padding: 4px 12px; cursor: pointer; }
.sm-modal button:disabled { opacity: 0.4; cursor: default; }
.sm-modal h3 { margin: 0 0 10px 0; }
.sm-modal table { border-collapse: collapse; margin: 8px 0; }
.sm-modal td, .sm-modal th { border: 1px solid #4a4a6a; padding: 4px 10px;
  text-align: left; font-size: 13px; }
.sm-modal input[type=text] { background: #14141f; color: #e8e8f2;
  border: 1px solid #4a4a6a; border-radius: 4px; padding: 4px 8px; width: 140px; }
.sm-modal .sm-row { display: flex; gap: 8px; align-items: center; margin: 6px 0;
  flex-wrap: wrap; }
.sm-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.sm-status { color: #ff9a9a; font-size: 13px; min-height: 18px; }
.sm-toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
  background: #2e2e52; border: 1px solid #6a6aa0; border-radius: 6px; padding: 10px 18px;
  z-index: 200; box-shadow: 0 4px 16px rgba(0,0,0,0.5);
  color: #e8e8f2; font-family: 'Segoe UI', system-ui, sans-serif; }
.sm-hint { font-size: 12px; color: #7a7aa0; }
.sm-splitbanner { display: flex; align-items: center; gap: 10px; margin: 8px 0;
  flex-wrap: wrap; }
.sm-splitbanner .sm-swatch { width: 18px; height: 18px; }
/* FIDELITY:[highscores-tabs] (rev 12): tab strip approximating the orig
   3-grid PageControl; new-entry rows tinted (orig used row selection). */
.sm-tabs { display: flex; gap: 4px; margin: 8px 0; }
.sm-tabs button { background: #1d1d30; color: #9a9ac0;
  border: 1px solid #3a3a58; border-radius: 4px 4px 0 0; padding: 4px 14px;
  cursor: pointer; }
.sm-tabs button.sm-tabactive { background: #2a2a44; color: #e8e8f2;
  border-color: #5a5a85; font-weight: 600; }
.sm-tabs button:focus { outline: none; }
tr.sm-newentry { background: #2e2e52; font-weight: 700; }
`;

export function injectDialogStyles(): void {
  const style = el('style');
  style.textContent = DIALOG_CSS;
  document.head.appendChild(style);
}

// ============================================================================
// SHARED DOM HELPER (exported — renderer.ts chrome reuses it)
// ============================================================================

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

// ============================================================================
// MODAL WRAPPER + QUEUE (moved from renderer.ts; mechanics unchanged)
// ============================================================================

function modal(content: HTMLElement): () => void {
  const overlay = el('div', 'sm-overlay');
  const box = el('div', 'sm-modal');
  box.appendChild(content);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  return () => overlay.remove();
}

// Sequential modal presentation for game-event announcements. Our modals
// are non-blocking DOM overlays (the orig ShowModal() halted everything);
// queueing preserves "one at a time" if multiple events fire inside a
// single action() (mergers can chain; a merger can trigger a split).
// REV-6 CONTRACT (FIX:[splitdialog-close]): the open() callback receives a
// release() that MUST be called when the dialog closes; callers pair it
// with their own overlay dismissal — dismiss the overlay FIRST, THEN call
// release(). Discarding the modal() return value wedges the queue.
export function queueModal(open: (release: () => void) => void): void {
  modalQueue.push(open);
  pumpQueue();
}

let modalQueue: Array<(release: () => void) => void> = [];
let queueActive = false;

function pumpQueue(): void {
  if (queueActive || modalQueue.length === 0) return;
  queueActive = true;
  const open = modalQueue.shift()!;
  open(() => {
    queueActive = false;
    pumpQueue();
  });
}

// ============================================================================
// DIALOGS — free functions; receive state, formatMoney, and app callbacks
// via parameters. SpaceMonopolyApp methods (renderer.ts) delegate here.
// ============================================================================

// --- Generic boxes -----------------------------------------------------------

export function msgBox(title: string, text: string): void {
  const box = el('div');
  box.appendChild(el('h3', undefined, title));
  box.appendChild(el('div', undefined, text));
  const actions = el('div', 'sm-actions');
  const ok = el('button', undefined, 'OK');
  actions.appendChild(ok);
  box.appendChild(actions);
  const close = modal(box);
  ok.addEventListener('click', close);
}

export function toast(text: string): void {
  const t = el('div', 'sm-toast', text);
  document.body.appendChild(t);
  window.setTimeout(() => t.remove(), 2500);
}

// --- Event announcements (queued; FIDELITY:[comform/splitform/mergerform-modal]) ---

// FIDELITY:[comform-modal] — orig NewCom modal: company name, starting
// share price, founder's grant. On dismissal, orig immediately opens
// Info(i) — the trade dialog for the new company — chained via onDismiss.
export function foundingDialog(
  state: AppState,
  companyId: number,
  formatMoney: (amount: bigint) => string,
  onDismiss?: () => void,
): void {
  queueModal((release) => {
    const s = state;
    const c = s.company[companyId];
    const founder = s.player[s.curplay];
    const box = el('div');
    box.appendChild(el('h3', undefined, 'New Company'));

    const banner = el('div', 'sm-splitbanner');
    const swatch = el('span', 'sm-swatch');
    swatch.style.background = c.color;
    banner.appendChild(swatch);
    banner.appendChild(el('strong', undefined, c.name));
    box.appendChild(banner);

    box.appendChild(el('div', undefined,
      `The new company's name is ${c.name}.`));
    box.appendChild(el('div', undefined,
      `The shares will start at ${formatMoney(BigInt(c.value))} each.`));
    box.appendChild(el('div', undefined,
      `${founder.name} will get five free shares in the company and ` +
      `${formatMoney(BigInt(c.value))}.`));

    const actions = el('div', 'sm-actions');
    const ok = el('button', undefined, 'OK');
    actions.appendChild(ok);
    box.appendChild(actions);

    const dismiss = modal(box);
    ok.addEventListener('click', () => {
      dismiss();
      release();
      onDismiss?.(); // orig: NewCom->ShowModal(); then Info(i);
    });
  });
}

// FIDELITY:[splitform-modal] — orig SplitForm dialog announcing a 2-for-1
// split, with the orig per-player ListView restored (R15): one row per
// player — name / shares before / shares after — populated over the same
// range the orig loops (CLASSIC: all players; TOURNAMENT: current only).
// Rows are EAGER-CAPTURED in renderer.ts's actionHooks (queued-modal
// safety); only presentation lives here.
export function splitDialog(
  state: AppState,
  companyId: number,
  oldPrice: number,
  rows: SplitTableRow[],
  formatMoney: (amount: bigint) => string,
): void {
  queueModal((release) => {
    const s = state;
    const c = s.company[companyId];
    const box = el('div');
    box.appendChild(el('h3', undefined, 'Stock Split!'));

    const banner = el('div', 'sm-splitbanner');
    const swatch = el('span', 'sm-swatch');
    swatch.style.background = c.color;
    banner.appendChild(swatch);
    banner.appendChild(el('strong', undefined, c.name));
    box.appendChild(banner);

    box.appendChild(el('div', undefined,
      `${c.name}\u2019s value has reached ${formatMoney(BigInt(oldPrice))}. ` +
      'The company has split its stock 2-for-1:'));
    box.appendChild(el('div', undefined,
      `\u2022 Share price: ${formatMoney(BigInt(oldPrice))} \u2192 ` +
      `${formatMoney(BigInt(c.value))}`));

    // R15: orig SplitForm ListView — name / shares before / shares after.
    const table = el('table');
    const head = el('tr');
    for (const h of ['Player', 'Shares before', 'Shares after']) {
      head.appendChild(el('th', undefined, h));
    }
    table.appendChild(head);
    for (const r of rows) {
      const tr = el('tr');
      if (r.playerIndex === s.curplay) tr.style.fontWeight = '700';
      tr.appendChild(el('td', undefined, r.name));
      tr.appendChild(el('td', undefined, r.sharesBefore.toString()));
      tr.appendChild(el('td', undefined, r.sharesAfter.toString()));
      table.appendChild(tr);
    }
    box.appendChild(table);

    // FIX:[tournament-doubling-hint]: mode-aware doubling note.
    box.appendChild(el('div', 'sm-hint',
      s.gameType === TOURNAMENT
        ? 'Only the current player\u2019s shares are doubled in Tournament (original behavior).'
        : 'All shareholders have had their share counts doubled.'));

    const actions = el('div', 'sm-actions');
    const ok = el('button', undefined, 'OK');
    actions.appendChild(ok);
    box.appendChild(actions);

    const dismiss = modal(box);
    ok.addEventListener('click', () => {
      dismiss();  // remove the overlay from the DOM...
      release();  // ...then free the queue for the next dialog
    });
  });
}

// FIDELITY:[mergerform-modal] — orig Merger form dialog with the per-player
// ListView restored (R15): one row per player — name / shares in the
// absorbed company / shares in the survivor / money earned — over the same
// range the orig loops (CLASSIC: all players; TOURNAMENT: current only).
// Row data is captured in renderer.ts's merger hook (mutation-before-
// display, eager capture for queued-modal safety); only presentation here.
export function mergerDialog(
  state: AppState,
  survivorId: number,
  absorbedId: number,
  oldSurvivorValue: number,
  absorbedValue: number,
  rows: MergerTableRow[],
  formatMoney: (amount: bigint) => string,
): void {
  queueModal((release) => {
    const s = state;
    const survivor = s.company[survivorId];
    const absorbed = s.company[absorbedId];
    const box = el('div');
    box.appendChild(el('h3', undefined, 'Merger!'));

    // Absorbed banner (struck-through name to signal it's gone).
    const banner = el('div', 'sm-splitbanner');
    const swAb = el('span', 'sm-swatch');
    swAb.style.background = absorbed.color;
    const abName = el('strong', undefined, absorbed.name);
    abName.style.textDecoration = 'line-through';
    banner.appendChild(swAb);
    banner.appendChild(abName);
    banner.appendChild(el('span', undefined, 'has been taken over by'));
    box.appendChild(banner);
    const banner2 = el('div', 'sm-splitbanner');
    const swSv = el('span', 'sm-swatch');
    swSv.style.background = survivor.color;
    banner2.appendChild(swSv);
    banner2.appendChild(el('strong', undefined, survivor.name));
    box.appendChild(banner2);

    const combined = el('div', 'sm-row');
    combined.appendChild(el('span', undefined, 'Combined value:'));
    combined.appendChild(el('strong', undefined,
      `${formatMoney(BigInt(oldSurvivorValue))} + ` +
      `${formatMoney(BigInt(absorbedValue))} = ` +
      `${formatMoney(BigInt(survivor.value))}`));
    box.appendChild(combined);

    // R15: orig Merger ListView — name / shares in A / shares in B /
    // money earned (A = absorbed, B = survivor).
    const table = el('table');
    const head = el('tr');
    for (const h of ['Player', `Shares in ${absorbed.name}`, `Shares in ${survivor.name}`, 'Money earned']) {
      head.appendChild(el('th', undefined, h));
    }
    table.appendChild(head);
    for (const r of rows) {
      const tr = el('tr');
      if (r.playerIndex === s.curplay) tr.style.fontWeight = '700';
      tr.appendChild(el('td', undefined, r.name));
      tr.appendChild(el('td', undefined, r.absorbedShares.toString()));
      tr.appendChild(el('td', undefined, r.survivorShares.toString()));
      tr.appendChild(el('td', undefined, formatMoney(r.moneyEarned)));
      table.appendChild(tr);
    }
    box.appendChild(table);

    if (s.gameType === TOURNAMENT) {
      // QUIRK tournament-no-conversion: TOURNAMENT payouts without
      // conversion — surfaced rather than hidden.
      box.appendChild(el('div', 'sm-hint',
        'Tournament: shares are not converted \u2014 only the cash payout occurs (original behavior).'));
    }

    box.appendChild(el('div', 'sm-hint',
      `${absorbed.name} no longer exists; its squares now belong to ` +
      `${survivor.name}.`));

    const actions = el('div', 'sm-actions');
    const ok = el('button', undefined, 'OK');
    actions.appendChild(ok);
    box.appendChild(actions);

    const dismiss = modal(box);
    ok.addEventListener('click', () => {
      dismiss();
      release();
    });
  });
}

// --- New Game (Players.cpp flow) ----------------------------------------------

// Callbacks supplied by renderer.ts's SpaceMonopolyApp:
//   setGridSize: app's setGridSize (geometry + randomise + redraw)
//   onGameStarted: reset of app-private concluded flag
//   redrawGrid / moneyShow / mainUpdate / beginTurnChoices: app methods
// Go! order preserved verbatim from rev 12: setGridSize (only if size
// actually changed — FIX:[gosame-size-nowipe]) → startGame → concluded
// reset → close → redraw → moneyShow → mainUpdate → beginTurnChoices.
export interface NewGameDialogCallbacks {
  setGridSize(t: GridType): void;
  onGameStarted(): void;
  redrawGrid(): void;
  moneyShow(): void;
  mainUpdate(): void;
  beginTurnChoices(): void;
}

export function newGameDialog(
  state: AppState,
  cb: NewGameDialogCallbacks,
): void {
  const s = state;
  const box = el('div');
  box.appendChild(el('h3', undefined, 'New Game'));

  const nameInputs: HTMLInputElement[] = [];
  const listWrap = el('div');
  const addName = (value: string): void => {
    const row = el('div', 'sm-row');
    const inp = el('input') as HTMLInputElement;
    inp.type = 'text';
    inp.value = value;
    nameInputs.push(inp);
    row.appendChild(inp);
    const del = el('button', undefined, '\u2212');
    del.addEventListener('click', () => {
      if (nameInputs.length > 1) {
        nameInputs.splice(nameInputs.indexOf(inp), 1);
        row.remove();
      }
    });
    row.appendChild(del);
    listWrap.appendChild(row);
  };
  addName('Player 1');
  addName('Player 2');
  box.appendChild(listWrap);

  const addBtn = el('button', undefined, '+ Add player');
  addBtn.addEventListener('click', () => {
    if (nameInputs.length < MAX_PLAYERS) addName(`Player ${nameInputs.length + 1}`);
  });
  box.appendChild(addBtn);

  const modeRow = el('div', 'sm-row');
  const modeSel = el('select');
  for (const [label, v] of [['Classic', CLASSIC], ['Tournament', TOURNAMENT]] as Array<[string, number]>) {
    const opt = el('option', undefined, label);
    opt.value = String(v);
    modeSel.appendChild(opt);
  }
  modeRow.appendChild(el('span', undefined, 'Mode:'));
  modeRow.appendChild(modeSel);
  box.appendChild(modeRow);

  const sizeRow = el('div', 'sm-row');
  const sizeSel = el('select');
  for (const t of [SMALL, MEDIUM, LARGE] as GridType[]) {
    const cfg = GRID_CONFIGS[t];
    const opt = el('option', undefined, `${cfg.xsize}\u00d7${cfg.ysize}`); // R9
    opt.value = String(t);
    sizeSel.appendChild(opt);
    if (t === s.gridType) sizeSel.value = String(t);
  }
  sizeRow.appendChild(el('span', undefined, 'Grid:'));
  sizeRow.appendChild(sizeSel);
  box.appendChild(sizeRow);

  const status = el('div', 'sm-status');
  const actions = el('div', 'sm-actions');
  const go = el('button', undefined, 'Go!');
  const cancel = el('button', undefined, 'Cancel');
  actions.appendChild(go);
  actions.appendChild(cancel);
  box.appendChild(status);
  box.appendChild(actions);

  const close = modal(box);
  cancel.addEventListener('click', close);

  go.addEventListener('click', () => {
    const names = nameInputs
      .map((inp, i) => inp.value.trim() || `Player ${i + 1}`)
      .slice(0, MAX_PLAYERS);
    if (names.length < 1) {
      status.textContent = 'At least one player required.';
      return;
    }
    // FIDELITY: orig grid-size MENU and New Game are independent —
    // a new game at the SAME size works with the board as it stands
    // (circles preserved; see scaffold startGame). Only a genuine
    // size CHANGE re-geometries + randomises (orig setGridSize).
    const chosen = Number(sizeSel.value) as GridType;
    if (chosen !== s.gridType) {
      cb.setGridSize(chosen);
    }
    startGame(s, names, Number(modeSel.value) as 0 | 1);
    cb.onGameStarted(); // renderer: this.concluded = false
    close();
    cb.redrawGrid();
    cb.moneyShow();
    cb.mainUpdate();
    cb.beginTurnChoices();
  });
}

// --- Trade dialog (ComInfoForm.cpp flow) --------------------------------------

export function tradeDialog(
  state: AppState,
  startCom: number,
  formatMoney: (amount: bigint) => string,
  redrawGrid: () => void,
  moneyShow: () => void,
): void {
  const s = state;
  let com = startCom;

  const box = el('div');
  const title = el('h3');
  const infoLines = el('div');
  const status = el('div', 'sm-status');

  const amountInput = el('input') as HTMLInputElement;
  amountInput.type = 'text';
  amountInput.placeholder = 'amount';

  const actions = el('div', 'sm-actions');
  const prev = el('button', undefined, '\u2039');
  const next = el('button', undefined, '\u203a');
  const buy = el('button', undefined, 'Buy');
  const sell = el('button', undefined, 'Sell');
  const buyMax = el('button', undefined, 'Buy Max');
  const sellAll = el('button', undefined, 'Sell All');
  const closeBtn = el('button', undefined, 'Close');
  actions.appendChild(prev);
  actions.appendChild(next);
  actions.appendChild(buy);
  actions.appendChild(sell);
  actions.appendChild(buyMax);
  actions.appendChild(sellAll);
  actions.appendChild(closeBtn);

  box.appendChild(title);
  box.appendChild(infoLines);
  const amtRow = el('div', 'sm-row');
  amtRow.appendChild(el('span', undefined, 'Shares:'));
  amtRow.appendChild(amountInput);
  box.appendChild(amtRow);
  box.appendChild(status);
  box.appendChild(actions);

  const close = modal(box);
  closeBtn.addEventListener('click', close);

  // InfoButs (orig): trading buttons disabled while the five selection
  // squares are shown (Enabled = !sels). Dialog is modal, so sels cannot
  // change while it is open (matches orig Main->Enabled=false).
  const gated = s.sels;
  buy.disabled = gated;
  sell.disabled = gated;
  buyMax.disabled = gated;
  sellAll.disabled = gated;

  const refresh = (): void => {
    const view: CompanyInfoView = companyInfo(s, com);
    const c = s.company[com];
    title.textContent = c.name;
    const shareWord = view.sharesOwned === 1n ? 'share' : 'shares';
    const major = view.majorShareholder
      ? `${s.player[view.majorShareholder.playerIndex].name} (${view.majorShareholder.shares})`
      : 'Nobody.';
    infoLines.textContent = '';
    const rows: Array<[string, string]> = [
      ['Share price', formatMoney(BigInt(view.value))],
      ['You own', `${view.sharesOwned} ${shareWord}`],
      ['Max buyable', view.maxbuy.toString()],
      ['Size', `${view.sizeSquares} ${view.sizeSquares === 1 ? 'square' : 'squares'}`],
      ['Major shareholder', major],
    ];
    for (const [k, v] of rows) {
      const r = el('div', 'sm-row');
      r.appendChild(el('span', undefined, `${k}:`));
      const val = el('strong', undefined, v);
      r.appendChild(val);
      infoLines.appendChild(r);
    }
    if (gated) {
      const note = el('div', 'sm-hint',
        'Trading is locked until you place this turn\u2019s piece.');
      infoLines.appendChild(note);
    }
    amountInput.value = '';
    status.textContent = '';
    moneyShow(); // companyInfo refreshed state.maxbuy
  };
  refresh();

  // BitBtn4/BitBtn5: cycle to prev/next EXISTING company (goto redo).
  const gotoCom = (dir: number): void => {
    for (let k = 1; k <= NUM_COMPANIES; k++) {
      const c = (com + dir * k + NUM_COMPANIES * 2) % NUM_COMPANIES;
      if (s.company[c].exist) {
        com = c;
        refresh();
        return;
      }
    }
  };
  prev.addEventListener('click', () => gotoCom(-1));
  next.addEventListener('click', () => gotoCom(1));

  const parseAmount = (): bigint | null => {
    const t = amountInput.value.trim();
    if (!/^\d+$/.test(t)) {
      status.textContent = 'Enter a whole number of shares.';
      return null;
    }
    return BigInt(t); // large(text) equivalent
  };

  buy.addEventListener('click', () => {
    const amt = parseAmount();
    if (amt === null) return;
    if (!buyShares(s, com, amt)) {
      status.textContent =
        `You can't buy that many shares you fraudster (1 \u2013 ${s.maxbuy}).`;
      return;
    }
    refresh();
    redrawGrid();
  });
  sell.addEventListener('click', () => {
    const amt = parseAmount();
    if (amt === null) return;
    if (!sellShares(s, com, amt)) {
      status.textContent =
        `You can't sell that many shares you fraudster (1 \u2013 ${s.player[s.curplay].shares[com]}).`;
      return;
    }
    refresh();
    redrawGrid();
  });
  buyMax.addEventListener('click', () => {
    buyMaxShares(s, com);
    refresh();
    moneyShow();
    redrawGrid();
  });
  sellAll.addEventListener('click', () => {
    sellAllShares(s, com);
    refresh();
    moneyShow();
    redrawGrid();
  });
}

// --- Player details (ListBox1DblClick / playerDetailsView) ---------------------

export function detailsDialog(
  state: AppState,
  pnum: number,
  formatMoney: (amount: bigint) => string,
): void {
  // Gating: detailsSet() TRUE means details hidden (info box instead).
  if (getGame().getPrefs().detailsSet()) {
    msgBox('Game Details',
      'Player details are hidden due to the preferences set for this game...');
    return;
  }
  const view = playerDetailsView(state, pnum);
  const box = el('div');
  box.appendChild(el('h3', undefined, `Details of ${view.name}`));
  const table = el('table');
  const head = el('tr');
  for (const h of ['Company', 'Shares', 'Worth']) head.appendChild(el('th', undefined, h));
  table.appendChild(head);
  for (const row of view.rows) {
    const tr = el('tr');
    tr.appendChild(el('td', undefined, row.name));
    tr.appendChild(el('td', undefined, row.shares.toString()));
    tr.appendChild(el('td', undefined, formatMoney(row.worth)));
    table.appendChild(tr);
  }
  box.appendChild(table);
  // QUIRK zombie-exclusion: EXISTING companies only — may legitimately
  // disagree with Total()/high-score wealth. Faithful.
  box.appendChild(el('div', 'sm-hint',
    'Existing companies only (zombie shares excluded \u2014 original behavior).'));
  const rows: Array<[string, string]> = [
    ['Money', formatMoney(view.money)],
    ['Share wealth', formatMoney(view.shareWealth)],
    ['Net wealth', formatMoney(view.netWealth)],
  ];
  for (const [k, v] of rows) {
    const r = el('div', 'sm-row');
    r.appendChild(el('span', undefined, `${k}:`));
    r.appendChild(el('strong', undefined, v));
    box.appendChild(r);
  }
  const actions = el('div', 'sm-actions');
  const ok = el('button', undefined, 'Dismiss');
  actions.appendChild(ok);
  box.appendChild(actions);
  const close = modal(box);
  ok.addEventListener('click', close);
}

// --- Preferences (draft-commit flow; orig Preferences.cpp) -----------------------

export function prefsDialog(
  moneyShow: () => void,
  storage: Storage,
  key: string,
): void {
  const draft = openPreferencesDraft();
  const box = el('div');
  box.appendChild(el('h3', undefined, 'Preferences'));

  const unitRow = el('div', 'sm-row');
  unitRow.appendChild(el('span', undefined, 'Currency unit:'));
  const unitInput = el('input') as HTMLInputElement;
  unitInput.type = 'text';
  unitInput.maxLength = 3; // R11: renderer validation (orig lacks it)
  unitInput.value = draft.getCurrencyUnit().getUnit();
  unitRow.appendChild(unitInput);
  const prefixSel = el('select');
  const optPre = el('option', undefined, 'Prefix (\u00A3500)');
  const optPost = el('option', undefined, 'Postfix (500\u00A3)');
  optPre.value = '1';
  optPost.value = '0';
  prefixSel.appendChild(optPre);
  prefixSel.appendChild(optPost);
  prefixSel.value = draft.getCurrencyUnit().isPrefix() ? '1' : '0';
  unitRow.appendChild(prefixSel);
  box.appendChild(unitRow);

  const mkCheck = (label: string, checked: boolean): HTMLInputElement => {
    const row = el('div', 'sm-row');
    const cb = el('input') as HTMLInputElement;
    cb.type = 'checkbox';
    cb.checked = checked;
    row.appendChild(cb);
    row.appendChild(el('span', undefined, label));
    box.appendChild(row);
    return cb;
  };
  const mergers = mkCheck('Force mergers', draft.mergersSet());
  const expansion = mkCheck('Force expansion', draft.expansionSet());
  const details = mkCheck('Hide details', draft.detailsSet());
  const companies = mkCheck('Allow creation', draft.companiesSet());

  // RENDERER SPEC (orig forceExpansionClick): allowCreation disabled
  // unless forceExpansion is checked.
  const syncCompanies = (): void => {
    companies.disabled = !expansion.checked;
  };
  expansion.addEventListener('change', syncCompanies);
  syncCompanies();

  const status = el('div', 'sm-status');
  const actions = el('div', 'sm-actions');
  const save = el('button', undefined, 'Save');
  const cancel = el('button', undefined, 'Cancel');
  actions.appendChild(save);
  actions.appendChild(cancel);
  box.appendChild(status);
  box.appendChild(actions);

  const close = modal(box);
  cancel.addEventListener('click', close); // Cancel = discard draft (no-op net)

  save.addEventListener('click', () => {
    const unit = unitInput.value.trim();
    if (unit.length < 1 || unit.length > 3) {
      status.textContent = 'Currency unit must be 1\u20133 characters.';
      return;
    }
    draft.setCurrencyUnit(new CurrencyUnit(unit, prefixSel.value === '1'));
    draft.setMergers(mergers.checked);
    draft.setExpansion(expansion.checked);
    draft.setDetails(details.checked);
    draft.setCompanies(companies.checked);
    // R8 faithful-dead: writes but nothing loads it (QUIRK prefs-half-wired).
    savePreferences(draft, storage, key);
    moneyShow();
    close();
  });
}

// --- High Scores (FIDELITY:[highscores-tabs], R16 RETIRED) ----------------------

// Shared tabbed presentation (orig 3-grid PageControl equivalent). Used by
// BOTH the standalone High Scores menu dialog and the end-of-game second
// modal; the current grid's tab is ACTIVATED on entry (orig behavior on
// insert). New entries are bold + row-tinted (orig used row selection).
export function scoresTableDialog(
  scores: ScoreRecord[][],
  gridType: GridType,
  formatMoney: (amount: bigint) => string,
): void {
  const box = el('div');
  box.appendChild(el('h3', undefined, 'High Scores'));

  const labels = ['Small (16\u00d712)', 'Medium (22\u00d718)', 'Large (28\u00d724)'];

  // Tab strip.
  const tabs = el('div', 'sm-tabs');
  const tabBtns: HTMLButtonElement[] = [];

  // Tab body — rebuilt on switch.
  const tabBody = el('div');
  const renderTable = (t: number): void => {
    tabBody.textContent = '';
    const table = el('table');
    for (let j = 0; j < scores[t].length; j++) {
      const rec = scores[t][j];
      const tr = el('tr');
      if (rec.newEntry) tr.className = 'sm-newentry';
      tr.appendChild(el('td', undefined, `${j + 1}.`));
      tr.appendChild(el('td', undefined, rec.name));
      tr.appendChild(el('td', undefined, formatMoney(rec.wealth)));
      table.appendChild(tr);
    }
    tabBody.appendChild(table);
    for (let i = 0; i < tabBtns.length; i++) {
      tabBtns[i].className = i === t ? 'sm-tabactive' : '';
    }
  };

  for (let t = 0; t < scores.length; t++) {
    const tab = el('button', undefined, labels[t]);
    tab.addEventListener('click', () => renderTable(t));
    tabs.appendChild(tab);
    tabBtns.push(tab);
  }
  box.appendChild(tabs);
  box.appendChild(tabBody);

  const actions = el('div', 'sm-actions');
  const ok = el('button', undefined, 'Close');
  actions.appendChild(ok);
  box.appendChild(actions);
  const close = modal(box);
  ok.addEventListener('click', close);

  // Orig PageControl activates the CURRENT grid's tab (on insert, and
  // by extension when viewing); render it initially.
  renderTable(gridType);
}

// Standalone High Scores menu dialog — same tabbed presentation.
// (highScores(insert=false) still SAVES unconditionally — orig
// unconditional SaveScores; defaults materialize on disk.)
export function scoresDialog(
  state: AppState,
  formatMoney: (amount: bigint) => string,
  storage: Storage,
  key: string,
): void {
  const scores = highScores(state, false, storage, key);
  scoresTableDialog(scores, state.gridType, formatMoney);
}

// --- Final standings (orig OverForm Finish) ------------------------------------

// FIDELITY:[highscores-modal] (rev 12): orig end-of-game sequence is
// Finish() → GameOver modal → HighScores(true) modal — two sequential
// dialogs. onClose chains the high-scores second modal.
export function standingsDialog(
  st: FinalStandings,
  formatMoney: (amount: bigint) => string,
  onClose?: () => void,
): void {
  const box = el('div');
  box.appendChild(el('h3', undefined, 'Game Over'));
  const intro = el('div');
  intro.textContent =
    `Turn ${st.turn} \u2014 biggest company: ${st.biggestCompany.name} ` +
    `(${st.biggestCompany.size} squares). `;
  box.appendChild(intro);
  const winner = el('div', 'sm-row');
  winner.appendChild(el('strong', undefined,
    `Winner: ${st.winner.name} \u2014 ${formatMoney(st.winner.netWealth)}`));
  box.appendChild(winner);

  const table = el('table');
  const head = el('tr');
  for (const h of ['Player', 'Money', 'Share wealth', 'Net wealth']) {
    head.appendChild(el('th', undefined, h));
  }
  table.appendChild(head);
  for (const row of st.standings) {
    const tr = el('tr');
    tr.appendChild(el('td', undefined, row.name));
    tr.appendChild(el('td', undefined, formatMoney(row.money)));
    tr.appendChild(el('td', undefined, formatMoney(row.shareWorth)));
    tr.appendChild(el('td', undefined, formatMoney(row.netWealth)));
    table.appendChild(tr);
  }
  box.appendChild(table);
  box.appendChild(el('div', 'sm-hint', 'Results recorded in the high scores.'));

  const actions = el('div', 'sm-actions');
  const ok = el('button', undefined, 'Close');
  actions.appendChild(ok);
  box.appendChild(actions);
  const close = modal(box);
  ok.addEventListener('click', () => {
    close();
    onClose?.(); // orig: Finish(); then HighScores(true);
  });
}

// --- About (static card; orig AboutForm finished/trivial — NOTES §7) ------------

export function aboutDialog(): void {
  const box = el('div');
  box.appendChild(el('h3', undefined, 'Space Monopoly'));
  box.appendChild(el('div', undefined,
    'TypeScript port of Space Monopoly (Borland C++ Builder/VCL original).'));
  box.appendChild(el('div', 'sm-hint', 'Logic layer faithful port; renderer approximates original visuals.'));
  const actions = el('div', 'sm-actions');
  const ok = el('button', undefined, 'Dismiss');
  actions.appendChild(ok);
  box.appendChild(actions);
  const close = modal(box);
  ok.addEventListener('click', close);
}

// --- Quit (orig closemain ≈ confirm + reload; R7) --------------------------------

export function quitConfirm(progress: boolean, reload: () => void): void {
  const box = el('div');
  box.appendChild(el('h3', undefined, 'Are you sure you want to quit?'));
  if (progress) {
    box.appendChild(el('div', undefined,
      'If you quit now your score will not be recorded in the High Scores Table.'));
  }
  const actions = el('div', 'sm-actions');
  const yes = el('button', undefined, 'Yes');
  const no = el('button', undefined, 'No');
  actions.appendChild(yes);
  actions.appendChild(no);
  box.appendChild(actions);
  const close = modal(box);
  no.addEventListener('click', close);
  yes.addEventListener('click', reload);
}
