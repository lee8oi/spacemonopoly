# DIALOGS-NOTES.md — rev 11
# SPACE MONOPOLY PORT — DIALOGS SPINE (authoritative record)
# Sessions 14–27 · dialogs.ts / dialogs-core / dialogs-events / dialogs-game /
# dialogs-meta + companion renderer/scaffold records where coupled.
#
# ┌──────────────────────────────────────────────────────────────────────┐
# │ ERRATUM (rev 11 issuance): rev 10 of this spine (Session-27 rulings   │
# │ reissue: §15.1–15.7) was issued in-chat but its full text was lost to │
# │ conversation compaction before this reissue; only §-summaries         │
# │ survive. Rev 11 RECONSTRUCTS those rulings at their issued § numbers │
# │ (§15.1–15.6 substantively identical to rev 10 as issued; §15.7 queue │
# │ refreshed). Where a reconstruction could not be verified verbatim,   │
# │ it is marked "(rec)". This erratum is binding: future sessions must  │
# │ not treat rev-10 phrasing as recoverable.                            │
# └──────────────────────────────────────────────────────────────────────┘

## FOOTER / CURRENT STATE (Session 27 close)

| Artifact | Rev on disk | Status |
|---|---|---|
| dialogs-core.ts | 2 | split module, chat-patches folded |
| dialogs-events.ts | 1 | split module, verbatim carry |
| dialogs-game.ts | 6 | Batch F layout + tabs dropped (rev 5) + header slimmed (rev 6) |
| dialogs-meta.ts | 1 | split module, verbatim carry |
| dialogs.ts | 9 | barrel — wildcard re-exports of the four modules |
| renderer.ts | 24 | untouched by split (barrel preserved import path); Batch G pending → rev 25 |
| scaffold.ts | — | frozen (+2 amendments) |

Build: green, ~77 kb bundle, game functional (Lee-verified).
Boot expectations: §1 baseline renders identically pre/post-split.

**Rev-numbering regime (since the split):** per-module, cite module+rev.
Historical single-file revs (dialogs.ts rev 8 and earlier) retain their
single-file numbering in this record. Distinct namespaces are intentional
(§15.4-2): "dialogs-game.ts rev 6" never collides with spine revisions.

---

## PART I — CARRIED HISTORY (Sessions 14–26)
### (closed history; condensation of §1–11 pending per §15.5 — see erratum note in Part III)

Unchanged from rev 9, except where explicitly superseded in Part II/III.
Contents at a glance (§-numbers stable since rev 5): project frame and
protocol (§1–7), dialogs record of Batches A–E (§13/§14), trade-dialog
design basis (§12.1–12.7), errata registry (§14.5), queue (§14.6 —
superseded by §15.7 below).

### §12.4 TRADE DIALOG DESIGN BASIS (frozen design-basis; supersedes note)
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

### §12.2-5 EVIDENCE ADDENDUM (Session-27 re-read, screenshot #5)
Vision re-read of the original buy/sell dialog confirmed: tab strip is
genuine original chrome (not a vision artifact), resolving both §6 ship-
trivia items: (a) tab strip exists in the orig; (b) orig flipper glyphs
were `<<` / `>>` double-chevrons (modernized in the port per ruling).
Full pixel observations recorded in the Session-27 chat record; the two
facts above are the durable outcomes.

---

## PART II — SESSION 27 RULINGS (reconstructed §15.1–15.6, issued rev 10)
### (substantively identical as issued; "(rec)" marks unverifiable verbatim wording)

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

**§15.4 Four-module file split (executed).** dialogs.ts rev 8 → dialogs-
core / -events / -game / -meta + barrel (dialogs.ts rev 9, wildcard
re-exports, renderer import path unchanged). Per-module rev numbering;
structural deviation logged as DEVIATION:[dialogs-split]. Executed BEFORE
Batch F (order swap vs original schedule) per the payload-ceiling incident
below. Renderer.ts untouched by the split.

**§15.5 Spine pruning (adopted, pending execution).** Closed-history §1–11
may migrate to RENDERER-ARCHIVE at a future reissue, condensing the spine
for read-budget headroom.

**§15.6 Multi-paste read protocol (effective immediately).** When multiple
files are pasted in one turn, Lee tags priority; one file drains fully
across consecutive turns before the next is read. Prevents the two
Session-27 read-limit incidents from recurring.

---

## PART III — SESSION 27 EXECUTION RECORD (rev 11 substance)

### §16.1 Payload-ceiling incident & platform constant
A full-file dialogs.ts rev 9 (~13K tokens) failed to attach correctly
(registered under a rev-9 title with rev-8-equivalent content). Empirical
platform ceiling: **single artifacts must stay < ~10K tokens; hard danger
zone > ~12K**. Standing planning constant for all future full-file
issuances. This incident triggered the §15.4 order swap (split first).

### §16.2 Split execution record (DEVIATION:[dialogs-split])
Executed as: dialogs-core/-events/-game/-meta rev 1 (verbatim carries,
import blocks new) + dialogs.ts rev 9 barrel. Two chat-patches post-issuance:
(1) dialogs-core `modal` missing export (TS2459 × 3 fan-out) — patch issued
but initially failed to land on disk; caught by build, re-applied on second
attempt; (2) dialogs-game missing `msgBox` import (TS2304). Both patches
folded into subsequent reissues (core → rev 2 at Batch-G-adjacent reissue;
game → rev 4 composition). Acceptance test passed: build green, zero
visual change, §1 baseline identical.

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

### §15.8 DEVIATION:[tabs-dropped] (Lee ruling, Session 27, rev 5)
The company-name tab strip — confirmed genuine original chrome (§12.2-5
addendum), restored at rev 2 per the §15.1 "easy access" ruling — is
REMOVED. Basis, in Lee's words and order: containment could not be made
reliable; the deviation aligns with upcoming responsive-design work
("Perhaps this will help us create a responsive design that scales well
to mobile device screens"). Judgment recorded: the strip duplicated the
flippers' navigation with a usability cost on constrained viewports.
Navigation completeness preserved via in-band flippers (cycle skips
zombies, wraps). The fixed 480px form width introduced during containment
work was reverted simultaneously — a hard pixel width opposes responsive
design. Active-tab color echo (§15.1-3) is retired with the strip.

### §16.5 NEW DIRECTION OPENED: Responsive / mobile-friendly design
Recorded as design intent (Lee, Session 27), not yet a batch: the port
should scale well to mobile-device screens. Consequences already applied:
content-sized dialogs, pixel-fixed widths deprecated in dialogs-game. The
first responsive pass should survey ALL fixed pixel widths across
renderer.ts, dialogs-core CSS, and scaffold-derived layout constants
before scoping a batch. Candidate queue placement: alongside or after
Batch G (renderer rev 25).

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

---

## PART IV — QUEUE (supersedes §14.6 / §15.7)

1. **Session-close bootstrap regeneration** (obligation carried from
   §15.7-7): regenerate FRESH_BOOTSTRAP.md from THIS rev-11 spine at
   Session 27 close. The bootstrap's disk-state table must reflect:
   four dialogs modules + barrel, renderer 24, scaffold frozen, Batch F
   CLOSED at dialogs-game rev 5 (layout) / rev 6 (comments), Batch G next.
2. **Batch G** — renderer.ts rev 25 (triple scope): white-dot swatches,
   header trim, loadPreferences() boot call. Compose against re-read
   renderer.ts rev 24 (needs full rev-24 paste in the next session).
3. **Responsive-design pass** (§16.5): survey of fixed pixel widths
   across renderer.ts, dialogs-core CSS, and layout constants; scope to
   a batch proposal. Queue placement Lee's call.
4. **Spine pruning** (§15.5, adopted): migrate Part-I closed history to
   RENDERER-ARCHIVE at the next spine reissue; spine targets ≤ 2 read-pages.
5. **dialogs-core rev 2 reissue**: fold the `modal` export patch into a
   header-noted reissue at next substantive touch (pairs naturally with
   the responsive CSS survey, item 3).
6. **Renderer-notes interlock**: RENDERER-NOTES rev 9 reissue owed
   (Session-27 coupling: split acceptance + Batch G spec updates);
   schedule with Batch G.

---

*Footer: rev 11 issued at Session 27 close (Batch F closed, tabs-dropped
deviation recorded, payload-ceiling constant set, probe-first rule
binding). Next spine rev: 12 (post-Batch-G record + pruning execution,
per queue). Bootstrap must regenerate from this rev at session close.*
