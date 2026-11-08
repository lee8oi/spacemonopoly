// ============================================================================
// SPACE MONOPOLY PORT — GAME DIALOGS MODULE (dialogs-game.ts) — rev 8
// Role: new-game dialog (orig TPlayInfo/Players.cpp), trade dialog (orig
// ComInfoForm), player-details dialog (orig ListBox1DblClick). One of four
// modules split from dialogs.ts rev 8 (Session 27, spine §15.4); re-exported
// through the dialogs.ts barrel so renderer.ts's import path is unchanged.
//
// Revision history and rationale live in ARCHIVE.md — code header carries
// current-rev note only, per §2 / §15.3. Region commentary inside
// functions is retained where it documents LIVE contracts (fidelity tags,
// quirks, gating invariants); per-batch narrative is archive-owned.
//
// rev 8 (Session 31): trade-band fill re-points to companyDisplayColor()
// from dialogs-core rev 2 — DEVIATION:[company-color-contrast]: display
// palette (Lee: yellow #e0e000, green #5eea2f) replaces orig state hues
// at the band; scaffold stays the fidelity record. Header spine refs
// repointed to ARCHIVE.md (former notes files dissolved Session 28).
// rev 7 = chat patch on disk (no reissue): FIXED:[trade-dialog-width]
// constant 380px trade-dialog width (Lee-tuned for large share counts).
// Full narrative archive: RENDERER-ARCHIVE.md.
// ============================================================================

import type {
  AppState,
  GameType,
  CompanyInfoView,
} from './scaffold';
import {
  CLASSIC,
  TOURNAMENT,
  NUM_COMPANIES,
  startGame,
  buyShares,
  sellShares,
  buyMaxShares,
  sellAllShares,
  companyInfo,
  playerDetailsView,
  getGame,
} from './scaffold';
import {
  el,
  modal,
  msgBox,
  companyDisplayColor,
} from './dialogs-core';

const MAX_PLAYERS = 6; // R6 (renderer-layer limit)

// ============================================================================
// NEW GAME (Players.cpp flow)
// ============================================================================

// Callbacks supplied by renderer.ts's SpaceMonopolyApp:
//   onGameStarted: reset of app-private concluded flag
//   redrawGrid / moneyShow / mainUpdate / beginTurnChoices: app methods
// LIVE CONTRACT — Go! order: startGame → concluded reset → close →
// redraw → moneyShow → mainUpdate → beginTurnChoices. No setGridSize
// call: grid choice is owned solely by the Options → Grid Size menu
// entry (ruling §12.6-4). A new game always starts at the standing
// geometry; a same-size restart works with the board as it stands
// (circles preserved; see scaffold startGame).
export interface NewGameDialogCallbacks {
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
  // FIDELITY:[players.dfm-caption] — orig TPlayInfo form caption.
  box.appendChild(el('h3', undefined, 'Player Information'));

  // LIVE CONTRACTS — Move Up / Move Down reordering, orig Players.cpp:
  //   FIDELITY:[players.cpp-updatebuts] — move pair enabled iff a row is
  //     selected; boundary clicks silently no-op (handler guards).
  //   FIDELITY:[players.cpp-reselect] — selection follows the moved row
  //     (orig ItemIndex = pos ∓ 1), permitting click-walking.
  //   FIX:[players.cpp-strcpy] — orig BitBtn5Click (Move Up) swapped names
  //     through strcpy into char buffer[25] (overflow pattern). The port
  //     splices live DOM node references instead. Orig BitBtn6Click (Move
  //     Down) already used a safe AnsiString swap — replicated.
  //   DEVIATION:[selection-model] — rows are inline editable inputs (not
  //     the orig listbox + Name field); selection is a row highlight
  //     driven by row click / input focus.
  //   FIDELITY:[players.cpp-maxlength] — name inputs clamp at 15 chars
  //     (orig Edit1 MaxLength; BitBtn1Click comment "15 chars + NULL").
  //   FIDELITY:[players.cpp-updatebuts-go] — Go! disabled iff the list is
  //     empty (orig UpdateButs() BitBtn3 branch). Reachable only when
  //     non-empty — no status-message fallback.
  //   FIDELITY:[players.cpp-btbtn2click-remove-guard-dropped] — orig
  //     removes unconditionally; the list CAN reach empty.
  //   DEVIATION:[prefill-single] — prefills ONE "Player 1" row; orig
  //     starts empty (Go! disabled on entry). Lee-approved quick-start.
  const nameInputs: HTMLInputElement[] = [];
  let selectedIndex = -1;

  // Rows live in rowsWrap (inside the left pane). All index math goes
  // through these live queries — never a cached index baked in at build
  // time, or moves/adds/removes would desync from the DOM.
  const getRows = (): HTMLElement[] =>
    Array.from(rowsWrap.children) as HTMLElement[];

  const updateButs = (): void => { // orig UpdateButs()
    moveUpBtn.disabled = selectedIndex < 0;
    moveDownBtn.disabled = selectedIndex < 0;
    go.disabled = nameInputs.length === 0; // orig: BitBtn3 branch
  };

  const setSelected = (idx: number): void => {
    const rows = getRows();
    for (let i = 0; i < rows.length; i++) {
      rows[i].classList.remove('sm-playerrow-selected');
    }
    selectedIndex = idx;
    if (idx >= 0 && idx < rows.length) {
      rows[idx].classList.add('sm-playerrow-selected');
    }
    updateButs();
  };

  const selectRowNode = (row: HTMLElement): void => {
    setSelected(getRows().indexOf(row));
  };

  // Swap by node reference — detach, splice, reinsert. No string copy
  // anywhere; input values/focus ride along on the live nodes.
  const moveSelected = (delta: number): void => {
    const rows = getRows();
    const pos = selectedIndex;
    const next = pos + delta;
    if (pos < 0 || next < 0 || next >= rows.length) return; // orig no-op guard
    const [row] = rows.splice(pos, 1);
    rows.splice(next, 0, row);
    rowsWrap.replaceChildren(...rows);
    // Keep nameInputs in step with the DOM so Go! collects the
    // displayed order.
    const [inp] = nameInputs.splice(pos, 1);
    nameInputs.splice(next, 0, inp);
    setSelected(next); // orig: ItemIndex = pos ∓ 1
  };

  // Two-pane layout: rows on the left, reorder buttons on the right
  // (orig Players.dfm button column).
  const listWrap = el('div', 'sm-players-pane');
  const leftPane = el('div', 'sm-pane-left');
  const rowsWrap = el('div');
  leftPane.appendChild(rowsWrap);

  const addName = (value: string): void => {
    const row = el('div', 'sm-row sm-playerrow');
    const inp = el('input') as HTMLInputElement;
    inp.type = 'text';
    inp.value = value;
    inp.maxLength = 15; // FIDELITY:[players.cpp-maxlength] — orig Edit1
    nameInputs.push(inp);
    // mousedown so selection registers before the input grabs focus;
    // focus covers keyboard entry into a row.
    row.addEventListener('mousedown', () => selectRowNode(row));
    inp.addEventListener('focus', () => selectRowNode(row));
    row.appendChild(inp);
    const del = el('button', undefined, '\u2212');
    del.addEventListener('click', () => {
      // Orig BitBtn2Click deletes unconditionally — the list may empty.
      const rows = getRows();
      const idx = rows.indexOf(row); // dynamic index — survives reorders
      nameInputs.splice(nameInputs.indexOf(inp), 1);
      row.remove();
      if (selectedIndex === idx) {
        // VCL ListBox clears the selection when the selected item is
        // deleted → UpdateButs disables the move pair. Faithful.
        setSelected(-1);
      } else if (selectedIndex > idx) {
        setSelected(selectedIndex - 1); // same row stays selected
      } else {
        setSelected(selectedIndex); // re-sync highlight against new DOM
      }
    });
    row.appendChild(del);
    rowsWrap.appendChild(row);
    // Newly added row is not selected (orig Add does not select it).
  };

  addName('Player 1'); // DEVIATION:[prefill-single]

  const rightPane = el('div', 'sm-pane-right');
  const btnGroup = el('div', 'sm-btn-group');
  const moveUpBtn = el('button', undefined, 'Move Up');    // orig BitBtn5
  const moveDownBtn = el('button', undefined, 'Move Down'); // orig BitBtn6
  moveUpBtn.disabled = true;   // orig .dfm: Enabled = false initially
  moveDownBtn.disabled = true;
  moveUpBtn.addEventListener('click', () => moveSelected(-1));
  moveDownBtn.addEventListener('click', () => moveSelected(1));
  btnGroup.appendChild(moveUpBtn);
  btnGroup.appendChild(moveDownBtn);
  rightPane.appendChild(btnGroup);

  listWrap.appendChild(leftPane);
  listWrap.appendChild(rightPane);
  box.appendChild(listWrap);

  const addBtn = el('button', undefined, '+ Add player');
  addBtn.addEventListener('click', () => {
    if (nameInputs.length < MAX_PLAYERS) {
      addName(`Player ${nameInputs.length + 1}`);
      updateButs(); // orig BitBtn1Click calls UpdateButs() post-add
    }
  });
  box.appendChild(addBtn);

  // Mode radios — orig Game Type tab. Orig has no default marked;
  // port defaults Classic.
  box.appendChild(el('div', undefined, 'Select a mode:'));
  const modeRow = el('div', 'sm-row');
  let selectedMode: GameType = CLASSIC;
  const mkModeRadio = (label: string, value: GameType, checked: boolean): void => {
    const inp = el('input') as HTMLInputElement;
    inp.type = 'radio';
    inp.name = 'sm-mode';
    inp.checked = checked;
    inp.addEventListener('change', () => {
      if (inp.checked) selectedMode = value;
    });
    modeRow.appendChild(inp);
    modeRow.appendChild(el('span', undefined, label));
  };
  mkModeRadio('Classic Game', CLASSIC, true);
  mkModeRadio('Tournament', TOURNAMENT, false);
  box.appendChild(modeRow);

  // Grid row absent by design — ruling §12.6-4 (Options menu owns it).

  const status = el('div', 'sm-status');
  const actions = el('div', 'sm-actions');
  const go = el('button', undefined, 'Go!');
  go.disabled = nameInputs.length === 0; // orig UpdateButs() initial state
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
    startGame(s, names, selectedMode);
    cb.onGameStarted(); // renderer: this.concluded = false
    close();
    cb.redrawGrid();
    cb.moneyShow();
    cb.mainUpdate();
    cb.beginTurnChoices();
  });
}

// ============================================================================
// TRADE DIALOG (ComInfoForm.cpp flow)
// ============================================================================

// LIVE CONTRACTS — trade dialog, orig ComInfoForm (screenshot #5,
// §12.4/§12.2-5, §15.1 rulings):
//   FIDELITY:[cominfoform] — company-colored HEADER BAND (display
//     palette — DEVIATION:[company-color-contrast], see refresh()),
//     company name centered, ‹ Previous / Next › flippers IN-BAND (orig
//     double-chevron convention modernized, Lee ruling); detail captions
//     verbatim: "Company Size: {n} squares" / "Cost of Shares: {price}" /
//     "Major Shareholder: {name} with {n} shares." ("Nobody." fallback);
//     sell group "You own {n} shares in this company" over [Sell All]
//     [Sell >>>] [qty] Shares; buy group "You can buy up to {n} shares in
//     this company" over [Max Buy] [Buy >>>] [qty] Shares; two SEPARATE
//     qty fields, per-field parser (§15.2-c); bottom button "Finished"
//     plain text (orig green-check glyph dropped — weak-evidence styling);
//     ">>>" glyphs literal. Any company switch re-derives the full panel
//     in ONE refresh() pass.
//   FIXED:[trade-dialog-width] (rev 7 chat patch, S31): constant 380px
//     content width, Lee-tuned — absorbs share-count caption growth so
//     the dialog never re-lays-out mid-purchase (probe receipts S31).
//   DEVIATION:[tabs-dropped] — the orig company-name tab strip (confirmed
//     genuine chrome, screenshot #5; restored at rev 2 per the "easy
//     access" ruling) is REMOVED: containment could not be made reliable
//     across five fix attempts, the strip duplicates the flippers'
//     navigation, and removal advances the responsive-design direction.
//     Flippers remain the complete navigation (cycle skips zombies,
//     wraps). Fixed 480px form width reverted with it — content sizing
//     under the CSS max-width (superseded by the 380px constant).
//   FIDELITY:[infobuts] — trading buttons disabled while the five
//     selection squares are shown (Enabled = !sels). Modal is blocking,
//     so sels cannot change while open. Nav (flippers) stays enabled —
//     only trading is locked.
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
  box.style.width = '380px'; // FIXED:[trade-dialog-width] — see contracts
  // above; measured shrink-to-fit oscillation 352.5↔343.3px (probe
  // receipts S31), 380px = Lee-tuned constant with growth headroom.

  // Header band: flippers flank the centered company name (flex:1).
  const band = el('div');
  band.style.cssText =
    'display:flex;align-items:center;gap:10px;margin:-4px 0 10px 0;' +
    'padding:8px 10px;border-radius:6px;color:#ffffff;';
  const bandPrev = el('button', undefined, '\u2039 Previous');
  const bandNext = el('button', undefined, 'Next \u203a');
  for (const b of [bandPrev, bandNext]) {
    // Light-on-color button faces so the pair reads on any company color.
    b.style.cssText =
      'background:rgba(255,255,255,0.15);color:#ffffff;' +
      'border:1px solid rgba(255,255,255,0.7);flex:0 0 auto;';
  }
  const bandName = el('strong');
  bandName.style.cssText = 'flex:1 1 auto;text-align:center;font-size:16px;';
  band.appendChild(bandPrev);
  band.appendChild(bandName);
  band.appendChild(bandNext);
  box.appendChild(band);

  // Detail lines (orig captions, verbatim).
  const infoLines = el('div');
  box.appendChild(infoLines);

  // Sell group: "You own {n} shares in this company".
  const sellCap = el('div', 'sm-grouptitle');
  const sellRow = el('div', 'sm-row');
  const sellAll = el('button', undefined, 'Sell All');
  const sellBtn = el('button', undefined, 'Sell >>>');
  const sellQty = el('input') as HTMLInputElement;
  sellQty.type = 'text';
  sellQty.placeholder = 'amount';
  sellQty.style.width = '70px';
  sellRow.appendChild(sellAll);
  sellRow.appendChild(sellBtn);
  sellRow.appendChild(sellQty);
  sellRow.appendChild(el('span', undefined, 'Shares'));
  box.appendChild(sellCap);
  box.appendChild(sellRow);

  // Buy group: "You can buy up to {n} shares in this company".
  const buyCap = el('div', 'sm-grouptitle');
  const buyRow = el('div', 'sm-row');
  const maxBuy = el('button', undefined, 'Max Buy');
  const buyBtn = el('button', undefined, 'Buy >>>');
  const buyQty = el('input') as HTMLInputElement;
  buyQty.type = 'text';
  buyQty.placeholder = 'amount';
  buyQty.style.width = '70px';
  buyRow.appendChild(maxBuy);
  buyRow.appendChild(buyBtn);
  buyRow.appendChild(buyQty);
  buyRow.appendChild(el('span', undefined, 'Shares'));
  box.appendChild(buyCap);
  box.appendChild(buyRow);

  const status = el('div', 'sm-status');
  const actions = el('div', 'sm-actions');
  const finished = el('button', undefined, 'Finished'); // orig caption
  actions.appendChild(finished);
  box.appendChild(status);
  box.appendChild(actions);

  const close = modal(box);
  finished.addEventListener('click', close);

  // InfoButs gating (see LIVE CONTRACTS above).
  const gated = s.sels;
  sellAll.disabled = gated;
  sellBtn.disabled = gated;
  maxBuy.disabled = gated;
  buyBtn.disabled = gated;

  const refresh = (): void => {
    const view: CompanyInfoView = companyInfo(s, com);
    const c = s.company[com];
    // Display palette, NOT state hue — DEVIATION:[company-color-contrast]
    // (white band text stays legible on bright fills; see dialogs-core).
    band.style.background = companyDisplayColor(com);
    bandName.textContent = c.name;
    const major = view.majorShareholder
      ? `${s.player[view.majorShareholder.playerIndex].name} with ` +
        `${view.majorShareholder.shares} shares.`
      : 'Nobody.';
    infoLines.textContent = '';
    const rows: Array<[string, string]> = [
      ['Company Size', `${view.sizeSquares} ${view.sizeSquares === 1 ? 'square' : 'squares'}`],
      ['Cost of Shares', formatMoney(BigInt(view.value))],
      ['Major Shareholder', major],
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
    // NOTE: view.maxbuy is BigInt — compare against 1n, never 1.
    sellCap.textContent =
      `You own ${view.sharesOwned} ${view.sharesOwned === 1n ? 'share' : 'shares'} in this company`;
    buyCap.textContent =
      `You can buy up to ${view.maxbuy} ${view.maxbuy === 1n ? 'share' : 'shares'} in this company`;
    sellQty.value = '';
    buyQty.value = '';
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
  bandPrev.addEventListener('click', () => gotoCom(-1));
  bandNext.addEventListener('click', () => gotoCom(1));

  // Per-field parsers (§15.2-c): each group validates its own qty field.
  const parseSellAmount = (): bigint | null => {
    const t = sellQty.value.trim();
    if (!/^\d+$/.test(t)) {
      status.textContent = 'Enter a whole number of shares.';
      return null;
    }
    return BigInt(t); // large(text) equivalent
  };
  const parseBuyAmount = (): bigint | null => {
    const t = buyQty.value.trim();
    if (!/^\d+$/.test(t)) {
      status.textContent = 'Enter a whole number of shares.';
      return null;
    }
    return BigInt(t); // large(text) equivalent
  };

  sellAll.addEventListener('click', () => {
    sellAllShares(s, com);
    refresh();
    moneyShow();
    redrawGrid();
  });
  sellBtn.addEventListener('click', () => {
    const amt = parseSellAmount();
    if (amt === null) return;
    if (!sellShares(s, com, amt)) {
      status.textContent =
        `You can't sell that many shares you fraudster (1 \u2013 ${s.player[s.curplay].shares[com]}).`;
      return;
    }
    refresh();
    redrawGrid();
  });
  maxBuy.addEventListener('click', () => {
    buyMaxShares(s, com);
    refresh();
    moneyShow();
    redrawGrid();
  });
  buyBtn.addEventListener('click', () => {
    const amt = parseBuyAmount();
    if (amt === null) return;
    if (!buyShares(s, com, amt)) {
      status.textContent =
        `You can't buy that many shares you fraudster (1 \u2013 ${s.maxbuy}).`;
      return;
    }
    refresh();
    redrawGrid();
  });
}

// ============================================================================
// PLAYER DETAILS (ListBox1DblClick / playerDetailsView)
// ============================================================================

// LIVE CONTRACTS — player details, orig ListBox1DblClick:
//   Heading "Player Details"; bold "Details of {name}"; summary rows
//   first with orig captions (Money in the Bank / Net worth of Shares /
//   Total Wealth); "Share Details:" table w/ orig column captions
//   (Company Name / Number of Shares / Worth of Shares); Okay button.
//   DEVIATION:[hint-supplement] — zombie-exclusion hint retained.
//   QUIRK: existing companies only — may legitimately disagree with
//   Total()/high-score wealth. Faithful.
//   GATING: detailsSet() TRUE → info box instead of this dialog.
export function detailsDialog(
  state: AppState,
  pnum: number,
  formatMoney: (amount: bigint) => string,
): void {
  if (getGame().getPrefs().detailsSet()) {
    msgBox('Game Details',
      'Player details are hidden due to the preferences set for this game...');
    return;
  }
  const view = playerDetailsView(state, pnum);
  const box = el('div');
  box.appendChild(el('h3', undefined, 'Player Details'));

  const lead = el('div');
  lead.appendChild(el('strong', undefined, `Details of ${view.name}`));
  box.appendChild(lead);

  const summary: Array<[string, string]> = [
    ['Money in the Bank', formatMoney(view.money)],
    ['Net worth of Shares', formatMoney(view.shareWealth)],
    ['Total Wealth', formatMoney(view.netWealth)],
  ];
  for (const [k, v] of summary) {
    const r = el('div', 'sm-row');
    r.appendChild(el('span', undefined, `${k}:`));
    r.appendChild(el('strong', undefined, v));
    box.appendChild(r);
  }

  box.appendChild(el('div', undefined, 'Share Details:'));
  const table = el('table');
  const head = el('tr');
  for (const h of ['Company Name', 'Number of Shares', 'Worth of Shares']) {
    head.appendChild(el('th', undefined, h));
  }
  table.appendChild(head);
  for (const row of view.rows) {
    const tr = el('tr');
    tr.appendChild(el('td', undefined, row.name));
    tr.appendChild(el('td', undefined, row.shares.toString()));
    tr.appendChild(el('td', undefined, formatMoney(row.worth)));
    table.appendChild(tr);
  }
  box.appendChild(table);

  box.appendChild(el('div', 'sm-hint',
    'Existing companies only (zombie shares excluded \u2014 original behavior).'));

  const actions = el('div', 'sm-actions');
  const ok = el('button', undefined, 'Okay');
  actions.appendChild(ok);
  box.appendChild(actions);
  const close = modal(box);
  ok.addEventListener('click', close);
}
