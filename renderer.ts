// ============================================================================
// SPACE MONOPOLY PORT — RENDERER / UI LAYER (renderer.ts) — rev 10 (condensed)
// Imports the logic layer (scaffold.ts, Session-13-amended). Canvas 2D
// board + DOM chrome. Full rationale, revision history, R# assumptions,
// open items: RENDERER-NOTES.md (archive — keep in sync, do not grow code).
// Point-of-use tags: // FIX:[orig/renderer bug fixed]
//                    // DEVIATION:[renderer choice, Lee-approved]
//                    // FIDELITY:[matches orig source]
// ============================================================================

import {
  AppState,
  getGame,
  comma,
  CurrencyUnit,
  GRID_CONFIGS,
  SMALL,
  MEDIUM,
  LARGE,
  CLASSIC,
  TOURNAMENT,
  CELL_EMPTY,
  CELL_CIRCLE,
  CELL_DIAMOND,
  COMPANY_CELL_BASE,
  NUM_COMPANIES,
  COMPANY_DEFS,
  startGame,
  advanceTurn,
  offerChoices,
  checkPlacementRules,
  action,
  eraseChoices,
  newCompanyHook,
  comSplitHook,
  mergerHook,
  companyInfo,
  buyShares,
  sellShares,
  buyMaxShares,
  sellAllShares,
  canAffordCompany,
  playerDetailsView,
  concludeGame,
  highScores,
  openPreferencesDraft,
  savePreferences,
  PREFERENCES_STORE_KEY,
} from './scaffold';
import type { GridType, CompanyInfoView, FinalStandings, Money } from './scaffold';

// R2 RETIRED (Session 13): the NEW_GAME_RANDOMISES flag is deleted.
// Board-on-new-game behavior now lives in scaffold startGame()
// (FIX:[phase3-verified]): circles survive, companies/diamonds stripped —
// Lee-verified observable spec of the original binary.
// R14 RETIRED (rev 10): standings auto-show at natural game end, per orig
// BitBtn1Click Finish(); the continue button remains a post-hoc viewer.
const TIMER_INTERVAL_MS = 250;     // R1
const SCORES_STORE_KEY = 'HighScores'; // R5
const MAX_PLAYERS = 6;             // R6

// Palette (orig ImageList tiles approximated in primitives — NOTES §4.6)
const CHECKER_A = '#3a3a52';
const CHECKER_B = '#30304a';
const CIRCLE_FILL = '#f0ead6';
const CIRCLE_STROKE = '#1c1c2a';
const DIAMOND_FILL = '#7ee08a';
const DIAMOND_STROKE = '#1c1c2a';
const SEL_FILL = 'rgba(0, 0, 204, 0.45)';  // clBlue translucent
const SEL_STROKE = '#000';                 // clBlack
const ACTIVE_STROKE = '#ffff00';           // clYellow

const CSS = `
.sm-root { display: flex; flex-wrap: wrap; gap: 16px;
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: #e8e8f2; background: #14141f; min-height: 400px; padding: 12px; }
.sm-left { display: flex; flex-direction: column; gap: 8px; }
.sm-menubar { display: flex; gap: 6px; flex-wrap: wrap; }
.sm-menubar button, .sm-side button { background: #2a2a44; color: #e8e8f2;
  border: 1px solid #4a4a6a; border-radius: 4px; padding: 4px 10px; cursor: pointer; }
.sm-menubar button:disabled, .sm-side button:disabled { opacity: 0.4; cursor: default; }
.sm-menubar select { background: #2a2a44; color: #e8e8f2; border: 1px solid #4a4a6a;
  border-radius: 4px; padding: 4px; }
.sm-board { background: #0c0c16; border: 2px solid #4a4a6a; border-radius: 6px;
  align-self: flex-start; cursor: default; }
.sm-hintbar { font-size: 13px; color: #9a9ac0; min-height: 18px; }
.sm-side { width: 260px; display: flex; flex-direction: column; gap: 8px; }
.sm-panel { background: #1d1d30; border: 1px solid #3a3a58; border-radius: 6px;
  padding: 10px; }
.sm-panel h4 { margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase;
  letter-spacing: 0.08em; color: #9a9ac0; }
.sm-players { list-style: none; margin: 0; padding: 0; }
.sm-players li { padding: 3px 4px; border-radius: 4px; cursor: default; }
.sm-players li.current { background: #2e2e52; font-weight: 600; }
.sm-comrow { display: flex; align-items: center; gap: 8px; margin: 4px 0; }
.sm-comrow button { flex: 1; text-align: left; }
.sm-swatch { width: 14px; height: 14px; border-radius: 3px; flex: none;
  border: 1px solid #333; }
.sm-money { font-size: 20px; font-weight: 700; }
.sm-turn { font-size: 13px; color: #9a9ac0; }
/* FIX:[modal-inheritance]: modals/toasts live on document.body, outside
   .sm-root — they must declare their own text/button styles. */
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
`;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

export class SpaceMonopolyApp {
  readonly state = new AppState();
  private readonly root: HTMLElement;
  private readonly storage: Storage;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private hintBar!: HTMLElement;
  private moneyLabel!: HTMLElement;
  private playerLabel!: HTMLElement;
  private turnLabel!: HTMLElement;
  private playerList!: HTMLUListElement;
  private companyRows: Array<{ btn: HTMLButtonElement; swatch: HTMLElement }> = [];
  private continueBtn!: HTMLButtonElement;
  private menuButtons: Record<string, HTMLButtonElement> = {};
  private gridSizeSelect!: HTMLSelectElement;

  private timerHandle: number | null = null;
  private timerTag = 0; // Timer1 Tag, cycles 0..4
  private concluded = false;
  private hintTimeout: number | null = null;

  // Modal queue: DOM modals are non-blocking, but chained events inside one
  // action() (e.g. merger then split) must present one at a time rather
  // than stacking overlays. Queue order = orig event order.
  private modalQueue: Array<(release: () => void) => void> = [];
  private queueActive = false;

  constructor(root: HTMLElement, storage: Storage = localStorage) {
    this.root = root;
    this.storage = storage;
    this.injectStyles();
    this.buildChrome();
    this.setGridSize(SMALL); // includes randomise — FIDELITY: orig FormCreate
    this.mainUpdate();
    this.moneyShow();
  }

  // --- Chrome ---------------------------------------------------------------

  private injectStyles(): void {
    const style = el('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    this.root.classList.add('sm-root');
  }

  private buildChrome(): void {
    const left = el('div', 'sm-left');

    const menubar = el('div', 'sm-menubar');
    const mkMenu = (label: string, onClick: () => void): HTMLButtonElement => {
      const b = el('button', undefined, label);
      b.addEventListener('click', onClick);
      menubar.appendChild(b);
      return b;
    };
    this.menuButtons['newGame'] = mkMenu('New Game', () => this.newGameDialog());
    this.menuButtons['newGrid'] = mkMenu('Create New Grid', () => {
      // MenuUpdate gates this to !progress (enforced in mainUpdate).
      this.state.grid.randomise();
      this.redrawGrid();
    });

    this.gridSizeSelect = el('select');
    for (const t of [SMALL, MEDIUM, LARGE] as GridType[]) {
      const cfg = GRID_CONFIGS[t];
      const opt = el('option', undefined, `${cfg.xsize}\u00d7${cfg.ysize}`); // R9
      opt.value = String(t);
      this.gridSizeSelect.appendChild(opt);
    }
    this.gridSizeSelect.addEventListener('change', () => {
      this.setGridSize(Number(this.gridSizeSelect.value) as GridType);
    });
    menubar.appendChild(this.gridSizeSelect);

    // End Game mirrors orig EndGame1Click: concludes a game in progress.
    this.menuButtons['endGame'] = mkMenu('End Game', () => this.doConclude(true));
    this.menuButtons['prefs'] = mkMenu('Preferences', () => this.prefsDialog());
    this.menuButtons['scores'] = mkMenu('High Scores', () => this.scoresDialog());
    this.menuButtons['about'] = mkMenu('About', () => this.aboutDialog());
    this.menuButtons['quit'] = mkMenu('Quit', () => this.quitConfirm());

    this.canvas = el('canvas', 'sm-board');
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));

    this.hintBar = el('div', 'sm-hintbar', '');

    left.appendChild(menubar);
    left.appendChild(this.canvas);
    left.appendChild(this.hintBar);

    const side = el('div', 'sm-side');

    const pPanel = el('div', 'sm-panel');
    pPanel.appendChild(el('h4', undefined, 'Players'));
    this.playerList = el('ul', 'sm-players');
    pPanel.appendChild(this.playerList);
    side.appendChild(pPanel);

    const mPanel = el('div', 'sm-panel');
    mPanel.appendChild(el('h4', undefined, 'Current Player'));
    this.playerLabel = el('div', undefined, '\u2014');
    this.moneyLabel = el('div', 'sm-money', '\u2014');
    this.turnLabel = el('div', 'sm-turn', '');
    mPanel.appendChild(this.playerLabel);
    mPanel.appendChild(this.moneyLabel);
    mPanel.appendChild(this.turnLabel);
    side.appendChild(mPanel);

    const cPanel = el('div', 'sm-panel');
    cPanel.appendChild(el('h4', undefined, 'Companies'));
    for (let i = 0; i < NUM_COMPANIES; i++) {
      const row = el('div', 'sm-comrow');
      const swatch = el('span', 'sm-swatch');
      swatch.style.background = COMPANY_DEFS[i].color;
      const btn = el('button', undefined, COMPANY_DEFS[i].name);
      btn.addEventListener('click', () => {
        if (this.state.company[i]?.exist) this.tradeDialog(i);
      });
      row.appendChild(swatch);
      row.appendChild(btn);
      cPanel.appendChild(row);
      this.companyRows.push({ btn, swatch });
    }
    side.appendChild(cPanel);

    this.continueBtn = el('button', undefined, 'Continue');
    this.continueBtn.addEventListener('click', () => this.onContinue());
    side.appendChild(this.continueBtn);

    this.root.appendChild(left);
    this.root.appendChild(side);
  }

  // Rows rebuilt in mainUpdate(); per-row dblclick = orig ItemIndex.
  private rebuildPlayerList(): void {
    const s = this.state;
    this.playerList.textContent = '';
    for (let i = 0; i < s.player.length; i++) {
      const li = el('li', i === s.curplay ? 'current' : undefined);
      li.textContent = `${s.player[i].name} \u2014 ${this.formatMoney(s.player[i].money)}`;
      li.addEventListener('dblclick', () => this.detailsDialog(i));
      this.playerList.appendChild(li);
    }
  }

  // --- Board ----------------------------------------------------------------

  setGridSize(type: GridType): void {
    this.state.gridType = type;
    const cfg = GRID_CONFIGS[type];
    this.state.maxTurns = cfg.maxTurns;
    this.state.grid.resize(cfg.xsize, cfg.ysize, CELL_EMPTY);
    this.state.grid.randomise(); // FIDELITY: orig setGridSize randomises
    this.gridSizeSelect.value = String(type);
    this.canvas.width = cfg.xsize * cfg.tileW;
    this.canvas.height = cfg.ysize * cfg.tileH;
    this.redrawGrid();
    this.mainUpdate();
  }

  redrawGrid(): void {
    const s = this.state;
    const cfg = s.gridConfig();
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < cfg.ysize; y++) {
      for (let x = 0; x < cfg.xsize; x++) {
        // Checkerboard — ImageList iStart + (x+y)%2 equivalent.
        ctx.fillStyle = (x + y) % 2 === 0 ? CHECKER_A : CHECKER_B;
        ctx.fillRect(x * cfg.tileW, y * cfg.tileH, cfg.tileW, cfg.tileH);
        this.drawCellEntity(x, y);
      }
    }
    this.drawSels();
  }

  // SEAM (NOTES §4.6): swap for extracted bitmap tiles if SpacePoly2.res
  // yields usable BITMAP resources; single-point replacement.
  private drawCellEntity(x: number, y: number): void {
    const s = this.state;
    const cfg = s.gridConfig();
    const cell = s.grid.get(x, y);
    if (cell === CELL_EMPTY) return;
    const ctx = this.ctx;
    const cx = x * cfg.tileW + cfg.tileW / 2;
    const cy = y * cfg.tileH + cfg.tileH / 2;

    if (cell === CELL_CIRCLE) {
      const r = Math.min(cfg.tileW, cfg.tileH) * 0.28;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = CIRCLE_FILL;
      ctx.fill();
      ctx.strokeStyle = CIRCLE_STROKE;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (cell === CELL_DIAMOND) {
      const r = Math.min(cfg.tileW, cfg.tileH) * 0.32;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
      ctx.fillStyle = DIAMOND_FILL;
      ctx.fill();
      ctx.strokeStyle = DIAMOND_STROKE;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (cell >= COMPANY_CELL_BASE) {
      const com = cell - COMPANY_CELL_BASE;
      ctx.fillStyle = s.company[com]?.color ?? '#888';
      ctx.fillRect(x * cfg.tileW + 1, y * cfg.tileH + 1, cfg.tileW - 2, cfg.tileH - 2);
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2;
      ctx.strokeRect(x * cfg.tileW + 1, y * cfg.tileH + 1, cfg.tileW - 2, cfg.tileH - 2);
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.floor(cfg.tileH * 0.45)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String.fromCharCode(65 + com), cx, cy);
    }
  }

  // DrawSels + Timer1Timer equivalent (R3: full repaint per tick).
  private drawSels(): void {
    const s = this.state;
    if (!s.sels) return;
    const cfg = s.gridConfig();
    const ctx = this.ctx;
    for (let i = 0; i < NUM_COMPANIES; i++) {
      const [cx, cy] = s.choice[i];
      if (cx < 0 || cy < 0) continue; // fewer than 5 valid picks is legal
      const px = cx * cfg.tileW;
      const py = cy * cfg.tileH;
      if (i === this.timerTag) {
        ctx.strokeStyle = ACTIVE_STROKE;
        ctx.lineWidth = 4;
        ctx.strokeRect(px + 2, py + 2, cfg.tileW - 4, cfg.tileH - 4);
      } else {
        ctx.fillStyle = SEL_FILL;
        ctx.fillRect(px, py, cfg.tileW, cfg.tileH);
        ctx.strokeStyle = SEL_STROKE;
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 1, py + 1, cfg.tileW - 2, cfg.tileH - 2);
      }
    }
  }

  private startSelectorTimer(): void {
    this.stopSelectorTimer();
    this.timerHandle = window.setInterval(() => {
      this.timerTag = (this.timerTag + 1) % NUM_COMPANIES;
      this.redrawGrid();
    }, TIMER_INTERVAL_MS);
  }

  private stopSelectorTimer(): void {
    if (this.timerHandle !== null) {
      window.clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  // --- Mouse (NOTES §6.6) ----------------------------------------------------
  // FIX:[click-mapping] rect-proportional mapping — correct even if the
  // canvas is CSS-scaled (flex squeeze, host page, DPR oddities).

  private cellFromEvent(e: MouseEvent): [number, number] | null {
    const cfg = this.state.gridConfig();
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    if (fx < 0 || fy < 0 || fx >= 1 || fy >= 1) return null;
    const x = Math.floor(fx * cfg.xsize);
    const y = Math.floor(fy * cfg.ysize);
    if (x < 0 || y < 0 || x >= cfg.xsize || y >= cfg.ysize) return null;
    return [x, y];
  }

  private onMouseDown(e: MouseEvent): void {
    const s = this.state;
    if (!s.progress) return;
    const cell = this.cellFromEvent(e);
    if (!cell) return;
    const [x, y] = cell;
    const inChoice = s.choice.some(([cx, cy]) => cx === x && cy === y);
    if (!inChoice) {
      this.flashHint('Click one of the five flashing squares!'); // R12
      return;
    }

    const err = checkPlacementRules(s, x, y);
    if (err !== null) {
      this.msgBox('Game Information...', err);
      return;
    }

    this.stopSelectorTimer();
    s.sels = false;
    eraseChoices(s);
    action(s, x, y, this.actionHooks());
  }

  private onMouseMove(e: MouseEvent): void {
    const s = this.state;
    if (!s.progress) {
      this.canvas.style.cursor = 'default';
      return;
    }
    const cell = this.cellFromEvent(e);
    const over =
      cell !== null && s.choice.some(([cx, cy]) => cx === cell[0] && cy === cell[1]);
    this.canvas.style.cursor = over ? 'pointer' : 'default'; // crHandPoint
  }

  private setHint(text: string): void {
    this.hintBar.textContent = text;
    this.hintBar.style.color = '#9a9ac0';
  }

  private flashHint(text: string): void {
    if (this.hintTimeout !== null) window.clearTimeout(this.hintTimeout);
    this.hintBar.textContent = text;
    this.hintBar.style.color = '#ffcc66';
    this.hintTimeout = window.setTimeout(() => {
      this.hintTimeout = null;
      this.updateHint();
    }, 1500);
  }

  private updateHint(): void {
    const s = this.state;
    if (!s.progress) {
      this.setHint('');
    } else if (s.sels) {
      this.setHint('Click one of the five flashing squares to place your piece.');
    } else {
      this.setHint('Click Continue to pass to the next turn.');
    }
  }

  // --- Turn flow --------------------------------------------------------------

  private onContinue(): void {
    const s = this.state;
    if (s.progress) {
      advanceTurn(s);
      if (s.progress) {
        this.beginTurnChoices();
      } else {
        // FIDELITY:[auto-finish] (rev 10; R14 retired): orig BitBtn1Click
        // calls Finish() the instant the final turn ends — standings and
        // high scores commit immediately, no intermediate "See Results"
        // click. The button remains as a post-hoc viewer (doConclude's
        // concluded-guard makes it a no-op the second time).
        this.doConclude(false);
      }
    } else {
      this.doConclude(false);
    }
  }

  private beginTurnChoices(): void {
    offerChoices(this.state, {
      redrawGrid: () => this.redrawGrid(),
      moneyShow: () => this.moneyShow(),
      drawSels: () => this.redrawGrid(), // sels already true; R3 full repaint
      startSelectorTimer: () => this.startSelectorTimer(),
      mainUpdate: () => this.mainUpdate(),
    });
  }

  // Shared end-of-game tail (orig: BitBtn1Click !progress branch and
  // EndGame1Click converge on Finish → HighScores(true) → CreateComs).
  // FIX:[doconclude-guard]: force=true (End Game menu) concludes even
  // mid-game, mirroring orig EndGame1Click; force=false (natural end /
  // post-hoc viewer) only valid once the game has ended.
  private doConclude(force: boolean): void {
    const s = this.state;
    if (force) {
      this.stopSelectorTimer();
      s.sels = false;
      eraseChoices(s);
      s.progress = false;
    } else {
      if (s.progress || this.concluded) return;
    }
    this.concluded = true;
    const standings = concludeGame(s, this.storage, SCORES_STORE_KEY);
    this.redrawGrid();
    this.mainUpdate();
    this.moneyShow();
    this.standingsDialog(standings);
  }

  // action() hooks — pure logic calls + announcements.
  // FIDELITY:[event-modals]: splits, mergers AND foundings announce via
  // modal dialogs like the orig SplitForm / Merger / NewCom forms. The
  // modal queue preserves orig event order.
  private actionHooks() {
    return {
      redrawGrid: () => this.redrawGrid(),
      moneyShow: () => this.moneyShow(),
      mainUpdate: () => this.mainUpdate(),
      newCompany: (x: number, y: number) => {
        const id = newCompanyHook(this.state, x, y);
        if (id === null) return; // QUIRK newcompany-noop: silent, placement lost
        // FIDELITY:[comform-modal+info] (ComForm.cpp NewCompany): orig
        // shows the NewCom modal, then IMMEDIATELY opens Info(i) — the
        // trade dialog for the new company — on modal dismissal.
        this.foundingDialog(id, () => this.tradeDialog(id));
        this.moneyShow();
        this.mainUpdate();
        this.redrawGrid();
      },
      comSplit: (companyId: number) => {
        // Capture pre-split numbers BEFORE comSplitHook mutates them, so the
        // dialog can show the before/after economics.
        const com = this.state.company[companyId];
        const oldPrice = com.value;
        const oldShares = this.state.player[this.state.curplay].shares[companyId];
        comSplitHook(this.state, companyId);
        this.splitDialog(companyId, oldPrice, oldShares);
        this.moneyShow();
      },
      merger: (survivorId: number, absorbedId: number) => {
        // Capture pre-merger numbers BEFORE mergerHook mutates them.
        const s = this.state;
        const survivor = s.company[survivorId];
        const absorbed = s.company[absorbedId];
        const oldSurvivorValue = survivor.value;
        const absorbedValue = absorbed.value;
        const myAbsorbedShares = s.player[s.curplay].shares[absorbedId];
        const mySurvivorShares = s.player[s.curplay].shares[survivorId];
        mergerHook(this.state, survivorId, absorbedId);
        this.mergerDialog(
          survivorId,
          absorbedId,
          oldSurvivorValue,
          absorbedValue,
          myAbsorbedShares,
          mySurvivorShares,
        );
        this.moneyShow();
      },
    };
  }

  // --- MoneyShow / MainUpdate (NOTES §6.4–6.5) -------------------------------

  private formatMoney(amount: bigint): string {
    const cu = getGame().getPrefs().getCurrencyUnit();
    return cu.output(comma(amount.toString()));
  }

  moneyShow(): void {
    const s = this.state;
    if (s.player.length === 0) return;
    this.moneyLabel.textContent = this.formatMoney(s.player[s.curplay].money);

    // DEVIATION:[swatch-color] (R13): orig fills the shape white when
    // affordable; port keeps the company color, white border = affordable.
    for (let i = 0; i < NUM_COMPANIES; i++) {
      const swatch = this.companyRows[i].swatch;
      const c = s.company[i];
      swatch.style.background = c?.exist ? c.color : '#555';
      swatch.style.borderColor =
        c?.exist && canAffordCompany(s, i) ? '#fff' : '#333';
    }
  }

  mainUpdate(): void {
    const s = this.state;
    const playing = s.player.length > 0;

    // FIX:[seeresults-disabled]: in-game disabled = sels (orig BitBtn1);
    // post-game disabled = concluded. With R14 retired the button is
    // now a post-hoc viewer (standings already auto-showed at game end).
    this.continueBtn.disabled = s.progress ? !!s.sels : this.concluded;
    this.continueBtn.textContent = s.progress
      ? (s.sels ? 'Place a piece\u2026' : 'Continue')
      : (playing && !this.concluded ? 'See Results' : 'Game Over');

    // Company buttons: Enabled = Exist (trade BUTTONS gated on !sels
    // inside the dialog, per orig InfoButs).
    for (let i = 0; i < NUM_COMPANIES; i++) {
      this.companyRows[i].btn.disabled = !(s.company[i]?.exist ?? false);
    }

    this.rebuildPlayerList();
    this.playerLabel.textContent = playing ? s.player[s.curplay].name : '\u2014';
    this.turnLabel.textContent = playing
      ? `Turn ${s.turn} of ${s.maxTurns}` +
          (s.gameType === TOURNAMENT ? ' (Tournament)' : '')
      : '';

    // MenuUpdate: setup menus when !progress; End Game when progress.
    this.menuButtons['newGame'].disabled = s.progress;
    this.menuButtons['newGrid'].disabled = s.progress;
    this.gridSizeSelect.disabled = s.progress;
    this.menuButtons['prefs'].disabled = s.progress;
    this.menuButtons['endGame'].disabled = !s.progress;

    this.updateHint();
  }

  // --- Dialogs ----------------------------------------------------------------

  private modal(content: HTMLElement): () => void {
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
  // The open() callback receives a release() that MUST be called when the
  // dialog closes; callers pair it with their own overlay dismissal.
  private queueModal(open: (release: () => void) => void): void {
    this.modalQueue.push(open);
    this.pumpQueue();
  }

  private pumpQueue(): void {
    if (this.queueActive || this.modalQueue.length === 0) return;
    this.queueActive = true;
    const open = this.modalQueue.shift()!;
    open(() => {
      this.queueActive = false;
      this.pumpQueue();
    });
  }

  // FIDELITY:[comform-modal] — orig NewCom modal: company name, starting
  // share price, founder's grant. On dismissal, orig immediately opens
  // Info(i) — the trade dialog for the new company — chained via onDismiss.
  private foundingDialog(companyId: number, onDismiss?: () => void): void {
    this.queueModal((release) => {
      const s = this.state;
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
        `The shares will start at ${this.formatMoney(BigInt(c.value))} each.`));
      box.appendChild(el('div', undefined,
        `${founder.name} will get five free shares in the company and ` +
        `${this.formatMoney(BigInt(c.value))}.`));

      const actions = el('div', 'sm-actions');
      const ok = el('button', undefined, 'OK');
      actions.appendChild(ok);
      box.appendChild(actions);

      const dismiss = this.modal(box);
      ok.addEventListener('click', () => {
        dismiss();
        release();
        onDismiss?.(); // orig: NewCom->ShowModal(); then Info(i);
      });
    });
  }

  // FIDELITY:[splitform-modal] — orig SplitForm dialog announcing a 2-for-1
  // split. Displays the before/after economics captured by the comSplit hook.
  private splitDialog(companyId: number, oldPrice: number, oldShares: Money): void {
    this.queueModal((release) => {
      const s = this.state;
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
        `${c.name}\u2019s value has reached ${this.formatMoney(BigInt(oldPrice))}. ` +
        'The company has split its stock 2-for-1:'));
      box.appendChild(el('div', undefined,
        `\u2022 Share price: ${this.formatMoney(BigInt(oldPrice))} \u2192 ` +
        `${this.formatMoney(BigInt(c.value))}`));
      box.appendChild(el('div', undefined,
        `\u2022 Your holding: ${oldShares} \u2192 ` +
        `${s.player[s.curplay].shares[companyId]} shares`));
      box.appendChild(el('div', 'sm-hint',
        'All shareholders have had their share counts doubled.'));

      const actions = el('div', 'sm-actions');
      const ok = el('button', undefined, 'OK');
      actions.appendChild(ok);
      box.appendChild(actions);

      const dismiss = this.modal(box);
      ok.addEventListener('click', () => {
        dismiss();  // remove the overlay from the DOM...
        release();  // ...then free the queue for the next dialog
      });
    });
  }

  // FIDELITY:[mergerform-modal] — orig Merger form dialog. Displays the
  // before/after economics captured by the merger hook: payout for
  // absorbed shares, share conversion (CLASSIC), combined values.
  private mergerDialog(
    survivorId: number,
    absorbedId: number,
    oldSurvivorValue: number,
    absorbedValue: number,
    myAbsorbedShares: Money,
    mySurvivorShares: Money,
  ): void {
    this.queueModal((release) => {
      const s = this.state;
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

      const rows: Array<[string, string]> = [
        ['Combined value',
          `${this.formatMoney(BigInt(oldSurvivorValue))} + ` +
          `${this.formatMoney(BigInt(absorbedValue))} = ` +
          `${this.formatMoney(BigInt(survivor.value))}`],
      ];
      if (myAbsorbedShares > 0n) {
        rows.push(['Payout (your absorbed shares)',
          `${myAbsorbedShares} \u00d7 ${this.formatMoney(BigInt(absorbedValue))}`]);
        if (s.gameType === CLASSIC) {
          rows.push(['Your shares converted',
            `${mySurvivorShares} + ${myAbsorbedShares} = ` +
            `${s.player[s.curplay].shares[survivorId]} ${survivor.name} shares`]);
        } else {
          rows.push(['Your shares converted',
            'None \u2014 Tournament shares are not converted (original behavior)']);
        }
      }
      for (const [k, v] of rows) {
        const r = el('div', 'sm-row');
        r.appendChild(el('span', undefined, `${k}:`));
        r.appendChild(el('strong', undefined, v));
        box.appendChild(r);
      }
      box.appendChild(el('div', 'sm-hint',
        `${absorbed.name} no longer exists; its squares now belong to ` +
        `${survivor.name}.`));

      const actions = el('div', 'sm-actions');
      const ok = el('button', undefined, 'OK');
      actions.appendChild(ok);
      box.appendChild(actions);

      const dismiss = this.modal(box);
      ok.addEventListener('click', () => {
        dismiss();
        release();
      });
    });
  }

  private msgBox(title: string, text: string): void {
    const box = el('div');
    box.appendChild(el('h3', undefined, title));
    box.appendChild(el('div', undefined, text));
    const actions = el('div', 'sm-actions');
    const ok = el('button', undefined, 'OK');
    actions.appendChild(ok);
    box.appendChild(actions);
    const close = this.modal(box);
    ok.addEventListener('click', close);
  }

  private toast(text: string): void {
    const t = el('div', 'sm-toast', text);
    document.body.appendChild(t);
    window.setTimeout(() => t.remove(), 2500);
  }

  // --- New Game (Players.cpp flow) ---------------------------------------------

  private newGameDialog(): void {
    const s = this.state;
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

    const close = this.modal(box);
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
        this.setGridSize(chosen);
      }
      startGame(s, names, Number(modeSel.value) as 0 | 1);
      this.concluded = false;
      close();
      this.redrawGrid();
      this.moneyShow();
      this.mainUpdate();
      this.beginTurnChoices();
    });
  }

  // --- Trade dialog (ComInfoForm.cpp flow) --------------------------------------

  private tradeDialog(startCom: number): void {
    const s = this.state;
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

    const close = this.modal(box);
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
        ['Share price', this.formatMoney(BigInt(view.value))],
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
      this.moneyShow(); // companyInfo refreshed state.maxbuy
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
      this.redrawGrid();
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
      this.redrawGrid();
    });
    buyMax.addEventListener('click', () => {
      buyMaxShares(s, com);
      refresh();
      this.moneyShow();
      this.redrawGrid();
    });
    sellAll.addEventListener('click', () => {
      sellAllShares(s, com);
      refresh();
      this.moneyShow();
      this.redrawGrid();
    });
  }

  // --- Player details (ListBox1DblClick / playerDetailsView) ---------------------

  private detailsDialog(pnum: number): void {
    // Gating: detailsSet() TRUE means details hidden (info box instead).
    if (getGame().getPrefs().detailsSet()) {
      this.msgBox('Game Details',
        'Player details are hidden due to the preferences set for this game...');
      return;
    }
    const view = playerDetailsView(this.state, pnum);
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
      tr.appendChild(el('td', undefined, this.formatMoney(row.worth)));
      table.appendChild(tr);
    }
    box.appendChild(table);
    // QUIRK zombie-exclusion: EXISTING companies only — may legitimately
    // disagree with Total()/high-score wealth. Faithful.
    box.appendChild(el('div', 'sm-hint',
      'Existing companies only (zombie shares excluded \u2014 original behavior).'));
    const rows: Array<[string, string]> = [
      ['Money', this.formatMoney(view.money)],
      ['Share wealth', this.formatMoney(view.shareWealth)],
      ['Net wealth', this.formatMoney(view.netWealth)],
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
    const close = this.modal(box);
    ok.addEventListener('click', close);
  }

  // --- Preferences (draft-commit flow; orig Preferences.cpp) -----------------------

  private prefsDialog(): void {
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

    const close = this.modal(box);
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
      savePreferences(draft, this.storage, PREFERENCES_STORE_KEY);
      this.moneyShow();
      close();
    });
  }

  // --- High Scores -------------------------------------------------------------

  private scoresDialog(): void {
    const s = this.state;
    const scores = highScores(s, false, this.storage, SCORES_STORE_KEY);
    const box = el('div');
    box.appendChild(el('h3', undefined, 'High Scores'));
    const labels = ['Small (16\u00d712)', 'Medium (22\u00d718)', 'Large (28\u00d724)'];
    for (let t = 0; t < scores.length; t++) {
      box.appendChild(el('h4', undefined, labels[t]));
      const table = el('table');
      for (let j = 0; j < scores[t].length; j++) {
        const rec = scores[t][j];
        const tr = el('tr');
        if (rec.newEntry) tr.style.fontWeight = '700';
        tr.appendChild(el('td', undefined, `${j + 1}.`));
        tr.appendChild(el('td', undefined, rec.name));
        tr.appendChild(el('td', undefined, this.formatMoney(rec.wealth)));
        table.appendChild(tr);
      }
      box.appendChild(table);
    }
    const actions = el('div', 'sm-actions');
    const ok = el('button', undefined, 'Close');
    actions.appendChild(ok);
    box.appendChild(actions);
    const close = this.modal(box);
    ok.addEventListener('click', close);
  }

  // --- Final standings (orig OverForm Finish) ------------------------------------

  private standingsDialog(st: FinalStandings): void {
    const box = el('div');
    box.appendChild(el('h3', undefined, 'Game Over'));
    const intro = el('div');
    intro.textContent =
      `Turn ${st.turn} \u2014 biggest company: ${st.biggestCompany.name} ` +
      `(${st.biggestCompany.size} squares). `;
    box.appendChild(intro);
    const winner = el('div', 'sm-row');
    winner.appendChild(el('strong', undefined,
      `Winner: ${st.winner.name} \u2014 ${this.formatMoney(st.winner.netWealth)}`));
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
      tr.appendChild(el('td', undefined, this.formatMoney(row.money)));
      tr.appendChild(el('td', undefined, this.formatMoney(row.shareWorth)));
      tr.appendChild(el('td', undefined, this.formatMoney(row.netWealth)));
      table.appendChild(tr);
    }
    box.appendChild(table);
    box.appendChild(el('div', 'sm-hint', 'Results recorded in the high scores.'));

    const actions = el('div', 'sm-actions');
    const ok = el('button', undefined, 'Close');
    actions.appendChild(ok);
    box.appendChild(actions);
    const close = this.modal(box);
    ok.addEventListener('click', close);
  }

  // --- About (static card; orig AboutForm finished/trivial — NOTES §7) ------------

  private aboutDialog(): void {
    const box = el('div');
    box.appendChild(el('h3', undefined, 'Space Monopoly'));
    box.appendChild(el('div', undefined,
      'TypeScript port of Space Monopoly (Borland C++ Builder/VCL original).'));
    box.appendChild(el('div', 'sm-hint', 'Logic layer faithful port; renderer approximates original visuals.'));
    const actions = el('div', 'sm-actions');
    const ok = el('button', undefined, 'Dismiss');
    actions.appendChild(ok);
    box.appendChild(actions);
    const close = this.modal(box);
    ok.addEventListener('click', close);
  }

  // --- Quit (orig closemain ≈ confirm + reload; R7) --------------------------------

  private quitConfirm(): void {
    const s = this.state;
    const mkQuit = (warnScore: boolean): void => {
      const box = el('div');
      box.appendChild(el('h3', undefined, 'Are you sure you want to quit?'));
      if (warnScore) {
        box.appendChild(el('div', undefined,
          'If you quit now your score will not be recorded in the High Scores Table.'));
      }
      const actions = el('div', 'sm-actions');
      const yes = el('button', undefined, 'Yes');
      const no = el('button', undefined, 'No');
      actions.appendChild(yes);
      actions.appendChild(no);
      box.appendChild(actions);
      const close = this.modal(box);
      no.addEventListener('click', close);
      yes.addEventListener('click', () => window.location.reload());
    };
    mkQuit(s.progress);
  }
}

// Entry point. Typical host page:
//   <div id="app"></div>
//   <script type="module">
//     import { mountApp } from './renderer.js';
//     mountApp(document.getElementById('app')!);
//   </script>

export function mountApp(root: HTMLElement, storage: Storage = localStorage): SpaceMonopolyApp {
  return new SpaceMonopolyApp(root, storage);
}
