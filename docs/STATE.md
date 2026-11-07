# STATE.md — SPACE MONOPOLY PORT — LIVE STATE (rev 6)
# Sole source of live truth. Successor to the five-spine notes regime
# (dissolved Session 28 — migration CLOSED; see ARCHIVE.md Section 0).
# Decision rationale & full history: ARCHIVE.md (Sections 0–5, all
# CLOSED). Pre-split renderer deep history (revs 16–23):
# RENDERER-ARCHIVE.md (frozen). Frozen-scaffold rationale:
# SCAFFOLD-NOTES.md (frozen, +redirect banner).
#
# Transport regime: STATE.md = small, full reissue on change; rev = disk
# contents. ARCHIVE.md = append-only; chunk-built; anchored patches with
# marker receipts; interior never modified (errata appended, dated).
# FRESH_BOOTSTRAP.md = derived pointer, regenerated each session close,
# non-authoritative.
#
# rev 6 (Session 29 FINAL close): SESSION 29 COMPLETE. RENDERER-NOTES
# dissolution CLOSED — ARCHIVE §5 verified complete (banner + verbatim
# rev-9 body + END marker; full-file verification served as receipt);
# file deletion cleared and recorded. Legacy-docs retirement CLOSED —
# five files deleted (Session 20 Interface Todo, GLOSSARY, SOURCE_MAP,
# PORT_PLAN, UI_Tier_Map); dispositions in ARCHIVE §0 incl. preserved
# provenance (© 1998–2001 David Vivash, GPL v2) and UI_Tier_Map addendum.
# Batch G CLOSED at renderer.ts rev 25 (all scopes Lee-verified, build
# green). Next queue head: three-way renderer split (rev-26 wave).
# rev 5: residuals harvest. rev 2–4: see ARCHIVE §5 banner record.

## DISK STATE (verify at session open; build green before any code work)

| File | Rev on disk | Notes |
|---|---|---|
| dialogs-core.ts | 1 + `modal` export patch | patch landed, NOT folded; → rev 2 at next substantive touch |
| dialogs-events.ts | 1 | verbatim split carry |
| dialogs-game.ts | 6 | Batch F closed (rev 5 layout / rev 6 comments); flippers sole nav |
| dialogs-meta.ts | 1 | verbatim split carry |
| dialogs.ts | 9 | barrel — wildcard re-exports of the four modules |
| renderer.ts | 25 | Batch G CLOSED & Lee-verified: white-dot swatches, header collapse, loadPreferences() boot call |
| scaffold.ts | frozen | +2 sanctioned amendments; do not touch |

Build: green (Lee-confirmed post-rev-25). §1 baseline unchanged and
re-verified this session. Known errata: ARCHIVE.md Section 0 (dialogs-core
rev-table correction; rev-10 compaction loss — "(rec)" discipline binding).

Docs directory FINAL (Session 29): STATE.md, ARCHIVE.md (Sections 0–5
complete), FRESH_BOOTSTRAP.md, SCAFFOLD-NOTES.md, RENDERER-ARCHIVE.md,
+ code files. All five legacy docs + RENDERER-NOTES.md deleted;
dispositions in ARCHIVE §0; deep renderer history preserved in
ARCHIVE §5 + RENDERER-ARCHIVE.md.

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

- **Tabs dropped** (DEVIATION:[tabs-dropped]): flippers are the complete
  navigation; active-tab color echo retired.
- **Responsive / mobile-friendly design** (standing intent, unsurveyed):
  pixel-fixed widths deprecated. Survey scope: renderer.ts, dialogs-core
  CSS, scaffold-derived layout constants. Core-CSS slice inventoried
  (Session 28): 320/520px modal bounds, 140px text inputs, 22px indent,
  18px swatches.
- **§1 baseline**: square cells 16×12 / 22×18 / 28×24, tokens/entities,
  sels borders, three dropdown menus, mode radios, two-group prefs — renders
  identically after any dialogs/structural change.
- **Renderer size regime (Session 29)**: renderer.ts ~14K tokens exceeds
  both the per-turn ingest budget (~4 pages) and the rule-6 artifact
  ceiling — motivating the approved three-way split (below). Standing
  post-split: each renderer sub-file must stay within a single-turn read
  AND below the ceiling. Near-ceiling issuances default to planning
  chunks from the start (rev-25 precedent: 4-chunk delivery).

## SESSION-29 EXECUTION RECORD (durable summary; detail → ARCHIVE §0/§5)

- **Batch G CLOSED at renderer.ts rev 25**: white-dot swatches
  (DEVIATION:[white-dot-affordance], replaces white-border per R13 —
  also closes Todo A7/D3, deferred since Session 20); header collapse
  per §7 absorption map; loadPreferences() boot call
  (DEVIATION:[prefs-wired], renderer-side only, scaffold untouched).
  Delivery via the sanctioned 4-chunk fallback (two bare failures first).
- **Prefs false-positive defect cycle (lesson)**: "prefs don't survive
  reload" resolved as Okay-vs-Save semantics (Okay = apply-only; Save =
  persist — deliberate §12.6-5 fidelity). Writer/reader/boot-call
  exonerated by probe. Okay-trap redesign PARKED (open item).
- **RENDERER-NOTES dissolution CLOSED**: ARCHIVE §5 = banner + verbatim
  rev-9 body + END marker, full-file verified (receipt satisfied); file
  deleted. Deep history: ARCHIVE §5 (rev-24 era) + RENDERER-ARCHIVE
  (revs 16–23).
- **Legacy-docs retirement CLOSED**: five pre-migration docs audited,
  dispositioned, deleted (ARCHIVE §0 entry + UI_Tier_Map addendum).
  Todo residuals harvested to open items below; provenance preserved.

## OPEN ITEMS

- **Four Todo residuals (harvested Session 29; renderer-side)**:
  (a) **Buildings entity** — original shows stacked yellow-roofed
  buildings ~3/cell; `drawCellEntity` (rev 25) has NO buildings branch —
  confirm against orig evidence, then implement or consciously drop;
  (b) **Player-token color source** (B5): player-blue vs company-colored,
  unresolved; (c) **Betelguese spelling check** (B10): compare port
  COMPANY_DEFS against orig `&Betelguese` caption — QUIRK-FIDELITY
  candidate; (d) **Initial menu-enablement vs orig** (§11.7): port's
  pre-game defaults believed faithful (Session-19c polarity work) but
  never formally closed against orig pre-game state. Cheap to batch at
  the three-way-split session (rev 25 fully re-read there anyway).
- **Okay-trap ruling (parked)**: first documented user trip on
  Okay-vs-Save persist asymmetry (Session 29). Deliberate fidelity design
  (§12.6-5); changing it is a dialogs-side patch awaiting a Lee ruling.
- **Currency symbol raw byte** (verify before ship): default assumed £
  (Windows-1252 mojibake); confirm against orig binary.
- **SCAFFOLD-NOTES amendment log**: dated line for DEVIATION:[square-cells]
  still owed (Lee's hand at next scaffold-notes touch).
- **RENDERER-ARCHIVE junction verification (minor)**: N3 append payload
  verified complete; junction with pre-existing rev-17 entry / APPEND LOG
  replacement unconfirmed if the Session-29 paste was tail-only.
  Also due at the split session: RENDERER-ARCHIVE deep-history append for
  revs 24–25 (rev 26 happens next).

## QUEUE

1. **Three-way renderer split (APPROVED, Session-29 rulings)** —
   renderer-chrome.ts (palette + CSS + chrome/menu construction) /
   renderer-board.ts (paint, fit, mouse, timers) / renderer.ts app shell
   (turn flow, mainUpdate, delegates, actionHooks). Zero behavior change;
   Session-17 dialogs-split precedent (verbatim carries, import blocks
   new, barrel optional); full-app-object plumbing (no accessor
   machinery). Rev-26 wave; design composed at its own session; gates:
   build green, §1 baseline, every sub-file under ingest/ceiling limits.
   Requires full rev-25 paste train (multiple turns, rule 4). Fold in:
   Todo-residual verifications; RENDERER-ARCHIVE rev-24/25 append.
2. **Responsive-design survey** (see Live Directions): scope a batch
   proposal. Natural pairing: dialogs-core rev 2 fold-in.
3. **dialogs-core rev 2**: fold `modal` patch into header-noted reissue at
   next substantive touch; header repoints history refs to ARCHIVE.md.
4. **Bootstrap regeneration** — at each session close, from this file.

## SESSION-OPEN PROTOCOL

1. Lee confirms disk state matches table + build green.
2. Lee announces queue item; required file pastes follow (one large file
   per turn, per rule 4).
3. Re-read all pages of any to-be-revised file before composing. No code
   before gates clear.
