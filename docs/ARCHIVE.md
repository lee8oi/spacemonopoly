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

## Erratum / Disposition entry (Session 29): legacy-docs retirement

Audited and dispositioned at Session 29 (four pre-migration documents).
Approved by Lee; execution recorded in STATE.md rev 5. Deletion of each
file follows this entry's landing on disk + receipt.

| Former file | Verdict | Disposition of content |
|---|---|---|
| Session 20 Interface Todo.md | CONSUMED, residuals harvested | Interface inventory, Batches 1–3 planning, Appendix P — all executed (renderer revs 14–23) and recorded in RENDERER-ARCHIVE / ARCHIVE §5. Four unharvested residuals folded to STATE.md rev 5 open items: buildings entity, player-token color source, Betelguese spelling, initial menu-enablement vs orig. |
| GLOSSARY.md | DEAD, deleted | All tables "_pending_" — never finalized; naming conventions live in code. Nothing harvested; nothing lost. |
| SOURCE_MAP.md | FALSE, deleted | Every row "not started" for a functionally complete port — abandoned before first update, actively misleading. True translation record: scaffold.ts + SCAFFOLD-NOTES.md. |
| PORT_PLAN.md | SUPERSEDED, deleted — PROVENANCE PRESERVED HERE | Constitution, protocol (STATUS/HANDOFF), and core/ui architecture all obsolete. Provenance block, preserved verbatim below, exists nowhere else: Space Monopoly © 1998–2001 David Vivash, GPL v2 (port is a derivative work; GPL v2 applies if distributed); original source recovered at github.com/SparkeyinVA/Space-Monopoly (sourceCode/spacemonopoly); original structure: VCL forms (.cpp/.h/.dfm triples). |

Renumbering note: references to these four files in frozen/archive text
dangle henceforth, per the STATUS.md precedent (Erratum 2 above).

Addendum (same session): UI_Tier_Map.md — surfaced after the
four-file disposition above; audited identically. Verdict: CONSUMED.
Session-5 exit deliverable (SMMain.cpp analysis: money-type question,
geometry table, forms/globals/touch-point registries, renderer plan,
file queue). Every open question it carried was resolved and
recorded elsewhere (money → BigInt in code; geometry → GRID_CONFIGS,
superseded by DEVIATION:[square-cells]; prefs dead-code → R8 WIRED,
DEVIATION:[prefs-wired], renderer rev 25; quirks → ARCHIVE §5 Phase-3
ledger). Deleted under the same approval; nothing harvested.

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

--- SECTION 5 : RENDERER-NOTES DISSOLUTION (Session 29) ---

Issued: Session 29, at the renderer.ts rev 25 (Batch G) issuance.
Records the dissolution of RENDERER-NOTES.md (terminal at rev 9; no
rev 10). Its content splits: live conventions restated operatively
in STATE.md (binding rules 1-8, live directions, queue); closed
history lives in the body appended BELOW, pasted verbatim from disk
by Lee (rev-20 '2D' lesson: never re-transcribe from chat memory).
Deep renderer history (revs 16-23): RENDERER-ARCHIVE.md (frozen).

Batch G execution record (closes the spine's queue items 1-2): rev 25
delivered triple scope - white-dot swatches (DEVIATION:
[white-dot-affordance], R13/§12.6-7, Lee-verified), header collapse
per §7 (pointers land here, not a dying file), and the
loadPreferences() boot call (DEVIATION:[prefs-wired], verified across
reload). Delivery lesson (chunked full-file, Session 29): rev 25 at
~14K tokens exceeded the rule-6 ceiling - two bare artifact failures,
recovered via the sanctioned numbered-chat-chunks fallback (4 chunks).
Post-dissolution citations: renderer rationale -> this section;
pre-split deep history -> RENDERER-ARCHIVE.md; live state -> STATE.md.
RENDERER-NOTES.md file deletable at Lee's discretion after receipt.

# RENDERER-NOTES.md — Annotation Archive (SPINE) for renderer.ts + dialogs.ts

Companion to `renderer.ts` (UI layer, **rev 24 on disk — Session-25 Batch D
coupling COMPLETE and VERIFIED; next reissue = rev 25, Batch G**) and
`dialogs.ts` (dialog layer, **rev 7 on disk** — all modal/dialog
presentation; split out of renderer.ts rev 12 in Session 17; rev history now
canonical in DIALOGS-NOTES.md §13). Scaffold (logic layer, Session-13-amended
+ Session-23 square-cells amendment — see §6 cross-ref) and its own archive:
SCAFFOLD-NOTES.md. Active session record for dialogs.ts work:
DIALOGS-NOTES.md.

**ARCHITECTURE (Session 21 reorg):** This file is now the LEAN SPINE —
revision index, assumption statuses, open items, conventions, source
ledger. The FULL narrative history lives in **RENDERER-ARCHIVE.md**
(write-once, append-only; reissued only on demand). Archive policy:

- A revision's entry here carries full detail ONLY while pending
  verification (or a defect correction cycle is open). Once verified →
  compressed to a short index block. Superseded → compressed + pointer.
- The archive is never rewritten — new full entries are appended there
  as revisions happen; nothing there ever inflates this file.
- Deep-history requests: attach RENDERER-ARCHIVE.md on demand, same as
  original source files. Per-revision pointers below identify where
  detail lives.

Code tags (FIX:/DEVIATION:/FIDELITY:) point here; renderer.ts-layer
rationale and the revision spine for BOTH code files live here.

**REV 9 (Session 25):** cleanup pass N2 — Batch D execution recorded
(renderer rev 24 row; dialogs revs 4–7 index rows added, pointing to
DIALOGS-NOTES §13); §7 added mapping the renderer.ts code-header history
into this spine (physical trim deferred to renderer rev 25); queue
refreshed (§3); Batch G retargeted rev 24→25; housekeeping now tracks the
N1/N2/N3 cleanup batches.

---

## 1. Revision Index

### renderer.ts

| Rev | Scope & tags | Verification |
|---|---|---|
| 1 | Initial complete UI layer over frozen scaffold (NOTES §6 blueprint, Sessions 10–11). | Lee playtests (early). |
| 2 | FIX:[click-mapping] (rect-proportional mouse mapping — CSS-scale safe). Trading gate resolved (UI-level, per orig InfoButs). FIDELITY setGridSize-randomise / itemindex / trade-flavor. ADD R12 hint bar. | Playtested. |
| 3 | FIX:[modal-inheritance] (modals appended to body, own colors). DEVIATION:[swatch-color] (R13: company color + white-border affordability). | Playtested. |
| 4 | End-game triple-bug: FIX:[seeresults-disabled] + FIX:[doconclude-guard] (doConclude(force)). | Lee playtests ✔. |
| 5 | FIDELITY:[splitform-modal]; ADD modal queue. Split mechanics confirmed (threshold = share PRICE). | Verified. |
| 6 | FIX:[splitdialog-close] (overlay dismiss then queue release — contract documented on queueModal). | Verified. |
| 7 | FIDELITY:[mergerform-modal]. Triple-merge = two merger dialogs + split (correct). | Verified. |
| 8 | FIDELITY:[comform-modal]; FIDELITY:[comform-info] (callback — later found unwired, fixed rev 9). Players.cpp fidelity pack. | Partial (see rev 9). |
| 9 | R2 RETIRED — scaffold FIX:[phase3-verified] owns board-on-new-game; FIX:[gosame-size-nowipe]; FIX:[info-nowired] (founding → trade chain). | Lee 5/5 ✔. |
| 10 | FIDELITY:[auto-finish] — R14 RETIRED (standings auto-show at final Continue). | Lee playthrough ✔. |
| (15) | *(Session 15 notes-only: PHASE 3 SOURCE VERIFICATION COMPLETE — all original sources read, dispositioned in §5; R15/R16 surfaced; DFMs/res outstanding as trivia.)* | — |
| 11 | FIDELITY:[splitform-players] + [mergerform-players] (R15 RETIRED); eager capture in actionHooks; FIX:[tournament-doubling-hint]. | Lee CLASSIC ✔; TOURNAMENT rows unexercised (low risk). |
| 12 | FIDELITY:[highscores-modal] + [highscores-tabs] (R16 RETIRED; tabbed scores, end-of-game second modal); DEVIATION:[doconclude-composes-tail] (**RE-SYNC WARNING**: if scaffold concludeGame is ever amended, re-sync doConclude's three-call tail manually). | Lee 9/9 primary checklist ✔. |
| 13 | Session-17 split: all dialog presentation → dialogs.ts (rev 1); zero behavior change. | Lee smoke-pass ✔. |
| 14 | Session-21 Batch 1 (B3+B4+B9): responsive board (transform-based, DPR-aware, ResizeObserver); DEVIATION:[dark-checker]; DEVIATION:[title-short]; column root layout; R12 hint strip below board. | SUPERSEDED by revs 15/16 (viewport overflow; alignment). |
| 15 | FIX:[viewport-fit] — height model MIN → FIT (root 100vh, min-height 0 chain, host-page normalization, internal side-panel scroll, ≤720px exempted). | SUPERSEDED-IN-PART by rev 16: full-size fixed ✔; reduced-window misalignment residual → rev 16. |
| 16 | FIX:[board-top-align] — board region align-items center → flex-start (width-bound fits no longer float the board; top flush with panel top at every size; leftover collects between board and hint bar). CSS-only. | **VERIFIED by Lee — "looks good enough for now."** Batch 1 CLOSED. |
| 17 | Session-21 Batch 2 (B6+B7+B8+B10, A5 restored): side-panel recomposition (original hierarchy, names-only plain list, single-click details); B8b top-box semantics; B8 teal turn box; B7 Finish Turn; B10 company rows thin-separator; "Companies" heading dropped pending Label5 evidence. | **VERIFIED by Lee (7/7 checklist).** Batch 2 CLOSED. |
| 18 | Session-22 first issue of Batch 3 (menubar B2+A4). **DEFECTIVE — never verified; superseded in-session by rev 19.** Three defects: (1) rev-14/15/16 responsive chrome stylesheet lost → ResizeObserver sizing feedback loop (runaway board expansion, side panel pushed out of viewport); (2) permanent full-viewport transparent overlay appended at construction → ALL clicks intercepted, menus inert; (3) mainUpdate menu gating via querySelectorAll DOM scraping instead of held references; dropdown positioning via offsetLeft/offsetTop against unpositioned ancestors. Design intent correct — B2 mapping, A4 captions. Never reached disk verification. | **DEFECT REPORTED by Lee at load. Superseded.** |
| 19 | Session-22 Batch 3 (B2+A4): menubar → three dropdown menus — **Project:** New Game · End Game · View High Scores · Quit; **Options:** Create New Grid · Grid Size ▸ · Preferences; **Help:** About Space Monopoly. A4 literal asterisk flyout captions (`16*12 (80 turns)` etc.), bullet marks current grid type; select element DELETED (R9 superseded-by-revision). Vanilla DOM menu system: position:fixed panels via getBoundingClientRect, right-cascade with edge flip, click-open + hover-switch + Esc/click-away, open-only underlay, DEVIATION:[menu-styling] dark-app-adapted Win2k chrome, DEVIATION:[menu-interaction]; MenuUpdate polarity unchanged, items held by reference. Rev-17 stylesheet restored verbatim (menu CSS purely appended). Two pre-transmission defects in the first rev-19 draft (panels visible at boot, undeclared gridFlyoutPanel field, missing Esc handler) were caught on self-review and corrected before any disk write. | **VERIFIED by Lee ("everything appears functional. Resized window looks good.").** Batch 3 CLOSED. |
| 20 | Session-23 board-entity art at `drawCellEntity()` + sels correction in `drawSels()`. Cross tokens (company color, dark outline), DEVIATION:[company-initial] (white letter + halo), faithful blue circle (`#4f83e8`/`#16204a`, brightened for dark board), yellow diamond, DEVIATION:[token-flat-shading], sels = solid blue + white border (normal) / green border (active). ERRATUM: the issued artifact carried one transcription typo (`'2D'` at getContext) — caught by the build gate, hand-fixed on disk; also taught that Lumo's "byte-identical" self-review certification is fallible — trust the gate + diffs. | Loaded and exercised by Lee; tuning feedback followed → superseded by revs 21–23. |
| 21 | Tuning pass 1: diamond highlight ellipse REMOVED (read as a spurious "O"/"0" glyph); cross geometry rebuilt span-derived (span 92%, center 50%, armW 33%); letter readability (stroked-outline halo, 40% font). | Lee feedback: arms stubby/center small → superseded by rev 22. |
| 22 | Tuning pass 2: vertical arms full-bleed to cell edges; center 50%→58%; horizontal arms keep 92% span. | **Lee HAND-TUNED on disk beyond the issued artifact** (center →0.70, cross lineWidth →2) and then applied Lumo's chat-issued symmetric-geometry patch — on-disk contents diverged from the issued rev → restamped rev 23. |
| 23 | **On-disk final form, Session-23 close (Lee hand-edited over issued rev 22; never re-issued as an artifact):** (1) cross SYMMETRIC — all four arms identical geometry (`halfSpan = 0.46m`, `armLen = halfSpan − halfCs`), enabled by the square-cells scaffold amendment (§6); (2) Lee-tuned constants: `centerSize = 0.70m`, cross `lineWidth = 2`; (3) company-initial letter block restored after a hand-patch casualty (dropped during the symmetric-geometry edit, re-added verbatim per chat instructions); (4) drawSels `lineWidth = 3` (Lee tune — borders of the blue sels squares). **VERIFIED by Lee — "Now the game looks great."** Board-entity-art mission CLOSED. | **VERIFIED by Lee. Session-23 mission CLOSED.** |
| 24 | Session-25 Batch D coupling with dialogs.ts rev 7 (grid-choice ownership ruling, DIALOGS-NOTES §12.6-4): newGameDialog DELEGATE drops its `setGridSize` entry (interface member deleted dialogs-side); merger actionHook call pruned to the rev-7 signature — `oldSurvivorValue` local deleted, `absorbedValue` local RETAINED (sole consumer of `moneyEarned` computation); app's own `setGridSize()` untouched (constructor + Grid Size flyout). Header additionally writes down the never-issued rev-23 interim state (previously recorded here only). Renderer-side behavior: none new — purely contract-tracking. | **VERIFIED by Lee (build green; new-game dialog shows no Grid row; same-size new game preserves circles; flyout re-geometries; merger announcement intact post-prune). Batch D CLOSED.** |

### dialogs.ts

*(Full record Session 18 onward: DIALOGS-NOTES.md. Revs 4–7 execution
detail: DIALOGS-NOTES.md §13.)*

| Rev | Scope & tags | Verification |
|---|---|---|
| 1 | Session-17 split payload (all modal/dialog code + modal queue + dialog CSS). See renderer rev 13. | Smoke-pass ✔. |
| 2 | Move Up/Move Down player reorder in new-game dialog; Session-18 transcription regression (row.netWorth → netWealth) diagnosed/fixed. Full record: DIALOGS-NOTES §§1–6. | Verified. |
| 3 | Cosmetic backlog: caption "Player Information"; MaxLength 15; Go! disabled at empty list (updateButs); remove-guard dropped; DEVIATION:[prefill-single]. Full record: DIALOGS-NOTES §10. | Lee live ✔. |
| 4 | Batch A (Session 24): founding/split/merger wording formalized to orig screenshot evidence; split price-bullet + merger combined-value line DROPPED; merger table survivor-first; DEVIATION:[color-banner] retained. | Lee live ✔ (provoked all three announcements). |
| 5 | Batch B (Session 24): standingsDialog "Game Over!" + orig summary block + Money Left/Worth of shares/Net Wealth + OK; detailsDialog "Player Details" reordering/rewording + Okay. | Lee live ✔ (both end paths + details). |
| 6 | Batch C (Session 24): high-scores tab captions RUNTIME-derived from GRID_CONFIGS; Position/Name/Net Wealth header row; Close → Okay. | **Lee-verified "accurate."** |
| 7 | Batch D (Session 25): grid dropdown REMOVED; `NewGameDialogCallbacks.setGridSize` deleted; mergerDialog vestigial params `oldSurvivorValue`/`absorbedValue` pruned (folded §6-watch-item closure). NOTE: §12.4's mode-radio conversion NOT in this rev (bootstrap scoped D narrower) — open fold-in ruling, DIALOGS-NOTES §13.3. | Lee live ✔ (with renderer rev 24). |

---

## 2. Renderer Assumptions (R1–R16, with current status)

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
- **R8 (SUPERSEDED-BY-DESIGN, Session 24)** Prefs persistence = WIRED
  (option b; DEVIATION:[prefs-wired]): Save writes AND loadPreferences()
  activates at boot (scaffold has the dormant reader); prefs apply to
  future game launches. Supersedes the faithful-dead settlement and the
  QUIRK-[prefs-half-wired] observation. (See DIALOGS-NOTES rev 8 §12.9
  for implementation considerations; Batch E design discussion required
  before code — scaffold-touch question.)
- **R9 (SUPERSEDED-BY-REVISION, rev 19)** Grid-size select element with
  ACTUAL geometry labels is DELETED; grid size is Options → Grid Size
  flyout with the orig literal asterisk captions (A4). Actual-geometry
  knowledge remains valid trivia (orig captions overstate both dims).
  **Session-25 extension (Batch D):** the new-game dialog's grid dropdown
  is ALSO deleted — grid choice now flows through the flyout exclusively.
- **R10 (RETIRED, Session 21)** Player list showed name + money
  (enhancement over orig names-only). List now NAMES-ONLY per A5
  FIDELITY (rev 17) — the enhancement itself is dead.
- **R11 (SETTLED)** Currency-unit input validated to 1–3 chars
  (RENDERER SPEC; orig bypasses setUnit — port MAY validate at input).
- **R12 (SETTLED, diagnostic)** Hint bar + missed-click feedback.
  Lee ruled KEEP (inventory A6). Relocated below board (rev 14); gains
  "Turn X of N" context in rev 17 (displaced from turn box per B8).
- **R13 (Lee-approved deviation; basis source-confirmed)** Swatches keep
  company color; affordability = **white dot (REPLACES the white border
  per Lee Session 24 §12.6-7)** — dot sized within the swatch so the
  company color remains clearly visible. (DEVIATION:[white-dot-affordance]).
  Implementation = Batch G, renderer.ts **rev 25**.
- **R14 (RETIRED, rev 10, verified)** Standings auto-show at natural
  game end, per orig BitBtn1Click Finish().
- **R15 (RETIRED, rev 11, verified — CLASSIC only)** Per-player tables
  restored in splitDialog and mergerDialog (orig SplitForm/Merger
  ListView content; CLASSIC all players, TOURNAMENT current only).
  Data captured eagerly in the action hooks for queued-modal safety.
  CLASSIC paths verified by Lee; TOURNAMENT rows still unexercised
  (risk low — range identical to hook mutation ranges; spot-check
  opportunistically).
- **R16 (RETIRED, rev 12, verified)** End-of-game second modal:
  standings → high-scores, tabbed presentation shared with the
  standalone High Scores menu dialog (3 tabs, current grid's tab
  activated on insert, new entries bold + tinted). doConclude composes
  the tail itself (DEVIATION:[doconclude-composes-tail], re-sync
  warning in §1 rev 12 index row). Primary checklist verified 9/9.

---

## 3. Queued Work / Open Items

**Phase 3 COMPLETE; Session-20 batches 1–3 CLOSED; Session-23
board-entity art CLOSED (rev 23 verified); Session-25 Batch D CLOSED
(renderer rev 24 + dialogs rev 7, Lee-verified).**

Remaining work:

1. **D4 dialogs batches — A/B/C/D CLOSED** (dialogs revs 4–7, all
   Lee-verified; execution record DIALOGS-NOTES §13). Remaining:
   **Batch E — preferences** (dialogs.ts rev 8): §12.9 design discussion
   FIRST (scaffold `loadPreferences()` activation — frozen-file amendment
   question needs a Lee ruling) + open mode-radio fold-in ruling
   (DIALOGS-NOTES §13.3). **Batch F — trade dialog re-layout**
   (dialogs.ts rev 9). **Batch G — company-list white dot**
   (renderer.ts **rev 25** — rev 24 consumed by Batch D coupling).
2. **~~Company-list heading QUESTION (rev 17)~~ — CLOSED** (Lee Session 24 §12.6-8: wide shot + memory confirm — no header exists above the company list in the orig right panel; rev-17 heading-drop is source-confirmed and PERMANENT.)
3. **TOURNAMENT spot-check** (opportunistic): 2-player Tournament game —
   single-row split/merger tables, no-conversion hint, turn box + hint
   bar "(Tournament)" tag, natural end at maxturns+1. Requires an
   actual second player row (solo TOURNAMENT auto-downgrades to
   CLASSIC per orig quirk). Note: spot-check also exercises the
   square-cell board under Tournament mode (trivial — same renderer).
4. **Square-cells secondary checks** (post-amendment): boards at all
   three grid sizes render + fit correctly (aspect now grid-dependent
   1.33/1.22/1.17 — SMALL wider, LARGE taller than before); click
   mapping after resize; sels boxes still read well on square tiles.
   Lee exercised visually at ≥1 grid size at Session 23 close.
5. **Unrun secondary checks** (low priority): fresh-storage David/1M
   defaults view; high-score persistence across reload; menu dialog
   no-tinting; >15-char name clamp; Session-18 reorder re-run;
   solo-Tournament downgrade confirmation.
6. **New-game board mechanism (DOCUMENTARY ONLY, non-blocking)**: no
   examined original file explains why circles survive new game
   (Grid::clear() is uninitialized-loop UB). Port implements Lee's
   observed spec; nothing further unless new sources surface.
7. **Verify-before-ship trivia**: currency symbol raw byte (assume £);
   SMMain.dfm captions (would also settle R1's timer interval) AND
   initial menu-enablement defaults (DIALOGS-NOTES §11.7 — rev 19 ships
   a default-derived boot state; orig truth still uninspected).
8. ~~Tile-art extraction seam~~ **CLOSED-SCOPE (Session 23):** the
   crafting landed as CODE-DRAWN VECTOR ART at drawCellEntity() (revs
   20–23), not extracted .res bitmaps — screenshots supplied sufficient
   reference and dark-theme adaptation argued for authored vectors.
   The seam remains the single swap point if SpacePoly2.res extraction
   is ever wanted later.
9. **Light theme (D1)**: entity-art hexes were tuned for the DARK board
   only (Lee ruling Session 23); a light-theme pass (checker + token
   palette revisit) is a future Lee-scheduled batch. (Interacts with
   the parked multi-theme discussion, Lee-raised end of Session 24.)
10. **Minor dialog CSS pass** (Lee-requested, Session 24 — twice): a
    wanted FUTURE pass on announcement/dialogs styling; parked
    separately from D4 batches.
11. **Housekeeping / cleanup batches (Session 25)**:
    - **N1 (dialogs spine) — DONE**: DIALOGS-NOTES rev 8 issued
      (Session 25) — Batch A–D record + absorbed dialogs.ts code-header
      history (§13.2); dialogs.ts header trim deferred to rev 8 (Batch E).
    - **N2 (renderer spine) — DONE**: THIS reissue (rev 9) — Batch D
      recorded; renderer.ts code-header content mapped into §7 below;
      header trim deferred to renderer rev 25 (Batch G).
    - **N3 (archives) — PENDING**: attach RENDERER-ARCHIVE.md and append
      the full narratives for **revs 18/19 (defect-cycle)** AND **revs
      20–23 (entity-art chain incl. the '2D' typo erratum and Lee's
      hand-tune history)**. PROCESS LESSONS (Session 22): (a)
      preservation-verification rule; (b) pre-transmission self-review —
      Session 23 addendum: the self-review certified a byte-identical
      line that was NOT byte-identical (rev-20 '2D' typo). Lesson:
      certifications must come from re-reading the ISSUED artifact
      text, not from composing-side memory; the build gate + Lee's
      on-disk diff remain the authoritative checks.
    - SCAFFOLD-NOTES.md amendment-log line for DEVIATION:[square-cells]
      still pending (Lee to add at next scaffold-notes touch — §6
      renderer-side record already in place).

---

## 4. Conventions (mirror of scaffold's)

- Changes to renderer.ts and dialogs.ts via FULL FILE REISSUE, same
  artifact id each time ("renderer-ts" and "dialogs-ts"), no surgical
  patches (Lee's preference). Each code artifact call carries one
  complete file.
- This file reissued alongside ("renderer-notes") when rationale grows;
  full-length narrative entries go to RENDERER-ARCHIVE.md, not here.
- FIX/DEVIATION/FIDELITY tags in code point here for detail; from
  Session 19 onward, dialogs.ts-layer tags point to DIALOGS-NOTES.md.
- Logic layer amendments only via logged entries (Session-13 FIX:
  [phase3-verified] precedent; Session-23 DEVIATION:[square-cells]
  follows the same logged-hand-amendment pattern — see §6).
- DELIVERY PROTOCOL (critical): artifact reissue calls carry near-zero
  accompanying preamble — analysis goes in a separate message, never
  competing with the file content. One artifact call per message.
  Failed reissues retried bare once; two consecutive bare failures →
  numbered chat chunks for Lee to concatenate on disk.
- Change order within a task: notes reissue FIRST (design record is
  durable even if a code call dies), then code, bare.
- Duplicate file uploads: a file arriving twice in one message
  (identical copies) is ONE read — client duplication.
- Rev numbering: each reissued code file carries a distinct revision
  marker uniquely identifying its contents; renderer.ts and dialogs.ts
  number independently (renderer rev 24 on disk, dialogs rev 7).
  Defect corrections take a NEW rev number — EXCEPT defects caught
  before any disk write, which fold into the pending reissue under the
  same number (first rev-19 draft precedent). **Session-23 extension
  (rev 23 precedent): when Lee hand-edits an issued rev on disk, the
  on-disk file takes a NEW rev number rather than mutating the issued
  rev's meaning — rev numbers keep uniquely identifying on-disk
  contents even across hand-tune sessions.**
- Build gate (Session 19a): `./build.sh` = `tsc && npx esbuild …` —
  type errors block the bundle. On-disk verification after reissues
  REMAINS REQUIRED (behavior-preserving/type-correct drift sails
  through tsc — the rev-18 stylesheet loss AND the rev-20 '2D' typo
  class prove this).
- **Notes-spine policy (Session 21):** spine stays lean (index +
  statuses + queue + conventions); full detail only for
  pending/unstable revisions; verified → compressed; superseded →
  compressed + pointer; archive append-only, reissued on demand.
- **Responsive-design review rule (Session 21, rev-16 lesson):** any
  layout change must be reasoned through BOTH fit regimes
  (width-bound and height-bound) at design time, not just the default
  full-size case.
- **Preservation-verification rule (Session 22, rev-18 lesson):** when
  a reissue claims to carry prior-revision content forward, the
  carried sections must be checked against the source revision at
  composition time, not trusted.
- **Pre-transmission self-review (Session 22, rev-19 lesson; Session-23
  addendum):** re-read generated artifacts for internal consistency
  before issuing — AND perform certifications by re-reading the issued
  text itself, not from memory (rev-20 '2D' typo passed a
  composition-memory certification).
- **Inventory-amendment recording (Session 21, Batch 2):** when Lee
  overrides an approved SESSION20-INVENTORY disposition at design
  time, the change is recorded as a named DEVIATION/FIDELITY flip
  with consequence notes HERE — the inventory file itself stays
  closed (game-window scope) with corrections riding in the rev
  entry. Design-time amendments BEFORE code issuance leave no
  cancelled-deviation residue in shipped artifacts.
- **Cross-file coupling rule (Session 25, Batch D precedent):** when an
  interface shrink spans two code files, the dependent call-site edit
  rides the same change window as the contract change, sequenced
  contract-first (dialogs rev 7 issued before renderer rev 24, so the
  renderer composition target was final text, not a hypothetical).
  The transient red between the two issues is accepted by design —
  no build occurs mid-window.

---

## 5. Phase 3 source-verification ledger

**STATUS: PHASE 3 COMPLETE (Session 15).** All original source files
read and dispositioned; results summarized here; full Session-15
narrative in RENDERER-ARCHIVE.md.

| Source | Result |
|---|---|
| HighScores.h | structural match; 3-tab layout confirmed (basis for rev 12's tabbed presentation) |
| Preferences.h | checkbox names map 1:1; draft-commit flow confirmed |
| Players.cpp | R2 evidence; otherwise faithful; reorder DONE Session 18; cosmetic trio DONE Session 19b |
| ComEditForm.cpp | empty shell, dead in orig — correctly not ported |
| ComForm.cpp | founding modal + Info(i) chain implemented (rev 8/9) |
| GameGrid.h/.cpp | randomise faithful, no circle minimum (statistics); clear() NOT in this class |
| Grid.h/.cpp | clear() UB confirmed (uninitialized ix); resize/init uninit'd; default ctor 16×16 noted |
| Game.h/.cpp | (Session 1-2) ported as boot defaults; NO board-clearing logic |
| Merger.cpp | CLEAN — payout basis, payer range, CLASSIC-only conversion, tournament-empty-range confirmed; surfaced R15 — RESTORED rev 11 |
| SplitForm.cpp | CLEAN — halve-then-double order, doubling range, caller-owned threshold confirmed; co-surfaced R15 — RESTORED rev 11 |
| OverForm.cpp | CLEAN — scans/winner/field-order/compute-only confirmed; FIX:[cumulative-worth] confirmed AT SOURCE (orig bug real); re-read Session 19c |
| HighScores.cpp | logic CLEAN — insertion/save/defaults/Total() confirmed; DEVIATION:[scores-format] fully corroborated (cipher key/trivia in ARCHIVE); surfaced R16 — RESTORED rev 12 |
| SMMain.cpp | CLEAN — no new behavioral mismatches; FIX:[turn-eq], FIX:[rejection-loop], QUIRK [double-east], QUIRK [prefs-half-wired], R13 basis, N/E/W/S order, turn-flow architecture, action/checkPlacementRules/setGridSize/MenuUpdate/DrawSels/quit-texts/go-sequence/playerDetails all matched at source. Trivia: boot double-randomise (harmless); ListBox1 ItemIndex=−1 UB (port immune). MenuUpdate polarity re-confirmed Session 19c (DIALOGS-NOTES §11.4) |

Pending: **NONE.** Phase 3 closed. Outstanding information sources are
optional ship trivia only (SMMain.dfm, SpacePoly2.res — see §3).

---

## 6. Cross-file records (renderer-spine pointers)

- **SCAFFOLD, Session-23 hand amendment — DEVIATION:[square-cells]:**
  GRID_CONFIGS tileH := tileW (SMALL 40→37, LARGE 20→21, MEDIUM
  already 27×27 — unchanged). Origin: orig tiles are rectangular with
  a constant ~1.22:1 board aspect (Lee-confirmed via screenshots;
  592×480 / 594×486 / 588×480 across the three sizes); Lee ruled for
  square cells on appearance grounds. Consequences: board aspect is
  now grid-dependent (≈1.33/1.22/1.17 — SMALL wider, LARGE taller);
  fitBoard()/mouse-mapping/entity art all derive from tile dims and
  absorbed it with ZERO renderer changes. REQUIRES: an amendment-log
  line in SCAFFOLD-NOTES.md (Lee to add at next scaffold-notes touch —
  this entry is the renderer-side record only). Also corrects the
  historical record: the rev-14–16 "aspect-preserved (4:3)" code
  comments were WRONG — the port board was ~1.22:1 by scaffold design
  (and the original likewise), never 4:3.
- **DIALOGS, Session-25 rev chain transfer:** dialogs.ts rev history
  (revs 1–7) is now canonical in DIALOGS-NOTES.md §13 (spine rev 8,
  cleanup pass N1). The dialogs index above is a COMPRESSED POINTER —
  do not expand it here.

---

## 7. Cleanup pass N2 (Session 25) — renderer.ts code-header absorption map

Lee direction (Session 25): historical commentary migrates OUT of the
code headers INTO the spines/archives; spines become the authoritative
history. For `renderer.ts`, the header mass maps onto EXISTING spine
sections as follows — nothing needed rewriting, only pointing:

| Code-header content (rev 24 on disk) | Spine home |
|---|---|
| R2/R9/R10/R14/R15/R16 "RETIRED" annotation blocks; R9 "superseded" line | §2 (assumption statuses) — already verbatim-equivalent |
| REV 13 SPLIT / REV 14 / REV 15 / REV 16 / REV 17 / REV 18 / REV 19 / REV 20 / REV 21 / REV 22 / REV 23 / REV 24 changelog comments | §1 index rows (equal or greater detail) |
| Palette constants commentary (dark-checker, entity hexes, sels colors, turnbox, menu chrome) | §1 revs 14/17/19/20–23 rows; D1 parked item §3-9 |
| DEVIATION:[doconclude-composes-tail] block + re-sync warning | §1 rev 12 row (RE-SYNC WARNING preserved); §3-1 (scaffold-touch consequence) |
| Batch D coupling notes (rev 24 additions) | §1 rev 24 row |

**Content that remains CODE-INTERNAL by design** (works-as-comments;
trim should keep these, they document live invariants, not history):

- REV-6 queue contract on `queueModal` (overlays on dialogs.ts, but the
  overlay-dismiss-then-release order binds callers — rev 6 row).
- Rev-14 base-units warnings at `redrawGrid`/`fitBoard` (clearRect bounds
  and transform math — live correctness constraints).
- `drawCellEntity` seam block (contract: base tile units under canvas
  transform; geometry fraction meanings).
- R15 eager-capture "do not move capture" note in actionHooks.
- Inline FIDELITY/DEVIATION/QUIRK tags at their sites (they point here).

**Physical trim:** DEFERRED to renderer.ts rev 25 (Batch G) — no rev
burned on comment moves. From rev 25, the renderer.ts header collapses
to: terse role statement, current-rev change note, and "History:
RENDERER-NOTES.md §1/§7; archives in RENDERER-ARCHIVE.md."

---

*Last updated: Session 23 close — board-entity art COMPLETE: revs 20
(shipped, typo erratum) → 21 → 22 → 23 (on-disk final, Lee-tuned,
VERIFIED — "Now the game looks great."). Square-cells scaffold amendment
DEVIATION:[square-cells] logged (§6). Session-23 mission CLOSED.*

*Session 24 update (RENDERER-NOTES rev 8): R8 prefs persistence flipped
to WIRED (DEVIATION:[prefs-wired]); R13 white-dot affordability REPLACES
white-border (Lee §12.6-7); Company-list heading QUESTION CLOSED (§3 item
2); D4 scoping complete, awaiting batch approval (§3 item 1).*

*Session 25 update (RENDERER-NOTES rev 9, cleanup N2): D4 Batches A–D
EXECUTED and Lee-verified (dialogs revs 4–7; renderer rev 24 coupling);
rev index + dialogs index current; §7 records the code-header absorption
map (trim deferred: dialogs → rev 8, renderer → rev 25); Batch G
retargeted to renderer rev 25; queue: Batch E design discussion (incl.
mode-radio fold-in ruling + §12.9 scaffold-touch question) is the next
decision point; N3 archive appends PENDING (attach RENDERER-ARCHIVE.md).*

--- END OF SECTION 5 ---