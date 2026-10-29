# RENDERER-ARCHIVE.md — Session 21 Close Append (revs 16 & 17)

**Instruction:** Paste the two entries below at the END of your on-disk
`RENDERER-ARCHIVE.md` (after the rev-15 entry), keeping the append-log
line at the very bottom. Per the archive's append-only policy, no
existing text changes — this is a pure append. (In-conversation artifact
`renderer-archive-append`; disk destination: end of RENDERER-ARCHIVE.md.)

---

## rev 16 (FIX:[board-top-align] — reduced-window alignment; CSS-only)

**Context:** rev 15 (FIX:[viewport-fit]) closed the full-size overflow
defect but Lee's follow-up screenshot showed a residual: at reduced
window widths the board sat noticeably lower than the side panel's top
while the panel stayed pinned at the row top. (Process note: Lee's
first report of the residual was initially misread in-conversation as
the hint bar still being invisible — Lee corrected the record; the
hint bar was fine, only the alignment was off.)

**Root cause:** the board region centered the canvas vertically
(`align-items: center`), while the side panel anchors to the row top.
The asymmetry was invisible in the height-bound regime (full-width
windows: the 4:3 fit consumes the region's whole height, zero leftover,
because the side panel's fixed ~300px width plus menubar make the board
column tall relative to its width). At reduced widths the fit flips to
WIDTH-BOUND: the board scales to the narrowed column and leaves leftover
vertical space, which centering split above and below — floating the
board down relative to the panel. The defect was predictable at rev-14
design time and wasn't reasoned through; this produced the
**responsive-design review rule** now in the spine §4 (any layout change
must be reasoned through BOTH fit regimes at design time).

**Fix:** board region `align-items: center` → `flex-start` (horizontal
centering via `justify-content: center` retained). The board's top edge
now sits flush with the side panel's top at every window size. Trade-off
accepted: on narrow-but-tall windows the leftover collects BELOW the
board (between board and hint bar) instead of being split — least
obtrusive placement, and the original app anchors its board at the
top-left of the client area, so top-flushness is the faithful direction.
Bottom-flushness with the panel is a non-goal (panel internals were
mid-recomposition toward the Batch-2 fixed hierarchy anyway).

**Scope:** CSS-only; one property. No drawing, mouse, timer, or
turn-flow changes. **Verified by Lee** ("looks good enough for now") —
Batch 1 CLOSED at rev 16.

---

## rev 17 (Session 21 Batch 2 — side panel recomposition; B6+B7+B8+B10)

**Scope:** renderer-only, presentation-only. Scaffold and dialogs.ts
untouched. Implements the Session-20 inventory's locked Batch 2 with
two rounds of Lee design-time amendments (see below).

**Composition (B6, original hierarchy restored):** side panel
top-to-bottom = (1) current-player box → (2) company list → (3)
Players box (names-only) → (4) teal turn box → (5) Finish Turn.
Replaces the rev-13 order (Players → Current Player duplicate →
Companies → button); absorbs the B11 wonkiness ledger (duplication,
premature Game Over button, checkbox-look rows).

**Design-time amendment episode (for the record):** at design Lee first
ruled the Players box REMOVED entirely ("only show current player"),
which was recorded as DEVIATION:[players-box-removed]; Lee then
corrected himself before any code shipped — the box was reinstated
per the original design and the removal deviation never existed in
any artifact. Final spec has the box. Lesson codified as the
inventory-amendment recording convention (spine §4): design-time
overrides are logged as named deviations in the notes; the inventory
file stays closed; nothing ships before Lee's final ruling.

**Item-by-item:**
- **B8b top box**: "£0" pre-game (orig initial-screenshot state); in
  play = current player's name over balance, driven by
  moneyShow/mainUpdate. Single-click on the box opens the CURRENT
  player's details (Lee ruling; the orig has no box equivalent).
- **A5 FIDELITY (restored)**: Players box is NAMES-ONLY (orig layout;
  R10's name+money enhancement retired — R10 status flipped to RETIRED).
  Plain rows, no current-player highlight ("copy the original design");
  orientation lives in the top box.
- **DEVIATION:[singleclick-details]**: player details open on
  SINGLE-click of a players-list row (orig = ListBox1DblClick). Supersedes
  rev-2's FIDELITY:[itemindex] dblclick flavor. Details access preserved
  for ALL players. The current-player box is also single-click.
- **B8 FIDELITY**: large teal box showing ONLY the current turn number.
  Faithful-bright teal (#008080 anchor, approximated) + dark numerals;
  Lee ruled faithful-bright with theming revisitable later. Blank
  pre-game. Max-turns context AND the "(Tournament)" tag displaced to
  the R12 hint bar (updateHint now prefixes "Turn X of N — ").
- **B7**: in-game button label "Finish Turn" (was Continue); "Place a
  piece…" sels-state text kept (port addition; orig just disables).
  Post-game "Game Over" disabled state and all rev-4/10 gating logic
  untouched.
- **B10**: plain clickable company rows, swatch + name, thin separators,
  dark-adapted. **"Companies" heading DROPPED — QUESTION, open:** the
  original screenshot shows the list starting immediately with the
  first button (no heading in crop), but the dfm fragment evidences
  Label5 (purple/bold/underlined Times New Roman) somewhere on the
  panel — text/position unreadable. Reinstate with extracted caption if
  wider evidence lands (carried as open item in spine §3).
  **Order verified by genuine vision pass** (Session-20 process lesson
  upheld): screenshot shows Atlantis → Betelguese → Cannon → Debenese →
  Eridnus = port COMPANY_DEFS order exactly; dfm DECLARATION order
  (Eridnus first) is Z-order, not visual position — screenshot is
  ground truth. Swatch = small solid company-color square-ish shape;
  exact shape held for D3 (dfm round-rect TShapes). VCL dotted focus
  rect on one row = keyboard-focus artifact, not ported. No white dots
  in capture (consistent with D3 deferral).
- **Betelguese spelling (open item #5, closed):** port "Betelguese" =
  orig "&Betelguese" — QUIRK-FIDELITY confirmed already-faithful via
  Lee's pasted COMPANY_DEFS. No change.

**Cosmetic aside flagged in-delivery:** the TURNBOX_* constants are
declared for documentation; the turn-box CSS uses the literal hex
inline (consistent with the board palette arrangement). Inert unless
a noUnusedLocals-style gate complains.

**Implementation notes:** buildChrome builds the new panel in order;
rebuildPlayerList emits names-only rows with click listeners;
moneyShow guards the pre-game "£0"; mainUpdate drives turnBox,
playerLabel, Finish-Turn label/gating; menubar untouched (Batch 3).

**Verified by Lee — 7/7 checklist:** panel order; top box £0→name+
£6,000; single-click top box details; single-click row details
(all players); teal box number-only incrementing; hint-bar turn
prefix; Finish Turn/Game Over states; plus regression sweep of the
§6 baseline (end-game flow, trade dialogs, affordability swatches).
**Batch 2 CLOSED at rev 17.**

---

**APPEND LOG** (maintain at file bottom, newest last):
- Session 21 mid: rev-15 spine reissue recorded (viewport-fit narrative
  = former notes rev-15 entry, migrated at reorg).
- Session 21 close: rev 16 (board-top-align) + rev 17 (Batch 2 side
  panel) appended. Spine pending-detail blocks for both compressed to
  index lines post-verification — this file is now the sole full record
  for revs 16–17.
