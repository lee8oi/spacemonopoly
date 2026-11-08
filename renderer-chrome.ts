// ============================================================================
// SPACE MONOPOLY PORT — RENDERER CHROME (renderer-chrome.ts) — rev 2
// Split from renderer.ts rev 25 (rev-26 wave, Session 30). ZERO BEHAVIOR
// CHANGE at split; bodies carried VERBATIM from rev 25 except ownership
// re-points: chrome-local fields keep `this.`; shell-owned logic is
// reached via `app.` (full-app-object plumbing — no accessor machinery).
// Session-17 dialogs-split precedent.
// Issued as ONE complete file (chunk-splice protocol retired for this
// wave after the Session-30 splice failure — do not append anything).
// SPLIT-WAVE ADJUSTMENT: element fields assigned inside buildChrome()
// (not the constructor) drop `readonly` (TS2540 under strict mode);
// definite-assignment `!` retained. Logged for ARCHIVE.
//
// rev 2 (Session 31): side-panel swatch fill re-points to
// companyDisplayColor() (dialogs-core rev 2) —
// DEVIATION:[company-color-contrast]: DISPLAY palette (Lee: yellow
// #e0e000, green #5eea2f) replaces scaffold state hues at the swatch;
// scaffold COMPANY_DEFS (orig clYellow/clLime) remains the fidelity
// record in state. The build-time fill is the INITIAL value only —
// moneyShow() (shell, rev 27) repaints every swatch from state each
// refresh and must read the SAME display palette; the two sites pair.
// History: ARCHIVE.md (Sections 0–5); RENDERER-ARCHIVE.md (revs 16–26).
//
// This module OWNS: palette constants, the chrome CSS sheet, menu
// system (menubar, dropdown panels, flyout, underlay, positioning),
// side-panel construction, and ALL chrome ELEMENT references
// (boardRegion, hintBar, side-panel widgets). The CANVAS element moved
// to AppBoard (constructed there, appended here into boardRegion —
// listener attachment order preserved: no user event can fire between
// chrome construction and board construction).
// AppBoard imports the palette constants from THIS file (single home).
// Chrome stylesheet loads before canvas painting (constructor order:
// AppChrome, then AppBoard, in the shell).
// ============================================================================

import {
  SMALL,
  MEDIUM,
  LARGE,
  NUM_COMPANIES,
  COMPANY_DEFS,
} from './scaffold';
import type { GridType } from './scaffold';
import { el, injectDialogStyles, companyDisplayColor } from './dialogs';
import type { SpaceMonopolyApp } from './renderer';

// Palette — approximations of orig ImageList tiles, tuned for the dark
// theme. DEVIATION:[dark-checker]: beige→dark checker (B1); restoring the
// orig beige checker is a two-constant change if a light theme (D1) lands.
export const CHECKER_A = '#43435e';
export const CHECKER_B = '#36364d';
export const GRID_LINE = '#12121c';
// Faithful blue circle, brightened for the dark board (tunable live).
export const CIRCLE_FILL = '#4f83e8';
export const CIRCLE_STROKE = '#16204a';
// Faithful yellow rotated square; flat fill, thin black outline (the
// rev-21 highlight ellipse is dead — it read as a spurious glyph).
export const DIAMOND_FILL = '#ffd74a';
export const DIAMOND_STROKE = '#12121c';
// Sels (rev-20 correction): normal = solid royal blue + thick white
// border; active (timer-cycled) = solid blue + thick lime-green border.
export const SEL_FILL = '#0000ff';
export const SEL_BORDER_NORMAL = '#ffffff';
export const SEL_BORDER_ACTIVE = '#32cd32'; // lime green
export const ACTIVE_STROKE = '#32cd32';     // same as SEL_BORDER_ACTIVE
// Teal turn box: faithful-bright VCL clTeal #008080 (approximation);
// dark numerals per approved design. Theming revisit is Lee-flagged.
export const TURNBOX_BG = '#008080';
export const TURNBOX_FG = '#063030';
export const TURNBOX_SEP = '#2b2b45';
// Menu chrome (DEVIATION:[menu-styling] — dark-app adaptation of Win2k
// native menu colors).
export const MENU_BG = '#f4f4f0';
export const MENU_FG = '#1a1a24';
export const MENU_HOVER_BG = '#316ac5';   // clHighlight
export const MENU_HOVER_FG = '#ffffff';
export const MENU_DISABLED_FG = '#8a8a90';
export const MENU_BORDER = '#8a8a96';
export const MENU_UNDERLAY_Z = '900';    // below dialog overlays (dialogs.ts)
export const MENU_PANEL_Z = '905';

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

export class AppChrome {
  // Menu system state. menuItems = every menu row, held BY REFERENCE
  // (never querySelector-scrape in mainUpdate — rev-18 lesson). Panels
  // positioned via getBoundingClientRect at OPEN time, never at
  // construction. gridFlyoutPanel = the Grid Size flyout.
  // mainUpdate (shell) toggles .sm-disabled on these references
  // directly — hence public.
  menuItems: Record<string, HTMLDivElement> = {};
  gridBullets: Record<string, HTMLElement> = {};
  // Element references read cross-module: boardRegion (AppBoard fit /
  // canvas host), side-panel widgets + hintBar (shell moneyShow /
  // mainUpdate / hint trio), continueBtn + companyRows (shell).
  // NOTE: assigned inside buildChrome(), so no `readonly` (see header).
  boardRegion!: HTMLElement;
  hintBar!: HTMLElement;
  moneyLabel!: HTMLElement;
  playerLabel!: HTMLElement;
  turnBox!: HTMLElement;
  playerList!: HTMLUListElement;
  continueBtn!: HTMLButtonElement;
  readonly companyRows: Array<{ btn: HTMLButtonElement; swatch: HTMLElement; dot: HTMLElement }> = [];
  private readonly menuPanels: HTMLDivElement[] = [];
  private gridFlyoutPanel!: HTMLDivElement;
  private readonly topMenus: Array<HTMLButtonElement> = [];
  private openTopIdx = -1;
  private underlay: HTMLDivElement | null = null;
  private flyoutOpen = false;

  constructor(private readonly app: SpaceMonopolyApp) {
    this.injectStyles();
    this.buildChrome();
  }

  // --- Chrome ---------------------------------------------------------------

  private injectStyles(): void {
    const style = el('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    this.app.root.classList.add('sm-root');
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
        mkItem(g.key, g.caption, () => this.app.setGridSize(g.type), bullet),
      );
    }
    this.gridFlyoutPanel = gridPanel;

    // ---- PROJECT (B2 FIDELITY: New Game · End Game · View High Scores · Quit)
    const projectPanel = mkPanel(
      mkItem('newGame', 'New Game', () => this.app.newGameDialog()),
      mkItem('endGame', 'End Game', () => this.app.doConclude(true)),
      mkItem('scores', 'View High Scores', () => this.app.scoresDialog()),
      mkItem('quit', 'Quit', () => this.app.quitConfirm()),
    );

    // ---- OPTIONS (Create New Grid · Grid Size ▸ · Preferences) --------------
    // Grid Size is a CASCADE: hovering (or clicking) its row opens the
    // flyout; hovering any other row in the panel closes it. The flyout
    // is positioned to the RIGHT of the row with edge flip (openFlyout).
    const optionsPanel = mkPanel();
    optionsPanel.appendChild(
      mkItem('newGrid', 'Create New Grid', () => {
        // MenuUpdate gates this to !progress (enforced in mainUpdate).
        this.app.state.grid.randomise();
        this.app.board.redrawGrid();
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
      mkItem('prefs', 'Preferences', () => this.app.prefsDialog()),
    );
    // Non-Grid rows close the flyout on hover.
    for (const child of Array.from(optionsPanel.children)) {
      if (child !== gridRow) {
        child.addEventListener('mouseenter', () => this.closeFlyout());
      }
    }

    // ---- HELP (About Space Monopoly) ----------------------------------------
    const helpPanel = mkPanel(
      mkItem('about', 'About Space Monopoly', () => this.app.aboutDialog()),
    );

    mkTop('Project', projectPanel);   // topMenus[0]
    mkTop('Options', optionsPanel);   // topMenus[1]
    mkTop('Help', helpPanel);         // topMenus[2]

    // Board column: canvas CONSTRUCTION + mouse-listener attachment
    // moved to AppBoard's constructor (ownership move — see file
    // header); AppBoard appends its canvas into this.boardRegion, so
    // the rev-25 DOM tree is identical. Region first, hint bar below.
    // Board fills the board column edge-to-edge vertically under the
    // menubar (region), top-aligned, aspect-preserved. R12 hint bar
    // (kept per inventory A6) = reserved slim strip below the region
    // (no board occlusion).
    this.boardRegion = el('div', 'sm-boardregion');
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
      if (this.app.state.player.length > 0) {
        this.app.detailsDialog(this.app.state.curplay);
      }
    });
    side.appendChild(topPanel);

    // (2) B10: company list — plain clickable rows, swatch + name, thin
    // separators. NO heading (source-confirmed Session 24 §12.6-8 —
    // permanent). Company order = port COMPANY_DEFS order (verified).
    // REV 25: each swatch gains a centered dot child — AFFORDABILITY
    // indicator (white dot on company color; hidden when unaffordable
    // or company nonexistent). DEVIATION:[white-dot-affordability].
    // REV 2: swatch fill = DISPLAY palette (companyDisplayColor), NOT
    // the scaffold hue — pairs with moneyShow()'s repaint (shell rev
    // 27); see DEVIATION:[company-color-contrast] in dialogs-core.
    const cPanel = el('div', 'sm-panel');
    for (let i = 0; i < NUM_COMPANIES; i++) {
      const row = el('div', 'sm-comrow');
      const swatch = el('span', 'sm-swatch');
      swatch.style.background = companyDisplayColor(i);
      const dot = el('span', 'sm-dot');
      swatch.appendChild(dot);
      const btn = el('button', undefined, COMPANY_DEFS[i].name);
      btn.addEventListener('click', () => {
        if (this.app.state.company[i]?.exist) this.app.tradeDialog(i);
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
    this.continueBtn.addEventListener('click', () => this.app.onContinue());
    side.appendChild(this.continueBtn);

    content.appendChild(side);
    this.app.root.appendChild(menubar);
    this.app.root.appendChild(content);
  }

    // ---- MENU OPEN/CLOSE/POSITIONING -----------------------------------------
  // Panels are position:fixed; geometry computed at OPEN time from
  // getBoundingClientRect (viewport coords — immune to ancestor stacking
  // and the flex/menubar-wrap layout). Panels are display:none by CSS
  // default; openMenu/openFlyout reveal them; closeMenus hides ALL
  // panels. The underlay exists ONLY while a menu is open and is
  // REMOVED on close — never a resident click-blocker.

  openMenu(idx: number, panel: HTMLDivElement): void {
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

  openFlyout(): void {
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

  closeMenus(): void {
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
  rebuildPlayerList(): void {
    const s = this.app.state;
    this.playerList.textContent = '';
    for (let i = 0; i < s.player.length; i++) {
      const li = el('li');
      li.textContent = s.player[i].name; // A5: names only
      li.addEventListener('click', () => this.app.detailsDialog(i));
      this.playerList.appendChild(li);
    }
  }
}
