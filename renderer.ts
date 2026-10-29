// ============================================================================
// SPACE MONOPOLY PORT — RENDERER / UI LAYER (renderer.ts) — rev 17
// (rev 17 = Session 21, BATCH 2 — side panel recomposition per
// SESSION20-INVENTORY B6+B7+B8+B10 with Lee's design-time amendments:
// B6 original order (current-player box → company list → names-only
// Players box → teal turn box → Finish Turn); A5 FIDELITY names-only
// list; DEVIATION:[singleclick-details] (single-click opens player
// details, orig = double-click); B8b top-box "£0" pre-game → name+money;
// B7 "Finish Turn"; B8 teal turn box (turn number only); B10 plain
// company rows w/ thin separators, heading dropped pending Label5
// evidence (QUESTION). Presentation only — scaffold/dialogs untouched.)
//
// Retained here: app init/chrome, canvas board rendering, selection timer,
// mouse handling, turn flow (onContinue, beginTurnChoices, doConclude),
// actionHooks (R15 eager capture), moneyShow/mainUpdate, mountApp.
// ALL modal/dialog presentation lives in dialogs.ts (rev 3) —
// SpaceMonopolyApp methods delegate to functions imported from there;
// dialogs receive state, formatMoney, and callbacks via parameters.
//
// Imports the logic layer (scaffold.ts, Session-13-amended, FROZEN — the
// split did not touch it). Full rationale, revision history, R# assumptions,
// open items: RENDERER-NOTES.md (spine — keep in sync, do not grow code).
// Point-of-use tags: // FIX:[orig/renderer bug fixed]
//                    // DEVIATION:[renderer choice, Lee-approved]
//                    // FIDELITY:[matches orig source]
// ============================================================================

import {
  AppState,
  getGame,
  comma,
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
  canAffordCompany,
  finishStandings,
  highScores,
  createComs,
  PREFERENCES_STORE_KEY,
} from './scaffold';
import type { GridType } from './scaffold';
import {
  el,
  injectDialogStyles,
  foundingDialog,
  splitDialog,
  mergerDialog,
  tradeDialog,
  detailsDialog,
  prefsDialog,
  scoresDialog,
  scoresTableDialog,
  standingsDialog,
  aboutDialog,
  newGameDialog,
  quitConfirm,
  msgBox,
} from './dialogs';
import type { SplitTableRow, MergerTableRow } from './dialogs';

// R2 RETIRED (Session 13): the NEW_GAME_RANDOMISES flag is deleted.
// Board-on-new-game behavior now lives in scaffold startGame()
// (FIX:[phase3-verified]): circles survive, companies/diamonds stripped —
// Lee-verified observable spec of the original binary.
// R14 RETIRED (rev 10): standings auto-show at natural game end, per orig
// BitBtn1Click Finish(); the continue button remains a post-hoc viewer.
// R15 RETIRED (rev 11): split/merger dialogs carry per-player tables
// (orig SplitForm/Merger ListView content), matching the orig display
// ranges (CLASSIC all players; TOURNAMENT current player only).
// R16 RETIRED (rev 12): end-of-game sequence is standings modal →
// high-scores modal (tabbed, current grid's tab activated, new entries
// highlighted), per orig Finish() → HighScores(true); the standalone
// High Scores menu dialog shares the tabbed presentation.
// R10 RETIRED (rev 17): players list is now NAMES-ONLY per A5 FIDELITY —
// the name+money enhancement is dead; current-player balance lives in
// the top box (B8b).
// REV 13 SPLIT: dialog presentation moved to dialogs.ts; this file keeps
// chrome/board/timer/mouse/turn-flow/actionHooks.
// REV 14 (BATCH 1): responsive board (transform-based, DPR-aware,
// ResizeObserver); DEVIATION:[dark-checker]; DEVIATION:[title-short];
// column root layout; R12 hint strip below board.
// REV 15 (FIX:[viewport-fit]): height model MIN → FIT — root occupies
// exactly the viewport, min-height: 0 down the flex chain, host-page
// normalization, side panel scrolls internally, ≤720px exempted.
// REV 16 (FIX:[board-top-align]): board TOP-aligned in its region —
// width-bound fits no longer float the board below the panel top.
// REV 17 (BATCH 2): side panel recomposed to the ORIGINAL hierarchy per
// B6 — see the side-panel construction in buildChrome and the REV 17
// CSS block below. Turn-context ("Turn X of N", "(Tournament)") moved
// from the panel to the R12 hint bar (Lee ruling).
const TIMER_INTERVAL_MS = 250;     // R1
const SCORES_STORE_KEY = 'HighScores'; // R5

// Palette (orig ImageList tiles approximated in primitives — NOTES §4.6)
// REV 14 (B4): checker contrast strengthened + grid lines added —
// dark-adapted restore of the orig bordered beige checker.
// DEVIATION:[dark-checker]: dark palette per B1; if D1 light theme ever
// lands, restoring the beige checker is a two-constant change.
const CHECKER_A = '#43435e';
const CHECKER_B = '#36364d';
const GRID_LINE = '#12121c';
const CIRCLE_FILL = '#f0ead6';
const CIRCLE_STROKE = '#1c1c2a';
const DIAMOND_FILL = '#7ee08a';
const DIAMOND_STROKE = '#1c1c2a';
const SEL_FILL = 'rgba(0, 0, 204, 0.45)';  // clBlue translucent
const SEL_STROKE = '#000';                 // clBlack
const ACTIVE_STROKE = '#ffff00';           // clYellow
// REV 17 (B8): faithful-bright teal turn box (VCL clTeal #008080 as the
// faithful anchor — hex is an approximation pending closer evidence;
// dark numerals per approved design). Theming revisit is Lee-flagged.
const TURNBOX_BG = '#008080';
const TURNBOX_FG = '#063030';
const TURNBOX_SEP = '#2b2b45';

// REV 13 SPLIT — chrome/board CSS only. The modal/toast/tab classes
// (.sm-overlay/.sm-modal/.sm-toast/.sm-tabs/etc.) moved to dialogs.ts's
// DIALOG_CSS, injected there via injectDialogStyles(). Order preserved:
// chrome stylesheet first, dialog stylesheet second.
// REV 14 (B3): column root (menubar full-width, then content row);
// .sm-board chrome stripped; canvas paints edge-to-edge in its region,
// aspect-preserved (4:3). R12 hint strip below the board.
// First-cut small-screen accommodation (≤720px stacks board above the
// panel) — dedicated mobile pass deferred.
// REV 15 (FIX:[viewport-fit]): html/body normalization; root height 100vh
// + box-sizing; min-height: 0 down the flex chain; side panel scrolls
// internally; ≤720px stacked mode exempted from the fit model.
// REV 16 (FIX:[board-top-align]): .sm-boardregion align-items FLEX-START
// (width-bound fits no longer float the board; leftover collects between
// board and hint bar).
// REV 17 (BATCH 2): side-panel classes recomposed to the ORIGINAL
// hierarchy — .sm-current (top box: clickable, name + money, "£0"
// pre-game), company rows with THIN SEPARATORS and NO heading (QUESTION:
// Label5 evidence pending), .sm-players names-only plain rows
// (single-click details — DEVIATION:[singleclick-details]), .sm-turnbox
// (large teal box, current turn number only), Finish Turn at bottom.
// .sm-players li.current highlight and the .sm-turn "Turn X of Y" line
// are DELETED (A5 FIDELITY: orig list is plain; turn context moved to
// the hint bar).
const CSS = `
html, body { margin: 0; height: 100%; }
.sm-root { display: flex; flex-direction: column; gap: 10px;
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: #e8e8f2; background: #14141f; height: 100vh;
  box-sizing: border-box; padding: 12px; }
.sm-menubar { display: flex; gap: 6px; flex-wrap: wrap; flex: none; }
.sm-menubar button, .sm-side button { background: #2a2a44; color: #e8e8f2;
  border: 1px solid #4a4a6a; border-radius: 4px; padding: 4px 10px; cursor: pointer; }
.sm-menubar button:disabled, .sm-side button:disabled { opacity: 0.4; cursor: default; }
.sm-menubar select { background: #2a2a44; color: #e8e8f2; border: 1px solid #4a4a6a;
  border-radius: 4px; padding: 4px; }
.sm-content { display: flex; gap: 16px; flex: 1 1 auto; min-height: 0; }
.sm-boardcol { display: flex; flex-direction: column; gap: 6px;
  flex: 1 1 68%; min-width: 0; min-height: 0; }
.sm-boardregion { flex: 1 1 auto; min-height: 320px;
  display: flex; align-items: flex-start; justify-content: center; }
.sm-board { display: block; }
.sm-hintbar { font-size: 13px; color: #9a9ac0; min-height: 18px; flex: none; }
.sm-side { width: 300px; flex: none; display: flex; flex-direction: column;
  gap: 8px; min-height: 0; overflow-y: auto; }
.sm-panel { background: #1d1d30; border: 1px solid #3a3a58; border-radius: 6px;
  padding: 10px; }
.sm-panel h4 { margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase;
  letter-spacing: 0.08em; color: #9a9ac0; }
.sm-current { cursor: pointer; }
.sm-cpname { font-size: 15px; margin-bottom: 2px; min-height: 19px; }
.sm-money { font-size: 20px; font-weight: 700; }
.sm-players { list-style: none; margin: 0; padding: 0; }
.sm-players li { padding: 3px 4px; cursor: pointer; }
.sm-comrow { display: flex; align-items: center; gap: 8px; padding: 6px 0;
  border-bottom: 1px solid ${'#2b2b45'}; }
.sm-comrow:last-child { border-bottom: none; }
.sm-comrow button { flex: 1; text-align: left; }
.sm-swatch { width: 14px; height: 14px; border-radius: 3px; flex: none;
  border: 1px solid #333; }
.sm-turnbox { background: #008080; color: #063030; font-size: 38px;
  font-weight: 700; text-align: center; padding: 8px 0; border-radius: 4px;
  flex: none; min-height: 24px; }
@media (max-width: 720px) {
  .sm-root { height: auto; min-height: 100vh; }
  .sm-content { flex-direction: column; }
  .sm-side { width: auto; overflow-y: visible; }
  .sm-boardregion { min-height: 55vh; }
}
`;

export class SpaceMonopolyApp {
  readonly state = new AppState();
  private readonly root: HTMLElement;
  private readonly storage: Storage;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private boardRegion!: HTMLElement;
  private resizeObs: ResizeObserver | null = null;
  private hintBar!: HTMLElement;
  private moneyLabel!: HTMLElement;
  private playerLabel!: HTMLElement;
  private turnBox!: HTMLElement;
  private playerList!: HTMLUListElement;
  private companyRows: Array<{ btn: HTMLButtonElement; swatch: HTMLElement }> = [];
  private continueBtn!: HTMLButtonElement;
  private menuButtons: Record<string, HTMLButtonElement> = {};
  private gridSizeSelect!: HTMLSelectElement;

  private timerHandle: number | null = null;
  private timerTag = 0; // Timer1 Tag, cycles 0..4
  private concluded = false;
  private hintTimeout: number | null = null;

  // (REV 13 SPLIT) The modal queue moved to dialogs.ts with every queued
  // consumer; this class no longer owns dialog-presentation machinery.

  constructor(root: HTMLElement, storage: Storage = localStorage) {
    this.root = root;
    this.storage = storage;
    this.injectStyles();
    this.buildChrome();
    this.setGridSize(SMALL); // includes randomise — FIDELITY: orig FormCreate
    // REV 14 (B3): responsive board — observe the board region and refit
    // (also delivers the initial paint once layout lands; fitBoard
    // early-returns on zero-size regions, e.g. the constructor-time call).
    // REV 15: the region now reports the FITTED height (see CSS notes) —
    // that is the fix; the observer/fit logic itself is unchanged.
    this.resizeObs = new ResizeObserver(() => this.fitBoard());
    this.resizeObs.observe(this.boardRegion);
    this.mainUpdate();
    this.moneyShow();
  }

  // --- Chrome ---------------------------------------------------------------

  private injectStyles(): void {
    const style = el('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    this.root.classList.add('sm-root');
    injectDialogStyles(); // rev 13: dialog CSS from dialogs.ts, order unchanged
  }

  private buildChrome(): void {
    // REV 14 (B3): menubar now full-width at top level of the column root;
    // board column (~68%) + side panel form the content row beneath it.
    // (Menubar STRUCTURE is unchanged in rev 17 — dropdown recomposition
    // is Batch 3.)
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

    // REV 14 (B3): board fills the board column edge-to-edge vertically
    // under the menubar (region), top-aligned (rev 16), aspect-preserved.
    // R12 hint bar (kept per inventory A6) = reserved slim strip below the
    // region (no board occlusion).
    this.boardRegion = el('div', 'sm-boardregion');
    this.boardRegion.appendChild(this.canvas);
    const boardCol = el('div', 'sm-boardcol');
    boardCol.appendChild(this.boardRegion);

    this.hintBar = el('div', 'sm-hintbar', '');
    boardCol.appendChild(this.hintBar);

    const content = el('div', 'sm-content');
    content.appendChild(boardCol);

    // ==========================================================================
    // REV 17 (BATCH 2) — SIDE PANEL, ORIGINAL HIERARCHY (B6):
    // (1) current-player box → (2) company list → (3) names-only Players
    // box → (4) teal turn box → (5) Finish Turn. Replaces the rev-13
    // order (Players → Current Player dup → Companies → button) and
    // absorbs B11's wonkiness ledger.
    // ==========================================================================
    const side = el('div', 'sm-side');

    // (1) B6/B8b: current-player box. Pre-game = "£0" (moneyShow drives
    // it); in play = current player's name over balance. Single-click
    // opens the CURRENT player's details (Lee ruling — pairs with the
    // single-click rows below; orig had no box equivalent).
    const topPanel = el('div', 'sm-panel sm-current');
    this.playerLabel = el('div', 'sm-cpname', '');
    this.moneyLabel = el('div', 'sm-money', '');
    topPanel.appendChild(this.playerLabel);
    topPanel.appendChild(this.moneyLabel);
    topPanel.addEventListener('click', () => {
      if (this.state.player.length > 0) {
        this.detailsDialog(this.state.curplay);
      }
    });
    side.appendChild(topPanel);

    // (2) B10: company list — plain clickable rows, swatch + name, thin
    // separators. NO heading (QUESTION: orig screenshot shows the list
    // starting immediately with the first button; dfm Label5 exists but
    // text/position unreadable — reinstate if wider evidence lands).
    // Company ORDER verified this session (screenshot = port
    // COMPANY_DEFS order exactly). Swatch shape held for D3.
    const cPanel = el('div', 'sm-panel');
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

    // (3) A5 FIDELITY: Players box — NAMES ONLY (orig layout; R10's
    // name+money enhancement retired). Plain rows, no current-player
    // highlight ("copy the original design"). DEVIATION:[singleclick-
    // details]: details open on SINGLE-click (orig = ListBox dblclick)
    // — restores per-player details access for everyone.
    const pPanel = el('div', 'sm-panel');
    pPanel.appendChild(el('h4', undefined, 'Players'));
    this.playerList = el('ul', 'sm-players');
    pPanel.appendChild(this.playerList);
    side.appendChild(pPanel);

    // (4) B8 FIDELITY: large teal box showing ONLY the current turn
    // number. Max-turns context and the "(Tournament)" tag moved to the
    // R12 hint bar (Lee ruling). Populated in mainUpdate; blank pre-game.
    this.turnBox = el('div', 'sm-turnbox', '');
    side.appendChild(this.turnBox);

    // (5) B7: Finish Turn — in-game label per orig BitBtn1; gating and
    // post-game "Game Over" disabled state are the rev-4/10 logic in
    // mainUpdate, untouched. "Place a piece…" sels text kept (port
    // addition — orig just disables the button while sels).
    this.continueBtn = el('button', undefined, 'Finish Turn');
    this.continueBtn.addEventListener('click', () => this.onContinue());
    side.appendChild(this.continueBtn);

    content.appendChild(side);
    this.root.appendChild(menubar);
    this.root.appendChild(content);
  }

  // Rows rebuilt in mainUpdate(); single-click row = that player's
  // details (DEVIATION:[singleclick-details]; supersedes rev-2's
  // FIDELITY:[itemindex] dblclick, whose list is now names-only anyway).
  private rebuildPlayerList(): void {
    const s = this.state;
    this.playerList.textContent = '';
    for (let i = 0; i < s.player.length; i++) {
      const li = el('li');
      li.textContent = s.player[i].name; // A5: names only
      li.addEventListener('click', () => this.detailsDialog(i));
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
    // REV 14 (B3): canvas no longer sized to natural tile units — fitBoard
    // computes the responsive display size (DPR-aware) and repaints.
    // cfg.tileW/tileH stay as the DRAWING units (scaffold is FROZEN —
    // GRID_CONFIGS is not ours to change); see fitBoard/redrawGrid.
    this.fitBoard();
    this.mainUpdate();
  }

  // REV 14 (B3): responsive fit. Computes the largest aspect-preserving
  // board inside the board region, sets the canvas' CSS size to it and the
  // backing store to display size × devicePixelRatio (crisp at any DPR —
  // no upscale blur). Early-returns on zero-size regions (constructor /
  // detached roots); the ResizeObserver delivers the first real fit once
  // layout lands. FIXED SIDE BENEFIT: FIX:[click-mapping]'s
  // rect-proportional mouse mapping is immune to display scaling, so
  // clicks stay correct at every size with no mouse-side changes.
  private fitBoard(): void {
    const cfg = this.state.gridConfig();
    const baseW = cfg.xsize * cfg.tileW;
    const baseH = cfg.ysize * cfg.tileH;
    const rw = this.boardRegion.clientWidth;
    const rh = this.boardRegion.clientHeight;
    if (rw <= 0 || rh <= 0) return;
    const scale = Math.min(rw / baseW, rh / baseH);
    const dispW = Math.max(1, Math.floor(baseW * scale));
    const dispH = Math.max(1, Math.floor(baseH * scale));
    this.canvas.style.width = `${dispW}px`;
    this.canvas.style.height = `${dispH}px`;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(dispW * dpr);
    this.canvas.height = Math.round(dispH * dpr);
    this.redrawGrid();
  }

  redrawGrid(): void {
    const s = this.state;
    const cfg = s.gridConfig();
    const ctx = this.ctx;
    const baseW = cfg.xsize * cfg.tileW;
    const baseH = cfg.ysize * cfg.tileH;

    // REV 14 (B3): map base-tile drawing units onto the backing store.
    // ALL existing draw sites (drawCellEntity, drawSels) remain in base
    // units and scale for free. clearRect is in BASE units too — clearing
    // canvas.width/height here would clear in transformed units and
    // misbehave (backing-store pixels ≠ base units). Keep clear bounds
    // in base units.
    ctx.setTransform(
      this.canvas.width / baseW, 0, 0, this.canvas.height / baseH, 0, 0,
    );
    ctx.clearRect(0, 0, baseW, baseH);

    for (let y = 0; y < cfg.ysize; y++) {
      for (let x = 0; x < cfg.xsize; x++) {
        // Checkerboard — ImageList iStart + (x+y)%2 equivalent.
        // REV 14 (B4): DEVIATION:[dark-checker] — contrast strengthened
        // (palette above); the borders below complete the structure.
        ctx.fillStyle = (x + y) % 2 === 0 ? CHECKER_A : CHECKER_B;
        ctx.fillRect(x * cfg.tileW, y * cfg.tileH, cfg.tileW, cfg.tileH);
        this.drawCellEntity(x, y);
      }
    }

    // REV 14 (B4): thin cell borders — single grid-line pass AFTER the
    // fills/entities so lines read over both checker phases (orig
    // structure: bordered checker; dark-adapted per B1).
    ctx.strokeStyle = GRID_LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= cfg.xsize; x++) {
      ctx.moveTo(x * cfg.tileW, 0);
      ctx.lineTo(x * cfg.tileW, baseH);
    }
    for (let y = 0; y <= cfg.ysize; y++) {
      ctx.moveTo(0, y * cfg.tileH);
      ctx.lineTo(baseW, y * cfg.tileH);
    }
    ctx.stroke();

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
  // canvas is CSS-scaled (flex squeeze, host page, DPR oddities). REV 14:
  // this is what lets the board go responsive with zero mouse changes.

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
      msgBox('Game Information...', err); // rev 13: delegate to dialogs.ts
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

  // REV 17 (B8 displacement): turn context ("Turn X of N" + Tournament
  // tag) lives HERE now, prefixing the R12 guidance — the teal turn box
  // shows only the bare number per B8 FIDELITY.
  private updateHint(): void {
    const s = this.state;
    if (!s.progress) {
      this.setHint('');
    } else {
      const ctx =
        `Turn ${s.turn} of ${s.maxTurns}` +
        (s.gameType === TOURNAMENT ? ' (Tournament)' : '') +
        ' \u2014 ';
      if (s.sels) {
        this.setHint(ctx + 'Click one of the five flashing squares to place your piece.');
      } else {
        this.setHint(ctx + 'Click Finish Turn to pass to the next turn.');
      }
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
  //
  // FIDELITY:[highscores-modal] (rev 12; R16 retired): the sequence is
  // now TWO dialogs — standings modal, then on Close the high-scores
  // modal (tabbed, current grid's tab activated) — matching orig
  // Finish(); HighScores(true);. Both end paths run through here.
  //
  // DEVIATION:[doconclude-composes-tail] (rev 12): composed here rather
  // than via the scaffold's concludeGame() wrapper because the second
  // modal needs the INSERTED table with its transient newEntry flags —
  // the wrapper discards it, and re-running it would duplicate entries.
  // Body is the wrapper's verbatim: finishStandings → highScores(true)
  // → createComs. RE-SYNC WARNING: if concludeGame is ever amended,
  // this three-call sequence must be re-synced manually (see notes).
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
    s.progress = false;
    const standings = finishStandings(s);
    const scores = highScores(s, true, this.storage, SCORES_STORE_KEY);
    createComs(s);
    this.redrawGrid();
    this.mainUpdate();
    this.moneyShow();
    // rev 13: standings + scores modals delegated to dialogs.ts; the
    // two-dialog chaining (standings → scoresTableDialog) is preserved
    // via the onClose callback, exactly as rev 12 did in-file.
    standingsDialog(standings, (a) => this.formatMoney(a), () => {
      // orig: Finish(); then HighScores(true) — second modal, current
      // grid's tab activated, new entries highlighted.
      scoresTableDialog(scores, s.gridType, (a) => this.formatMoney(a));
    });
  }

  // action() hooks — pure logic calls + announcements.
  // FIDELITY:[event-modals]: splits, mergers AND foundings announce via
  // modal dialogs like the orig SplitForm / Merger / NewCom forms. The
  // modal queue (now in dialogs.ts) preserves orig event order.
  //
  // R15 (rev 11): per-player table data is captured EAGERLY in these
  // hooks — both before AND after the mutating hook call — because the
  // DOM modals are queued, not blocking: a later chained event inside
  // the same action() (merger → split) would otherwise present stale or
  // mutated numbers when the dialog finally opens. Display ranges match
  // the orig SplitForm/Merger ListView population exactly: all players
  // in CLASSIC, current player only in TOURNAMENT (identical to the
  // ranges comSplitHook/mergerHook themselves mutate).
  //
  // REV 13 SPLIT: the EAGER CAPTURE stays HERE (renderer.ts) — only the
  // presentation of the rows moved to dialogs.ts. Do not move capture.
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
        foundingDialog(
          this.state,
          id,
          (a) => this.formatMoney(a),
          () => this.tradeDialog(id),
        );
        this.moneyShow();
        this.mainUpdate();
        this.redrawGrid();
      },
      comSplit: (companyId: number) => {
        // Capture per-player shares BEFORE comSplitHook doubles them;
        // AFTER values read post-mutation (orig displays post-mutation).
        const s = this.state;
        const oldPrice = s.company[companyId].value;
        const start = s.gameType === TOURNAMENT ? s.curplay : 0;
        const end = s.gameType === TOURNAMENT ? s.curplay + 1 : s.numplays;
        const rows: SplitTableRow[] = [];
        for (let i = start; i < end; i++) {
          rows.push({
            playerIndex: i,
            name: s.player[i].name,
            sharesBefore: s.player[i].shares[companyId],
            sharesAfter: 0n, // filled after the hook mutates
          });
        }
        comSplitHook(s, companyId);
        for (const r of rows) {
          r.sharesAfter = s.player[r.playerIndex].shares[companyId];
        }
        splitDialog(s, companyId, oldPrice, rows, (a) => this.formatMoney(a));
        this.moneyShow();
      },
      merger: (survivorId: number, absorbedId: number) => {
        // Capture pre-merger values BEFORE mergerHook mutates them;
        // per-player rows assembled POST-mutation (orig Merger populates
        // its ListView after mutating — mutation-before-display).
        // Absorbed holdings are unchanged by the hook (zombie-shares
        // quirk: never zeroed), so post-read equals pre-read; survivor
        // holdings ARE changed by CLASSIC conversion, hence post-read.
        // moneyEarned = absorbed shares × PRE-merger absorbed value.
        const s = this.state;
        const oldSurvivorValue = s.company[survivorId].value;
        const absorbedValue = s.company[absorbedId].value;
        const start = s.gameType === TOURNAMENT ? s.curplay : 0;
        const end = s.gameType === TOURNAMENT ? s.curplay + 1 : s.numplays;
        const preAbsorbed: import('./scaffold').Money[] = [];
        for (let i = start; i < end; i++) {
          preAbsorbed.push(s.player[i].shares[absorbedId]);
        }
        mergerHook(s, survivorId, absorbedId);
        const rows: MergerTableRow[] = [];
        for (let k = 0; k < preAbsorbed.length; k++) {
          const i = start + k;
          rows.push({
            playerIndex: i,
            name: s.player[i].name,
            absorbedShares: preAbsorbed[k],
            survivorShares: s.player[i].shares[survivorId],
            moneyEarned: preAbsorbed[k] * BigInt(absorbedValue),
          });
        }
        mergerDialog(
          s,
          survivorId,
          absorbedId,
          oldSurvivorValue,
          absorbedValue,
          rows,
          (a) => this.formatMoney(a),
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
    // REV 17 (B8b): pre-game the top box shows "£0" (orig initial
    // screenshot state); in play it is the CURRENT player's balance.
    // Name updates live in mainUpdate (playerLabel).
    this.moneyLabel.textContent =
      s.player.length === 0
        ? this.formatMoney(0n)
        : this.formatMoney(s.player[s.curplay].money);

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
    // REV 17 (B7): in-game label is "Finish Turn" (was Continue); the
    // "Place a piece…" sels text is kept (port addition). Post-game
    // labels/gating are the rev-4/10 behavior, untouched.
    this.continueBtn.disabled = s.progress ? !!s.sels : this.concluded;
    this.continueBtn.textContent = s.progress
      ? (s.sels ? 'Place a piece\u2026' : 'Finish Turn')
      : (playing && !this.concluded ? 'See Results' : 'Game Over');

    // Company buttons: Enabled = Exist (trade BUTTONS gated on !sels
    // inside the dialog, per orig InfoButs).
    for (let i = 0; i < NUM_COMPANIES; i++) {
      this.companyRows[i].btn.disabled = !(s.company[i]?.exist ?? false);
    }

    this.rebuildPlayerList();
    this.playerLabel.textContent = playing ? s.player[s.curplay].name : '';

    // REV 17 (B8): teal box = CURRENT TURN NUMBER ONLY. Blank pre-game
    // (playing false). Turn/max/(Tournament) context lives in the hint
    // bar (updateHint).
    this.turnBox.textContent = playing ? String(s.turn) : '';

    // MenuUpdate: setup menus when !progress; End Game when progress.
    this.menuButtons['newGame'].disabled = s.progress;
    this.menuButtons['newGrid'].disabled = s.progress;
    this.gridSizeSelect.disabled = s.progress;
    this.menuButtons['prefs'].disabled = s.progress;
    this.menuButtons['endGame'].disabled = !s.progress;

    this.updateHint();
  }

  // --- Dialog delegates (rev 13) ----------------------------------------------
  // Thin methods delegating to dialogs.ts; the app supplies state,
  // formatMoney, and its own refresh/flow callbacks. Order of operations
  // on each path is preserved verbatim from the rev-12 in-file versions.

  private newGameDialog(): void {
    newGameDialog(this.state, {
      setGridSize: (t) => this.setGridSize(t),
      onGameStarted: () => {
        this.concluded = false;
      },
      redrawGrid: () => this.redrawGrid(),
      moneyShow: () => this.moneyShow(),
      mainUpdate: () => this.mainUpdate(),
      beginTurnChoices: () => this.beginTurnChoices(),
    });
  }

  private tradeDialog(id: number): void {
    tradeDialog(
      this.state,
      id,
      (a) => this.formatMoney(a),
      () => this.redrawGrid(),
      () => this.moneyShow(),
    );
  }

  private detailsDialog(pnum: number): void {
    detailsDialog(this.state, pnum, (a) => this.formatMoney(a));
  }

  private prefsDialog(): void {
    prefsDialog(() => this.moneyShow(), this.storage, PREFERENCES_STORE_KEY);
  }

  private scoresDialog(): void {
    scoresDialog(this.state, (a) => this.formatMoney(a), this.storage, SCORES_STORE_KEY);
  }

  private aboutDialog(): void {
    aboutDialog();
  }

  private quitConfirm(): void {
    // R7: orig closemain ≈ confirm + reload. Score warning only mid-game
    // (s.progress captured at open time, exactly as rev 12 did).
    quitConfirm(this.state.progress, () => window.location.reload());
  }
}

// Entry point. Typical host page:
//   <div id="app"></div>
//   <script type="module">
//     import { mountApp } from './renderer.js';
//     mountApp(document.getElementById('app')!);
//   </script>

export function mountApp(root: HTMLElement, storage: Storage = localStorage): SpaceMonopolyApp {
  // REV 14 (B9): DEVIATION:[title-short] — orig form caption was
  // 'Space Monopoly v1.2 - 2001 David Vivash' (dfm evidence); Lee chose
  // the short form for the port's document title.
  document.title = 'Space Monopoly';
  return new SpaceMonopolyApp(root, storage);
}
