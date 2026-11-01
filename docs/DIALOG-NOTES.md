# DIALOGS-NOTES.md — Sessions 18–19 Record + Session 24 D4 Scope (rev 7)

**Artifacts:** `dialogs-ts` (code, rev 3 on disk; next reissue = rev 4); `dialogs-notes` (this document)
**Rev:** 7 — Sessions 18 (closed) + 19a build gate (closed, §8) + 19b cosmetics (closed, §10) + 19c item-#2 verification (closed, §11) + Session 24 D4 scoping + **micro-decision resolutions (§12.6 — ALL RESOLVED, this revision)**
**Sessions:** 18, 19, 24 (open)
**Files affected:** 24: none yet (scoping only). Planned: `dialogs.ts` (revs 4+), `renderer.ts` (rev 24, Batch G).

*(Filename note: pasted as `DIALOG-NOTES.md`; canonical name in the bootstrap is `DIALOGS-NOTES.md`.)*

---

## 1–11. Sessions 18–19 record

(Carried forward verbatim from rev 5 — unchanged. Contents: §1 Players.cpp/.dfm source verification; §2 design decisions (reorder, selection model, remove-while-selected); §3 issuance history incl. transcription-drift incident; §4 tag ledger; §5 Session-18 regression report — CLOSED (`netWorth`→`netWealth`); §6 verification status — ALL CLOSED; §7 out-of-scope observations; §8 Session 19a build gate (`tsc` apt-native not npx; `./build.sh` = tsc && esbuild; sabotage-tested fail→held→fix→pass; tsconfig target es2020 + dom lib); §9 open items; §10 Session 19b cosmetic backlog (caption "Player Information", MaxLength 15, Go! empty-list disable, DEVIATION:[prefill-single]); §11 Session 19c doConclude re-entry — verified no defect, menu-state-is-the-guard, MenuUpdate polarity 5/5 + 3 ungated.)

---

## 12. SESSION 24 — D4 DIALOGS SCOPE (scoping; no code yet)

### 12.1 Objective & evidence base

Presentation fidelity pass over the remaining dialog forms. All forms already work
functionally (revs 5–12 machinery: modal queue, eager capture, gating); this is look-
and-wording fidelity only. Evidence: **13 Lee-held original screenshots** submitted this
session in two bursts (5 + 8; first burst's images 6–13 failed delivery, resent in second
burst — all 13 confirmed received and analyzed).

### 12.2 Evidence inventory (verbatim strong layer; vision styling layer discarded)

| # | Form | Orig evidence (verbatim text where load-bearing) |
|---|---|---|
| 1 | Merger dialog | Headline "Merger!"; body: "There has been a merger between A and B" / "The new company will take the name of A" / "The cost of A shares will be £N"; table: Player / Shares in A / Shares in B / **"Money Earnt"** (orig misspelling); OK button. |
| 2 | Split dialog | Caption "Split"; headline "Shares Split Two For One!"; body: "Shares in A have split two for one. The previous share price of £X has been changed to £Y"; table: Player / Shares Before Split / Shares After Split; OK. |
| 3 | New company dialog | Headline "A new company has been formed"; then "The new company's name is A." / "The shares will start at £N each." / "P will get five free shares in the company and £N"; OK. |
| 4/12 | Game over dialog | Headline "Game Over!"; intro "At go number 38 the game is finally over. Below lists the game's final standings .."; summary block: Largest company / Size of company / Winning Player / Net Wealth of player; table: Player / Money Left / Worth of shares / Net Wealth; OK. (Two independent screenshots agree — corroborated.) |
| 5 | Buy/sell (trade) dialog | Separate window (caption ≈ "Space Monopoly Services"); **company-colored header band** with company name + ‹ Previous / Next › flippers in the band; detail lines: "Company Size: 2 squares" / "Cost of Shares: £200" / "Major Shareholder: Lee with 5 shares."; group 1 header "You own N shares in this company" + [Sell All] [Sell >>>] [qty] Shares; group 2 header "You can buy up to N shares in this company" + [Max Buy] [Buy >>>] [qty] Shares; Finished button. |
| 6 | Player info — Players tab | Tabs: Players / Game Type. Players: list + Move Up / Move Down (right column) + Remove + "Name:" field + Add; bottom buttons (vision read "Quit"/"Cancel" — Quit likely misread of Go!, unconfirmed). |
| 7 | Player info — Game Type tab | "Select a mode:"; radios: Classic Game / Tournament; buttons Go! / Cancel. |
| 8 | Preferences — General tab | Tabs: General / Game. "Currency Settings" group: Currency Unit **dropdown** (shows £); radios Prefix / Postfix; bottom: Save / Okay / Cancel. |
| 9 | Preferences — Game tab | Group box: orig heading reads "Multiplayer Options" (Lee-confirmed from disk shot); subtext "(Recommended for multiplayer games, but can be used for single player games)"; checkboxes: Force Mergers / Force Expansion / (indented, boxed) Allow Company Creation / Hide Player details; bottom: Save / Okay / Cancel. |
| 10 | Company list (right panel) | Five rows: colored dot + name (Atlantis Ltd. / Betelgeuse / Cannon Inc. / Debenese / Eridnus Corp.), thin separators, selection highlight on one row. **Lee ruling: NO header exists above the list in the orig right panel — Label5 question CLOSED.** |
| 11 | High scores dialog | Three size selectors "16 by 12" / "22 by 18" / "32 by 24"; table with header row: Position / Name / Net Wealth; top entry tinted; Okay button. |
| 13 | Player details dialog | Caption "Player Details"; content: "Details of Lee" — Money in the Bank: £6,000 / Net worth of Shares: £0 / Total Wealth: £6,000; then "Share Details:" table: Company Name / Number of Shares / Worth of Shares; Okay button. |

**Evidence rulings made at scoping:**
- Vision-read styling details (fonts, hex guesses, "wine glass icons", green checkmarks in buttons) are DISCARDED as evidence. Text + structure only.
- "Filter buttons, no tabs" read on high scores is OVERRULED by the Phase-3 source ledger (HighScores.h: 3-tab PageControl) and the rev-12 port — the size labels are tab captions.
- **White dot (company list): Lee confirmed** — the white dot signifies the current player can afford to buy at least one share in that company. (Renderer-side affordance; Batch G.)

### 12.3 Lee's scoping rulings (Session 24, binding)

1. **Wording policy:** formalize wording/spelling for better accuracy — orig misspellings and clumsy phrasing are corrected, not slavishly preserved. E.g. "Money Earnt" → "Money Earned"; "At go number 38" → "At turn 38" (port vocabulary; confirmed §12.6-1); trailing ".." → proper ellipsis.
2. **Theme:** dark theme retained for all dialog chrome (DEVIATION:[menu-styling] family continuity). Broader themes discussion deferred to a future session (interacts with the deferred D1 light-theme pass).
3. **Port additions:** follow Lumo's recommendations —
   - DROP: merger "Combined value" sum line (redundant once orig's "The cost of A shares will be £N" sentence lands); split share-price bullet line (superseded by orig's before/after sentence).
   - KEEP: the behavioral-quirk hints (tournament doubling note, tournament no-conversion note, zombie-exclusion note, trading-lock note) as small-print supplements — tagged DEVIATION:[hint-supplement] going forward.
   - KEEP: company-color banners/swatches on announcement modals as dark-theme color identity (DEVIATION:[color-banner] — orig announcement dialogs are plain).
4. **White dot:** renderer-side affordability marker (≥1 share affordable). Batch G — white dot REPLACES the R13 white border (Lee §12.6-7), sized so the company color remains clearly visible.
5. **New game + preferences structure:** stay SINGLE PAGE (Lee: extra tab redundant). Orig tab structure NOT adopted → tags DEVIATION:[single-page-newgame], DEVIATION:[single-page-prefs].

### 12.4 Formalized wording targets (reference for code batches)

**Founding (Batch A):** h3 "New Company!" (window-caption role); bold lead "A new company has been formed"; then, verbatim-formalized: "The new company's name is {name}." / "The shares will start at {price} each." / "{player} will get five free shares in the company and {price}." Button: OK.

**Split (Batch A):** h3 "Shares Split Two For One!"; body: "Shares in {name} have split two for one. The previous share price of {old} has been changed to {new}."; table headers: Player / Shares Before Split / Shares After Split. Keep tournament/classic doubling hint. Button: OK.

**Merger (Batch A):** h3 "Merger!"; color banners retained (struck-through absorbed / survivor); body: "There has been a merger between {A} and {B}." / "The new company will take the name of {A}." / "The cost of {A} shares will be {new price}."; table headers: Player / Shares in {A} / Shares in {B} / Money Earned (spelling formalized from orig "Earnt"); combined-value line REMOVED. Keep tournament no-conversion + takeover hints. Button: OK.

**Game over (Batch B):** h3 "Game Over!"; intro: "At turn {N} the game is finally over. Below are the game's final standings…" (grammar fixed per §12.6-1/2); four-line summary block: "Largest company: {name}" / "Size of company: {n} squares" / "Winning Player: {name}" / "Net Wealth of player: {money}"; table headers: Player / Money Left / Worth of shares / Net Wealth. Button: OK (was "Close"). Winner-summary one-liner retired in favor of the summary block.

**Player details (Batch B):** h3 "Player Details"; bold "Details of {name}"; summary rows first: "Money in the Bank" / "Net worth of Shares" / "Total Wealth"; then "Share Details:" label over table: Company Name / Number of Shares / Worth of Shares; zombie hint retained (DEVIATION:[hint-supplement]). Button: Okay (was "Dismiss").

**High scores (Batch C):** tab captions FIXED to actual geometry (Lee §12.6-3: "Fix it") — derive caption strings FROM GRID_CONFIGS at runtime (e.g. `${cols} by ${rows}`) so captions can never drift from reality; DEVIATION:[scores-caption-fix] (orig overstated Large as "32 by 24"; actual Large is smaller — read exact dims from scaffold at code time, never from memory). Table gains header row: Position / Name / Net Wealth; new-entry bold+tint retained. Button: Okay (was "Close").

**Trade / buy-sell (Batch F):** company-colored header band (name + ‹ Previous / Next › flippers, dark-adapted); detail captions: "Company Size: {n} squares" / "Cost of Shares: {price}" / "Major Shareholder: {name} with {n} shares." (fall back to "Nobody." when none); group 1: "You own {n} shares in this company" over [Sell All] [Sell >>>] [qty field] Shares; group 2: "You can buy up to {n} shares in this company" over [Max Buy] [Buy >>>] [qty field] Shares; two SEPARATE quantity fields (orig has one per group); button "Finished" (was "Close"). Trading-lock hint retained. ">>>" glyphs kept literal (orig caption content).

**Preferences (Batch E):** single page with two group sections (DEVIATION:[single-page-prefs]): "Currency Settings" (unit input stays free-text per R11 validation deviation; Prefix/Postfix converted from select to radio pair) and the Game group: heading **"Gameplay Options"** (renamed from orig "Multiplayer Options" — Lee ruling §12.6-6: orig's own subtext admits single-player use, so the name is inaccurate; formalization, not fidelity break) + recommendation subtext verbatim; checkboxes relabeled: "Force Mergers" / "Force Expansion" / "Allow Company Creation" (indented, disabled unless expansion — already implemented) / "Hide Player Details". Buttons: Save / Okay / Cancel with §12.6-5 semantics. **Persistence WIRED (option b — supersedes R8 faithful-dead; see §12.9):** preferences saved on Save AND read at game launch so they apply to future sessions.

**New game (Batch D):** single page (DEVIATION:[single-page-newgame]): players section unchanged mechanically (Move Up / Move Down right column, per-row −, "+ Add player", MaxLength 15, prefill-single); mode selector converted from dropdown to radio pair under heading "Select a mode:" with labels Classic Game / Tournament; **grid-size dropdown REMOVED** (Lee §12.6-4 — canonical grid choice is the Options → Grid Size flyout, rev 19; orig player form has no grid control; matches orig division of responsibilities). Buttons: Go! / Cancel.

### 12.5 Batch plan (sequenced smallest → largest)

| Batch | Scope | File / rev |
|---|---|---|
| A | Announcement text fidelity: founding, split, merger (wording, table captions, drops per §12.3) | dialogs.ts rev 4 |
| B | Game over + player details rewording/reordering | dialogs.ts rev 5 |
| C | High scores: runtime-derived tab captions, header row, Okay | dialogs.ts rev 6 |
| D | New game: mode radios + "Select a mode:" + grid-dropdown removal (single page) | dialogs.ts rev 7 |
| E | Preferences: group sections, "Gameplay Options", radio pair, third button + WIRED persistence | dialogs.ts rev 8 |
| F | Trade dialog re-layout: color header band, captioned details, two-group buy/sell, Finished | dialogs.ts rev 9 |
| G | Company list white-dot affordance (renderer side panel; RETIRES the R13 white-border signal; dot sized within the swatch so the company color stays clearly visible — Lee §12.6-7) | renderer.ts rev 24 |

Delivery cadence: one full-file reissue per batch (clean audit trail), DIALOGS-NOTES reissued when design records change; Lee may group batches into a single reissue if he prefers fewer transcriptions. Chat-patch mode available for tuning loops (Session-23 precedent); hand-edits take new revs.

### 12.6 Micro-decisions — RESOLVED (Lee, Session 24)

1. **"go number" → "turn"** — YES, fix grammar; deviate from orig (wording-policy formalization).
2. **Trailing ".."** — YES, fix (proper ellipsis/period).
3. **High-scores tab captions** — FIX: corrected to actual geometry, derived from GRID_CONFIGS at runtime. Orig's overstated "32 by 24" is not carried.
4. **New-game grid dropdown** — REMOVE (Lumo recommendation accepted; canonical entry point = Options → Grid Size flyout).
5. **Preferences Okay/Save/Cancel semantics** — agreed: Okay = apply to live game + close (no persist); Save = apply + persist; Cancel = discard. EXTENSION (Lee): preferences must be READ at launch and apply to future game launches — persistence wired, superseding R8 faithful-dead (see §12.9).
6. **Preferences Game-tab group heading** — orig reads "Multiplayer Options" (Lee-confirmed). Lee proposes and adopts **"Gameplay Options"** for accuracy (applies to single-player too).
7. **Affordability signal** — white dot REPLACES the white border (border "not as noticeable"); dot must not fill the swatch box — company color remains clearly visible.
8. **Company list heading (Label5)** — no header exists above the list in the orig right panel (Lee ruling). Rev-17 heading-drop is now source-confirmed and PERMANENT. Close RENDERER-NOTES §3 item 2 at next renderer-notes reissue.

### 12.7 Verification expectations (per batch)

- `./build.sh` green after each transcription (gate catches type drift; behavioral spot-checks remain mandatory).
- Batch-specific live checks: A — trigger/provoke split, merger, founding (CLASSIC + solo Tournament where reachable); B — end game via both paths (menu + natural finish); C — standalone High Scores + end-of-game second modal (new-entry tint) + captions match actual grid dims on all three sizes; D — mode radio commit, reorder re-run, grid choice ONLY via Options menu; E — draft-commit flow, expansion→creation enable chain, SAVE→relaunch persistence round-trip (write then read at next launch, all pref fields); F — buy/sell/max/sell-all paths, prev/next cycling, sels lockout; G — white dot matches affordability at several cash levels, across all three grid aspects.
- TOURNAMENT single-row tables spot-check rides along opportunistically (standing §9 item).

### 12.8 Evidence provenance & caveats (for the record)

- Screenshots submitted by Lee this session, held on Lee's disk (cleared from conversation slots after extraction; re-attach on request for re-examination).
- All screenshot-derived styling claims are weak-evidence and were discarded; wording/structure claims quoted above are the design basis.
- The five-shot first-burst images were cleared from the conversation at Lee's request after text extraction; the eight second-burst images remain available for re-examination.
- Erratum from rev 6 of this document: the trade-dialog evidence line contained a doubled word ("can buy buy up to") introduced at composition; the correct extraction is "You can buy up to N shares in this company".

### 12.9 Persistence wiring design note (Batch E — R8 supersession)

Lee's §12.6-5 extension chooses option (b) from the long-standing verify-before-ship
trivia item: preferences become **wired** (saved AND read at launch), superseding
R8's "faithful-dead" settlement and the QUIRK-[prefs-half-wired] behavior
(orig FormCreate reader is commented out — we now deliberately diverge:
DEVIATION:[prefs-wired]).

Implementation considerations to resolve at Batch E design time:
- Scaffold reportedly contains a dormant `loadPreferences()` (per R8 note). Investigate whether activating it requires a scaffold hand-amendment (logged-amendment precedent, square-cells pattern) or whether renderer-side boot-time read of the `Preferences` localStorage key suffices. Prefer the path that leaves the frozen scaffold untouched if functionally equivalent.
- Storage shape must match what the existing Save path already writes (key `Preferences`) — read exactly what is written; do not invent a parallel schema.
- Which fields apply live vs. next-game (e.g. currency unit likely applies to display immediately; force/expansion/hide-details likely only at next `startGame`) — decide per field with Lee at Batch E.
- RENDERER-NOTES R8 status line + §3 item 7 trivia entry must be updated at the next renderer-notes reissue to record the flip to (b).

---
*Session 24 status: SCOPED + MICRO-DECISIONS RESOLVED (§12.6). No code issued. Next: Batch A → dialogs.ts rev 4 (announcement modals: founding, split, merger — wording per §12.4).*
