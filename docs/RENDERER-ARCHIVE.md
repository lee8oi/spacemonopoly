# RENDERER-ARCHIVE.md — Full Narrative Archive for renderer.ts + dialogs.ts

**ROLE (Session 21 reorg):** WRITE-ONCE, APPEND-ONLY. This file holds the
FULL narrative revision history that the lean spine (RENDERER-NOTES.md)
indexes. The spine carries one-line pointers; this file carries the story.

**Policy:**
- Never rewrite existing entries (historical record stays as written).
- New full revision narratives are APPENDED at the end as they happen
  (Sessions / revisions append chronologically).
- This file is reissued only when appended to AND only on demand — it is
  NOT part of the routine per-batch delivery chain (the spine travels
  instead). Attach from disk when deep history is needed.
- Corollary: the spine's size is decoupled from this file's growth.

Everything below is the verbatim former RENDERER-NOTES.md as of the rev-15
reissue (mid-Session-21, pre-spine-reorg), which in turn carried all prior
content verbatim from its own history.

---

# [verbatim from former RENDERER-NOTES.md, rev-15 reissue]

# RENDERER-NOTES.md — Annotation Archive for renderer.ts + dialogs.ts

Companion to `renderer.ts` (UI layer, rev 15 — chrome/board/turn-flow) and
`dialogs.ts` (dialog layer, rev 3 — all modal/dialog presentation; split
out of renderer.ts rev 12 in Session 17). Mirrors the scaffold
convention: the code carries only terse one-line tags; this document
holds the full rationale, revision history, and open items. Keep in sync
with future findings; do not grow the code instead.

Scaffold (logic layer, Session-13-amended) and its own archive:
SCAFFOLD-NOTES.md. Active session record for dialogs.ts work (Sessions
18–19 onward): DIALOGS-NOTES.md — this archive now carries pointers to
it rather than duplicating its content.

---

## 1. Revision History

### rev 1 (initial)
First complete UI layer over the frozen scaffold: canvas board, chrome,
selection timer, mouse handling, turn flow, trading, preferences, high
scores, standings, quit. Built from NOTES §6 (renderer blueprint decoded
during Sessions 10–11).

### rev 2 (after first playtest — clicks dead)
- **FIX:[click-mapping]** cellFromEvent originally divided `e.offsetX`
  by tile size. That is only correct when the canvas renders at its
  natural pixel size; any CSS scaling (flex layout squeeze, narrow host
  page, browser zoom) silently maps clicks to the wrong cell. Symptom:
  flashing squares animated forever, clicks did nothing, Continue
  correctly disabled per orig `BitBtn1->Enabled = !sels & progress`.
  Repair: map via getBoundingClientRect + proportional division.
  Canvas pinned against flex stretch (align-self, flex-wrap on root).
- **RESOLVED [trading gate]** (open item from NOTES §8): ComInfoForm.cpp
  `InfoButs()` sets Buy/Sell/Max/SellAll `Enabled = !sels`. Enforcement
  is UI-level, inside the trade dialog. Dialog is modal, so `sels` cannot
  change while it is open (matches orig `Main->Enabled=false` gating).
- **FIDELITY [setGridSize-randomise]**: orig setGridSize() calls
  randomise() after resize — the board carries circles from boot
  (FormCreate → setGridSize → CreateGrid). Port now randomises on every
  grid-size change.
- **FIDELITY [itemindex]**: ListBox1DblClick opens details for the
  CLICKED row (orig ItemIndex), not always the current player.
- **FIDELITY [trade-flavor]**: orig "fraudster" validation messages;
  BitBtn4/BitBtn5 prev/next company buttons cycling existing companies
  (goto-redo loop).
- **ADD [R12]** hint bar + missed-click feedback (diagnostic affordance;
  orig ignores misses silently).

### rev 3 (after second playtest)
- **FIX:[modal-inheritance]**: modals/toasts are appended to
  document.body, OUTSIDE .sm-root, so they inherit no text color from
  the app container — black text on dark background, plus default
  OS-styled gray buttons. .sm-modal/.sm-toast now declare explicit
  colors/fonts/buttons.
- **DEVIATION:[swatch-color]** (R13, Lee-approved): orig MoneyShow
  fills Shape6–10 white when affordable. With 6000 starting money vs
  ~100–800 early share prices, the swatches sat white nearly
  permanently and read as broken. Port keeps the company color at all
  times and signals affordability via white border. Two-line revert in
  moneyShow() if strict fidelity is ever wanted.

### rev 4 (end-game triple-bug repair — Lee-reported)
Three symptoms, one root cause: greyed "See Results", no standings
dialog, no high-score insertion despite qualifying wealth.
- **FIX:[seeresults-disabled]**: `continueBtn.disabled = sels || !progress`
  was correct in-game but, once the game ended (progress==false), kept
  the button disabled FOREVER. So the retitled "See Results" button was
  unclickable, concludeGame never ran, and no dialog/high-score followed.
  Now: in-game disabled = sels; post-game disabled = concluded (results
  clickable exactly once). Verified working.
- **FIX:[doconclude-guard]**: doConclude() bailed if `s.progress` —
  correct for the post-game "See Results" path only, but the End Game
  MENU button was wired to the same function, making mid-game End Game
  a silent no-op. Split into doConclude(force): End Game passes
  force=true (mirrors orig EndGame1Click, which concludes without
  confirmation); the Continue/"See Results" button passes force=false.
  Verified working (7-turn game + natural 80-turn game).

Post-rev-4 verification status (Lee playtests):
- End Game mid-game: standings dialog appears. ✔
- Natural end at 80 turns: game ends. ✔ (R14 remained open until rev 10)
- High score insertion: confirmed working (entry slotted above
  "David" defaults; >1M not required — defaults are 1,000,000).

### rev 5 (split announcement → modal; R4 partially retired)
- **FIDELITY:[splitform-modal]**: split announcement promoted from a
  2.5 s toast to a blocking-style modal with before/after economics
  (share price halved, holding doubled), sourced from SplitForm.cpp.
  Pre-split numbers captured in the comSplit hook BEFORE comSplitHook()
  mutates state. Retired R4 for splits.
- **ADD [modal queue]**: DOM modals are non-blocking, but chained events
  inside one action() (merger → split) must present one at a time;
  queueModal()/pumpQueue() serializes them in orig event order.
- Split MECHANICS confirmed correct during this period: threshold is on
  share PRICE (company Value), not holdings. Lee verified: price crossed
  3200 → split fired. Open item "stock split investigation" CLOSED.

### rev 6 (stuck split dialog — Lee-reported)
- **FIX:[splitdialog-close]**: OK button was wired to the modal QUEUE's
  release callback instead of the overlay's own dismissal —
  `modal(box)`'s return value was discarded, so clicking OK advanced the
  queue but never removed the overlay. Game logic underneath was fine
  (split applied, consistent state) — purely a UI wedge. Repair chains
  both: dismiss overlay first, then release queue. Contract documented
  on queueModal() so the failure mode can't silently reintroduce.

### rev 7 (merger announcement → modal)
- **FIDELITY:[mergerform-modal]**: merger promoted from toast to modal
  (Merger.cpp parity), showing absorbed company (struck through),
  survivor, combined values, payout for absorbed shares, and share
  conversion — or the Tournament no-conversion note (surfacing the
  tournament-no-conversion quirk rather than hiding it).
- Verified by Lee including a triple merge: **expect TWO merger dialogs
  then a split dialog** — pairwise resolution in action() is correct
  orig behavior.
- Founding announcement left as toast pending verdict (settled rev 8).

### rev 8 (fidelity pack from Players.cpp / ComForm.cpp reads)
- **R2 flipped false** (superseded entirely — see rev 9): orig
  BitBtn3Click visibly calls clear() with no randomise; assumed blank
  board on new game. WRONG — see rev 9 correction.
- **FIDELITY:[comform-modal]**: founding announcement promoted to modal
  carrying ComForm.cpp content: company name, starting share price,
  founder's 5-free-shares + cash grant.
- **FIDELITY:[comform-info]**: intended to auto-open the trade dialog
  after founding (orig `NewCom->ShowModal(); Info(i);`) — but the
  onDismiss argument was never passed, so it silently never fired
  (caught and fixed in rev 9; see FIX:[info-nowired]).
- Also verified from Players.cpp: tournament-downgrade, 6000 start
  money, CreateComs roster/colors, turn/curplay init, tournament
  snapshot cloning — all already faithful, no changes.
- Noted cosmetic backlog: orig player-setup has Move Up/Move Down
  reorder buttons; port has add/remove only.

### rev 9 (board-on-new-game CORRECTED — Lee testimony overruled source-reading)
Background: rev 8's blank board contradicted Lee's long-standing
observation that the original ALWAYS starts with circles (typically
4–10 on the small grid). Investigation trail:
- GameGrid.cpp: randomise() is uniform 1-in-30 per cell, NO minimum
  guarantee — the 4–10 range is statistics (mean ~6.4 on 192 cells;
  sub-4 rolls ~1 game in 8). Port faithful; no change.
- Grid.h: orig `clear()` iterates an UNINITIALIZED `ix` — undefined
  behavior (same family as the ub-loop bug). Value-blind clear cannot
  explain circles surviving, so the observed selective wipe
  (circles stay; companies/diamonds don't) is explained by no examined
  file — the mechanism question is closed as UNRESOLVED (see
  SCAFFOLD-NOTES §8; Game.cpp was read/port Sessions 1–2 and contains
  no board-clearing logic).
- Resolution: implement Lee's verified OBSERVABLE SPEC in the scaffold
  (FIX:[phase3-verified], SCAFFOLD-NOTES Session 13) and make the
  renderer stop fighting it:
  - **R2 RETIRED ENTIRELY**: NEW_GAME_RANDOMISES flag deleted. New-game
    board behavior lives solely in scaffold startGame(): circles kept,
    companies/diamonds stripped.
  - **FIX:[gosame-size-nowipe]**: Go! handler previously called
    setGridSize() UNCONDITIONALLY — resize+randomise erased the board
    even at same size. Now setGridSize() only runs when the size
    actually CHANGED; same-size new games work with the board as it
    stands (orig grid-size menu and New Game are independent paths).
  - **FIX:[info-nowired]**: foundingDialog(id) was called without its
    onDismiss callback in rev 8 — the Info(i) auto-open never fired.
    Now `foundingDialog(id, () => this.tradeDialog(id))` chains the
    trade dialog on New Company modal dismissal, matching orig
    `NewCom->ShowModal(); Info(i);`.
- **VERIFIED BY LEE (5/5 pass)**: boot circles ✔; same-size new game
  keeps circles ✔; grid-size change rerolls ✔; founding modal →
  trade dialog chain ✔; new game after game end = clean board with
  circles remaining ✔.

### rev 10 (auto-show standings; R14 RETIRED — verified)
- **FIDELITY:[auto-finish]**: onContinue's end-of-game branch now calls
  doConclude(false) directly — orig BitBtn1Click invokes Finish() the
  instant the final turn ends; standings + high-score commitment happen
  immediately on the final Continue click, no intermediate "See Results"
  step. The button remains a post-hoc viewer (doConclude's concluded
  guard makes repeat clicks no-ops); title logic unchanged.
- **VERIFIED BY LEE (playthrough)**: final Continue → results modal
  appears immediately; game otherwise plays as expected.

### (notes-only reissue, Session 15 — no code change; rev stays 10)
**PHASE 3 (SOURCE VERIFICATION) COMPLETE.** All original source files
read and dispositioned; the port has zero unlogged behavioral
deviations; the two known presentation gaps (R15, R16) are logged and
backlogged with Lee's specs. Read results this session:

- **Merger.cpp — CLEAN**: payout basis (absorbed pre-merger value),
  payer range (CLASSIC all / TOURNAMENT current), CLASSIC-only
  conversion, tournament-empty-range origin confirmed at source;
  zombie-shares non-zeroing consistent with caller-side `exist=false`.
  Surfaced R15.
- **SplitForm.cpp — CLEAN**: halve-then-double order, doubling range
  (CLASSIC all / TOURNAMENT current), no threshold in file
  (caller-owned), mutation-before-display all confirmed.
  Co-surfaced R15. Non-behavioral: `char cash[20]` +
  `large::output` latent-overflow family (port immune via BigInt).
- **OverForm.cpp — CLEAN**: biggest-company scan (strict >, first-seen
  max, all-zero degenerate), winner selection (strict <, earliest tie,
  via Total()), field order (name/money/share-worth/net-wealth), and
  compute-display-only scope (no insert, no CreateComs — caller-owned,
  matching concludeGame's layering) all confirmed. **FIX:[cumulative-
  worth] CONFIRMED AT SOURCE** (SCAFFOLD-NOTES §2.7): `large netwealth,
  worth;` declared outside the player loop, `worth` accumulating across
  players — the port's per-player-fresh computation is the correct
  repair. Same `char cash[20]` overflow-family observation.
- **HighScores.cpp — logic CLEAN**: insertion (strict >, first-beaten-
  entry, shift-down dropping #10, break), unconditional SaveScores even
  on view-only (defaults materialize on disk), David/1M defaults,
  Total() formula all confirmed. Unreachable `if (i>0)` shift guard
  confirmed at source (i ∈ [9, j+1], j ≥ 0). **DEVIATION:[scores-format]
  FULLY CORROBORATED**: 4-line records, checksum formula (pnum + name
  chars + wealth chars), all four crypt() failure modes ("smv1" magic
  sniff, NUL-truncating read loop, unexplained `filesize -= 4`,
  `delete[] passbuf` on c_str-owned memory). New trivia: cipher key =
  "Space Monopoly" + 20 chars (j*2) + "David1,000,0000" (49 bytes);
  the magic check doubles as plaintext-fallback — a plaintext `scores`
  file would load undecrypted. JSON deviation stands as justified.
  Surfaced R16.
- **DEVIATION LOGGED (R15)**: orig SplitForm/Merger dialogs populate a
  per-player ListView (name, shares/companies, money effects for EVERY
  player — CLASSIC; current player only in TOURNAMENT). Port's
  splitDialog/mergerDialog summarize the CURRENT player only. Unlogged
  since revs 5/7 — now formally recorded and backlogged. Lee's ruling:
  fidelity-first; deviations deferred as design choices evolve.
- **DEVIATION LOGGED (R16 — via HighScores.cpp read)**: orig
  end-of-game sequence is Finish() → GameOver modal → **HighScores
  modal** — two sequential dialogs, the second being the high-scores
  form with the current grid's tab ACTIVATED and new entries visibly
  SELECTED. Port shows only the standings modal; scores are inserted
  silently (rev-4 playtest verified insertion and the standings dialog
  as separate facts — the missing second display went unnoticed until
  the source read). Also folds the presentation deltas: orig = 3-tab
  PageControl (tab activated on insert) vs port = three stacked
  tables; orig marks new entries via row selection vs port's bold.
  **SMMain.cpp read confirms scope: BOTH end paths run Finish(); +
  HighScores(true);** (BitBtn1Click end-of-game branch and
  EndGame1Click), matching the port's shared doConclude. Logged and
  backlogged; Lee has specified the TABBED presentation is the ideal.
- **SMMain.cpp (final re-read) — CLEAN, no new behavioral mismatches.**
  Previously logged items CONFIRMED AT SOURCE:
  - **FIX:[turn-eq]** — exact `== maxturns` (CLASSIC) and
    `== maxturns+1` (TOURNAMENT) in BitBtn1Click; port's `>=` repair
    correct, including direction (skipped increment would strand the
    game running forever).
  - **QUIRK [double-east]** — with fossil record: `comAdjoining` /
    `UpdateGrid` use the CORRECTED neighbor stepping
    (`ya = (xa == 0) ? 1 : 0`, 4 iterations, commented-out switch
    equivalents retained in source), while `go()`'s !newok check keeps
    the OLD buggy k<5 stepping (N,E,W,S,E — East twice). Booleans only;
    port's uniform 4-neighborhood behaviorally identical. The split
    between corrected and buggy functions is exactly why the quirk is
    tagged to `go()` specifically.
  - **FIX:[rejection-loop]** — `goto redo` sampling in `go()` verbatim;
    port's bounded-retry + deterministic fallback stands.
  - **QUIRK [prefs-half-wired] / R8** — FormCreate's pref-load block is
    sitting commented out, verbatim; faithful-dead is the only faithful
    option.
  - **R13 basis** — MoneyShow: white brush + black pen when affordable,
    company color otherwise. Deviation description source-confirmed.
  - **Neighbor order** — N,E,W,S in all corrected functions, matching
    NEIGHBOR_OFFSETS; order cannot matter for comnext (consumed only
    when exactly one distinct company adjoins).
  - **Turn-flow architecture** — BitBtn1Click ordering (snapshot →
    advance → restore → turn bookkeeping → end-or-go) maps 1:1 onto
    advanceTurn + offerChoices, including the `curplay+1 > numplays`
    wrap idiom.
  - Everything else matched: `action()`'s three branches incl.
    split-trigger placement and recursive `action(x,y)` re-evaluation
    (port's loop equivalent); `checkPlacementRules` vs Image1MouseDown's
    condM/condE logic incl. the companiesSet-dependent expansion
    predicate; setGridSize geometry table (all nine values);
    MenuUpdate gating; DrawSels/Timer1 behavior; quit-confirm texts;
    `go()` canonical sequence; playerDetails population incl. the
    phantom-row stray Add() (already logged as not ported).
  - **NEW TRIVIA (non-behavioral): boot DOUBLE-RANDOMISE** — FormCreate
    calls setGridSize(SMALL) (randomises) and then CreateGrid()
    (randomises AGAIN). Second pass overwrites the first; observable
    result = one random board, which the port produces with its single
    randomise. Recorded for the record; no action.
  - **Logged observation (no action): orig ListBox1DblClick UB on
    empty selection** — with no row selected, ItemIndex = −1 and the
    handler indexes `Player[-1]` (undefined). Port immune by
    construction (rows are clicked directly).
  - Housekeeping: the file arrived TWICE in one message (identical
    copies — client duplication, not a phantom third-party document).
    Treated as one read per convention §3.5; no impact.

### rev 11 (per-player tables in split/merger dialogs; R15 RETIRED)
Restores the orig SplitForm/Merger ListView content per the Session-15
spec — renderer-only, scaffold untouched, zero freeze-discipline
implications.
- **FIDELITY:[splitform-players]**: splitDialog gains a per-player
  table (columns: Player / Shares before / Shares after), one row per
  player in CLASSIC, current-player row only in TOURNAMENT — the exact
  ranges `comSplitHook` itself mutates and the orig SplitForm loops
  over. The rev-5 "Your holding" bullet is replaced by the table (it
  WAS the R15 deviation).
- **FIDELITY:[mergerform-players]**: mergerDialog gains a per-player
  table (columns: Player / Shares in [absorbed] / Shares in [survivor] /
  Money earned — company names in the headers), same CLASSIC-all /
  TOURNAMENT-current row range as `mergerHook`'s payout loop. The rev-7
  current-player payout/conversion rows are replaced by the table (they
  WERE the R15 deviation); the combined-value row and banners remain.
  TOURNAMENT keeps a no-conversion hint (quirk surfacing preserved).
- **EAGER CAPTURE (correctness detail)**: table rows are assembled in
  the action hooks, NOT lazily at modal-open time. The DOM modals are
  QUEUED, and a later chained event inside action() (merger → split)
  mutates state before earlier dialogs open; lazy reads would present
  mutated numbers. Split: `sharesBefore` snapshotted before
  comSplitHook, `sharesAfter` read immediately after (both stored).
  Merger: absorbed holdings snapshotted before mergerHook, survivor
  holdings + moneyEarned computed after (moneyEarned = absorbed
  holding × PRE-merger absorbed value; absorbed holdings never change
  — zombie-shares quirk — so post-read equals pre-read; survivor
  holdings DO change via CLASSIC conversion, hence post-read).
  Mutation-before-display matches orig (Session-15 source read).
- **FIX:[tournament-doubling-hint]** (incidental): the old split
  dialog's unconditional "All shareholders have had their share counts
  doubled" hint was WRONG in TOURNAMENT (only the current player
  doubles — comSplitHook range). Now mode-aware; TOURNAMENT notes the
  original-behavior restriction.
- Row styling: current player's row bolded (orientation aid; orig
  ListView had no such emphasis — cosmetic, R13-family, revert by
  deleting two fontWeight lines).
- Rev-6 dialog-close contract (dismiss overlay → release queue)
  preserved in both rewritten dialogs. Tournament downgrade note: a
  1-player TOURNAMENT is silently CLASSIC (quirk), so its tables show
  all (one) players — consistent.
- **VERIFIED BY LEE**: CLASSIC multiplayer split table shows all
  players, before/after doubled ✔; merger table shows zero-share rows
  with 0 earned and shareholders' shares/payouts ✔; chained
  triple-merge → split sequence presents correct numbers ✔.
  TOURNAMENT rows not exercised (Lee unfamiliar with orig tournament
  mode) — risk assessed LOW: the row-range ternary is identical to
  the hook mutation ranges source-verified in Session 15, so the tables
  are correct by construction whenever the underlying economies fire;
  untested surface is single-row rendering and the mode hints only.
  Spot-check opportunistically (e.g. during the rev-12 playtest).

### rev 12 (tabbed high-scores + end-of-game second modal; R16 RETIRED)
Implements Lee's specified ideal from the Session-15 HighScores.cpp
read — renderer-only, scaffold untouched.
- **FIDELITY:[highscores-modal]**: doConclude now chains a SECOND
  modal after the standings dialog — high scores with the current
  grid's tab activated and new entries highlighted — matching orig
  Finish() → GameOver modal → HighScores(true). Both end paths
  (natural finish and mid-game End Game) share doConclude, so both
  present the sequence. Costs one extra dialog + one extra click at
  game end (expected; orig behaves identically).
- **FIDELITY:[highscores-tabs]**: the standalone High Scores menu
  dialog and the end-of-game second modal share ONE tabbed
  presentation: three tabs (Small / Medium / Large) replacing the
  three stacked tables (orig: 3-grid PageControl). End-of-game opens
  with the CURRENT grid's tab activated (orig PageControl behavior on
  insert); the menu dialog defaults to the current grid's tab as well.
  New entries are highlighted: bold + row tint (orig used row
  SELECTION — visually stronger; the tint approximates the selected
  look while staying a passive highlight, consistent with the port's
  bold-highlight precedent in rev 4's scores view. Cosmetic
  approximation; orig's literal focus-grab has no clean DOM analog
  and none was attempted.)
- **DEVIATION:[doconclude-composes-tail] (ARCHITECTURAL NOTE — RE-SYNC
  WARNING)**: the scaffold's `concludeGame()` wrapper returns only the
  FinalStandings and DISCARDS the inserted score table, but the second
  modal needs that table WITH its transient `newEntry` flags — and
  re-running the insert (calling concludeGame twice) would DUPLICATE
  entries. doConclude therefore composes the tail itself:
  `finishStandings` → `highScores(state, true, storage, key)` →
  `createComs` — the wrapper's body verbatim, using the three exported
  functions it wraps. Behaviorally identical to concludeGame (same
  three calls, same order, same state effects); the only divergence is
  WHERE the composition lives. Scaffold file itself untouched (R16 was
  ruled renderer-only; freeze discipline intact). IF concludeGame is
  ever amended (e.g. a future FIX:[phase3-verified] touches the
  end-of-game tail), doConclude MUST be re-synced manually — it is no
  longer downstream of the wrapper. Re-sync target: the three-call
  sequence inside doConclude. NOTE: doConclude's non-force branch also
  sets s.progress = false directly (previously done by the wrapper's
  first line) — guarded prior by the progress/concluded early-return,
  so behaviorally identical; kept explicit for invariant clarity.
- Tab mechanics: a tab strip of buttons above the table; activating a
  tab swaps the displayed grid's table (DOM rebuilt). rev-6 contract
  N/A (plain modal, not queued — game event flow is complete when the
  end-of-game sequence begins, so no queue interaction).
- Interaction with rev 4/10 button logic: unchanged. The continue
  button remains a post-hoc viewer; repeat clicks remain no-ops (the
  concluded guard fires before any modal is built). The
  "See Results"-as-viewer path re-presents BOTH dialogs (standings
  then high scores), matching what a fresh orig user-initiated view
  would show.
- **VERIFIED BY LEE (primary checklist, 9/9)**: natural CLASSIC finish
  → standings then high-scores second modal ✔; End Game mid-game →
  same sequence ✔; current grid's tab pre-activated (tested Small and
  Medium) ✔; new high-score entries highlighted ✔; non-qualifying
  players correctly absent from the table (no spurious insertion) ✔;
  tab switching / grid-size-changed menu dialog shows respective tab ✔;
  post-conclusion chrome state correct (Continue disabled + "Game
  Over"; company buttons disabled; setup menus re-enabled) ✔; no
  dangling intermediate "See Results" state ✔; no duplicate insertions
  on post-game viewing ✔. Verification scope: primary checklist only —
  the secondary (fresh-storage defaults, reload persistence, menu
  no-tint) and systematic regression items were not separately run,
  though core flows (turn placement, trading, split/merger/founding
  dialogs) were exercised incidentally during the playthroughs without
  issue. TOURNAMENT spot-check not performed; R15 caveat remains open.

### rev 13 (renderer split — Option A; REORGANIZATION ONLY, no behavior change; VERIFIED)
Approved at Session-16 close (FRESH_BOOTSTRAP §3), executed Session 17.
Motivation: context/truncation management. The monolithic renderer.ts
is split into renderer.ts (chrome/board/turn-flow) + dialogs.ts (all
modal/dialog presentation). Scaffold untouched; ZERO behavior change —
the rev-12 verification (primary checklist 9/9) remained the accepted
baseline, and the FRESH_BOOTSTRAP §6 regression baseline was the
acceptance bar for the split.

- **What moved to dialogs.ts** (new artifact id `dialogs-ts`, rev 1):
  all modal/dialog code — `foundingDialog`, `splitDialog`,
  `mergerDialog`, `standingsDialog`, `scoresTableDialog`,
  `scoresDialog`, `tradeDialog`, `detailsDialog`, `prefsDialog`,
  `aboutDialog`, `newGameDialog`, `quitConfirm`, `msgBox`, `toast`;
  the `SplitTableRow` / `MergerTableRow` interfaces; the `el()` DOM
  helper, `modal()`, and the MODAL QUEUE (`queueModal`/`pumpQueue`)
  with its rev-6 dismiss-then-release contract (the contract comment
  travels with the queue — the queue is dialog-presentation machinery
  and every queued consumer lives in dialogs.ts); and the modal/toast/
  tab/table CSS classes (`.sm-overlay`, `.sm-modal`, `.sm-toast`,
  `.sm-tabs`, `.sm-newentry`, `.sm-row`, `.sm-actions`, `.sm-status`,
  `.sm-hint`, `.sm-splitbanner`, dialog input styles).
- **Enumeration note**: the bootstrap §3 list named eleven dialog
  functions + msgBox/toast; the governing clause is "all modal/dialog
  code (~350–400 lines)," and bootstrap §4 states the Move Up/Down work
  "lives in the new-game dialog (dialogs.ts after split)" —
  therefore `newGameDialog` moves (and `quitConfirm`, a pure modal with
  no canvas coupling, moves with it). renderer.ts's retained list in
  §3 (init/chrome, board, timer, mouse, turn flow, actionHooks,
  moneyShow/mainUpdate) does not include them.
- **What renderer.ts retains**: app init/chrome + root CSS injection
  (and the injectDialogStyles() call, keeping the chrome-then-dialog
  stylesheet order), canvas board rendering (incl. drawCellEntity — the
  tile-art seam), selection timer, mouse handling, turn flow
  (`onContinue`, `beginTurnChoices`, `doConclude`), `actionHooks` IN
  FULL — including the R15 eager-capture row assembly —
  `moneyShow`/`mainUpdate`, `mountApp`, `setGridSize`,
  `redrawGrid`/`drawSels`.
- **Pattern**: SpaceMonopolyApp methods become thin delegates; the
  dialog bodies are free functions in dialogs.ts receiving what they
  need via parameters — state, a `formatMoney` helper, storage/key,
  and app-side callbacks (tradeDialog takes redraw/moneyShow
  refreshers; newGameDialog takes a `NewGameDialogCallbacks` bundle —
  setGridSize, onGameStarted [resets the app-private concluded flag],
  redrawGrid, moneyShow, mainUpdate, beginTurnChoices — preserving the
  Go! order verbatim: setGridSize-if-changed → startGame → concluded
  reset → close → redraw → moneyShow → mainUpdate → beginTurnChoices;
  standingsDialog chains scoresTableDialog via its onClose callback
  exactly as rev 12 did in-file). Dialogs import scaffold directly for
  view-model calls (companyInfo, playerDetailsView, highScores, prefs
  draft/commit) exactly as before; the logic layer sees no difference.
- **Eager-capture survival (R15)**: the before/after snapshot logic and
  `SplitTableRow`/`MergerTableRow` assembly stay in renderer.ts's
  `actionHooks` — only the PRESENTATION of the rows moved to
  dialogs.ts (the row interfaces are exported from dialogs.ts so
  renderer.ts's hooks can construct them).
- **Deviation-warning survival audit** (all three FRESH_BOOTSTRAP §3
  warnings verified intact post-split):
  1. `DEVIATION:[doconclude-composes-tail]` — doConclude is untouched
     in renderer.ts; the three-call sequence (finishStandings →
     highScores(true) → createComs) and the re-sync warning stand.
  2. Rev-6 modal-queue contract — moved verbatim with the queue into
     dialogs.ts; queued dialogs still dismiss their overlay FIRST,
     then call `release()`.
  3. R15 eager capture — see above; capture stays in actionHooks.
- **Rev-numbering decision (flagged for the record)**: renderer.ts
  bumps rev 12 → 13 (marked "reorganization only") and dialogs.ts is
  rev 1. Keeping renderer.ts at "rev 12" was considered (the split is
  not a behavior change), but a reissued file that DIFFERS from the
  verified disk rev-12 copy while both claim rev 12 would corrupt the
  audit trail — the "NEVER regenerate code from memory" protocol
  depends on revision numbers uniquely identifying file contents. The
  rev-13 marker + this entry preserve the invariant that rev 12 =
  the Lee-verified monolith.
- **CSS split mechanics**: dialogs.ts exports the dialog stylesheet
  via `injectDialogStyles()`; renderer.ts injects the chrome/board
  stylesheet first, then calls it. Selector precedence/ordering is
  unchanged — the dialog classes never overlapped chrome classes
  beyond .sm-root's color inheritance, which the modals were already
  outside (rev-3 FIX:[modal-inheritance] — modals append to
  document.body and declare their own colors; this survives the split
  unchanged).
- **VERIFIED BY LEE (Session 17, split smoke-pass)**: "Everything is
  working as expected. Source split successful." The two-file build
  passed the FRESH_BOOTSTRAP §6 regression baseline; no behavioral
  drift reported. Rev 13 / dialogs rev 1 accepted as the new canonical
  source of truth for their respective files.

### dialogs.ts rev 2 (Session 18) — POINTER ENTRY
Move Up / Move Down player reordering in the new-game dialog (orig
Players.cpp BitBtn5/BitBtn6, right-column pair, selection-follows-move)
plus the Session-18 end-game regression (on-disk transcription drift:
`row.netWorth` vs scaffold's `netWealth`) and its diagnosis/fix.
Renderer.ts untouched (rev 13 continues). **Full record:
DIALOGS-NOTES.md rev 5, §§1–6.**

### (Session 19 — tooling; no code change to either file)
Build gate added (bootstrap open item #1): new minimal `tsconfig.json`
(es2020 + dom lib; the 58-error first run was all lib-target false
alarms — zero genuine type errors) and `build.sh` now runs
`tsc && npx esbuild …` — type errors abort the build before
`bundle.js` is written. Negative-tested. **Record:
DIALOGS-NOTES.md rev 5 §8.** Consequence for this archive's conventions:
transcription drift between artifact and disk is now caught at build
time — the Session 18 failure mode is structurally closed, though the
re-verify-on-disk-after-reissue rule (§4) remains standing practice.

### dialogs.ts rev 3 (Session 19b) — POINTER ENTRY
Cosmetic backlog closed (bootstrap open item #3): dialog caption
"Player Information" (players.dfm), name-input MaxLength 15
(players.cpp/.dfm), Go! disabled at empty list via updateButs()
(players.cpp UpdateButs), remove-guard dropped (orig BitBtn2Click
removes unconditionally), and `DEVIATION:[prefill-single]` — one-row
"Player 1" prefill (Lee-approved solo quick-start) replacing the
undocumented rev-1 two-row prefill. Changes confined to
newGameDialog. Verified live by Lee. **Full record:
DIALOGS-NOTES.md rev 5 §10.**

### (Session 19c — verification only; renderer.ts stays rev 13)
Bootstrap open item #2 (`doConclude(true)` post-game re-entry,
candidate defect) **CLOSED AS VERIFIED FAITHFUL — NO DEFECT**. The
port's `mainUpdate()` reproduces orig `MenuUpdate()` with exact
polarity on all five gated menu items (End Game enabled iff progress;
New Game / Create New Grid / Grid Size / Preferences iff !progress;
High Scores / About / Quit ungated in both); End Game self-disables
synchronously on both conclusion paths, so the claimed re-entry chain
is unreachable — exactly the original's own mechanism (the menu state
IS the guard; orig has no concluded flag and no guard in Finish()).
`force=true` mid-game matches orig EndGame1Click. Empirically confirmed
by Lee. **Full evidence trail, polarity table, and residual
unverified trivia (orig FormCreate calls MainUpdate but not
MenuUpdate — initial menu states come from SMMain.dfm defaults,
uninspected): DIALOGS-NOTES.md rev 5 §11.**

### rev 14 (Session 21, Batch 1 — board-area layout: B3 + B4 + B9; SUPERSEDED by rev 15 — Lee-found layout defects)
First code of the Session-20 interface-alignment plan (canonical:
SESSION20-INVENTORY.md / "Session 20 Interface Todo.md"), locked Batch 1
of three. Renderer-only PRESENTATION change: no game logic touched, no
behavioral change, dialogs.ts untouched (rev 3 continues), scaffold
untouched. Scope: inventory B3 (board proportion) + B4 (cell
appearance) + B9 (window title). Rev spine: revised from the pasted
Lee-confirmed rev-13 copy, never regenerated from memory.

- **B3 — responsive board (structural)**: root layout restructured from
  the rev-2-era two-column arrangement (`.sm-left`
  menubar+canvas+hint / `.sm-side`) to a COLUMN root: full-width
  menubar on top, then a content row — board column (flex-basis ~68%,
  the B3 65–70%-of-window target) + side panel. Batch 2 will
  recompose the side panel's internals; its position in the content
  row is now final. Board container ornamentation REMOVED (old
  `.sm-board` border/radius/background CSS gone — inventory B3); the
  canvas paints edge-to-edge vertically under the menubar, preserving
  the grid's 4:3 aspect (all three grid geometries are 4:3) by
  centering within the region.
- **B3 — implementation (transform, scaffold-frozen constraint)**:
  `cfg.tileW/tileH` live in the FROZEN scaffold and cannot change, so
  ALL canvas drawing stays in base-tile units; the renderer computes a
  display scale from the live board region, sets the canvas backing
  store to display-size × devicePixelRatio, and applies
  `ctx.setTransform` per redraw. Every existing draw site
  (`redrawGrid`, `drawCellEntity`, `drawSels`) is untouched and simply
  scales. `fitBoard()` runs on grid-size change and via a
  `ResizeObserver` on the board region (refits on window resize /
  panel growth; RO also delivers the initial fit when layout first
  lands — `fitBoard` early-returns on zero-size regions, covering the
  pre-layout constructor call). DPR-aware backing store means no
  upscale blur. **FIX:[click-mapping] pays off here**: the rev-2
  rect-proportional mouse mapping is immune to the display scaling by
  construction — no mouse-side changes were needed or made.
- **B3 — redrawing detail (audit note)**: `redrawGrid()` previously
  cleared `clearRect(0, 0, canvas.width, canvas.height)` — under the
  rev-14 transform that would clear in TRANSFORMED units and misbehave
  (backing-store pixels ≠ base units). Now clears in base units
  (`clearRect(0, 0, baseW, baseH)` after `setTransform`). Anyone
  touching this file must keep clear bounds in base units.
- **B4 — DEVIATION:[dark-checker]**: the port ALREADY drew a parity
  checker (`(x+y)%2`, two near-identical dark purples) — invisible in
  practice, and cells had no borders. Restored structure: checker
  contrast strengthened (CHECKER_A `#43435e` / CHECKER_B `#36364d` —
  Lee-approved first-cut values, tunable) + a thin 1-base-unit
  grid-line pass (`#12121c`) drawn AFTER fills/entities so it reads as
  the original's bordered checker in the dark palette (B1 keeps dark
  theme; if D1 light theme ever lands, the beige checker restore is a
  two-constant change).
- **B9 — DEVIATION:[title-short]**: `document.title = 'Space
  Monopoly'` set at mount. Original caption was the full
  `'Space Monopoly v1.2 - 2001 David Vivash'` (dfm evidence); Lee
  chose the short form.
- **R12 hint bar (kept per inventory A6)**: relocated into a reserved
  slim strip BELOW the board region (Lee decision: reserved strip over
  overlay — no art occlusion). Behavior (flash hints, color cycling)
  unchanged.
- **First-cut small-screen accommodation** (≤ 720px: content column
  stacks, board above the side panel, region keeps a 55vh floor);
  refinement deliberately deferred to a dedicated small-screen pass
  later.
- **Untouched by design**: menubar contents/structure (Batch 3 will
  rebuild it as three dropdown menus — the flat button row persists
  until then), side-panel internals (Batch 2), all dialog code, all
  game logic, all mouse/turn-flow/actionHooks mechanics.
- **Lee playtest verdict**: board looks better, game functional and
  playable, all §6 baseline behaviors intact — but TWO LAYOUT DEFECTS
  reported with screenshots (vision-analyzed same session):
  1. **Full-size window: page extends past the viewport bottom** —
     2–3 board rows clipped, hint bar pushed off-screen, no scrollbar.
  2. **Reduced window: board top sits well below the side-panel tops**
     (panels ~5–7 px higher at top, several px offset at bottom) —
     uneven whitespace, misaligned rows.
  Root cause (diagnosed in-conversation): the rev-14 CSS was a MIN-
  height layout, not a viewport-FIT layout. `.sm-root` used
  `min-height: 100vh` — content was free to GROW past the viewport
  (defect 1: page scrolls/hints off-screen), and the board region's
  `flex: 1 1 auto` had no height CAP to flex against, so the region
  sized to min-height rather than available height, leaving the
  board shrunken-while-the-page-was-too-tall and the panel row
  topologically misaligned with the board column (defect 2). **rev 14
  is SUPERSEDED by rev 15** — B3's substance (responsive transform,
  DPR crispness, stripped ornamentation, 68% column) carries forward;
  only the height model is replaced.

### rev 15 (Session 21, Batch 1 correction — FIX:[viewport-fit]; PENDING LEE VERIFICATION)
Repairs the two rev-14 layout defects; nothing else changes. Renderer
CSS/constructor-only; fitBoard logic, drawing, mouse, turn flow,
dialogs, scaffold all untouched from rev 14.

- **FIX:[viewport-fit] — height model replaced (MIN → FIT)**: the root
  now OCCUPIES exactly the viewport: `height: 100vh` (was
  `min-height: 100vh`), `box-sizing: border-box`, and every flex
  ancestor of the board region gains `min-height: 0` so the chain
  MENUBAR → CONTENT ROW → BOARD COLUMN → BOARD REGION actually
  shrinks to available height instead of growing to content height.
  Under a fit model the page NEVER exceeds the viewport at desktop
  sizes: no vertical scroll, no clipped board rows, hint bar always
  on-screen.
- **Host-page normalization (ADD, flagged)**: the fit model needs the
  host page to cooperate — default browser `body` margin (8 px) and a
  body shorter than the viewport would both break `100vh` anchoring.
  The injected stylesheet now includes `html, body { margin: 0;
  height: 100%; }`. This touches the HOST PAGE (index.html), which is
  beyond the three reissued files but is present on disk; if a
  hypothetical future host page needs its own body margins, this rule
  is the one to revisit.
- **Side-panel alignment (defect 2 repair)**: with the content row
  now height-constrained, the side panel stretches to the full row
  height and its panels align flush with the board column top/bottom.
  `.sm-side` gains `overflow-y: auto` so unusually SHORT windows
  scroll the PANEL internally rather than re-breaking the page fit
  (the board, being aspect-fitted, can only get smaller, never
  overflow).
- **Media-query adjustment**: the ≤720px stacked layout is
  intentionally exempted from the fit model (root returns to
  `height: auto; min-height: 100vh` there) — a phone screen cannot
  show board + full panel in one viewport, so the page scrolls
  normally in that mode. Dedicated mobile pass remains deferred.
- **fitBoard unchanged**: it already reads `clientWidth/clientHeight`
  of the region; the region itself now reports the CORRECT fitted
  height, which is the entire fix. (Vision read of the reduced-window
  screenshot also guessed the diamond pieces "look stretched" — they
  are not; the grid is uniformly scaled and `Math.min`-fitted, cells
  remain square. No change warranted.)
- **Acceptance (batch-specific addendum)**: full-size window —
  entire board + hint bar visible with NO vertical scrollbar;
  side-panel tops/bottoms flush with board column; reduced window —
  board refits, stays aligned, page never overflows while wide enough
  for side-by-side; behavior checks unchanged (clicks still land,
  §6 baseline still green).

---

## 2. Renderer Assumptions (R1–R16, with current status) — AS OF REV-15 REISSUE

All behavioral R#s are now RETIRED, resolved, or verified; remaining
ones are cosmetic/utility choices that are deliberately settled.

- **R1 (SETTLED, cosmetic)** Timer1 interval unknown (.dfm unexamined) →
  250 ms selection cycle. Could be read from SMMain.dfm if exactness
  matters.
- **R2 (RETIRED, rev 9, verified)** Board-on-new-game behavior owned by
  scaffold startGame() (FIX:[phase3-verified]): circles survive,
  companies/diamonds stripped. Orig mechanism unresolved and purely
  documentary (see SCAFFOLD-NOTES §8).
- **R3 (SETTLED, cosmetic)** Selection animation repaints the full board
  each tick (orig drew incrementally). Safe at these grid sizes.
- **R4 (RETIRED, revs 5–8)** All three event announcements (split,
  merger, founding) are modal dialogs with before/after economics,
  matching orig SplitForm/Merger/NewCom forms, serialized by the modal
  queue in orig event order.
- **R5 (SETTLED)** High-score storage key 'HighScores' (orig used
  per-table filenames). Part of the scores-format deviation in scaffold.
- **R6 (SETTLED)** Player count 1..6 (orig limit unexamined in .dfm).
- **R7 (SETTLED)** Quit ≈ confirm + page reload.
- **R8 (SETTLED, source-confirmed)** Prefs persistence = faithful-dead:
  Save writes, nothing loads (QUIRK prefs-half-wired; FormCreate reader
  commented out in orig — confirmed Session 15 SMMain.cpp read).
  loadPreferences() exists in scaffold if option (b) is chosen later.
- **R9 (SETTLED)** Grid-size labels show ACTUAL geometry (16×12 /
  22×18 / 28×24), not the orig overstated menu captions (QUIRK
  menu-labels).
- **R10 (SETTLED, enhancement)** Player list shows name + money
  (orig: names only). **NOTE (Session-20 inventory A5): superseded —
  Batch 2 will restore names-only per the approved FIDELITY
  disposition; current state until then.**
- **R11 (SETTLED)** Currency-unit input validated to 1–3 chars
  (RENDERER SPEC; orig bypasses setUnit — port MAY validate at input).
- **R12 (SETTLED, diagnostic)** Hint bar + missed-click feedback.
  Candidate for removal once stable. **NOTE (Session-20 inventory A6):
  Lee ruled KEEP** — retained, relocated below board in rev 14.
- **R13 (Lee-approved deviation; basis source-confirmed)** Swatches keep
  company color; affordability = white border. Orig fills the entire
  swatch white with black pen.
- **R14 (RETIRED, rev 10, verified)** Standings auto-show at natural
  game end, per orig BitBtn1Click Finish().
- **R15 (RETIRED, rev 11, verified — CLASSIC only)** Per-player tables
  restored in splitDialog and mergerDialog (orig SplitForm/Merger
  ListView: split = name / shares before / shares after; merger =
  name / shares in A / shares in B / money earned; CLASSIC all players,
  TOURNAMENT current only). Data captured eagerly in the action hooks
  for queued-modal safety. CLASSIC paths verified by Lee; TOURNAMENT
  rows still unexercised (risk low — range identical to hook mutation
  ranges; spot-check opportunistically).
- **R16 (RETIRED, rev 12, verified)** End-of-game second modal:
  standings → high-scores, tabbed presentation shared with the
  standalone High Scores menu dialog (3 tabs, current grid's tab
  activated on insert, new entries bold + tinted). doConclude composes
  the tail itself (DEVIATION:[doconclude-composes-tail], see rev 12
  entry — re-sync warning documented there). Primary checklist
  verified by Lee 9/9; see rev 12 entry for scope note.

---

## 3. Queued Work / Open Items — AS OF REV-15 REISSUE

**Phase 3 COMPLETE; R15 (rev 11) and R16 (rev 12) SHIPPED AND VERIFIED
(primary checklists); renderer split (rev 13) SHIPPED AND VERIFIED
(Session 17 smoke-pass); player reorder (dialogs rev 2) and Session-18
regression RESOLVED (DIALOGS-NOTES §§1–6); build gate (Session 19a) and
cosmetic backlog (dialogs rev 3, Session 19b) CLOSED; open item #2
(doConclude re-entry) VERIFIED NO-DEFECT (DIALOGS-NOTES §11).**
**Session-20 interface inventory (game-window scope) APPROVED and
batch-locked; Batch 1 (B3+B4+B9) issued as rev 14, found defective on
Lee playtest, corrected as rev 15 (FIX:[viewport-fit]) — pending Lee
verification. Batches 2 (side panel) and 3 (menubar) queued behind
Batch 1 acceptance.**
Remaining work:

1. ~~Cosmetic backlog~~ **CLOSED** (Session 19b — dialogs.ts rev 3;
   DIALOGS-NOTES §10). Includes the formerly-queued Move Up/Move Down
   reorder (done Session 18, dialogs rev 2).
2. **SESSION 21 LAYOUT BATCHES** (canonical plan: SESSION20-INVENTORY.md
   "Approved implementation plan"):
   - **Batch 1 — board area (B3+B4+B9): rev 14 issued, rev 15
     correction ISSUED, pending Lee verification.**
   - Batch 2 — side panel: B6 (recomposition incl. B8b top-box
     semantics) + B7 (Finish Turn) + B8 (teal turn box) + B10 (company
     row structure; swatch shape held for D3; Betelguese spelling
     check during B10).
   - Batch 3 — menubar: B2 (three dropdown menus, "View High Scores" /
     "About Space Monopoly" captions) + A4 (Grid Size flyout, literal
     asterisk separator, turn-count captions).
   - Follow-on candidate: board-entity art at drawCellEntity()
     (P1 cross token, P2 diamond; buildings TBD evidence).
3. **TOURNAMENT spot-check** (opportunistic, rev-11 R15 caveat + rev-12
   secondary): 2-player Tournament game — single-row split/merger
   tables, no-conversion hint, "(Tournament)" turn label, natural end
   at maxturns+1. Low risk; run whenever convenient. NOTE: solo play
   can no longer exercise Tournament (1-player TOURNAMENT auto-downgrades
   to CLASSIC per orig quirk) — this spot-check now requires an actual
   second player row ("+ Add player" in the Player Information dialog).
4. **Unrun secondary checks** (low priority): fresh-storage David/1M
   defaults view, high-score persistence across page reload, menu
   dialog no-tinting (newEntry transience). Plus Session-19 leftovers:
   >15-char name clamp check, Session-18 reorder/click-walking re-run,
   solo-Tournament auto-downgrade confirmation (DIALOGS-NOTES §10.4).
5. **New-game board mechanism (DOCUMENTARY ONLY, non-blocking)**: no
   examined original file explains why circles survive new game —
   Grid::clear() is uninitialized-loop UB (Grid.h), and Game.cpp (read
   Sessions 1–2, ported as boot defaults) contains no clearing logic.
   Port implements Lee's observed spec (scaffold
   FIX:[phase3-verified]); nothing further to do unless new original
   sources surface.
6. **Verify-before-ship trivia** (carried from NOTES §10): currency
   symbol raw byte (assume £), prefs persistence option (b) decision,
   SMMain.dfm captions (would also settle R1's timer interval) AND
   initial menu-enablement defaults (orig FormCreate omits MenuUpdate;
   see DIALOGS-NOTES §11.7 — port's assumed states are very likely
   correct but uninspected at the .dfm).
7. **Tile-art extraction seam**: drawCellEntity() is the single method
   to swap for bitmap tiles (SpacePoly2.res via Resource Hacker — look
   for BITMAP entries; Space.ico is the app icon only; SpacePoly2.mak
   is a build script, no runtime relevance).
8. **Housekeeping**: DIALOGS-NOTES.md rev 5 is the canonical record for
   Sessions 18–19; this file carries pointers (rev-history entries
   above). Keep the pointer discipline going forward: dialogs.ts-layer
   changes → full record in DIALOGS-NOTES, pointer here; renderer.ts
   layer changes → full record here.

---

## 4. Conventions (mirror of scaffold's) — AS OF REV-15 REISSUE

- Changes to renderer.ts and dialogs.ts via FULL FILE REISSUE, same
  artifact id each time ("renderer-ts" and "dialogs-ts" — CANONICAL
  per FRESH_BOOTSTRAP §5/§7; corrects the earlier "ts-renderer"
  spelling once used in this document), no surgical patches (Lee's
  preference). The two-file reissue reality (Session 17 onward): a
  given change reissues the notes plus ONE OR BOTH code files as
  needed — each code artifact call carries one complete file.
- This file reissued alongside ("renderer-notes") when rationale grows.
- FIX/DEVIATION/FIDELITY tags in code point here for detail. From
  Session 19 onward, dialogs.ts-layer tags point to DIALOGS-NOTES.md
  (rev 5); this archive holds the renderer.ts-layer rationale and the
  revision spine for both files.
- Logic layer amendments only via logged FIX:[phase3-verified] entries
  (Session 13 precedent: startGame board spec). The renderer split was
  explicitly required NOT to touch scaffold.ts (FRESH_BOOTSTRAP §3).
- DELIVERY PROTOCOL (Session-16 lesson, critical): artifact reissue
  calls carry near-zero accompanying preamble — analysis goes in a
  separate message BEFORE or AFTER the reissue, never competing with
  the file content in the same generation. One artifact call per
  message. Failed reissues retried bare once; if two consecutive bare
  failures occur, fall back to numbered chat chunks for Lee to
  concatenate on disk.
- Change order within a task: notes reissue FIRST (design record is
  durable even if a code call dies), then code, bare.
- Duplicate file uploads: a file arriving twice in one message
  (identical copies) is ONE read — client duplication, not a phantom
  document.
- Rev numbering: each reissued code file carries a distinct revision
  marker that uniquely identifies its contents (see rev 13 entry for
  the rationale); renderer.ts and dialogs.ts number independently
  (renderer rev 15+, dialogs rev 3+).
- Build gate (Session 19a): `./build.sh` = `tsc && npx esbuild …` is the
  canonical build; type errors block the bundle. Transcription drift
  against the types is caught at build time, but on-disk verification
  after reissues REMAINS REQUIRED (drift can still be
  behavior-preserving and type-correct — e.g. a swapped string literal
  sails through tsc).

---

## 5. Phase 3 source-verification ledger — AS OF REV-15 REISSUE

**STATUS: PHASE 3 COMPLETE (Session 15). All project source files read
and dispositioned.** Files examined against the port (behavioral diffs
reported to Lee in-session):

| Source | Result |
|---|---|
| HighScores.h | structural match; 3-tab layout confirmed (basis for rev 12's tabbed presentation) |
| Preferences.h | checkbox names map 1:1; draft-commit flow confirmed |
| Players.cpp | R2 evidence (see §1 revs 8–9); everything else faithful; Move Up/Down backlog noted — **DONE Session 18 (dialogs rev 2)**; cosmetic trio (caption/MaxLength/Go!-disable) DONE Session 19b (dialogs rev 3, DIALOGS-NOTES §10) |
| ComEditForm.cpp | empty shell, dead in orig — correctly not ported |
| ComForm.cpp | founding modal + Info(i) chain implemented (rev 8/9) |
| GameGrid.h/.cpp | randomise faithful, no circle minimum (statistics); clear() NOT in this class |
| Grid.h/.cpp | clear() UB confirmed (uninitialized ix); resize/init uninit'd; default ctor 16×16 noted |
| Game.h/.cpp | (Session 1-2) ported as boot defaults; contains NO board-clearing logic — not the circles-survive mechanism |
| Merger.cpp | (Session 15) CLEAN — payout basis, payer range, CLASSIC-only conversion, tournament-empty-range all confirmed; surfaced R15 (per-player ListView, renderer presentation gap) — RESTORED rev 11 |
| SplitForm.cpp | (Session 15) CLEAN — halve-then-double order, doubling range, caller-owned threshold confirmed; co-surfaced R15 — RESTORED rev 11 |
| OverForm.cpp | (Session 15) CLEAN — biggest-company scan, winner selection, field order, compute-display-only scope confirmed; FIX:[cumulative-worth] confirmed AT SOURCE (orig bug real: worth declared outside loop); re-read Session 19c (DIALOGS-NOTES §11) |
| HighScores.cpp | (Session 15) logic CLEAN — insertion, unconditional save, defaults, Total() confirmed; unreachable shift-guard confirmed; DEVIATION:[scores-format] fully corroborated (cipher key/trivia recorded); surfaced R16 (missing second end-of-game modal + tabbed presentation) — RESTORED rev 12 |
| SMMain.cpp | (Session 15, final re-read) CLEAN — no new behavioral mismatches; FIX:[turn-eq], FIX:[rejection-loop], QUIRK [double-east] (incl. corrected-vs-buggy stepping split + commented-out switch fossils), QUIRK [prefs-half-wired], R13 basis, N/E/W/S order, turn-flow architecture, action/checkPlacementRules/setGridSize geometry/MenuUpdate/DrawSels/quit-texts/go-sequence/playerDetails all matched at source. New trivia: boot double-randomise (harmless, port equivalent); ListBox1 ItemIndex=−1 UB in orig (port immune). Received twice in one message — treated as one read. Re-read Session 19c: MenuUpdate polarity confirmed against renderer mainUpdate() — all gates exact (DIALOGS-NOTES §11.4) |

Pending: **NONE.** Phase 3 closed. Outstanding information sources are
optional ship trivia only (SMMain.dfm, SpacePoly2.res — see §3).

---

*[End of migrated verbatim content. New full revision narratives are
APPENDED below this line from Session 21 onward, per the archive policy
in the header.]*

---

# APPEND LOG

*(new entries append here, newest last, full narrative — the spine
indexes them)*
