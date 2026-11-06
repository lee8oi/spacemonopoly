# STATE.md — SPACE MONOPOLY PORT — LIVE STATE (rev 2)
# Sole source of live truth. Successor to the five-spine notes regime
# (dissolved Session 28 — migration CLOSED; see ARCHIVE.md Section 0).
# Decision rationale & full history: ARCHIVE.md. Pre-split renderer history
# (revs 16–23): RENDERER-ARCHIVE.md (frozen). Frozen-scaffold rationale:
# SCAFFOLD-NOTES.md (frozen, +Session-28 redirect banner).
#
# Transport regime: STATE.md = small, full reissue on change; rev = disk
# contents. ARCHIVE.md = append-only; chunk-built; anchored patches with
# marker receipts; interior never modified (errata appended, dated).
# FRESH_BOOTSTRAP.md = derived pointer, regenerated each session close,
# non-authoritative.
#
# rev 2 (Session 28 close): migration marked CLOSED; open items folded in
# (currency symbol, prefs-wiring context); notes-migration queue item
# retired; grep "Stock->" item DROPPED (Lee may resurrect from archive).

## DISK STATE (verify at session open; build green before any code work)

| File | Rev on disk | Notes |
|---|---|---|
| dialogs-core.ts | 1 + `modal` export patch | patch landed, NOT folded; → rev 2 at next substantive touch |
| dialogs-events.ts | 1 | verbatim split carry |
| dialogs-game.ts | 6 | Batch F closed (rev 5 layout / rev 6 comments); flippers sole nav |
| dialogs-meta.ts | 1 | verbatim split carry |
| dialogs.ts | 9 | barrel — wildcard re-exports of the four modules |
| renderer.ts | 24 | Batch G target → rev 25; needs full rev-24 paste before composing |
| scaffold.ts | frozen | +2 sanctioned amendments; do not touch |

Build: green, ~77 kb, game functional (Lee-verified; no code changes in
Session 28). Known errata: ARCHIVE.md Section 0 (dialogs-core rev-table
correction; rev-10 compaction loss — "(rec)" discipline binding).

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

## OPEN ITEMS

- **Currency symbol raw byte** (verify before ship): default assumed £
  (Windows-1252 mojibake in original source); confirm against orig binary.
- **Prefs-wiring context for Batch G**: `loadPreferences()` boot call is
  DEVIATION:[prefs-wired] (option b, wired on startup; supersedes the
  original's half-wired quirk). Activation touching scaffold is
  frozen-file amendment territory — discuss before coding.

## QUEUE

1. **Batch G** — renderer.ts rev 25 (triple scope): white-dot swatches
   (R13, §12.6-7), header trim, `loadPreferences()` boot call. Requires
   full rev-24 paste; RENDERER-NOTES rev 9 pastes alongside (final duty
   before dissolution).
2. **RENDERER-NOTES dissolution** — at the Batch-G reissue: live
   conventions fold here/code-internal, closed history → ARCHIVE Section 5;
   no rev 10 of that file.
3. **Responsive-design survey** (see Live Directions): scope a batch
   proposal. Natural pairing: dialogs-core rev 2 fold-in.
4. **dialogs-core rev 2**: fold `modal` patch into header-noted reissue at
   next substantive touch; header repoints history refs to ARCHIVE.md.
5. **Bootstrap regeneration** — at each session close, from this file.

## SESSION-OPEN PROTOCOL

1. Lee confirms disk state matches table + build green.
2. Lee announces queue item; required file pastes follow (one large file
   per turn, per rule 4).
3. Re-read all pages of any to-be-revised file before composing. No code
   before gates clear.
