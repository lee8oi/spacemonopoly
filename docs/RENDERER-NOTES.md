# RENDERER-NOTES.md — Annotation Archive (SPINE) for renderer.ts + dialogs.ts

Companion to `renderer.ts` (UI layer, **rev 23 on disk — Session-23
board-entity art COMPLETE and VERIFIED**) and `dialogs.ts` (dialog
layer, rev 3 — all modal/dialog presentation; split out of renderer.ts
rev 12 in Session 17). Scaffold (logic layer, Session-13-amended +
Session-23 square-cells amendment — see §6 cross-ref) and its own
archive: SCAFFOLD-NOTES.md. Active session record for dialogs.ts work:
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

### dialogs.ts

| Rev | Scope & tags | Verification |
|---|---|---|
| 1 | Session-17 split payload (all modal/dialog code + modal queue + dialog CSS). See renderer rev 13. | Smoke-pass ✔. |
| 2 | Move Up/Move Down player reorder in new-game dialog; Session-18 transcription regression (row.netWorth → netWealth) diagnosed/fixed. Full record: DIALOGS-NOTES §§1–6. | Verified. |
| 3 | Cosmetic backlog: caption "Player Information"; MaxLength 15; Go! disabled at empty list (updateButs); remove-guard dropped; DEVIATION:[prefill-single]. Full record: DIALOGS-NOTES §10. | Lee live ✔. |

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
- **R8 (SETTLED, source-confirmed)** Prefs persistence = faithful-dead:
  Save writes, nothing loads (QUIRK prefs-half-wired; FormCreate reader
  commented out in orig — confirmed Session 15 SMMain.cpp read).
  loadPreferences() exists in scaffold if option (b) is chosen later.
- **R9 (SUPERSEDED-BY-REVISION, rev 19)** Grid-size select element with
  ACTUAL geometry labels is DELETED; grid size is Options → Grid Size
  flyout with the orig literal asterisk captions (A4). Actual-geometry
  knowledge remains valid trivia (orig captions overstate both dims).
- **R10 (RETIRED, Session 21)** Player list showed name + money
  (enhancement over orig names-only). List now NAMES-ONLY per A5
  FIDELITY (rev 17) — the enhancement itself is dead.
- **R11 (SETTLED)** Currency-unit input validated to 1–3 chars
  (RENDERER SPEC; orig bypasses setUnit — port MAY validate at input).
- **R12 (SETTLED, diagnostic)** Hint bar + missed-click feedback.
  Lee ruled KEEP (inventory A6). Relocated below board (rev 14); gains
  "Turn X of N" context in rev 17 (displaced from turn box per B8).
- **R13 (Lee-approved deviation; basis source-confirmed)** Swatches keep
  company color; affordability = white border. Orig fills the entire
  swatch white with black pen.
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
board-entity art CLOSED (rev 23 verified).**

Remaining work:

1. **D4 dialogs scope** (merge/split/new-company/game-over/buy-sell/
   player-info tabs/preferences tabs/high-scores/company-list +
   white-dot info) — NOW THE HEAD OF THE QUEUE. Lee-held screenshots
   required to open.
2. **Company-list heading QUESTION** (rev 17): wide screenshot of the
   orig side panel needed to settle Label5's text/position; if a heading
   exists, reinstate with extracted caption.
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
   Lee exercised visually at ≥1 grid size at Session-23 close.
5. **Unrun secondary checks** (low priority): fresh-storage David/1M
   defaults view; high-score persistence across reload; menu dialog
   no-tinting; >15-char name clamp; Session-18 reorder re-run;
   solo-Tournament downgrade confirmation.
6. **New-game board mechanism (DOCUMENTARY ONLY, non-blocking)**: no
   examined original file explains why circles survive new game
   (Grid::clear() is uninitialized-loop UB). Port implements Lee's
   observed spec; nothing further unless new sources surface.
7. **Verify-before-ship trivia**: currency symbol raw byte (assume £);
   prefs persistence option (b) decision; SMMain.dfm captions (would
   also settle R1's timer interval) AND initial menu-enablement
   defaults (DIALOGS-NOTES §11.7 — rev 19 ships a default-derived
   boot state; orig truth still uninspected).
8. ~~Tile-art extraction seam~~ **CLOSED-SCOPE (Session 23):** the
   crafting landed as CODE-DRAWN VECTOR ART at drawCellEntity() (revs
   20–23), not extracted .res bitmaps — screenshots supplied sufficient
   reference and dark-theme adaptation argued for authored vectors.
   The seam remains the single swap point if SpacePoly2.res extraction
   is ever wanted later.
9. **Light theme (D1)**: entity-art hexes were tuned for the DARK board
   only (Lee ruling Session 23); a light-theme pass (checker + token
   palette revisit) is a future Lee-scheduled batch.
10. **Housekeeping**: DIALOGS-NOTES.md = canonical record for dialogs.ts
    changes (pointers here); renderer.ts changes → full record here,
    new full entries APPENDED TO RENDERER-ARCHIVE.md. **PENDING ARCHIVE
    APPENDS: revs 18/19 (defect-cycle narrative) AND revs 20–23
    (entity-art chain incl. the '2D' typo erratum and Lee's hand-tune
    history)** — fold into the next archive touch. PROCESS LESSONS
    (Session 22): (a) preservation-verification rule; (b)
    pre-transmission self-review — Session 23 addendum: the self-review
    certified a byte-identical line that was NOT byte-identical (rev-20
    '2D' typo). Lesson: certifications must come from re-reading the
    ISSUED artifact text, not from composing-side memory; the build
    gate + Lee's on-disk diff remain the authoritative checks.

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
  number independently (renderer rev 23 on disk, dialogs rev 3).
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

---

*Last updated: Session 23 close — **board-entity art COMPLETE: revs
20 (shipped, typo erratum) → 21 → 22 → 23 (on-disk final, Lee-tuned,
VERIFIED — "Now the game looks great."). Square-cells scaffold
amendment DEVIATION:[square-cells] logged (§6). Sels correction,
blue circle, yellow diamond, cross tokens w/ initials all live.
Session-23 mission CLOSED. Next queued: D4 dialogs scope (Lee-held
screenshots required). Housekeeping: archive append for revs 18–23
pending; scaffold-notes amendment line pending.**
