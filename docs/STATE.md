# STATE.md — SPACE MONOPOLY PORT — LIVE STATE (rev 7)
# Sole source of live truth. Successor to the five-spine notes regime
# (dissolved Session 28 — migration CLOSED; see ARCHIVE.md Section 0).
# Decision rationale & full history: ARCHIVE.md (Sections 0–5, all
# CLOSED). Pre-split renderer deep history (revs 16–23):
# RENDERER-ARCHIVE.md (append-only). Frozen-scaffold rationale:
# SCAFFOLD-NOTES.md (frozen, +redirect banner).
#
# Transport regime: STATE.md = small, full reissue on change; rev = disk
# contents. ARCHIVE.md = append-only; chunk-built; anchored patches with
# marker receipts; interior never modified (errata appended, dated).
# FRESH_BOOTSTRAP.md = derived pointer, regenerated each session close,
# non-authoritative.
#
# rev 7 (Session 30 close): THREE-WAY RENDERER SPLIT CLOSED — rev-26
# wave complete, Lee-verified (build green, game running, §1 baseline
# pass clean). renderer.ts rev 26 (app shell) + renderer-chrome.ts rev 1
# + renderer-board.ts rev 1, full-app-object plumbing, zero behavior
# change. Split-wave adjustments: `readonly` dropped from eight
# chrome fields assigned in buildChrome() (TS2540); `CLASSIC` import
# retired in shell (unused). PROCESS FAILURE + LESSON: mid-class
# chunk-splice delivery produced 256 VS Code problems (part 2 landing
# outside the class); retired — SINGLE-FILE ISSUANCE under the ceiling
# is now the default; splices require Lee sign-off. New queue item:
# buy/sell dialog mid-purchase re-layout (dialogs-side). Todo residuals
# remain PARKED (scope ruling this session: split mechanics only).
# rev 6: Session 29 close (Batch G at renderer rev 25).

## DISK STATE (verify at session open; build green before any code work)

| File | Rev on disk | Notes |
|---|---|---|
| dialogs-core.ts | 1 + `modal` export patch | patch landed, NOT folded; → rev 2 at next substantive touch |
| dialogs-events.ts | 1 | verbatim split carry |
| dialogs-game.ts | 6 | Batch F closed (rev 5 layout / rev 6 comments); flippers sole nav; buy/sell dialog resides here (see Queue) |
| dialogs-meta.ts | 1 | verbatim split carry |
| dialogs.ts | 9 | barrel — wildcard re-exports of the four modules |
| renderer.ts | 26 | app shell: constructor, turn flow, actionHooks, moneyShow/mainUpdate, delegates, mountApp; owns state/hints/scratch |
| renderer-chrome.ts | 1 | palette + CSS + buildChrome + menus + positioning + rebuildPlayerList; 8 fields lost `readonly` (buildChrome assignment) |
| renderer-board.ts | 1 | canvas/fit/paint/sels/timers/mouse; observes chrome.boardRegion |
| scaffold.ts | frozen | +2 sanctioned amendments; do not touch |

Build: green (Lee-confirmed post-split, Session 30). §1 baseline re-verified
clean at Session-30 close (all three grids, tokens/entities/sels, three
menus + Escape, mode radios, two-group prefs; continue-button states).
Known errata: ARCHIVE.md Section 0 (dialogs-core rev-table correction;
rev-10 compaction loss — "(rec)" discipline binding).

Docs directory: STATE.md, ARCHIVE.md (Sections 0–5 complete),
FRESH_BOOTSTRAP.md, SCAFFOLD-NOTES.md, RENDERER-ARCHIVE.md, + code files.

## BINDING RULES (violations = process failure)

1. **Probe-first**: computed-style/DOM probe on FIRST report of any layout
   defect, before composing the first patch.
2. **Usability over geometry**: user-perceived usability is the acceptance
   criterion; computed-style correctness is not.
3. **Patch-landing verification**: every chat patch requires build-green
   confirmation before the next patch composes.
4. **Multi-paste protocol**: multiple files in one turn → Lee tags priority;
   drain one file fully across consecutive turns; read budgets are PER-TURN.
5. **Preservation-verification**: full re-read of any to-be-revised file
   before composing; revise issued text, never regenerate from memory.
6. **Payload ceiling**: full-file artifacts target < 10K tokens; > 12K
   empirically fails to attach. Surface overruns before issuing.
7. **Comment-relocation**: notes own per-batch narrative; code carries live
   contracts only (carve-out: fidelity tags, gating semantics, type notes).
8. **Rev identity**: rev numbers uniquely identify disk contents; cite
   module+rev. Chat patches on disk ⇒ next reissue bumps the rev.

## LIVE DIRECTIONS & CONSTRAINTS

- **Delivery regime (Session-30 lesson; supersedes chunk-plan default)**:
  a mid-class chunk-splice (part 2 appended outside the closing brace)
  caused 256 problems in renderer-chrome/renderer — and one turn of
  model output corrupted mid-composition, compounding diagnosis.
  STANDING: issue each file as ONE complete artifact whenever it fits
  under the rule-6 ceiling (~10K); a chunk-splice is permissible ONLY
  when the file cannot fit, and then at COMPLETE METHOD BOUNDARIES with
  explicit part-end markers and a splice dry-run note. Never make Lee
  the assembler mid-class.
- **Renderer size regime (post-split, standing)**: each renderer
  sub-file must stay within a single-turn read AND below the ceiling.
  Current census: shell ≈ 5K, chrome ≈ 5K, board ≈ 2.5K — all healthy.
- **Tabs dropped** (DEVIATION:[tabs-dropped]): flippers are the complete
  navigation; active-tab color echo retired.
- **Responsive / mobile-friendly design** (standing intent, unsurveyed):
  pixel-fixed widths deprecated. Survey scope: renderer-chrome CSS,
  dialogs-core CSS, scaffold-derived layout constants. Core-CSS slice
  inventoried (Session 28): 320/520px modal bounds, 140px text inputs,
  22px indent, 18px swatches.
- **§1 baseline**: square cells 16×12 / 22×18 / 28×24, tokens/entities,
  sels borders, three dropdown menus, mode radios, two-group prefs — renders
  identically after any dialogs/structural change. VERIFIED CLEAN against
  the rev-26 split (Session 30).

## SESSION-30 EXECUTION RECORD (durable summary; detail → RENDERER-ARCHIVE append)

- **Three-way renderer split CLOSED**: rev 25 (~12K tokens, 5 pages)
  re-read in full across two turns (rule 4/5), then split into
  renderer-chrome.ts rev 1 / renderer-board.ts rev 1 / renderer.ts rev 26.
  Mechanism: full-app-object plumbing, direct `app.chrome.X`/`app.board.X`
  property access, no accessor machinery. Bodies carried verbatim except
  mechanical re-points. `setGridSize` and the hint trio stayed shell-side
  (unnamed-map default = orchestrator logic in shell).
- **Splice failure + recovery**: initial chunked delivery (board 1,
  chrome 2, shell 2) put part 2 of chrome OUTSIDE the class → 256
  problems. Diagnosed from diagnostics (pattern: members "missing" =
  defined outside class; mkPanel/mkItem/mkTop unresolved = local-const
  leakage). Recovered by SINGLE-FILE reissue of chrome (also fixing the
  predicted TS2540 `readonly` defect), then single-file reissue of the
  shell. Board was never implicated — chunk 1 stood as delivered.
  Model-output corruption occurred in one reply this session; nothing
  from it was carried forward; recovery followed Stabilize→Diagnose→Re-run.
- **Gates**: build green (Lee receipt); §1 baseline pass clean (Lee);
  game running. Trade-dialog sizing defect NOTED during baseline
  (below) — separated from split verification as dialogs-side scope.
- **BOOKKEEPING DEBT CLEARED THIS SESSION**: RENDERER-ARCHIVE deep-history
  append composed (revs 24–25 Batch G story + rev-26 split + process
  lesson), delivered as anchored tail-append payload. N3 junction check
  (one-vs-two APPEND LOG) folded into the same paste instruction.

## OPEN ITEMS

- **Four Todo residuals (harvested Session 29; renderer-side; PARKED but
  now CHEAP — renderer sub-files all re-readable in one turn)**:
  (a) **Buildings entity** — original shows stacked yellow-roofed
  buildings ~3/cell; `drawCellEntity` (now renderer-board rev 1) has NO
  buildings branch — confirm against orig evidence, then implement or
  consciously drop; needs Lee's orig-evidence materials.
  (b) **Player-token color source** (B5): player-blue vs company-colored,
  unresolved; needs orig evidence (B5).
  (c) **Betelguese spelling check** (B10): compare scaffold
  COMPANY_DEFS against orig `&Betelguese` caption — QUIRK-FIDELITY
  candidate; needs the COMPANY_DEFS paste (scaffold frozen — paste only).
  (d) **Initial menu-enablement vs orig** (§11.7): port's pre-game
  defaults believed faithful (Session-19c polarity work) but never
  formally closed against orig pre-game state; needs orig evidence.
- **Buy/sell dialog mid-purchase re-layout (NEW, Session-30 baseline
  observation)**: trade dialog changes size during stock purchase as
  share counts change length, shifting wording. dialogs-game.ts side
  (rev 6, rev→7 on fix). Rule 1 (probe-first) applies at fix session.
- **Okay-trap ruling (parked)**: first documented user trip on
  Okay-vs-Save persist asymmetry (Session 29). Deliberate fidelity
  design (§12.6-5); changing it is a dialogs-side patch awaiting a
  Lee ruling.
- **Currency symbol raw byte** (verify before ship): default assumed £
  (Windows-1252 mojibake); confirm against orig binary.
- **SCAFFOLD-NOTES amendment log**: dated line for DEVIATION:[square-cells]
  still owed (Lee's hand at next scaffold-notes touch).
- **RENDERER-ARCHIVE junction verification (minor)**: N3 append payload
  verified complete; one-vs-two APPEND LOG count folded into the
  Session-30 append application — Lee confirms at paste.

## QUEUE

1. **Todo residuals batch** (a)–(d): with the split done, all evidence
   gaps are paste-sized; cheap to close in one session with Lee-supplied
   orig materials. Implement or consciously-drop rulings are Lee's.
2. **Buy/sell dialog sizing fix** (dialogs-game.ts rev 6 → 7): probe-first
   on the mid-purchase re-layout; likely fixed-width table/label columns;
   preserve §1 baseline.
3. **Responsive-design survey** (see Live Directions): scope a batch
   proposal. Natural pairing: dialogs-core rev 2 fold-in.
4. **dialogs-core rev 2**: fold `modal` patch into header-noted reissue at
   next substantive touch; header repoints history refs to ARCHIVE.md.
5. **Bootstrap regeneration** — at each session close, from this file.

## SESSION-OPEN PROTOCOL

1. Lee confirms disk state matches table + build green.
2. Lee announces queue item; required file pastes follow (one large file
   per turn, per rule 4). Post-split: renderer sub-files each fit one
   turn; full-file re-reads are cheap again.
3. Re-read all pages of any to-be-revised file before composing. No code
   before gates clear.
