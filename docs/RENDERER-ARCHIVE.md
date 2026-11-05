# RENDERER-ARCHIVE.md — Session 25 Append (revs 18–23; cleanup batch N3)

**Instruction:** Paste everything from the `---` separator below to the end
of this artifact at the END of your on-disk `RENDERER-ARCHIVE.md` (after the
existing rev-17 entry), replacing the old APPEND LOG block with the new one
at the very bottom. Per the archive's append-only policy, NO existing text
above the log changes — this is a pure append. (In-conversation artifact
`renderer-archive-append-n3`; disk destination: end of RENDERER-ARCHIVE.md.)

---

## rev 18 (Session 22 Batch 3, first issue — menubar B2+A4) **DEFECTIVE**

**Status:** never verified; superseded in-session by rev 19. Issued for the
record only — the defect narrative is the durable value.

**Intent (design layer — CORRECT, later realized at rev 19):** menubar →
three dropdown menus (Project / Options / Help) per B2; grid size demoted
from the sm-menubar `<select>` to an Options → Grid Size cascade flyout with
A4's literal asterisk captions (`16*12 (80 turns)` etc.); R9 superseded.
The design mapping was never at fault — every defect below is
implementation-layer.

**Defects (three, reported by Lee at load — all caught before design
conclusions were drawn from them):**

1. **Responsive chrome stylesheet LOST.** The reissue carried the new menu
   rules but dropped the rev-14/15/16 stylesheet. The ResizeObserver + CSS
   fit model lost its height constraints: ResizeObserver entered a sizing
   feedback loop (runaway board expansion) and the side panel was pushed
   out of the viewport. Root class: a reissue that claims to carry prior
   content forward was composed WITHOUT re-checking the carried sections
   against source. Codified as the **preservation-verification rule**
   (spine §4, Session-22 lesson).
2. **Permanent full-viewport transparent overlay appended at construction.**
   Intended as a click-away/underlay for open menus only; implemented as
   always-resident → every click on the page hit the overlay; menus and
   board input inert. The intended rev-19 shape (created on open, REMOVED
   on close) is the correction template.
3. **Menu gating via querySelectorAll DOM scraping + offsetLeft/offsetTop
   positioning.** mainUpdate re-queried the DOM for menu rows instead of
   holding references (fragile against rebuilds and invisible panels);
   dropdown panels were positioned with offsetLeft/offsetTop accumulated
   against unpositioned ancestors — wrong coordinates under the flex
   column-root layout and at wrapped menubar sizes.

**Process lessons banked:** (a) preservation-verification rule; (b)
pre-transmission self-review (also spine §4); (c) the build gate does NOT
catch this defect class — rev 18 was type-correct and built green; only
on-disk behavioral verification by Lee caught it.

---

## rev 19 (Session 22 Batch 3 CORRECTION — menus rebuilt on a sound footing)

**Supersedes rev 18 wholesale.** Layout of the menu system, in the form now
live on disk through renderer rev 24:

- Menubar content = three top-level buttons (mkTop: Project / Options /
  Help), each toggling its panel; hover-switches when another menu is open
  (Windows behavior; DEVIATION:[menu-interaction]).
- Leaf items built by a factory (mkItem) that stores a reference in
  `menuItems[key]`; mainUpdate toggles `.sm-disabled` on held references
  directly — no DOM scraping anywhere. MenuUpdate polarity unchanged from
  the rev-17 flat-button version (Session-19c-verified) — 5 gated items +
  End Game inverted; High Scores / About / Quit ungated.
- Panels: `position: fixed`, `display: none` by CSS default; geometry
  computed at OPEN time from `getBoundingClientRect` (viewport coords —
  immune to ancestor stacking and flex/wrap layout). openMenu clamps
  against the right viewport edge; openFlyout cascades right with EDGE
  FLIP (mirror leftward if the flyout would overflow; measured while
  hidden so the flip is exact — works in width-bound AND ≤720px regimes,
  one code path).
- Grid Size cascade: hovering (or clicking) the row opens the flyout;
  hovering any non-Grid row closes it. Bullet marker (•) in the row
  gutter tracks the current grid type, refreshed in mainUpdate.
- Underlay: created on open, REMOVED on close (rev-18 defect 2 dead);
  Esc and click-away close all menus.
- Styling: DEVIATION:[menu-styling] — dark-app adaptation of Win2k native
  menu chrome (light panel, dark items, clHighlight hover).
- **Rev-17 stylesheet restored VERBATIM**, menu CSS purely APPENDED after
  the preserve marker. (Restoration re-checked against the rev-17 source
  at composition — the preservation-verification rule applied on its
  birth session.)
- A4 captions: literal asterisks preserved; actual-geometry knowledge
  (GRID_CONFIGS dims) remains trivia only (R9 superseded-by-revision).

**Pre-transmission corrections (folded under the same rev number, never
on disk):** first rev-19 draft had panels visible at boot (missing display
default), an undeclared `gridFlyoutPanel` field, and a missing Esc
handler — caught on self-review before any disk write. Sets the spine §4
exception: defects caught pre-write fold into the pending reissue.

**Verified by Lee** ("everything appears functional. Resized window looks
good.") — **Batch 3 CLOSED at rev 19.**

---

## rev 20 (Session 23 — board-entity art v1 + sels correction)

**Mission:** replace the abstract tile glyphs (filled squares/simple
shapes) with orig-faithful ENTITY ART, drawn as code-drawn vector
primitives at the single seam `drawCellEntity()` (contract: base tile
units under the canvas transform). Decision (Lee ruling, Session 23):
authored vectors over extracted .res bitmaps — screenshots supplied
sufficient reference; dark-theme adaptation argued for authored palettes.
This CLOSED the tile-art extraction seam's scope (spine §3-8; the seam
remains the swap point if extraction is ever wanted later).

- **Cross tokens** (COMPANY_CELL_BASE+): company-color arms, thick dark
  outline tracing all edges, DEVIATION:[company-initial] (white letter
  A–E on the center), DEVIATION:[token-flat-shading] (no bevels/shadows).
- **Circle**: faithful blue — flat medium-blue fill + thick dark-blue
  outline (orig ImageList tile), brightened for the dark board:
  `#4f83e8` fill / `#16204a` stroke.
- **Diamond**: vivid yellow rotated square, flat fill, thin black outline.
- **drawSels correction** (folded in, Lee ruling): normal selection =
  solid royal-blue fill + THICK WHITE border; active (timer-cycled) =
  solid blue + thick lime-green border. Retires the translucent-blue/
  thin-black normal and clYellow-stroke active of the pre-20 era.
  Constants: SEL_FILL #0000ff, SEL_BORDER_NORMAL #ffffff,
  SEL_BORDER_ACTIVE/ACTIVE_STROKE #32cd32.

**Erratum (process-relevant, recorded):** the issued artifact carried one
transcription typo — `'2D'` instead of `'2d'` at the getContext call —
caught by the BUILD GATE, hand-fixed on disk. Load-bearing because the
self-review had CERTIFIED the line byte-identical from composition-side
memory. Addendum codified (spine §4): certifications must come from
re-reading the ISSUED artifact text, never from composing-side memory;
build gate + Lee's on-disk diff are the authoritative checks.

**Outcome:** loaded and exercised by Lee; tuning feedback followed →
superseded by revs 21–23.

---

## rev 21 (Session 23b — tuning pass 1)

Lee live-feedback-driven (arms stubby, center small, diamond "O"-glyph):

1. **Diamond highlight ellipse REMOVED** — the pseudo-3D ellipse read as
   a spurious "O"/"0" glyph at playable cell sizes. Diamond now flat fill
   + outline only.
2. **Cross geometry rebuilt, span-derived:** span 92% of min cell dim,
   center 50%, arm width 33% — geometry derived from span/center so arm
   lengths are computed (`armLen = halfSpan − halfCs`), not hand-tuned.
3. **Letter readability:** stroked-outline halo (lineJoin round,
   miterLimit 2), bold 40%-of-cell font.

Superseded by rev 22 (Lee: arms still stubby; center small).

---

## rev 22 (Session 23c — tuning pass 2)

Vertical (top/bottom) arms extended to the CELL EDGES — full tile height
— on the reasoning that the rev-14-era tiles were taller than wide
(pre-square-cells), so edge-reaching vertical arms restored the orig
cross's full-bleed look; horizontal arms kept the 92% span. Center square
50% → 58%.

**On-disk divergence (spine §4 rev-numbering extension precedent):** Lee
HAND-TUNED the disk copy beyond the issued artifact — `centerSize` 58% →
0.70, cross `lineWidth` → 2 — then applied a chat-issued
symmetric-geometry patch. On-disk contents no longer matched the issued
rev → restamped **rev 23** (rev numbers keep uniquely identifying on-disk
contents even across hand-tune sessions).

---

## rev 23 (Session 23 close — ON-DISK final form; never re-issued as an artifact until renderer rev 24)

The Session-23 endgame, in four acts (all recorded from spine + rev-24
header reconciliation):

1. **Scaffold amendment enables symmetry:** the logged frozen-file
   amendment DEVIATION:[square-cells] (GRID_CONFIGS tileH := tileW;
   SCAFFOLD-NOTES amendment line owed by Lee — renderer-side record at
   spine §6) made cells SQUARE. The asymmetric rev-22 geometry (vertical
   full-bleed, horizontal 92%) lost its premise.
2. **Symmetric cross:** all four arms identical geometry — `halfSpan =
   0.46m`, `armLen = halfSpan − halfCs` — same span fraction on both
   axes; no full-bleed. Center square at Lee's tuned `0.70m`; cross
   `lineWidth 2`.
3. **Hand-patch casualty + restoration:** the company-initial letter
   block was accidentally dropped during the symmetric-geometry edit;
   caught and re-added verbatim per chat instructions. (Second
   hand-edit-cycle lesson: verify the FULL entity block after a manual
   patch, not just the edited lines.)
4. **drawSels lineWidth → 3** (Lee tune — borders of the blue sels
   squares).

**Verified by Lee — "Now the game looks great." Session-23 mission
CLOSED.**

**Post-close note:** rev 23 existed ONLY on disk (hand-tuned, never an
issued artifact) until Session 25 — renderer.ts rev 24's header wrote
the interim state down, and THIS archive entry is now its full record.
Session-25 observation: the rev-22 "edge-reaching vertical arms"
reasoning was itself invalidated by square-cells — archived as-is; the
final geometry is the rev-23 symmetric form.

---

**APPEND LOG** (maintain at file bottom, newest last):
- Session 21 mid: rev-15 spine reissue recorded (viewport-fit narrative
  = former notes rev-15 entry, migrated at reorg).
- Session 21 close: rev 16 (board-top-align) + rev 17 (Batch 2 side
  panel) appended. Spine pending-detail blocks for both compressed to
  index lines post-verification — this file is now the sole full record
  for revs 16–17.
- Session 25 (cleanup batch N3): revs 18 (defective, process-record) +
  19 (menu correction) + 20 + 21 + 22 + 23 (entity-art chain, incl. the
  '2D' typo erratum, the rev-22 hand-tune/restamp episode, and the
  rev-23 on-disk-final narrative) appended from the spine index rows +
  session records. Spine §1 rows for 18–23 remain the compressed index;
  this file is now the sole full record for revs 16–23. Archive-append
  debt CLEARED.
