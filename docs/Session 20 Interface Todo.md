# SESSION 20 INVENTORY — Interface Layout Alignment

**Status:** CLOSED FOR GAME-WINDOW SCOPE — batches approved by Lee; implementation deferred to a fresh bootstrap (clean conversation + attachment cleanup). Piece evidence banked below (appendix). Parked: dialog screenshots (future dialogs scope), D3 white-dot materials.
**Method:** Each delta gets its own numbered entry with a proposed disposition. Screenshot evidence contradicting an approved `DEVIATION` reopens it as `QUESTION`.
**Dispositions:** `FIDELITY` (restore original) · `DEVIATION` (keep port, rationale) · `APPROXIMATION` (closest achievable) · `QUESTION` (needs Lee's call)
**Note:** Canonical durable copy of the Session 20 interface inventory. Reissued in full (same artifact ID) whenever any entry changes. Final update this session: batches locked; piece screenshots (company token, diamond) analyzed and banked (Appendix P).

---

## Part A — Ledgered deltas (known before screenshots)

### A1. Board tiles: canvas primitives vs ImageList bitmaps — CANVAS PATH CHOSEN, DETAILS DEFERRED
- **Delta:** Port draws entities as canvas primitives; original uses bitmap artwork (yellow roofed buildings stacking to ~3/cell, company-colored tokens, yellow diamonds).
- **Session-20 update:** Lee chose canvas representations (not bitmap extraction) for the company token and diamond — see Appendix P. Building pieces (stacked houses) and remaining entity art still need evidence/approach (D2 continued).
- **Disposition:** CANVAS REPR PATH for token + diamond (Lee-approved); modernized variants OK. Buildings TBD.
- **Impact:** renderer.ts (`drawCellEntity()` seam)

### A2. New Game dialog selection model
- **Disposition:** DEVIATION:[selection-model] — approved, keep.

### A3. Single-row prefill "Player 1"
- **Disposition:** DEVIATION:[prefill-single] — approved, keep.

### A4. Grid-size flyout labels — EVIDENCE RECEIVED, LEE-CONFIRMED
- **Original:** "Grid Size" cascading submenu under Options, three items: `16*12 (80 turns)` · `22*18 (120 turns)` · `28*24 (160 turns)` — Lee confirmed separator is a literal asterisk `*` (kept for fidelity; 2001-era ASCII convention). Turn counts 80/120/160 per vision read (eyeball-confirmed by Lee in bulk).
- **Disposition:** FIDELITY — Grid Size as submenu under Options with geometry+turns captions, asterisk separator.
- **Impact:** renderer.ts
- **Provenance note:** first reported A4 strings in chat were issued WITHOUT running vision (process breach, self-caught; corrected same session with a genuine extraction — strings matched by luck). Disciplines reaffirmed: never state unsourced evidence.

### A5. Player list content — CONFIRMED FIDELITY BY LEE
- **Delta:** Port: name + money. Original: names only.
- **Disposition:** FIDELITY — mimic original layout. Only show names in the "Players:" list. Current player's name+money stays in the top box. Balance updates immediately when a transaction is performed (implied by real-time update behavior).
- **Impact:** renderer.ts

### A6. Hint bar — CONFIRMED DEVIATION BY LEE
- **Delta:** R12 hint bar is a port addition; original has none.
- **Disposition:** DEVIATION keep — user likes it.
- **Impact:** renderer.ts

### A7. Affordability swatch / white dot — DEFERRED BY LEE
- **Delta:** Port: white border. Ledger: orig white fill. Lee has a screenshot AND doc text describing the feature — D3, future item (Lee confirmed later; not in current batches).
- **Note (dfm evidence):** SMMain.dfm fragment shows five small white-pen ellipse TShapes, one per company button, on the side panel — plausible correlate of the white-dot indicator. Conclusion deferred to D3 materials.
- **Disposition:** DEFERRED.
- **Impact:** renderer.ts

### A8. High-scores tabs
- **Disposition:** PENDING — needs original high-scores dialog screenshot. Lee HAS such screenshots (announced) — future dialogs scope.

### A9. Modal styling vs VCL forms
- **Disposition:** PENDING — Lee has dialog screenshots (merge, split, new company, game over, buy/sell, player information + tabs, preferences + tabs) — future dialogs scope; entangled with D1.

---

## Part B — Screenshot-derived deltas (game window, pass 1)

### B1. Overall theme — PARTIALLY DECIDED BY LEE
- **Decision:** Keep dark theme for now. Light theme to be offered as an added preference option later, discussed when we reach the Preferences dialog layout → parked as D1.
- **Consequence:** All styling-fidelity items below keep dark palette as the active skin; structural/proportional fidelity proceeds now.
- **Impact:** renderer.ts + dialogs.ts (later, via D1)

### B2. Menubar: three dropdown menus (Project / Options / Help) — RESOLVED
- **Mapping (menu screenshots, Session 20):**
  - **Project:** New Game · End Game · View High Scores · Quit
  - **Options:** Create New Grid · Grid Size ▸ (flyout → A4) · Preferences
  - **Help:** About Space Monopoly
- **Caption deltas vs port:** "High Scores" → **"View High Scores"** (under Project, not Options — settles quirk #6 menu-labels trivia, open item #4); "About" → **"About Space Monopoly"**. No shortcut hints/ampersands visible.
- **Caution:** screenshots are mid-game captures; initial enablement defaults remain uninspected — DIALOGS-NOTES §11.7 stays open (ties to open item #4).
- **Disposition:** FIDELITY — three dropdown menus as mapped above; nested Grid Size flyout.
- **Impact:** renderer.ts

### B3. Board proportion/size
- **Disposition:** APPROVED DIRECTION — enlarge board to ~65–70% window, near edge-to-edge vertically under menubar, strip container ornamentation. (Colors stay dark per B1.)
- **Impact:** renderer.ts

### B4. Cell appearance
- **Disposition:** APPROVED DIRECTION (structure) — restore thin cell borders + explicit checker pattern; palette adapts to dark theme (darkened checker rather than beige — mark `DEVIATION:[dark-checker]` once implemented, unless D1 light theme later restores beige).
- **Impact:** renderer.ts

### B5. Player tokens on board
- **Disposition:** PENDING — folded into A1 entity decision + token-color source check (player-blue vs company-colored).

### B6. Side panel composition and order — GO
- **Delta:** Original order: (1) current-player box (top; "£0" at pre-game, name+money in play), (2) company list, (3) "Players:" names-only box, (4) big teal turn-number box, (5) Finish Turn at bottom. Port: PLAYERS → CURRENT PLAYER (dup) → COMPANIES → Game Over button.
- **Disposition:** APPROVED DIRECTION (Lee: "proceed") — recompose to original hierarchy; kills the duplication. Top box shows pre-game "£0" then transitions to name+money (£6,000) on start.
- **Impact:** renderer.ts

### B7. Bottom action button
- **Disposition:** APPROVED DIRECTION — in-game label → "Finish Turn"; post-game label/behavior per Session 19 verification (keep "Game Over" disabled state).
- **Impact:** renderer.ts

### B8. Turn indicator form — CONFIRMED FIDELITY BY LEE
- **Disposition:** FIDELITY — adopt the large teal number box showing only the current turn number. Max turns omitted from this area (to be documented elsewhere, location TBD).
- **Impact:** renderer.ts

### B8b. Top box semantics at turn 0 — CLARIFIED BY LEE
- Original initial screenshot is pre-game state showing £0 balance; when game starts it updates to £6,000. Top box therefore shows money, not abstract score/count.
- **Impact:** renderer.ts (B6 implementation: top box renders "£0" pre-game, "Name / £6,000" in-play)

### B9. Window title — DECIDED BY LEE
- **Evidence:** original form Caption = `'Space Monopoly v1.2 - 2001 David Vivash'` (dfm fragment).
- **Disposition:** DEVIATION:[title-short] — use **"Space Monopoly"** (Lee's preference over the full original credit string).
- **Impact:** renderer.ts

### B10. Company row presentation — RESOLVED
- **Original (dfm evidence):** company list is five TBitBtns with OnClick handlers, captions `&Eridnus Corp.`, `&Debenese`, `&Cannon Inc.`, `&Betelguese`, `&Atlantis Ltd.`; five round-rect TShapes and five white-pen ellipses alongside (likely swatches/indicators → A7/D3).
- **Resolution:** Lee confirmed company buttons are ALREADY clickable in both the port and the original — reopen was based on a misreading of the port's interactivity. Collapses back to approved disposition.
- **Disposition:** STRUCTURE GO — plain-looking clickable rows, swatch + name, thin separators; dark-adapted styling. Swatch shape HELD for D3 materials. Spelling quirk "**Betelguese**" — QUIRK-FIDELITY candidate; check port's current spelling.
- **Impact:** renderer.ts

### B11. Port wonkiness ledger
- **Disposition:** ABSORBED into B6/B7 — duplication, premature Game Over button, checkbox-like row appearance all resolved by the recomposition.

### B12. Default grid geometry — RESOLVED, NO DEFECT
- Lee confirms original initial window is 16×12 — matches port default. Vision miscount (read artifact). Closed; port already faithful.

---

## Part D — Deferred / parked items

### D1. Light theme preference option (from B1)
- Parked until Preferences dialog layout discussion (ties to open item #4 prefs decision a/b/c).

### D2. Game-piece close-ups (from A1)
- Company token + diamond CLOSE-UPS RECEIVED AND ANALYZED (Appendix P). Still outstanding: building/house piece evidence (stacking to ~3/cell), player-token shape/color source check (B5).

### D3. Affordability white-dot materials (from A7)
- Lee has a screenshot AND doc text describing the feature. Future item; also settles swatch shape (B10) and the dfm white-ellipse correlate.

### D4. Dialogs scope (new, from Lee's announced inventory)
- Lee holds screenshots for: merge dialog, split dialog, new company dialog, game over dialog, buy/sell dialog, player information dialog (each tab), preferences dialog (each tab), high-scores tabs, company list + white-dot feature info. To be inventoried in a fresh future scope AFTER game-window batches are implemented (Lee: "Game window first then we'll work on the dialog stuff later").

---

## Appendix P — Piece close-ups (Session 20, vision-extracted)

### P1. Company token ("square piece" — MISNOMER)
- **Actual shape:** a plus/cross composite — central royal-blue square (~#4169E1) with four smaller ivory-yellow (~#FFFFF0) squares attached to top/bottom/left/right faces; arms ≈ half the center's height; entire token outlined in a thick dark-navy (~#00008B) border; sharp 90° corners; flat 2D, no shading/bevel/gradient; source image aliased/pixelated.
- **Ledger correction:** prior notes called this the "company square piece" — the silhouette is a CROSS, not a square. Any implementer must draw the plus shape.
- **Modernization path (Lee-approved direction):** keep cross geometry; hue-rotate the center square per company for the five colored variants; anti-aliased edges; flat colors otherwise.
- **Canvas recipe:** centered rect + four arm rects + shared stroke; trivial primitive decomposition.

### P2. Diamond piece
- **Shape:** square rotated 45° (diamond) divided by thin black facet lines into FOUR triangular facets meeting at center.
- **Color/lighting:** yellow-family fills with light from upper-right (brightest facet top-right ~#FFFF99, muted bottom-left ~#FFEA70); thick black outline; faint emissive glow along right edge; pseudo-3D via discrete color steps, no gradients in original.
- **Redraw options:** faithful = pixel-art discrete facets; modernized = smooth gradients between facets, softer glow, optional grounding shadow (Lee: "keep things similar or generate a better looking modern version" — choice pending at implementation).
- **Canvas recipe:** four triangles + outline + facet dividers.

*(Appendix colors are vision-read approximations from low-res sources — treat hex values as guides, not gospel; sanity-check against the screenshots during implementation.)*

---

## Evidence log — Session 20, SMMain.dfm binary fragment (truncated paste)

Readable text fields recovered from the 121 kb binary dfm (Lee pasted a fragment after the full-file attach failed):
- Form: `TMain Main`, Caption `'Space Monopoly v1.2 - 2001 David Vivash'`, Font MS Sans Serif, `Menu = MainMenu1`, Position poScreenCenter.
- Right-aligned side panel `Panel2` (BevelInner bvRaised) containing top-aligned `Panel4` (no bevel) with: five round-rect TShapes; five white-pen ellipse TShapes (Shape6–10); purple bold-underlined Times New Roman `Label5`; five TBitBtns for the companies (captions/handlers as listed in B10).
- `Panel1` begins at fragment end (truncated) — composition beyond this unknown.

---

## Approved implementation plan (locked by Lee, executed post-bootstrap)

All renderer-layer, notes-first full-file reissue per batch, rev spine from renderer.ts rev 13:

1. **Batch 1 — board area:** B3 (board proportion) + B4 (cell appearance, `DEVIATION:[dark-checker]`) + B9 (title, `DEVIATION:[title-short]`).
2. **Batch 2 — side panel:** B6 (recomposition incl. B8b top-box semantics) + B7 (Finish Turn) + B8 (teal turn box) + B10 (company row structure; swatch shape held for D3).
3. **Batch 3 — menubar:** B2 (three dropdown menus, View High Scores / About Space Monopoly captions) + A4 (Grid Size flyout, asterisk separator).

Board-entity art (P1 token, P2 diamond, buildings TBD) is a candidate follow-on batch at the `drawCellEntity()` seam — sequencing to be decided after the three layout batches land.

Verification carry-forwards: Betelguese spelling check (B10); DIALOGS-NOTES §11.7 initial-enablement; parked evidence items D1/D2-remainder/D3/D4.
