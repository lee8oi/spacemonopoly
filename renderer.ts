// ============================================================================
// SPACE MONOPOLY PORT — RENDERER / APP SHELL (renderer.ts) — rev 26
// Split wave (Session 30; approved Session-29 rulings): this file is
// now the APP SHELL — turn flow, mainUpdate, delegates, actionHooks.
// Chrome (palette, CSS, menubar/menus, side panel) → renderer-chrome.ts.
// Board (canvas paint, fit, mouse, timers) → renderer-board.ts.
// ZERO BEHAVIOR CHANGE: bodies carried VERBATIM from rev 25 except
// (a) ownership re-points — sub-module members reached via
// this.chrome.X / this.board.X, state kept on the shell; and
// (b) visibility widening where a shell member is now CALLED from a
// sub-module (methods formerly private → public: setGridSize,
// flashHint, actionHooks, onContinue, doConclude, dialog delegates).
// Full-app-object plumbing — no accessor machinery (ruling).
// Issued as ONE complete file (chunk-splice protocol retired for this
// wave after the Session-30 splice failure — do not append anything).
// History: ARCHIVE.md §5 (rev-24 era) + RENDERER-ARCHIVE.md (revs
// 16–23; rev-24/25 append due this session).
// ============================================================================
//
// REV 25 lineage carried forward (Session 29, Batch G):
//  (1) Swatch affordability = centered WHITE DOT on the company-colored
//      swatch (DEVIATION:[white-dot-affordance]; chrome-side render).
//  (2) loadPreferences boot call (DEVIATION:[prefs-wired]) — below.
//  (3) History/comment collapse per comment-relocation policy.

import {
  AppState,
  getGame,
  comma,
  GRID_CONFIGS,
  SMALL,
  MEDIUM,
  LARGE,
  TOURNAMENT,
  NUM_COMPANIES,
  CELL_EMPTY,
  advanceTurn,
  offerChoices,
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
} from './dialogs';
import type { SplitTableRow, MergerTableRow } from './dialogs';
import { AppChrome } from './renderer-chrome';
import { AppBoard } from './renderer-board';

const SCORES_STORE_KEY = 'HighScores'; // storage key (orig: per-table files)

export class SpaceMonopolyApp {
  // Shell-owned state; sub-modules reach it as app.state (public by
  // necessity — no accessor machinery).
  readonly state = new AppState();
  readonly root: HTMLElement; // chrome appends into this
  private readonly storage: Storage;
  readonly chrome: AppChrome; // built first (styles + chrome + boardRegion)
  readonly board: AppBoard;   // built second (canvas + listeners)
  private concluded = false;
  private hintTimeout: number | null = null;

  constructor(root: HTMLElement, storage: Storage = localStorage) {
    this.root = root;
    this.storage = storage;
    // Rev-25 constructor order preserved: injectStyles → buildChrome
    // (both inside AppChrome's constructor), THEN canvas creation +
    // listener attachment (AppBoard's constructor, appended into
    // chrome.boardRegion) — all before the first setGridSize paint.
    this.chrome = new AppChrome(this);
    this.board = new AppBoard(this);
    this.setGridSize(SMALL); // includes randomise — FIDELITY: orig FormCreate
    // Responsive board — observe the board region and refit (delivers the
    // initial paint once layout lands; fitBoard early-returns on zero-size
    // regions, e.g. this constructor-time path).
    this.board.initResizeObserver();
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.chrome.closeMenus(); // DEVIATION:[menu-interaction]
    });
    // DEVIATION:[prefs-wired] (REV 25): activate stored preferences at
    // boot, BEFORE the first mainUpdate/moneyShow, so a saved currency
    // unit is live for the first paint instead of flashing the default.
    loadPreferences(this.storage);
    this.mainUpdate();
    this.moneyShow();
  }

  // Orchestrator: state mutation + fit + menu/prefs-awareness refresh.
  // (Grid TYPE mutation is shell business; PAINT is board business —
  // setGridSize stays on the shell and delegates down, preserving the
  // rev-25 call graph exactly: gridType → maxTurns → resize →
  // randomise → fitBoard → mainUpdate.)
  setGridSize(type: GridType): void {
    this.state.gridType = type;
    const cfg = GRID_CONFIGS[type];
    this.state.maxTurns = cfg.maxTurns;
    this.state.grid.resize(cfg.xsize, cfg.ysize, CELL_EMPTY);
    this.state.grid.randomise(); // FIDELITY: orig setGridSize randomises
    this.board.fitBoard();
    this.mainUpdate();
  }

  // Hint bar (element lives in chrome; text/color logic is shell's).
  private setHint(text: string): void {
    this.chrome.hintBar.textContent = text;
    this.chrome.hintBar.style.color = '#9a9ac0';
  }

  flashHint(text: string): void {
    if (this.hintTimeout !== null) window.clearTimeout(this.hintTimeout);
    this.chrome.hintBar.textContent = text;
    this.chrome.hintBar.style.color = '#ffcc66';
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

  onContinue(): void {
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
      redrawGrid: () => this.board.redrawGrid(),
      moneyShow: () => this.moneyShow(),
      drawSels: () => this.board.redrawGrid(), // sels already true; full repaint
      startSelectorTimer: () => this.board.startSelectorTimer(),
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
  doConclude(force: boolean): void {
    const s = this.state;
    if (force) {
      this.board.stopSelectorTimer();
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
    this.board.redrawGrid();
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
  actionHooks() {
    return {
      redrawGrid: () => this.board.redrawGrid(),
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
        this.board.redrawGrid();
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
    this.chrome.moneyLabel.textContent =
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
      const swatch = this.chrome.companyRows[i].swatch;
      const c = s.company[i];
      swatch.style.background = c?.exist ? c.color : '#555';
      this.chrome.companyRows[i].dot.style.visibility =
        c?.exist && canAffordCompany(s, i) ? 'visible' : 'hidden';
    }
  }

  mainUpdate(): void {
    const s = this.state;
    const playing = s.player.length > 0;

    // In-game disabled = sels (orig BitBtn1); post-game disabled =
    // concluded. With auto-finish the button is a post-hoc viewer.
    this.chrome.continueBtn.disabled = s.progress ? !!s.sels : this.concluded;
    this.chrome.continueBtn.textContent = s.progress
      ? (s.sels ? 'Place a piece\u2026' : 'Finish Turn')
      : (playing && !this.concluded ? 'See Results' : 'Game Over');

    // Company buttons: Enabled = Exist (trade BUTTONS gated on !sels
    // inside the dialog, per orig InfoButs).
    for (let i = 0; i < NUM_COMPANIES; i++) {
      this.chrome.companyRows[i].btn.disabled = !(s.company[i]?.exist ?? false);
    }

    this.chrome.rebuildPlayerList();
    this.chrome.playerLabel.textContent = playing ? s.player[s.curplay].name : '';

    // Teal box = CURRENT TURN NUMBER ONLY. Blank pre-game (playing
    // false). Turn/max/(Tournament) context lives in the hint bar.
    this.chrome.turnBox.textContent = playing ? String(s.turn) : '';

    // MenuUpdate (dropdown-menu form; polarity unchanged, verified
    // Session 19c):
    // - setup menus (New Game / Create New Grid / Grid Size / flyout
    //   items / Preferences) disabled when progress;
    // - End Game disabled when !progress;
    // - View High Scores / About / Quit always enabled (no toggle).
    const setupDisabled = s.progress;
    const setMenuItem = (key: string, disabled: boolean): void => {
      const item = this.chrome.menuItems[key];
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
    this.chrome.gridBullets['grid-small'].style.visibility =
      cfg.xsize === GRID_CONFIGS[SMALL].xsize ? 'visible' : 'hidden';
    this.chrome.gridBullets['grid-medium'].style.visibility =
      cfg.xsize === GRID_CONFIGS[MEDIUM].xsize ? 'visible' : 'hidden';
    this.chrome.gridBullets['grid-large'].style.visibility =
      cfg.xsize === GRID_CONFIGS[LARGE].xsize ? 'visible' : 'hidden';

    this.updateHint();
  }

  // --- Dialog delegates ---------------------------------------------------------
  // Thin methods delegating to dialogs.ts; the app supplies state,
  // formatMoney, and its own refresh/flow callbacks. Order of operations
  // on each path is preserved. Grid choice is owned solely by the
  // Options → Grid Size menu entry (Batch D ruling — the new-game
  // dialog carries no grid callback).

  newGameDialog(): void {
    newGameDialog(this.state, {
      onGameStarted: () => {
        this.concluded = false;
      },
      redrawGrid: () => this.board.redrawGrid(),
      moneyShow: () => this.moneyShow(),
      mainUpdate: () => this.mainUpdate(),
      beginTurnChoices: () => this.beginTurnChoices(),
    });
  }

  tradeDialog(id: number): void {
    tradeDialog(
      this.state,
      id,
      (a) => this.formatMoney(a),
      () => this.board.redrawGrid(),
      () => this.moneyShow(),
    );
  }

  detailsDialog(pnum: number): void {
    detailsDialog(this.state, pnum, (a) => this.formatMoney(a));
  }

  prefsDialog(): void {
    prefsDialog(() => this.moneyShow(), this.storage, PREFERENCES_STORE_KEY);
  }

  scoresDialog(): void {
    scoresDialog(this.state, (a) => this.formatMoney(a), this.storage, SCORES_STORE_KEY);
  }

  aboutDialog(): void {
    aboutDialog();
  }

  quitConfirm(): void {
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
