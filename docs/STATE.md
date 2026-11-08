# STATE.md — SPACE MONOPOLY PORT — LIVE STATE (rev 9)
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
# rev 9 (Session 31 close): BOTH SESSION-31 DEFECTS CLOSED.
# (1) Trade-dialog width fix CLOSED — probe-first executed (rule 1):
# computed width 352.48px fresh-open vs 343.33px post-purchase →
# CONFIRMED OSCILLATION (caption-length-driven shrink-to-fit), not
# fixed-floor pinning. Patch = pinned explicit width; Lee-tuned
# constant 380px (headroom for multi-digit share growth; supersedes the
# measured+10 figure and the queue's old fixed-columns hypothesis).
# dialogs-game rev 6→7, Lee-applied; verified on Lee's eyes (rule 2).
# (2) Company-color contrast fix CLOSED — display-palette architecture:
# dialogs-core rev 2 = palette home (COMPANY_DISPLAY_COLORS, index-
# aligned with COMPANY_DEFS 0–4; companyDisplayColor(com, nonexistent?)
# helper with per-site gray-filler arg). Values LEE-RULED: yellow
# #e0e000 (Cannon Inc.), green #5eea2f (Betelguese); red/teal/blue
# verbatim. Also folded: `modal` patch (old queue item 4 CLOSED) and
# header repoints to ARCHIVE.md. FIVE consumers re-pointed:
# renderer-chrome rev 2 (build-time swatch fill) · renderer.ts rev 27
# (moneyShow LIVE repaint — the critical pairing site) · renderer-board
# rev 2 (token fill; '#888' fallback preserved) · dialogs-game rev 8
# (trade band) · dialogs-events rev 2 (4 banner swatches: founding/
# split/merger-absorbed/merger-survivor). All build-green with receipts.
# DEVIATION:[company-color-contrast]. §1 baseline: structurally clean;
# company colors changed INTENTIONALLY (expectation recorded at plan
# time, not discovered at verify).
# PERMANENT-DIVERGENCE WARNING (standing): scaffold state colors (orig
# clYellow #ffff00 / clLime #00ff00) are the FIDELITY RECORD and are
# never painted; every display surface uses the display palette. Do
# not "fix" a display fill back to a state hue — the divergence is
# the design.
# Shelved-but-available: trade-band text-shadow booster
# (text-shadow: 2px 2px 2px black) if the new values ever prove
# insufficient on Lee's monitor.
# rev 8 LINEAGE NOTE: rev 8 was a mid-session draft (contrast defect +
# About-dialog additions); the close-time re-read returned the rev 7
# text, so rev 8's disk-landing is UNCONFIRMED. rev 9 supersedes
# regardless — paste over whatever is on disk.
# Session 31 also added repo artifacts OUTSIDE the process regime (not
# in the disk table): README.md (GPL-2.0-only; build = ./build.sh
# → tsc + esbuild bundle.js → open index.html) and LICENSE (verbatim
# GPL-2.0 from gnu.org). Source-header copyright notices still OWED.
# rev 7: Session 30 close (three-way renderer split; splice lesson).

## DISK STATE (verify at session open; build green before any code work)

| File | Rev on disk | Notes |
|---|---|---|
| dialogs-core.ts | 2 | palette home: COMPANY_DISPLAY_COLORS + companyDisplayColor; `modal` patch FOLDED; header repointed to ARCHIVE.md |
| dialogs-events.ts | 2 | 4 banner swatch fills on display palette |
| dialogs-game.ts | 8 | rev 7 = 380px pinned trade-dialog width (Lee-applied); rev 8 = trade-band fill re-point + header lineage/spine repoints |
| dialogs-meta.ts | 1 | verbatim split carry; About item presumes this home (verify at fix session) |
| dialogs.ts | 9 | barrel — wildcard re-exports of the four modules |
| renderer.ts | 27 | app shell; rev 27 = moneyShow repaint on display palette |
| renderer-chrome.ts | 2 | build-time swatch fill on display palette |
| renderer-board.ts | 2 | token fill on display palette; '#888' fallback preserved |
| scaffold.ts | frozen | +2 sanctioned amendments; do not touch; state hues = fidelity record |

Build: green (Lee-confirmed after every issuance this session; final
receipt after dialogs-events rev 2). §1 baseline structurally clean with
intentional company-color changes (Lee-verified: "colors look better").
Docs directory: STATE.md, ARCHIVE.md (Sections 0–5 complete),
FRESH_BOOTSTRAP.md, SCAFFOLD-NOTES.md, RENDERER-ARCHIVE.md, + code files.
Repo artifacts outside the regime: README.md, LICENSE (GPL-2.0).

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
  STANDING: issue each file as ONE complete artifact whenever it fits
  under the rule-6 ceiling (~10K); a chunk-splice is permissible ONLY
  when the file cannot fit, and then at COMPLETE METHOD BOUNDARIES with
  explicit part-end markers and a splice dry-run note. Never make Lee
  the assembler mid-class. (Session 31 ran entirely single-file: zero
  splice events, zero failures.)
- **Renderer size regime (post-split, standing)**: each renderer
  sub-file must stay within a single-turn read AND below the ceiling.
  Current census: shell ≈ 5K, chrome ≈ 5K, board ≈ 2.5K — all healthy.
- **Palette divergence (standing; see header warning)**: scaffold =
  fidelity record; display surfaces = display palette, one home
  (dialogs-core COMPANY_DISPLAY_COLORS).
- **Tabs dropped** (DEVIATION:[tabs-dropped]): flippers are the complete
  navigation; active-tab color echo retired.
- **Responsive / mobile-friendly design** (standing intent, unsurveyed):
  pixel-fixed widths deprecated. Survey scope: renderer-chrome CSS,
  dialogs-core CSS, scaffold-derived layout constants. Core-CSS slice
  inventoried (Session 28): 320/520px modal bounds, 140px text inputs,
  22px indent, 18px swatches. NOTE: the 320/520 bounds analysis is now
  informed by Session-31's finding that the trade dialog oscillates
  shrink-to-fit between them (fixed by rev 7's pinned 380px width).
- **Dialog content-alignment survey (NEW, Session 31)**: Lee flagged
  possible misalignments across dialogs post-width-fix; evidence so
  far: trade-dialog caption rows ragged-wrap, band flexes name
  center-ish, 70px qty fields. Natural batch with the responsive
  survey (one audits geometry, one legibility/clutter).
- **§1 baseline**: square cells 16×12 / 22×18 / 28×24, tokens/entities,
  sels borders, three dropdown menus, mode radios, two-group prefs —
  renders identically after any dialogs/structural change, EXCEPT
  intentional color changes under an approved DEVIATION tag.
  Last verified: Session 31 close (structural, colors intentionally new).

## SESSION-31 EXECUTION RECORD (durable summary; splice lesson → Session 30 in ARCHIVE/RENDERER-ARCHIVE)

- **Width fix (dialogs-game 6→7→8)**: probe-first per rule 1; two-state
  probe proved oscillation (352.48↔343.33px), killing the min-width-floor
  hypothesis; explicit width pinned instead. Lee self-tuned 380px after
  landing — growth-headroom reasoning recorded (my probe sampled two
  states of one game; multi-session share growth needs slack). All
  consumer surfaces unchanged otherwise.
- **Contrast fix (six files)**: census method worth keeping — a grep
  sweep ("\.color\|COMPANY_DEFS") enumerated ALL consumers before any
  patch composed; it caught the shell's moneyShow repaint (renderer.ts:358,
  a site I had NOT mapped from the dialog/board reads alone) and the
  scaffold:1023 view-model carrier (classified non-painting). Compose-
  order discipline: dialogs-core rev 2 (the export everything depends
  on) landed FIRST, build-green, then consumers one-per-issuance with
  receipts between (rule 3 honored six times).
- **Process events**: one compaction boundary hit mid-batch (dialogs-
  events) — recovered cleanly by Lee re-pasting the file per my request
  (rule 5 saved rev 2 from being composed against a summarized-away
  memory of the file). STATE rev-8 lineage discrepancy resolved by
  composing rev 9 from the close-time re-read (see header).
- **Detour work (outside regime)**: README.md + LICENSE (GPL-2.0-only)
  composed and committed; build instructions corrected from Lee's
  build.sh (tsc + esbuild IIFE/SM → bundle.js; play = open index.html).

## OPEN ITEMS

- **About-dialog game description** (presumed dialogs-meta.ts rev 1→2):
  brief game/gameplay description for Help→About. Prerequisites:
  (a) rule-5 full re-read of dialogs-meta.ts to CONFIRM About lives
  there; (b) Lee content ruling — length, and fidelity posture (credit
  the original/"port of" framing vs original-work framing; README's
  "The Original Game"/"This Port" sections are a proven prose skeleton).
- **Source-header copyright notices OWED** (repo hygiene): short GPL-
  2.0-only notice + copyright line at top of each .ts file; batch with
  any future code pass.
- **Four Todo residuals (PARKED, paste-sized)**: (a) Buildings entity —
  drawCellEntity has no buildings branch; confirm against orig evidence,
  then implement or consciously drop. (b) Player-token color source
  (B5): player-blue vs company-colored; needs orig evidence. (c)
  Betelguese spelling vs orig `&Betelguese` caption (COMPANY_DEFS was
  pasted Session 31 — 'Betelguese' confirmed as the PORT spelling; the
  check vs the ORIGINAL caption remains outstanding). (d) Pre-game
  menu-enablement vs orig (§11.7); needs orig evidence.
- **Okay-trap ruling (parked)**: first documented user trip on
  Okay-vs-Save persist asymmetry; deliberate fidelity design; dialogs-
  side patch awaiting Lee ruling.
- **Currency symbol raw byte** (verify before ship): default assumed £
  (Windows-1252 mojibake); confirm against orig binary.
- **SCAFFOLD-NOTES amendment log**: dated line for DEVIATION:[square-cells]
  still owed (Lee's hand at next scaffold-notes touch).
- **RENDERER-ARCHIVE junction verification (minor)**: single-APPEND-LOG
  confirmation folded into Session-30 paste — Lee confirms when next
  touching that file.

## QUEUE

1. **Todo residuals batch** (a)–(d): all paste-sized; one session with
   Lee-supplied orig materials. Implement/conscious-drop rulings are
   Lee's.
2. **About-dialog description** (dialogs-meta 1→2): confirm home
   (re-read), then Lee content ruling, then compose.
3. **Dialog content-alignment survey** (NEW, Session 31): Lee-flagged;
   evidence = trade-dialog ragged rows, band flex, 70px qty fields.
   Propose a batch.
4. **Responsive-design survey** (see Live Directions): scope a batch
   proposal; natural pairing = queue item 3 (one pass, both audits).
5. **Bootstrap regeneration** — at each session close, from this file.

## SESSION-OPEN PROTOCOL

1. Lee confirms disk state matches table + build green.
2. Lee announces queue item; required file pastes follow (one large file
   per turn, per rule 4). Post-split: renderer sub-files each fit one
   turn; full-file re-reads are cheap again.
3. Re-read all pages of any to-be-revised file before composing. No code
   before gates clear.
