# SCAFFOLD-NOTES.md — Annotation Archive for scaffold.ts

Companion to `scaffold.ts` (logic layer, frozen at Session 12, amended
Sessions 13–14). This document holds the full rationale, history, and
analysis that the condensed scaffold's one-line tags (`FIX:` /
`DEVIATION:` / `QUIRK-FIDELITY:`) point back to. Nothing here is
required to compile or run the scaffold; everything here IS required to
understand, defend, or extend the port. Frozen scaffold + this archive +
STATUS.md together contain 100% of the information the pre-condensation
file held.

**STATUS (Session 12 close): SOURCE-READING PHASE COMPLETE.** All
project files read and dispositioned (ported / verified / husk-logged /
deliberately excluded). Renderer phase begun (renderer.ts).

**STATUS (Session 13): FIRST SANCTIONED AMENDMENT APPLIED.** One
defect-fix to the frozen layer: startGame's new-game board spec, tagged
`FIX:[phase3-verified]` (see §2.9). Freeze discipline holds: only
source-verified defect fixes may touch scaffold.ts, each individually
logged here.

**STATUS (Session 14 close): AMENDMENT VERIFIED; MECHANISM QUESTION
CLOSED AS UNRESOLVED.** Lee's 5-point playtest confirmed the amended
new-game board behavior (rev 9 + rev 10 renderer, incl. auto-finish
restoration). Additionally, a Session-1 planning/handoff document
surfaces that Game.h/.cpp were analyzed and ported in Sessions 1–2 —
correcting the recent erroneous belief that Game.cpp was unread. The
ported Game is a thin singleton (boot defaults only) with NO
board-clearing logic, so it does NOT explain the circles-survive
mechanism; with Grid::clear() being value-blind UB and no remaining
unexamined candidate file, the mechanism question is closed as
UNRESOLVED (documentary, non-blocking — port implements the observed
spec regardless).

**STATUS (Session 19): SCAFFOLD UNTOUCHED; TOOLCHAIN GATE ADDED;
COMMENTS CLAIM NOW TRUE.** scaffold.ts was NOT modified this session
(freeze discipline intact; the Session-13 startGame amendment remains
the only change since freeze). What changed is the toolchain around
it: a minimal `tsconfig.json` (es2022 + dom lib) now exists, and
`build.sh` runs `tsc && npx esbuild …` — type errors abort the build
before `bundle.js` is written. The first honest tsc run over all three
files produced 58 errors that were ALL lib-target false alarms (BigInt,
Array.from, Set, string literals at a default pre-ES2015 lib) — **zero
genuine type errors**, retroactively confirming the Session-18
`netWealth` rename (DIALOGS-NOTES §§5) was the only latent type
breakage ever in the tree. Full record: DIALOGS-NOTES.md rev 5 §8.
The tsconfig-target/header-comment discrepancy (§8) is RESOLVED: the
tsconfig was bumped es2020 → es2022 (tooling-only, one line; gate
rerun clean) — the scaffold header's "target ES2022+" claim is now
literally true, and the frozen file stayed untouched. Corroborations
this session: FIX:[cumulative-worth] re-confirmed at source (OverForm.cpp
re-read), and concludeGame's tail / renderer doConclude composition
verified faithful to orig EndGame1Click + BitBtn1Click (DIALOGS-NOTES
§11).

---

## 1. Architectural Decisions (with reasoning)

### 1.1 large.h → BigInt elimination (Session 6, final)
Player money and share counts are arbitrary-precision in the original
(Ammeraal's `class large`, "All rights reserved", 1996). Native BigInt
supersedes the entire API (add/sub/mul/div/mod, string conversion,
comparison) and — critically — avoids redistributing Ammeraal's
restricted code inside this GPL v2 port. Company share VALUES stay plain
int (matches orig `ComRecord.Value`); mixed ops bridge via `BigInt(val)`.
Not implemented: `sqrt(large)` — unobserved in game code; Newton's-method
integer sqrt if ever needed.
Mapping note: `large(const char*)` ≡ `BigInt(text)` — this is exactly how
the share-purchase dialogs parse entered amounts.

### 1.2 AppState mirror (Session 4-5)
The original keeps ALL game state in loose file-scope globals in
SMMain.cpp (curplay, turn, gridtype, Player[], Company[], gridStore,
ComStore, etc.). The port MIRRORED this structure in an `AppState` class
rather than redistributing into `Game` (the temptation documented and
rejected): redistribution would be a bigger behavioral deviation surface
and blur which state belongs to whom. `Game` remains a thin singleton
holding Prefs + GameGrid, exactly like the original's Game class.
Side benefit: GC eliminates the original's many array leaks for free
(see §5).

### 1.3 Hooks / view-model seams (Sessions 8-9)
The original's forms mutate state and call UI functions directly
(VCL-entangled). Port protocol: state mutations live in pure logic-layer
functions; UI side effects (dialogs, redraws) are injected via hook
interfaces (`ActionHooks`, `OfferChoicesHooks`) or returned as view
models (`CompanyInfoView`, `PlayerDetailsView`, `PlayerDetailRow`,
`FinalStandings`). This keeps the logic layer DOM-free and testable, and
gives the renderer a clean import surface.

### 1.4 Grid geometry ownership
`GRID_CONFIGS` (SMALL/MEDIUM/LARGE bundles: xsize, ysize, tileW=blwid,
tileH=blhit, maxTurns, iStart) owns all geometry and pacing, sourced from
SMMain `setGridSize()`. `Game`'s 16×16 constructor default mirrors the
original's Game.cpp boot state only.

### 1.5 Grid class notes
- Public `getWidth()/getHeight()` replace the original's duplicated
  global `gridxsize/gridysize` pair (desync risk logged Session 5).
- Covariant `clone()` on GameGrid needed because tournament snapshot
  store holds `GameGrid[]`.
- Self-assignment check in copyFrom preserved (orig behavior).
- (Session 13 read) Orig `Grid()` default ctor is 16×16 and `resize()`
  allocates without initializing — confirms the necessity of the port's
  explicit-initial-value Grid/resize signatures (FIX:[zero-init]).

## 2. Original Bug Fixes (FIX tags, in full)

1. **[zero-init]** Orig `new ELT[_y]` leaves POD cells as garbage in
   Grid.h constructor. Port requires explicit initial value.
2. **[ub-loop]** Orig copyFrom loop reads an UNINITIALIZED `ix` variable
   (Grid.h) — undefined behavior; would walk garbage column indices.
   Port: `for (ix = 0; ...)`.
3. **[parse-guard]** Orig Prefs.cpp load() had no length guards on
   reading the 5 flag chars or unit; port is bounds-safe (charAt
   out-of-range returns '' → flag false).
4. **[turn-eq]** Orig CLASSIC branch: `if (++turn == maxturns)` — exact
   equality; a skipped increment would never end the game. Ported `>=`.
5. **[rejection-loop]** Orig `go()` uses goto-redo rejection sampling
   which can spin FOREVER on a nearly-full board. Port retries bounded
   (10000) then falls back to deterministic left-to-right scan.
6. **[divide-zero]** Orig `maxbuy = Money / Value` would invoke
   Ammeraal's `large` divide-by-zero on a degenerate zero-price company.
   Port returns 0 affordable.
7. **[cumulative-worth]** Orig OverForm Finish(): `large netwealth,
   worth` declared OUTSIDE the player loop; `worth` accumulated across
   players so the standings list showed each player's worth INCLUDING
   all previous players'. Winner unaffected (separate Total() call).
   Port computes per-player fresh. *(Re-confirmed at source, Session
   19c — OverForm.cpp re-read; see DIALOGS-NOTES rev 5 §11.)*
8. **[comma-negative]** Orig comma() counts a leading '-' as a digit,
   garbling negative grouping. Port groups digits only. No observable
   difference in practice (money never negative in-game; buys capped).
9. **[phase3-verified] (SESSION 13 AMENDMENT — startGame new-game board
   spec; VERIFIED Session 14).** Orig Players.cpp BitBtn3Click calls
   `Game::getInstance().getGrid().clear()` before starting. Evidence
   trail: (a) Grid.h `clear()` iterates an UNINITIALIZED `ix` — UB, same
   family as #2 — so its compiled behavior is indeterminate; (b) a
   value-blind clear CANNOT produce the content-selective result Lee
   observes in his binary: **circles survive a new game; company and
   diamond cells do not**; (c) no examined code (Game.cpp — read
   Sessions 1–2, contains no clearing logic; go(); Finish();
   CreateComs; setGridSize) explains the selective wipe — the exact
   original mechanism is UNRESOLVED and CLOSED as such (see §8).
   Port therefore implements the OBSERVED SPEC — keep circles, strip
   companies and diamonds — replacing the former `clear(CELL_EMPTY)`
   (an inference that produced a blank board, contradicting Lee's
   testimony that the game ALWAYS starts with circles, typically 4–10
   on the small grid). Statistical note: GameGrid.cpp randomise() is
   uniform 1-in-30 per cell with NO minimum guarantee — the 4–10 typical
   range is binomial statistics (mean ~6.4 on 192 cells; sub-4 rolls
   ~1 game in 8), not code. **Verification (Session 14, Lee, 5/5)**:
   boot circles; same-size new game keeps circles; grid-size change
   rerolls; founding modal → trade dialog chain; new game after game
   end = clean board with circles remaining.

## 3. Deliberate Deviations (DEVIATION tags, in full)

1. **[_i64toa]** String(amount) for |amount| < 2^53 (JS number
   precision). Game money is BigInt, not this path.
2. **[rng]** Math.random() replaces srand(time(NULL))/rand(). Identical
   1/30 circle density; sequences not reproducible (no replay files
   exist anyway). Wall-clock re-seed dropped (orig called srand on
   every randomise — redundant, behaviorally invisible).
3. **[scores-format]** Orig persisted high scores as 4-lines-per-record
   text (name/wealth/char-sum checksum/events) run through a homemade
   cipher (crypt.cpp) with actively corrupting failure modes:
   "smv1" magic-number sniffing, a NUL-truncating read loop (silent
   truncation of legitimate data containing zero bytes), an unexplained
   `filesize -= 4` on decrypt, and `delete[] passbuf` freeing memory
   owned by an `AnsiString::c_str()` buffer — a genuine heap-corruption
   landmine. Parser also overflowed buffer[64] on long names. Port:
   same data shape, JSON/localStorage, checksum superseded by
   JSON.parse failure handling. (Crypt.h deliberately unread/
   unnecessary for a same-origin localStorage context.)
4. **[crypto-bypass]** (Related) Crypt bypass entirely — reinforces the
   scores-format deviation; magic-number and NUL-truncation behaviors
   would actively corrupt legitimate data, so bypassing them is a
   correctness fix, not just convenience.

## 4. Preserved Quirks (QUIRK-FIDELITY tags, in full)

1. **[tournament-no-conversion]** Orig Merger.cpp TOURNAMENT conversion
   loop range is `[curplay, curplay)` — EMPTY. Tournament mergers pay
   cash but never convert shares. (Verified Session 9 health check —
   Session 8's port erroneously converted; corrected.)
2. **[zombie-shares]** Absorbed companies' shares are NEVER zeroed,
   even in CLASSIC. Total() counts them at frozen company value until
   the slot is re-founded via NewCompany (CLASSIC-only reset). Zombie
   wealth persists in standings/high-scores indefinitely.
3. **[tournament-downgrade]** 1-player TOURNAMENT silently downgrades
   to CLASSIC (Players.cpp BitBtn3Click). *(Session 19 note: with the
   dialogs' single-player prefill [DEVIATION:[prefill-single],
   DIALOGS-NOTES §10], the default quick-start game is now the 1-player
   case — this quirk fires on every solo Tournament selection.)*
4. **[tournament-maxturns]** TOURNAMENT ends at maxturns+1 (off-by-one
   preserved).
5. **[newcompany-noop]** If all 5 company slots exist, NewCompany is a
   silent no-op — the placement is simply lost, no error surfaced.
6. **[menu-labels]** Orig menu handlers N16by16/N20by20/N32by32 vs.
   actual grids 16x12/22x18/28x24 — menu labels overstate geometry.
   (Actual .dfm captions unexamined; renderer fixed rather than
   matched — R9.)
7. **[double-east]** Orig go() !newok validation loops k<5 with buggy
   xa/ya stepping visiting N,E,W,S,E (East twice). Only booleans
   accumulate, so harmless; 4-neighborhood is behaviorally identical.
8. **[prefs-half-wired]** Orig writes a "Preferences" file on the form
   Save button (setChanges + Prefs.save) but the only reader
   (SMMain FormCreate pref->load block) is COMMENTED OUT. The file is
   written and never read.
9. **[prefs-no-validate]** Orig Preferences.cpp setChanges() constructs
   CurrencyUnit(unitSelector->Text, prefix->Checked) DIRECTLY —
   setUnit() never called on this path, so the 1–3 char limit is
   bypassed; any-length symbols can enter the game and the saved file.
   Latent contradiction: serialize() can emit records deserialize()
   rejects (line-1 > 3 chars fails setUnit). Port's constructor likewise
   doesn't validate (faithful); renderer MAY validate at input.
10. **[zombie-exclusion]** Player details dialog (ListBox1DblClick)
    sums share worth over EXISTING companies only — zombie shares are
    included in Total()/high-score wealth but EXCLUDED from this
    dialog, so the two displays can legitimately disagree.
11. **[tournament-snapshot-weirdness]** (Emergent, not ported as a
    quirk flag — captured by faithful translation of BitBtn1Click) In
    TOURNAMENT, advancing stores/restores ONLY grid + company
    Exist/Value; names/colors are shared. Player shares in
    non-current-world companies are untouched by snapshot/restore —
    interacts with quirk #1 above.

## 5. Logged-but-not-ported original flaws (GC/UI-layer)

- Phantom blank ListView row in playerDetails (stray `Items->Add()`
  before the loop — a permanent trailing empty line).
- `new char[64]` leaked per company iteration in ListBox1DblClick.
- `delete[] Score` in HighScores() frees only the outer array; the
  three inner `ScoreRecord[10]` arrays leak every invocation.
- `delete[] Player; delete[] Company` in closemain() paired with `new`
  allocations elsewhere (fragile but not double-free).
- MoneyShow() in SMMain mutates BOTH Shapes' Pen AND Brush colors
  (pen color assignment to non-outline shapes is redundant).
- (Session 13 read) Players.cpp BitBtn5/BitBtn6 Move Up/Down swap via
  `char buffer[25]` strcpy — latent overflow if a name exceeds 24
  chars; port (when/if reorder buttons are added) must swap by
  reference, not copy this pattern. *(DONE Session 18 — DOM node
  splice; see DIALOGS-NOTES §2.)*

## 6. Renderer Specifications (decoded from source; renderer.ts consumer)

### 6.1 ImageList1 tile map (iStart = GRID_CONFIGS.iStart)
| tile idx | content |
|---|---|
| iStart + (x+y)%2 | checkerboard background |
| iStart + 2 | circle (resource, +500) |
| iStart + 3 | diamond (resource, +100, absorbed) |
| iStart + 4 + c | company c's logo-tile |
| iStart + 9 | selection outline (DrawSels — blue fill, black pen) |
| iStart + 10 | timer-active selection (yellow frame) |

DrawSels: if sels, draw iStart+9 at each of the five Choice squares.
Timer1Timer: cycles Tag 0..4; draws iStart+10 at the active choice
(yellow pen), restoring the blue-frame variant (iStart+9) on the
previous square. Canvas: Brush clBlue, Pen toggling clBlack/clYellow.

### 6.2 redrawGrid() (SMMain.cpp)
```
for y in 0..gridysize-1, x in 0..gridxsize-1:
  draw checkerboard (iStart + ((x+y)%2)) at (x*blwid, y*blhit)
  if grid[x][y] == 1: draw circle (iStart+2)
  elif == 2: draw diamond (iStart+3)
  elif > 2:  draw company (iStart + 1 + grid[x][y])
DrawSels()
Screen->Refresh()
```

### 6.3 go() / offerChoices() canonical ordering
1. sels = false → redrawGrid (clears old selection overlays)
2. MoneyShow (update money display + affordability dots)
3. pickChoices (five squares)
4. sels = true
5. DrawSels
6. Timer1.Enabled = true (start selector animation)
7. MainUpdate (turn counter, company button enablement)

### 6.4 MoneyShow() spec (SMMain.cpp)
- Label6: comma(money) formatted with currency unit
- Shape6..Shape10 (beside each company's button): highlight (white bg
  + black pen) iff money >= company.Value AND company.Exist; else fill
  with the company's own color.
- ComInfo toolbar buttons ToolButton1..5: Enabled = company[i].Exist.

### 6.5 MainUpdate() spec (SMMain.cpp)
- BitBtn1 ("continue/end turn"): Enabled = !sels && progress
- Atlantis/Betelguese/Cannon/Debenese/Eridnus buttons: Enabled =
  Exist of respective company
- Label5: current player name, centered
- Panel3 (turn counter): Caption = turn
- MenuUpdate (contextual): CreateNewGrid/GridSize/NewGame/Preferences
  enabled when !progress; EndGame enabled when progress.
  *(Session 19c: renderer mainUpdate()'s port of MenuUpdate verified
  exact-polarity on all five gates — DIALOGS-NOTES §11.4.)*

### 6.6 Image1MouseDown / Image1MouseMove (SMMain.cpp)
- MouseDown on the grid: convert pixel → cell coords via integer div
  by blwid/blhit. If progress and (xbl,ybl) ∈ Choice[0..4]:
  run checkPlacementRules → on error MessageBox, else stop Timer,
  sels=false, EraseChoices, action(xbl,ybl).
- MouseMove: cursor becomes hand (crHandPoint) over a choice square,
  arrow otherwise (tracked via `hand` bool).

### 6.7 closemain() / quit flow (SMMain.cpp)
- If progress: MessageBox warning about score not being recorded, Yes/
  No; if Yes (and mode==1 via FormCloseQuery) → delete Player/Company
  arrays, Application->Terminate.
- If !progress: plain confirm → terminate.
- QUIT-MENU pathway: closemain(0) does not clean up Player/Company
  before Terminate — process exit handles it (faithful port: just
  reload/reset page state, no memory cleanup semantics needed).

### 6.8 Form layout / chrome
- Main form: screen container + right panel (player list, money label
  Label6, turn counter Panel3 which is CLICKABLE → opens GridManager,
  company buttons, affordability shapes).
- ListBox1 (player list): double-click opens playerDetails (gated by
  !detailsSet()); double-click with details hidden shows info box.
- Menus: New Game, Create New Grid, Grid Size (3 radio items), End
  Game, Quit, Preferences, High Scores, About.

### 6.9 New-game board spec (Session 13; VERIFIED Session 14)
Observable spec (Lee-verified against the original binary, 5-point
playtest of rev 9/10): a new game works with the board AS IT STANDS at
matching grid size — circles survive; company and diamond cells are
stripped. Grid-size CHANGE re-geometries + randomises (setGridSize).
Implemented in scaffold startGame (FIX:[phase3-verified]) + renderer
rev 9 (conditional setGridSize in the Go! handler). Original internal
mechanism UNRESOLVED AND CLOSED — Grid::clear() is uninitialized-loop
UB and cannot be selectively content-aware; Game.cpp (read Sessions
1–2) contains no clearing logic. Purely documentary; nothing pending.

## 7. Dead / Husk / Superseded Forms (analyzed, deliberately not ported)

- **GridManager.h/.cpp + .dfm**: constructor-only, no handlers, sole
  reference is Panel3Click → Show(). Five-panel layout w/ PageControl
  ("Grid View" tab w/ TImage Screen AutoSize+IncrementalDisplay, empty
  "High Scores" tab), ListView seeded "Random", "Test 1", "Test 2",
  dead buttons Delete/Create New Grid/Use This Grid/Cancel. Verdict:
  never-finished grid save/load feature; grid selection is effectively
  random-only. LOGGED AS DELIBERATE OMISSION.
- **ComEditForm.h/.cpp**: 5 edit boxes + 2 buttons, constructor-only.
  Intended company editor; unreferenced from SMMain logic. (Session 13
  re-confirmed from full .cpp: constructor only, zero handlers.)
- **playerDetails.h/.cpp**: constructor-only husk; all population done
  externally by SMMain ListBox1DblClick (ported as
  playerDetailsView). Button1 presumably close/dismiss (no ModalResult
  in header; ShowModal dismissal via system menu). Layout: title,
  3-col list (company/shares/worth), 3 money labels, dismiss button.
- **AboutForm.h/.cpp**: constructor-only STATIC dialog (title/version
  labels, bevel, logo image, dismiss BitBtn), opened ShowModal from
  menu. NOTE: unlike the others, this form is FINISHED, not abandoned —
  trivial by design, not by neglect. Text content lives in unexamined
  .dfm; renderer may render a generic About card. No logic to port.
- **StockForm.h/.cpp** (RESOLVED Session 12): SUPERSEDED ANCESTOR of
  ComInfoForm's trading, not missing behavior. Its three handlers
  (buy/sell w/ "fraudster" validation, max-buy/sell-all, cancel)
  duplicate logic ALREADY PORTED from the live ComInfoForm path
  (buyShares/sellShares/buyMaxShares/sellAllShares). Two telltale
  regressions vs the live path: (1) `atoi` into `__int64` — atoi returns
  C int, silently truncating large/garbage input (ComInfoForm upgraded
  to `large(text)`); (2) BitBtn3 max-buy uses the stale global `maxbuy`
  WITHOUT recomcomputing (ComInfoForm's BitBtn8 calls Info() first — our
  port recomputes). Handlers re-enable ComInfo and call Info() after
  trading — orchestration only. No `Stock->Show()` located in any file
  read; evidence indicates unreachable dead code from an earlier design
  where trading was a separate dialog. ZERO scaffold impact.

## 8. Open Items

- ~~StockForm.h existence~~ RESOLVED (Session 12): superseded dead
  ancestor — see §7. No port action.
- ~~New-game board MECHANISM~~ CLOSED AS UNRESOLVED (Session 14,
  documentary): why circles survive orig new game — Grid::clear() UB
  cannot explain selective wipe; Game.cpp (read Sessions 1–2) contains
  no clearing logic; no candidate file remains. Port implements the
  observed spec (FIX:[phase3-verified], verified 5/5). Reopen only if
  new original sources surface.
- Currency symbol raw byte — default assumed £ (\u00A3, Windows-1252
  mojibake in source); verify before ship.
- Prefs persistence decision — (a) faithful-dead (current, R8), (b)
  wired on startup (DEVIATION), or (c) drop. Loader provided.
- ~~Trading gate (sels)~~ RESOLVED: UI-level enforcement inside the
  trade dialog (orig InfoButs), confirmed ComInfoForm.cpp.
- OPTIONAL: `grep "Stock->"` across .cpp files (low priority).
- ~~tsconfig target vs. header comment (Session 19)~~ **RESOLVED**:
  scaffold.ts's header said "tsconfig target ES2022+ (static {} block,
  BigInt literals)" — authored before any tsconfig existed; the
  Session-19-created one initially said es2020. Resolution (Lee):
  bumped `target`/`lib` to es2022 (`es2022, dom`), gate rerun clean.
  The documented claim is now literally true; the frozen scaffold
  file was never touched. For the record: both targets passed the
  gate identically (static blocks are compiler-supported syntax
  regardless of `target`; BigInt literals need ≥ES2020), so the
  bump was documentation-truth alignment, not a functional fix.

## 9. Session History (condensed)

- **Session 0-1**: Planning/repo skeleton; HANDOFF protocol (session
  handoff docs, later largely superseded by these NOTES files);
  Basic.h + Game.h analysis (per surviving Session-1 handoff doc).
- **Session 2**: Game.cpp translation (thin singleton: Prefs + GameGrid,
  boot defaults only — no board-clearing logic, a fact that later
  mattered in Session 14's mechanism closure).
- **Session 3-5**: Remaining initial ports (CurrencyUnit, Prefs,
  GameGrid, Grid, large→BigInt first pass); SMMain structs + globals →
  AppState (13 VS Code problems resolved); geometry/GRID_CONFIGS
  consolidation; comma() first attempt (later corrected).
- **Session 6**: FINAL large→BigInt decision w/ license reasoning.
- **Session 7**: Merger.cpp/SplitForm.cpp ports (9 problems resolved).
- **Session 8**: ComForm/ComInfoForm/OverForm ports; mergerHook first
  version (flawed, later corrected).
- **Session 9**: Health check — mergerHook corrected to QUIRK-FIDELITY
  spec (tournament no-conversion, zombie shares); HighScores/OverForm
  verified; scores JSON/localStorage decision.
- **Session 10**: Full SMMain.cpp re-verification; binary DFM decoding
  (ComInfoForm, GridManager); GridManager declared dead; added
  playerDetailsView, tile constants, offerChoices, concludeGame.
- **Session 11**: Preferences.cpp analysis; draft-commit flow added;
  half-wired persistence + validation-bypass quirks documented.
- **Session 12**: Logic layer declared FEATURE-COMPLETE/FROZEN. Full
  condensation performed; annotations relocated to this file. Final
  source dispositions: playerDetails (husk, verified), Preferences
  (ported flow), AboutForm (static, analysis-only), StockForm (found —
  superseded dead ancestor, analysis-only; source-reading phase
  CLOSED). Binary DFM → rename-to-.txt workaround established.
- **Session 13 (renderer phase; Phase 3 verification begun)**: renderer
  revs 4–9 (end-game fixes, event-dialog modals + queue, merger/split/
  founding fidelity from SplitForm/Merger/ComForm reads). Read:
  HighScores.h, Preferences.h (structural matches), Players.cpp
  (everything faithful except the clear()-question it raised),
  ComEditForm.cpp (dead), ComForm.cpp (founding modal + Info chain),
  GameGrid.h/.cpp (randomise statistics, no minimum), Grid.h/.cpp
  (clear() UB confirmed). **First sanctioned scaffold amendment**:
  FIX:[phase3-verified] in startGame — new-game board = circles kept,
  companies/diamonds stripped, per Lee's verified observation; prior
  blank-board behavior was an erroneous inference from UB code.
  Renderer R2 flag retired.
- **Session 14 (rev 10 + close-out)**: auto-show standings at natural
  game end (R14 retired, orig BitBtn1Click Finish() fidelity;
  verified by Lee playthrough). Rev 9 new-game board behavior verified
  5/5 by Lee. Session-1 handoff doc surfaced (unintended client
  attachment) confirming Game.h/.cpp were analyzed Sessions 1–2 —
  correcting the mistaken "Game.cpp unread" belief; as the ported Game
  contains no board-clearing logic, the circles-survive mechanism is
  CLOSED AS UNRESOLVED (documentary). Notes files made current
  (Session 13/14 banners, verification stamps, ledger updates).
- **Session 19 (toolchain + verification; NO scaffold code change)**:
  build gate added (DIALOGS-NOTES §8): `tsconfig.json` created
  (initially es2020 + dom after a 58-false-error first run, then
  bumped to es2022 per the header-comment discrepancy — §8), `build.sh`
  gated `tsc && npx esbuild …`, negative-tested, green both before and
  after the es2022 bump. Scaffold byte-identical throughout — the
  clean tsc pass is the toolchain's retroactive confirmation of
  Sessions 12–13 freeze quality. Sessions 19b/19c (dialogs cosmetics,
  doConclude verification) recorded in DIALOGS-NOTES §§10–11; their
  findings relevant here: FIX:[cumulative-worth] re-confirmed at
  source (§2.7), concludeGame tail verified faithful to orig
  EndGame1Click/BitBtn1Click incl. the renderer's hand-composed
  doConclude (RENDERER-NOTES rev 12 re-sync warning — currently in
  sync), and the tsconfig-target/header-comment discrepancy logged
  and resolved (§8). Sessions 15–18 histories live in
  RENDERER-NOTES.md (renderer phase) and DIALOGS-NOTES.md (Sessions
  18–19); this archive intentionally records only scaffold-relevant
  events.

## 10. Verify-before-renderer checklist

- [ ] Currency symbol raw byte (assume £, verify)
- [ ] SMMain.dfm captions (menu labels 16by16 etc. — display quirk #6)
- [ ] Preferences persistence option selected (a/b/c)
- [x] ~~tsconfig target resolution~~ (Session 19: bumped to es2022,
      gate green — §8; header claim now true, scaffold untouched)
- [x] Trading gate enforcement point decided (UI-level, InfoButs)
- [x] StockForm.h existence resolved (superseded dead code)
- [x] renderer.ts import surface agreed (ActionHooks etc. as-is)
- [x] R2 new-game board behavior resolved + verified (Sessions 13–14:
      observed spec implemented, 5/5 playtest)
- [x] Type-check baseline established (Session 19: tsc clean over all
      three files; gate negative-tested — DIALOGS-NOTES §8.4)
