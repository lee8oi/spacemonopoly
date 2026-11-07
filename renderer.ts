// ============================================================================
// SPACE MONOPOLY PORT — RENDERER / UI LAYER (renderer.ts) — rev 25
// App shell: chrome (menubar/menus, side panel), responsive canvas board,
// mouse, timers, turn flow, dialog delegates, and action() hooks.
// REV 25 (Session 29, Batch G):
//  (1) Swatch affordability = centered WHITE DOT on the company-colored
//      swatch, replacing the rev-3 white BORDER
//      (DEVIATION:[white-dot-affordance]; R13 / Lee ruling §12.6-7).
//  (2) Header + historical commentary collapsed per the comment-
//      relocation policy; live contracts stay at their sites.
//      History: ARCHIVE.md Section 5 (rev-24-era spine);
//      RENDERER-ARCHIVE.md (renderer revs 16–23).
//  (3) DEVIATION:[prefs-wired] — loadPreferences(this.storage) runs at
//      construction, before first paint, activating the dormant scaffold
//      reader on boot (option b; supersedes the orig half-wired quirk).
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
  loadPreferences,
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

const TIMER_INTERVAL_MS = 250;        // orig Timer1 interval unknown; chosen
const SCORES_STORE_KEY = 'HighScores'; // storage key (orig: per-table files)

// Palette — approximations of orig ImageList tiles, tuned for the dark
// theme. DEVIATION:[dark-checker]: beige→dark checker (B1); restoring the
// orig beige checker is a two-constant change if a light theme (D1) lands.
const CHECKER_A = '#43435e';
const CHECKER_B = '#36364d';
const GRID_LINE = '#12121c';
// Faithful blue circle, brightened for the dark board (tunable live).
const CIRCLE_FILL = '#4f83e8';
const CIRCLE_STROKE = '#16204a';
// Faithful yellow rotated square; flat fill, thin black outline (the
// rev-21 highlight ellipse is dead — it read as a spurious glyph).
const DIAMOND_FILL = '#ffd74a';
const DIAMOND_STROKE = '#12121c';
// Sels (rev-20 correction): normal = solid royal blue + thick white
// border; active (timer-cycled) = solid blue + thick lime-green border.
const SEL_FILL = '#0000ff';
const SEL_BORDER_NORMAL = '#ffffff';
const SEL_BORDER_ACTIVE = '#32cd32'; // lime green
const ACTIVE_STROKE = '#32cd32';     // same as SEL_BORDER_ACTIVE
// Teal turn box: faithful-bright VCL clTeal #008080 (approximation);
// dark numerals per approved design. Theming revisit is Lee-flagged.
const TURNBOX_BG = '#008080';
const TURNBOX_FG = '#063030';
const TURNBOX_SEP = '#2b2b45';
// Menu chrome (DEVIATION:[menu-styling] — dark-app adaptation of Win2k
// native menu colors).
const MENU_BG = '#f4f4f0';
const MENU_FG = '#1a1a24';
const MENU_HOVER_BG = '#316ac5';   // clHighlight
const MENU_HOVER_FG = '#ffffff';
const MENU_DISABLED_FG = '#8a8a90';
const MENU_BORDER = '#8a8a96';
const MENU_UNDERLAY_Z = '900';    // below dialog overlays (dialogs.ts)
const MENU_PANEL_Z = '905';

// Chrome stylesheet. Board canvas paints edge-to-edge in its region;
// side panel scrolls internally; ≤720px stacks board above panel
// (first-cut accommodation; dedicated mobile pass deferred — see
// STATE.md responsive direction). Dialog CSS is injected separately
// by injectDialogStyles() (dialogs.ts); chrome sheet first, dialog
// sheet second — order preserved.
// REV 25: .sm-swatch gains position:relative + a centered .sm-dot child
// rule (white-dot affordability); swatch border is STATIC #333 now.
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
  border-bottom: 1px solid ${TURNBOX_SEP}; }
.sm-comrow:last-child { border-bottom: none; }
.sm-comrow button { flex: 1; text-align: left; }
.sm-swatch { width: 14px; height: 14px; border-radius: 3px; flex: none;
  border: 1px solid #333; position: relative; }
.sm-swatch .sm-dot { position: absolute; inset: 4px; background: #ffffff;
  border-radius: 50%; }
.sm-turnbox { background: #008080; color: #063030; font-size: 38px;
  font-weight: 700; text-align: center; padding: 8px  0; border-radius: 4px;
  flex: none; min-height: 24px; }
@media (max-width: 720px) {
  .sm-root { height: auto; min-height: 100vh; }
  .sm-content { flex-direction: column; }
  .sm-side { width: auto; overflow-y: visible; }
  .sm-boardregion { min-height: 55vh; }
}
/* ==== MENU RULES (dropdown panels; DEVIATION:[menu-styling]) ==== */
.sm-menubar .sm-menubtn { background: #2a2a44; color: #e8e8f2;
  border: 1px solid #4a4a6a; border-radius: 4px; padding: 4px 10px;
  cursor: pointer; font-size: 14px; }
.sm-menubar .sm-menubtn.sm-open { background: #4a4a6a; }
.sm-menupanel { display: none; position: fixed; background: ${MENU_BG};
  border: 1px solid ${MENU_BORDER}; border-radius: 4px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
  padding: 4px 0; min-width: 190px; z-index: ${MENU_PANEL_Z}; }
.sm-menuitem { display: flex; align-items: center; padding: 5px 12px 5px 6px;
  color: ${MENU_FG}; font-size: 14px; cursor: default; white-space: nowrap; }
.sm-menuitem:hover { background: ${MENU_HOVER_BG}; color: ${MENU_HOVER_FG}; }
.sm-menuitem.sm-disabled { color: ${MENU_DISABLED_FG}; }
.sm-menuitem.sm-disabled:hover { background: transparent; }
.sm-menuitem .sm-mitem-gutter { width: 18px; flex: none; text-align: center; }
.sm-menuitem .sm-mitem-arrow { margin-left: auto; padding-left: 18px; }
.sm-menuunderlay { position: fixed; inset: 0; z-index: ${MENU_UNDERLAY_Z}; }
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
  // REV 25: swatch rows gain the affordability DOT element
  // (DEVIATION:[white-dot-affordance] — dot visible = affordable).
  private companyRows: Array<{ btn: HTMLButtonElement; swatch: HTMLElement; dot: HTMLElement }> = [];
  private continueBtn!: HTMLButtonElement;

  // Menu system state. menuItems = every menu row, held BY REFERENCE
  // (never querySelector-scrape in mainUpdate — rev-18 lesson). Panels
  // positioned via getBoundingClientRect at OPEN time, never at
  // construction. gridFlyoutPanel = the Grid Size flyout.
  private menuItems: Record<string, HTMLDivElement> = {};
  private menuPanels: HTMLDivElement[] = [];
  private gridFlyoutPanel!: HTMLDivElement;
  private gridBullets: Record<string, HTMLElement> = {};
  private topMenus: Array<HTMLButtonElement> = [];
  private openTopIdx = -1;
  private underlay: HTMLDivElement | null = null;
  private flyoutOpen = false;

  private timerHandle: number | null = null;
  private timerTag = 0; // Timer1 Tag, cycles 0..4
  private concluded = false;
  private hintTimeout: number | null = null;

  constructor(root: HTMLElement, storage: Storage = localStorage) {
    this.root = root;
    this.storage = storage;
    this.injectStyles();
    this.buildChrome();
    this.setGridSize(SMALL); // includes randomise — FIDELITY: orig FormCreate
    // Responsive board — observe the board region and refit (delivers the
    // initial paint once layout lands; fitBoard early-returns on zero-size
    // regions, e.g. this constructor-time path).
    this.resizeObs = new ResizeObserver(() => this.fitBoard());
    this.resizeObs.observe(this.boardRegion);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeMenus(); // DEVIATION:[menu-interaction]
    });
    // DEVIATION:[prefs-wired] (REV 25): activate stored preferences at
    // boot, BEFORE the first mainUpdate/moneyShow, so a saved currency
    // unit is live for the first paint instead of flashing the default.
    loadPreferences(this.storage);
    this.mainUpdate();
    this.moneyShow();
  }

  // --- Chrome ---------------------------------------------------------------

  private injectStyles(): void {
    const style = el('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    this.root.classList.add('sm-root');
    injectDialogStyles(); // dialog CSS from dialogs.ts; chrome sheet first
  }

  private buildChrome(): void {
    // Column root: full-width menubar, then content row (board column
    // ~68% + side panel). Menubar CONTENT = three dropdown menus
    // (Project / Options / Help); no select elements.
    const menubar = el('div', 'sm-menubar');

    // Leaf-item factory: div row with an 18px gutter (bullet lives there
    // for grid items), label span, click handler guarded on enabled state.
    // References are stored in this.menuItems under the given key —
    // mainUpdate toggles .sm-disabled on these references directly.
    const mkItem = (
      key: string,
      label: string,
      onClick: () => void,
      bullet?: HTMLElement,
    ): HTMLDivElement => {
      const item = el('div', 'sm-menuitem');
      const gutter = el('span', 'sm-mitem-gutter');
      if (bullet) gutter.appendChild(bullet);
      item.appendChild(gutter);
      item.appendChild(el('span', undefined, label));
      item.addEventListener('click', () => {
        if (item.classList.contains('sm-disabled')) return;
        this.closeMenus();
        onClick();
      });
      this.menuItems[key] = item;
      return item;
    };

    // Dropdown-panel factory (display:none via CSS default; shown only
    // by openMenu/openFlyout, position:fixed — see those for geometry).
    const mkPanel = (...items: HTMLElement[]): HTMLDivElement => {
      const panel = el('div', 'sm-menupanel');
      for (const it of items) panel.appendChild(it);
      document.body.appendChild(panel);
      this.menuPanels.push(panel);
      return panel;
    };

    // Top-level menu factory: click toggles; hover switches when a menu
    // is already open (DEVIATION:[menu-interaction] — Windows behavior).
    const mkTop = (label: string, panel: HTMLDivElement): HTMLButtonElement => {
      const btn = el('button', 'sm-menubtn', label);
      const idx = this.topMenus.length;
      btn.addEventListener('click', () => {
        if (this.openTopIdx === idx) {
          this.closeMenus();
        } else {
          this.openMenu(idx, panel);
        }
      });
      btn.addEventListener('mouseenter', () => {
        if (this.openTopIdx >= 0 && this.openTopIdx !== idx) {
          this.openMenu(idx, panel); // hover-switch
        }
      });
      this.topMenus.push(btn);
      menubar.appendChild(btn);
      return btn;
    };

    // ---- GRID SIZE FLYOUT (A4 FIDELITY: literal asterisk captions) ---------
    // Built first because the Options panel references it.
    const gridSizes: Array<{ type: GridType; key: string; caption: string }> = [
      { type: SMALL, key: 'grid-small', caption: '16*12 (80 turns)' },   // A4
      { type: MEDIUM, key: 'grid-medium', caption: '22*18 (120 turns)' }, // A4
      { type: LARGE, key: 'grid-large', caption: '28*24 (160 turns)' },   // A4
    ];
    const gridPanel = mkPanel();
    for (const g of gridSizes) {
      const bullet = el('span', undefined, '\u2022'); // • current-size marker
      bullet.style.visibility = 'hidden';
      this.gridBullets[g.key] = bullet;
      gridPanel.appendChild(
        mkItem(g.key, g.caption, () => this.setGridSize(g.type), bullet),
      );
    }
    this.gridFlyoutPanel = gridPanel;

    // ---- PROJECT (B2 FIDELITY: New Game · End Game · View High Scores · Quit)
    const projectPanel = mkPanel(
      mkItem('newGame', 'New Game', () => this.newGameDialog()),
      mkItem('endGame', 'End Game', () => this.doConclude(true)),
      mkItem('scores', 'View High Scores', () => this.scoresDialog()),
      mkItem('quit', 'Quit', () => this.quitConfirm()),
    );

    // ---- OPTIONS (Create New Grid · Grid Size ▸ · Preferences) --------------
    // Grid Size is a CASCADE: hovering (or clicking) its row opens the
    // flyout; hovering any other row in the panel closes it. The flyout
    // is positioned to the RIGHT of the row with edge flip (openFlyout).
    const optionsPanel = mkPanel();
    optionsPanel.appendChild(
      mkItem('newGrid', 'Create New Grid', () => {
        // MenuUpdate gates this to !progress (enforced in mainUpdate).
        this.state.grid.randomise();
        this.redrawGrid();
      }),
    );
    const gridRow = el('div', 'sm-menuitem');
    gridRow.appendChild(el('span', 'sm-mitem-gutter'));
    gridRow.appendChild(el('span', undefined, 'Grid Size'));
    const gridArrow = el('span', 'sm-mitem-arrow', '\u25B6'); // ▶
    gridRow.appendChild(gridArrow);
    this.menuItems['gridSize'] = gridRow; // gating reference (whole row)
    gridRow.addEventListener('click', () => this.openFlyout());
    gridRow.addEventListener('mouseenter', () => this.openFlyout());
    optionsPanel.appendChild(gridRow);
    optionsPanel.appendChild(
      mkItem('prefs', 'Preferences', () => this.prefsDialog()),
    );
    // Non-Grid rows close the flyout on hover.
    for (const child of Array.from(optionsPanel.children)) {
      if (child !== gridRow) {
        child.addEventListener('mouseenter', () => this.closeFlyout());
      }
    }

    // ---- HELP (About Space Monopoly) ----------------------------------------
    const helpPanel = mkPanel(
      mkItem('about', 'About Space Monopoly', () => this.aboutDialog()),
    );

    mkTop('Project', projectPanel);   // topMenus[0]
    mkTop('Options', optionsPanel);   // topMenus[1]
    mkTop('Help', helpPanel);         // topMenus[2]

    this.canvas = el('canvas', 'sm-board');
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));

    // Board fills the board column edge-to-edge vertically under the
    // menubar (region), top-aligned, aspect-preserved. R12 hint bar
    // (kept per inventory A6) = reserved slim strip below the region
    // (no board occlusion).
    this.boardRegion = el('div', 'sm-boardregion');
    this.boardRegion.appendChild(this.canvas);
    const boardCol = el('div', 'sm-boardcol');
    boardCol.appendChild(this.boardRegion);

    this.hintBar = el('div', 'sm-hintbar', '');
    boardCol.appendChild(this.hintBar);

    const content = el('div', 'sm-content');
    content.appendChild(boardCol);

    // ---- SIDE PANEL, ORIGINAL HIERARCHY (B6) --------------------------------
    // (1) current-player box → (2) company list → (3) names-only Players
    // box → (4) teal turn box → (5) Finish Turn.

    // (1) B6/B8b: current-player box. Pre-game = "£0" (moneyShow drives
    // it); in play = current player's name over balance. Single-click
    // opens the CURRENT player's details (pairs with the single-click
    // rows below; orig had no box equivalent).
    const side = el('div', 'sm-side');
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
    // separators. NO heading (source-confirmed Session 24 §12.6-8 —
    // permanent). Company order = port COMPANY_DEFS order (verified).
    // REV 25: each swatch gains a centered dot child — AFFORDABILITY
    // indicator (white dot on company color; hidden when unaffordable
    // or company nonexistent). DEVIATION:[white-dot-affordance].
    const cPanel = el('div', 'sm-panel');
    for (let i = 0; i < NUM_COMPANIES; i++) {
      const row = el('div', 'sm-comrow');
      const swatch = el('span', 'sm-swatch');
      swatch.style.background = COMPANY_DEFS[i].color;
      const dot = el('span', 'sm-dot');
      swatch.appendChild(dot);
      const btn = el('button', undefined, COMPANY_DEFS[i].name);
      btn.addEventListener('click', () => {
        if (this.state.company[i]?.exist) this.tradeDialog(i);
      });
      row.appendChild(swatch);
      row.appendChild(btn);
      cPanel.appendChild(row);
      this.companyRows.push({ btn, swatch, dot });
    }
    side.appendChild(cPanel);

    // (3) A5 FIDELITY: Players box — NAMES ONLY (orig layout). Plain
    // rows, no current-player highlight ("copy the original design").
    // DEVIATION:[singleclick-details]: details open on SINGLE-click
    // (orig = ListBox dblclick) — restores per-player details access
    // for everyone.
    const pPanel = el('div', 'sm-panel');
    pPanel.appendChild(el('h4', undefined, 'Players'));
    this.playerList = el('ul', 'sm-players');
    pPanel.appendChild(this.playerList);
    side.appendChild(pPanel);

    // (4) B8 FIDELITY: large teal box showing ONLY the current turn
    // number. Max-turns context and the "(Tournament)" tag live in the
    // R12 hint bar. Populated in mainUpdate; blank pre-game.
    this.turnBox = el('div', 'sm-turnbox', '');
    side.appendChild(this.turnBox);

    // (5) B7: Finish Turn — in-game label per orig BitBtn1; gating and
    // post-game "Game Over" disabled state are mainUpdate's job.
    // "Place a piece…" sels text kept (port addition — orig just
    // disables the button while sels).
    this.continueBtn = el('button', undefined, 'Finish Turn');
    this.continueBtn.addEventListener('click', () => this.onContinue());
    side.appendChild(this.continueBtn);

    content.appendChild(side);
    this.root.appendChild(menubar);
    this.root.appendChild(content);
  }

    // ---- MENU OPEN/CLOSE/POSITIONING -----------------------------------------
  // Panels are position:fixed; geometry computed at OPEN time from
  // getBoundingClientRect (viewport coords — immune to ancestor stacking
  // and the flex/menubar-wrap layout). Panels are display:none by CSS
  // default; openMenu/openFlyout reveal them; closeMenus hides ALL
  // panels. The underlay exists ONLY while a menu is open and is
  // REMOVED on close — never a resident click-blocker.

  private openMenu(idx: number, panel: HTMLDivElement): void {
    this.closeMenus(); // hide any open panel/flyout/underlay first
    this.openTopIdx = idx;
    this.topMenus[idx].classList.add('sm-open');

    this.ensureUnderlay();
    panel.style.visibility = 'hidden';
    panel.style.display = 'block';

    const btnRect = this.topMenus[idx].getBoundingClientRect();
    let left = btnRect.left;
    // Horizontal clamp: never overflow the right viewport edge.
    const vw = window.innerWidth;
    const pw = panel.offsetWidth;
    if (left + pw > vw - 4) left = Math.max(4, vw - 4 - pw);
    panel.style.left = `${left}px`;
    panel.style.top = `${btnRect.bottom + 2}px`;

    panel.style.visibility = 'visible';
  }

  private openFlyout(): void {
    if (this.openTopIdx !== 1) return; // flyout only meaningful under Options
    if (this.flyoutOpen) return;
    const flyout = this.gridFlyoutPanel;
    const rowRect = this.menuItems['gridSize'].getBoundingClientRect();

    this.flyoutOpen = true;
    flyout.style.visibility = 'hidden';
    flyout.style.display = 'block';

    // Right-cascade with EDGE FLIP: mirror leftward if the flyout would
    // overflow the right viewport edge (width-bound AND ≤720px regimes —
    // same code path; measured while hidden so the flip is exact).
    const vw = window.innerWidth;
    const fw = flyout.offsetWidth;
    let left = rowRect.right + 2;
    if (left + fw > vw - 4) left = Math.max(4, rowRect.left - fw - 2);
    flyout.style.left = `${left}px`;
    flyout.style.top = `${rowRect.top}px`;

    flyout.style.visibility = 'visible';
  }

  private closeFlyout(): void {
    if (!this.flyoutOpen) return;
    this.flyoutOpen = false;
    this.gridFlyoutPanel.style.display = 'none';
  }

  private closeMenus(): void {
    this.closeFlyout();
    this.openTopIdx = -1;
    for (const b of this.topMenus) b.classList.remove('sm-open');
    for (const p of this.menuPanels) p.style.display = 'none';
    this.closeUnderlay();
  }

  private ensureUnderlay(): void {
    if (this.underlay) return;
    const u = el('div', 'sm-menuunderlay');
    u.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.closeMenus();
    });
    document.body.appendChild(u);
    this.underlay = u;
  }

  private closeUnderlay(): void {
    if (this.underlay) {
      this.underlay.remove();
      this.underlay = null;
    }
  }

  // Rows rebuilt in mainUpdate(); single-click row = that player's
  // details (DEVIATION:[singleclick-details]).
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
    this.fitBoard();
    this.mainUpdate();
  }

  // Responsive fit. Computes the largest aspect-preserving board inside
  // the board region, sets the canvas' CSS size to it and the backing
  // store to display size × devicePixelRatio (crisp at any DPR — no
  // upscale blur). Early-returns on zero-size regions (constructor /
  // detached roots); the ResizeObserver delivers the first real fit once
  // layout lands. FIX:[click-mapping]'s rect-proportional mouse mapping
  // is immune to display scaling, so clicks stay correct at every size
  // with no mouse-side changes.
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

    // Map base-tile drawing units onto the backing store. ALL existing
    // draw sites (drawCellEntity, drawSels) remain in base units and
    // scale for free. clearRect is in BASE units too — clearing
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
        // DEVIATION:[dark-checker] — dark palette per B1.
        ctx.fillStyle = (x + y) % 2 === 0 ? CHECKER_A : CHECKER_B;
        ctx.fillRect(x * cfg.tileW, y * cfg.tileH, cfg.tileW, cfg.tileH);
        this.drawCellEntity(x, y);
      }
    }

    // Thin cell borders — single grid-line pass AFTER the fills/entities
    // so lines read over both checker phases.
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

  // SEAM — board-entity art at drawCellEntity(). Swap point if extracted
  // .res bitmaps are ever wanted. Contract: draws in BASE tile units
  // under the canvas transform.
  //
  // Entities:
  //  (1) COMPANY_CELL_BASE+: symmetric CROSS TOKEN in company color,
  //      thick dark outline tracing all edges. Geometry (square cells,
  //      DEVIATION:[square-cells]): center square 70% of the cell; ALL
  //      FOUR arms use the SAME span fraction (46% half-span); arm
  //      width 33%. DEVIATION:[company-initial] — white letter A–E on
  //      the center square, stroked-outline halo, 40%-of-cell font.
  //  (2) CELL_CIRCLE: faithful BLUE circle (brightened for dark checker).
  //  (3) CELL_DIAMOND: faithful YELLOW rotated square, flat fill.
  //  DEVIATION:[token-flat-shading] — no bevels/drop shadows.
  private drawCellEntity(x: number, y: number): void {
    const s = this.state;
    const cfg = s.gridConfig();
    const cell = s.grid.get(x, y);
    if (cell === CELL_EMPTY) return;
    const ctx = this.ctx;
    const cx = x * cfg.tileW + cfg.tileW / 2;
    const cy = y * cfg.tileH + cfg.tileH / 2;
    const m = Math.min(cfg.tileW, cfg.tileH);
    if (cell === CELL_CIRCLE) {
      // Faithful blue circle, brightened for dark board.
      // Size: ~90% of smaller tile dimension.
      const r = m * 0.45;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = CIRCLE_FILL;
      ctx.fill();
      ctx.strokeStyle = CIRCLE_STROKE;
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (cell === CELL_DIAMOND) {
      // Faithful yellow rotated square, near-full cell, flat fill +
      // black outline only (highlight ellipse removed — it read as a
      // spurious glyph at cell sizes).
      const r = m * 0.48;
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
      const color = s.company[com]?.color ?? '#888';

      // Symmetric cross (square cells): all four arms use the SAME
      // span fraction of the cell; no vertical full-bleed.
      const centerSize = m * 0.70;
      const armW = m * 0.33;
      const halfSpan = m * 0.46;
      const halfCs = centerSize / 2;
      const armLen = halfSpan - halfCs;

      ctx.fillStyle = color;
      ctx.strokeStyle = '#12121c';
      ctx.lineWidth = 2;

      // Center square.
      ctx.fillRect(cx - halfCs, cy - halfCs, centerSize, centerSize);
      ctx.strokeRect(cx - halfCs, cy - halfCs, centerSize, centerSize);

      // Arms — top, bottom, left, right (identical geometry both axes).
      ctx.fillRect(cx - armW / 2, cy - halfSpan, armW, armLen);
      ctx.strokeRect(cx - armW / 2, cy - halfSpan, armW, armLen);
      ctx.fillRect(cx - armW / 2, cy + halfCs, armW, armLen);
      ctx.strokeRect(cx - armW / 2, cy + halfCs, armW, armLen);
      ctx.fillRect(cx - halfSpan, cy - armW / 2, armLen, armW);
      ctx.strokeRect(cx - halfSpan, cy - armW / 2, armLen, armW);
      ctx.fillRect(cx + halfCs, cy - armW / 2, armLen, armW);
      ctx.strokeRect(cx + halfCs, cy - armW / 2, armLen, armW);

      // DEVIATION:[company-initial] — white letter A–E on the center
      // square (stroked-outline halo + bold 40% font).
      const letter = String.fromCharCode(65 + com);
      const fontSize = Math.floor(m * 0.4);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.lineWidth = Math.max(2, m * 0.06);
      ctx.strokeStyle = '#12121c';
      ctx.strokeText(letter, cx, cy);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(letter, cx, cy);
    }
  }

  // Sels: normal selection = solid royal blue fill + thick white border;
  // active (timer-cycled) = solid blue square + thick lime-green border.
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
        // Active: solid blue square + thick green border.
        ctx.fillStyle = SEL_FILL;
        ctx.fillRect(px, py, cfg.tileW, cfg.tileH);
        ctx.strokeStyle = ACTIVE_STROKE;
        ctx.lineWidth = 3;
        ctx.strokeRect(px + 2, py + 2, cfg.tileW - 4, cfg.tileH - 4);
      } else {
        // Normal: solid blue fill + thick white border.
        ctx.fillStyle = SEL_FILL;
        ctx.fillRect(px, py, cfg.tileW, cfg.tileH);
        ctx.strokeStyle = SEL_BORDER_NORMAL;
        ctx.lineWidth = 3;
        ctx.strokeRect(px + 2, py + 2, cfg.tileW - 4, cfg.tileH - 4);
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

  // --- Mouse (FIX:[click-mapping] rect-proportional mapping) -----------------
  // Correct even if the canvas is CSS-scaled (flex squeeze, host page,
  // DPR oddities) — this is what lets the board stay responsive with
  // zero mouse-side changes.

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
      msgBox('Game Information...', err);
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

  // Turn context ("Turn X of N" + Tournament tag) lives HERE, prefixing
  // the R12 guidance — the teal turn box shows only the bare number per
  // B8 FIDELITY.
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
        // FIDELITY:[auto-finish]: orig BitBtn1Click calls Finish() the
        // instant the final turn ends — standings and high scores commit
        // immediately, no intermediate "See Results" click. The button
        // remains as a post-hoc viewer (doConclude's concluded-guard
        // makes it a no-op the second time).
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
      drawSels: () => this.redrawGrid(), // sels already true; full repaint
      startSelectorTimer: () => this.startSelectorTimer(),
      mainUpdate: () => this.mainUpdate(),
    });
  }

  // Shared end-of-game tail (orig: BitBtn1Click !progress branch and
  // EndGame1Click converge on Finish → HighScores(true) → CreateComs).
  // FIX:[doconclude-guard]: force=true (End Game menu) concludes even
  // mid-game, mirroring orig EndGame1Click; force=false (natural end /
  // post-hoc viewer) only valid once the game has ended.
  // FIDELITY:[highscores-modal]: the sequence is TWO dialogs — standings
  // modal, then on Close the high-scores modal (tabbed, current grid's
  // tab activated) — matching orig Finish(); HighScores(true);. Both end
  // paths run through here.
  //
  // DEVIATION:[doconclude-composes-tail]: composed here rather than via
  // the scaffold's concludeGame() wrapper because the second modal needs
  // the INSERTED table with its transient newEntry flags — the wrapper
  // discards it, and re-running it would duplicate entries. Body is the
  // wrapper's verbatim: finishStandings → highScores(true) → createComs.
  // RE-SYNC WARNING: if concludeGame is ever amended, this three-call
  // sequence must be re-synced manually.
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
    // Standings + scores modals delegated to dialogs.ts; the two-dialog
    // chaining (standings → scoresTableDialog) is preserved via the
    // onClose callback.
    standingsDialog(standings, (a) => this.formatMoney(a), () => {
      // orig: Finish(); then HighScores(true) — second modal, current
      // grid's tab activated, new entries highlighted.
      scoresTableDialog(scores, s.gridType, (a) => this.formatMoney(a));
    });
  }

    // action() hooks — pure logic calls + announcements.
  // FIDELITY:[event-modals]: splits, mergers AND foundings announce via
  // modal dialogs like the orig SplitForm / Merger / NewCom forms. The
  // modal queue (in dialogs.ts) preserves orig event order.
  //
  // Per-player table data is captured EAGERLY in these hooks — both
  // before AND after the mutating hook call — because the DOM modals
  // are queued, not blocking: a later chained event inside the same
  // action() (merger → split) would otherwise present stale or mutated
  // numbers when the dialog finally opens. DO NOT MOVE THE CAPTURE.
  // Display ranges match the orig SplitForm/Merger ListView population
  // exactly: all players in CLASSIC, current player only in TOURNAMENT
  // (identical to the ranges comSplitHook/mergerHook themselves mutate).
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
        // Capture pre-merger absorbed holdings BEFORE mergerHook mutates;
        // per-player rows assembled POST-mutation (orig Merger populates
        // its ListView after mutating — mutation-before-display).
        // Absorbed holdings are unchanged by the hook (zombie-shares
        // quirk: never zeroed), so post-read equals pre-read; survivor
        // holdings ARE changed by CLASSIC conversion, hence post-read.
        // moneyEarned = absorbed shares × PRE-merger absorbed value.
        const s = this.state;
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
          rows,
          (a) => this.formatMoney(a),
        );
        this.moneyShow();
      },
    };
  }

  // --- MoneyShow / MainUpdate --------------------------------------------------

  private formatMoney(amount: bigint): string {
    const cu = getGame().getPrefs().getCurrencyUnit();
    return cu.output(comma(amount.toString()));
  }

  moneyShow(): void {
    const s = this.state;
    // Pre-game the top box shows "£0" (orig initial screenshot state);
    // in play it is the CURRENT player's balance. Name updates live in
    // mainUpdate (playerLabel).
    this.moneyLabel.textContent =
      s.player.length === 0
        ? this.formatMoney(0n)
        : this.formatMoney(s.player[s.curplay].money);

    // REV 25 — DEVIATION:[white-dot-affordance] (R13 / Lee §12.6-7):
    // affordability = centered WHITE DOT on the company-colored swatch
    // (dot sized within the swatch so the color stays clearly visible).
    // The company color is NEVER overwritten (replaces the orig fill-
    // white-when-affordable scheme AND the port's white-border scheme).
    // Swatch border is static (#333 via CSS); nonexistent companies show
    // the gray filler swatch with no dot.
    for (let i = 0; i < NUM_COMPANIES; i++) {
      const swatch = this.companyRows[i].swatch;
      const c = s.company[i];
      swatch.style.background = c?.exist ? c.color : '#555';
      this.companyRows[i].dot.style.visibility =
        c?.exist && canAffordCompany(s, i) ? 'visible' : 'hidden';
    }
  }

  mainUpdate(): void {
    const s = this.state;
    const playing = s.player.length > 0;

    // In-game disabled = sels (orig BitBtn1); post-game disabled =
    // concluded. With auto-finish the button is a post-hoc viewer.
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

    // Teal box = CURRENT TURN NUMBER ONLY. Blank pre-game (playing
    // false). Turn/max/(Tournament) context lives in the hint bar.
    this.turnBox.textContent = playing ? String(s.turn) : '';

    // MenuUpdate (dropdown-menu form; polarity unchanged, verified
    // Session 19c):
    // - setup menus (New Game / Create New Grid / Grid Size / flyout
    //   items / Preferences) disabled when progress;
    // - End Game disabled when !progress;
    // - View High Scores / About / Quit always enabled (no toggle).
    const setupDisabled = s.progress;
    const setMenuItem = (key: string, disabled: boolean): void => {
      const item = this.menuItems[key];
      if (item) item.classList.toggle('sm-disabled', disabled);
    };
    setMenuItem('newGame', setupDisabled);
    setMenuItem('newGrid', setupDisabled);
    setMenuItem('prefs', setupDisabled);
    setMenuItem('gridSize', setupDisabled);
    setMenuItem('grid-small', setupDisabled);
    setMenuItem('grid-medium', setupDisabled);
    setMenuItem('grid-large', setupDisabled);
    setMenuItem('endGame', !s.progress);

    // Flyout bullet marks the CURRENT grid type (A4).
    const cfg = s.gridConfig();
    this.gridBullets['grid-small'].style.visibility =
      cfg.xsize === GRID_CONFIGS[SMALL].xsize ? 'visible' : 'hidden';
    this.gridBullets['grid-medium'].style.visibility =
      cfg.xsize === GRID_CONFIGS[MEDIUM].xsize ? 'visible' : 'hidden';
    this.gridBullets['grid-large'].style.visibility =
      cfg.xsize === GRID_CONFIGS[LARGE].xsize ? 'visible' : 'hidden';

    this.updateHint();
  }

  // --- Dialog delegates ---------------------------------------------------------
  // Thin methods delegating to dialogs.ts; the app supplies state,
  // formatMoney, and its own refresh/flow callbacks. Order of operations
  // on each path is preserved. Grid choice is owned solely by the
  // Options → Grid Size menu entry (Batch D ruling — the new-game
  // dialog carries no grid callback).

  private newGameDialog(): void {
    newGameDialog(this.state, {
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
    // Orig closemain ≈ confirm + reload. Score warning only mid-game
    // (s.progress captured at open time).
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
  // DEVIATION:[title-short]: orig form caption was 'Space Monopoly v1.2 -
  // 2001 David Vivash' (dfm evidence); Lee chose the short form.
  document.title = 'Space Monopoly';
  return new SpaceMonopolyApp(root, storage);
}