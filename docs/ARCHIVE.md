# ARCHIVE.md — SPACE MONOPOLY PORT — DECISION-RATIONALE ARCHIVE
# Append-only record of closed history, rationale, and rulings.
# PROTOCOL: sections grow only by anchored append-patches (receipt = tail
# marker pasted back); interior text is never modified — corrections ship
# as appended, dated erratum lines. Rev-number identity does not apply
# here; the anchor is "last confirmed section marker".
# Hot-path live truth lives in STATE.md; this file is consulted only when
# a why-question arises.

--- SECTION 0 : MIGRATION MAP (Session 28) ---

Issued: Session 28. Records the dissolution of the five-spine notes
regime (sessions 27 close → 28) and where each former file's authority
and content now live.

## Former regime inventory & dispositions

| Former file | Role | Disposition |
|---|---|---|
| DIALOGS-NOTES rev 11 | Spine of record, Sessions 14–27 | DISSOLVED. Live items → STATE.md. Closed history → Sections 1–3 below. |
| RENDERER-NOTES rev 9 | Renderer spine, revs 24-era | LIVE through Batch G (Batch G spec dependencies); dissolves into Section 5 at the Batch-G reissue. No rev 10. |
| SCAFFOLD-NOTES rev 1 | Companion annotation archive for frozen scaffold.ts | FROZEN ON DISK, retained as self-contained archive (tag→§ references from scaffold.ts preserved). Open items extracted to STATE.md. Dated redirect banner to be appended (see errata). |
| RENDERER-ARCHIVE | Pre-split renderer history, revs 16–23 | FROZEN ON DISK, untouched. Consult for renderer revs 16–23 rationale. |
| FRESH_BOOTSTRAP | Per-session orientation | DERIVED POINTER, regenerated at each session close from STATE.md. Non-authoritative. |
| STATUS.md (pre-session-28, extinct) | Former top-level state | Already extinct before this migration. |

## Successor files

- **STATE.md** — sole live-state file: disk table, binding rules, live
  directions, queue, session-open protocol. Fully reissued on change;
  its rev number identifies disk contents.
- **ARCHIVE.md** (this file) — append-only rationale store. Sections:
  - §0 Migration map (this section)
  - §1 Sessions 14–26 condensate (from DIALOGS-NOTES Part I; see
    in-section caveat — Part I is the surviving record, not a summary
    of a recoverable fuller text)
  - §2 Trade-dialog design basis & evidence (§12.4, §12.2-5)
  - §3 Session 27: rulings (rec), deviations, execution record
  - §4 Reserved: scaffold cross-reference (points to SCAFFOLD-NOTES
    on disk; no content migrated)
  - §5 Reserved: RENDERER-NOTES dissolution (filled at Batch-G reissue)

## Errata register (this migration)

- **Erratum 1 (Session 28):** DIALOGS-NOTES rev 11's footer disk table
  listed dialogs-core.ts as "rev 2, chat-patches folded." Disk
  inspection at Session 28 (full paste review) shows rev 1 with the
  `modal` export patch landed but NOT folded. STATE.md carries the
  corrected line.
- **Erratum 2 (Session 28):** SCAFFOLD-NOTES rev 1's intro references
  "STATUS.md" — extinct file. Resolution (pending Lee confirmation of
  the erratum's identity): appended dated redirect banner, correcting
  the 100%-of-information claim to point to STATE.md + this archive.
- **Carried erratum (rev 11 issuance, binding):** rev 10 of the
  dialogs spine was lost to conversation compaction; §15.1–15.6 in
  Section 3 are reconstructions and carry "(rec)" markers verbatim.
  Rev-10 phrasing is not recoverable. This archive preserves that
  marking discipline permanently.

## Transport-regime ruling (Session 28, Lee-sanctioned)

Match transport to mutation pattern: code files load whole, patch
incrementally, consolidate at natural reissues; STATE.md reissues whole
(small by design); this archive assembles in chunks (once) and grows
only by anchored appends with marker receipts. Nothing combines "large"
with "must be resent."

--- END OF SECTION 0 ---

--- SECTION 1 : SESSIONS 14–26 CONDENSATE (from DIALOGS-NOTES rev 11, Part I) ---

CAVEAT (migration): Part I of rev 11 was itself a condensation whose full
§1–11 text said "unchanged from rev 9" — but rev 11 replaced rev 9 on
disk, so the fuller Sessions 14–26 narrative survives nowhere except this
condensate. This section IS the surviving record, not a summary of a
recoverable fuller text. Rev-10-era anti-reconstruction discipline applies:
do not treat §1–11 detail as recoverable.

Part-I contents at a glance (§-numbers stable since spine rev 5):
- §1–7: project frame and protocol (§1 baseline: square cells
  16×12 / 22×18 / 28×24 grids, tokens/entities, sels borders, three
  dropdown menus, mode radios, two-group prefs).
- §13/§14: dialogs record of Batches A–E.
- §12.1–12.7: trade-dialog design basis (frozen spec — carried in
  full to Section 2 below).
- §14.5: errata registry (superseded by DIALOGS-NOTES Part III, now
  Section 3 below; and by this archive's errata register, Section 0).
- §14.6: queue (superseded at rev 11 by Part IV; superseded again by
  STATE.md queue at Session 28).

Batches A–E one-line recap (closed; detail beyond this lost with the
Part-I condensation): Batch A–C issued and Lee-verified at dialogs.ts
revs 4–6 (Session 24); Batch D executed and Lee-verified at rev 7 with
renderer rev 24 coupling, followed by cleanup batches N1/N2/N3 and the
grid-choice ownership ruling (Session 25); Batch E = preferences group
sections, prefs-wiring decision R8 → WIRED (option b,
DEVIATION:[prefs-wired]), white-dot affordability replacing white-border
(R13, §12.6–7) (Sessions 24–26). Render-side and session-by-session
records for this era: RENDERER-NOTES rev 9 (through Batch G),
RENDERER-ARCHIVE (renderer revs 16–23), SCAFFOLD-NOTES §9 (scaffold-
relevant events).

--- END OF SECTION 1 ---

--- SECTION 2 : TRADE-DIALOG DESIGN BASIS & EVIDENCE ---

Carried verbatim from DIALOGS-NOTES rev 11 (originally §12.4 and the
§12.2-5 addendum), preserved with its (rec)-era caveats. Issued text is
revised never regenerated; this is the issued rev-11 wording.

## §12.4 TRADE DIALOG DESIGN BASIS (frozen design-basis; supersedes note)
Frozen spec for the trade dialog rework (Batch F). The rev-2 execution is
faithful to this spec EXCEPT as expressly overridden by the Session-27
rulings in §15.1 and the deviation in §15.8 — most notably the tab strip,
specified and executed, then REMOVED. Remaining live requirements:
company-colored header band, centered name, in-band ‹ Previous / Next ›
flippers; detail captions verbatim ("Company Size: {n} squares" /
"Cost of Shares: {price}" / "Major Shareholder: {name} with {n} shares."
with "Nobody." fallback); sell group "You own {n} shares in this company"
over [Sell All] [Sell >>>] [qty] Shares; buy group "You can buy up to {n}
shares in this company" over [Max Buy] [Buy >>>] [qty] Shares; two
SEPARATE qty fields; "Finished" button plain-text; ">>>" glyphs literal;
trading-lock hint + sels gating uniform.
[Migration note, Session 28: caption strings now live in the code per
the §15.3 comment-relocation carve-out; this section remains the
design-basis citation for them.]

## §12.2-5 EVIDENCE ADDENDUM (Session-27 re-read, screenshot #5)
Vision re-read of the original buy/sell dialog confirmed: tab strip is
genuine original chrome (not a vision artifact), resolving both §6 ship-
trivia items: (a) tab strip exists in the orig; (b) orig flipper glyphs
were `<<` / `>>` double-chevrons (modernized in the port per ruling).
Full pixel observations recorded in the Session-27 chat record; the two
facts above are the durable outcomes.
[Migration note, Session 28: the tab strip was subsequently REMOVED from
the port (§15.8, Section 3 below); the genuineness finding stands as
historical fact and was NOT the basis for removal — containment
reliability and the responsive-design direction were.]

--- END OF SECTION 2 ---

--- SECTION 3 : SESSION 27 — RULINGS, DEVIATIONS, EXECUTION RECORD ---

Carried from DIALOGS-NOTES rev 11 (Parts II–III, §15.8, §16.6), preserved
verbatim including "(rec)" markers. Binding live consequences of these
rulings are restated operatively in STATE.md; THIS section is the citation
of record for their rationale.

## Part II — Session 27 Rulings (reconstructed §15.1–15.6, issued rev 10)
(substantively identical as issued; "(rec)" marks unverifiable verbatim wording)

**§15.1 Batch F design frozen.** Tab strip IN (ruling basis: "easy access
directly to the respective company" — Lee, Session 27); flippers modernized
to single guillemets; active-tab company-color echo w/ white text;
"Finished" plain text (green-check glyph dropped); one-pass re-derive on
company switch; trading-lock uniform. *(Superseded in part by §15.8 —
tab strip subsequently REMOVED.)*

**§15.2 Length-budget mitigations (binding).** (a) reuse existing CSS
classes + inline style assignments, no dialogs-core CSS additions; (b) one
consolidated FIDELITY block per region, not distributed commentary; (c)
graft onto the existing tradeDialog skeleton, duplicate parseAmount per
qty field; (d) header gains one rev paragraph per reissue.

**§15.3 Comment-relocation policy (standing, Lee direction).** Spines own
per-batch/per-rev narrative; code carries live contracts only. Applied
piggyback at substantive reissues. Carve-out: live invariants (fidelity
tags, gating semantics, type warnings such as the maxbuy-1n note) stay
code-internal. Batch F precedent: trade-dialog commentary relocated at
rev 2; modules' rev-1 comment bodies retained verbatim from dialogs.ts
rev 8 pending their own substantive touches.
[Migration note, Session 28: "spines own narrative" now reads "notes
own narrative" — STATE.md holds live state, this archive holds the
narrative; the policy's substance is unchanged and restated as
STATE.md rule 7.]

**§15.4 Four-module file split (executed).** dialogs.ts rev 8 → dialogs-
core / -events / -game / -meta + barrel (dialogs.ts rev 9, wildcard
re-exports, renderer import path unchanged). Per-module rev numbering;
structural deviation logged as DEVIATION:[dialogs-split]. Executed BEFORE
Batch F (order swap vs original schedule) per the payload-ceiling incident
(§16.1 below). Renderer.ts untouched by the split.

**§15.5 Spine pruning (adopted, pending execution).** Closed-history §1–11
may migrate to RENDERER-ARCHIVE at a future reissue, condensing the spine
for read-budget headroom.
[Migration note, Session 28: EXECUTED at Session 28 — superseded by this
archive's Sections 0–3; no further §15.5 obligation exists.]

**§15.6 Multi-paste read protocol (effective immediately).** When multiple
files are pasted in one turn, Lee tags priority; one file drains fully
across consecutive turns before the next is read. Prevents the two
Session-27 read-limit incidents from recurring.
[Migration note, Session 28: restated operatively as STATE.md rule 4.]

## Part III — Session 27 Execution Record (rev 11 substance)

### §16.1 Payload-ceiling incident & platform constant
A full-file dialogs.ts rev 9 (~13K tokens) failed to attach correctly
(registered under a rev-9 title with rev-8-equivalent content). Empirical
platform ceiling: **single artifacts must stay < ~10K tokens; hard danger
zone > ~12K**. Standing planning constant for all future full-file
issuances. This incident triggered the §15.4 order swap (split first).
[Migration note, Session 28: operationalized by the Section-0 transport-
regime ruling; restated as STATE.md rule 6.]

### §16.2 Split execution record (DEVIATION:[dialogs-split])
Executed as: dialogs-core/-events/-game/-meta rev 1 (verbatim carries,
import blocks new) + dialogs.ts rev 9 barrel. Two chat-patches post-issuance:
(1) dialogs-core `modal` missing export (TS2459 × 3 fan-out) — patch issued
but initially failed to land on disk; caught by build, re-applied on second
attempt; (2) dialogs-game missing `msgBox` import (TS2304). Both patches
folded into subsequent reissues (core → rev 2 at Batch-G-adjacent reissue;
game → rev 4 composition). Acceptance test passed: build green, zero
visual change, §1 baseline identical.
[Migration note, Session 28: see Erratum 1, Section 0 — the core patch
was NOT folded before spine dissolution; still open, tracked in STATE.md
queue item 4.]

### §16.3 Batch F execution record
**dialogs-game.ts rev 2** (composed against re-read rev 1): full trade
re-layout per §12.4 + §15.1 — band, in-band flippers, tab strip, verbatim
captions, two-group sell/buy with separate qty fields + per-field parsers,
Finished, uniform sels gating, consolidated FIDELITY:[cominfoform] block.
Pasted, built green, and Lee-verified live (single-company no-op behaviors
— one tab / flippers no-op — correctly diagnosed as test-game state, not
defects, per the tabs-list-existing-companies filter).

**Post-rev-2 fixes (chat patches, folded at rev 4):**
1. `view.maxbuy === 1` → `=== 1n` (BigInt/number comparison lint, TS2367
   class; composition had pattern-matched the buy caption off the sell
   caption's structure). Class of miss: type-checking the dependent field
   against its declared type, not against its sibling's shape.
2. Tab-strip containment thread — see §16.4 in full.

**dialogs-game.ts rev 5 (final Batch F layout).** Tab strip REMOVED per
Lee ruling — see §15.8. Fixed 480px box width reverted with it; content
sizing under CSS max-width 520px restored.

**dialogs-game.ts rev 6 (comment-only reissue, Lee-directed).** Header
history relocated to this spine; code retains live contracts per §15.3
carve-out. Sets precedent: directed comment-only trims are permitted
outside the piggyback rule when explicitly instructed. No executable
lines changed; verification = build + §1 baseline eyeball.

### §16.4 Tab-strip containment thread (full debug ledger)
Symptom: at five existing companies the strip overran the dialog's right
border; successive fixes (maxWidth 100% + nowrap; fixed 480px box; full
inline containment stack; tab-chrome compression + auto-center-active)
each reported "still scrolling out of view". Instrumentation (computed-
style probes, Lee-run) proved the strip WAS a functioning scroll
container in the end (clientWidth 480 < scrollWidth 614; modal scrollWidth
== clientWidth → no modal-level horizontal overflow; strip right edge 19px
inside the border) — the residual complaint was a clipped 5th tab behind
an invisible overlay scrollbar. Root cause of the ORIGINAL escape was
never conclusively isolated: patch staleness across builds confounded
every isolation attempt (screenshots described DOM from stale builds on
at least two occasions; the exact mechanism the first maxWidth-100%
attempt lost remains unknown). Two mechanistic theories (content-sized
modal sizing cycle; vertical-scrollbar width theft) were proposed and
both disproven by probe data.

**Binding lessons (Session 27, recorded with teeth):**
- **Probe-first rule:** computed-style/DOM probe on FIRST report of any
  layout defect, before the first patch is composed. Two probe
  transcripts in the chat record turned a five-patch failure thread into
  a same-session resolution path.
- **Usability over geometry:** an affordance that reads as broken to the
  user is broken, regardless of what computed styles prove about
  containment. Geometric correctness is not an acceptance criterion;
  usability is.
- **Verify patches landed, not just diagnosed:** the modal-export patch
  and (probably) at least one strip patch failed to reach disk on first
  application; screenshots of stale builds then fed the diagnosis loop.
  Every chat patch now requires a build-and-report confirmation before
  the next patch composes.
[Migration note, Session 28: the three lessons are restated operatively
as STATE.md rules 1–3; this ledger is their citation of record.]

### §15.8 DEVIATION:[tabs-dropped] (Lee ruling, Session 27, rev 5)
The company-name tab strip — confirmed genuine original chrome (§12.2-5
addendum, Section 2 above), restored at rev 2 per the §15.1 "easy access"
ruling — is REMOVED. Basis, in Lee's words and order: containment could
not be made reliable; the deviation aligns with upcoming responsive-design
work ("Perhaps this will help us create a responsive design that scales well
to mobile device screens"). Judgment recorded: the strip duplicated the
flippers' navigation with a usability cost on constrained viewports.
Navigation completeness preserved via in-band flippers (cycle skips
zombies, wraps). The fixed 480px form width introduced during containment
work was reverted simultaneously — a hard pixel width opposes responsive
design. Active-tab color echo (§15.1-3) is retired with the strip.

### §16.5 Responsive / mobile-friendly design (direction opened)
Recorded as design intent (Lee, Session 27), not yet a batch: the port
should scale well to mobile-device screens. Consequences already applied:
content-sized dialogs, pixel-fixed widths deprecated in dialogs-game. The
first responsive pass should survey ALL fixed pixel widths across
renderer.ts, dialogs-core CSS, and scaffold-derived layout constants
before scoping a batch. Candidate queue placement: alongside or after
Batch G (renderer rev 25).
[Migration note, Session 28: carried live as a STATE.md direction with
the dialogs-core CSS slice already inventoried (Session 28 paste).]

### §16.6 Batch F verification (close criteria)
§15.1-7 list ran against rev 5 state (tabs checks voided by §15.8):
buy/sell/max/sell-all via each group's own field incl. invalid-input and
over-quantity branches; flipper cycling skips zombies + wraps + recolors
band + re-derives panel in one pass; qty fields independent + clear on
switch; sels lockout disables the four trading buttons w/ hint, flippers
stay live; Finished closes. PASSES reported by Lee on the rev-5 build
("That works for now"). Batch F CLOSED at dialogs-game.ts rev 5;
rev 6 is comment-only polish. Residual known-issue status: none open
against the trade dialog.

--- END OF SECTION 3 ---
