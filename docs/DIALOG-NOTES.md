# DIALOGS-NOTES.md — Session 18–19 Record (rev 5)

**Artifacts:** `dialogs-ts` (code, rev 3); `dialogs-notes` (this document)
**Rev:** 5 — Sessions 18 (closed) + 19a build gate (closed, §8) + 19b cosmetics (closed, §10) + 19c item-#2 verification (closed, §11)
**Sessions:** 18, 19
**Files affected:** 19a: tooling only (`tsconfig.json` new, `build.sh` gated). 19b: `dialogs.ts` only (rev 3). 19c: **none** — verification only, no code change.

---

## 1. Source Verification Results (Players.cpp + Players.dfm)

| Question | Answer | Evidence |
|---|---|---|
| Button count & placement | One Move Up + one Move Down, right-hand column; Move Up above Move Down | `.dfm` control list; screenshot |
| Enable/disable rule | Enabled iff list non-empty **AND** a row is selected (`ItemIndex != -1`) | `UpdateButs()` |
| Boundary handling | Buttons stay **enabled** at first/last row; click handler silently no-ops | `BitBtn5Click` / `BitBtn6Click` |
| Selection after move | Follows the moved row (`ItemIndex = pos∓1`) | both handlers |
| Overflow | **Move Up only**: `strcpy` into `char buffer[25]`. Move Down already safe | `BitBtn5Click` |
| Reorder mechanism | String swap between adjacent `Strings[]` entries | both handlers |

## 2. Design Decisions

- **Enable rule:** enabled iff a row selected; boundary clicks silently no-op. Earlier "disable at first/last row" idea **rejected** — original never disables at boundaries. `FIDELITY`.
- **Selection model:** row highlight via row-mousedown / input focus (rev 1 uses editable inputs, not a listbox). `DEVIATION:[selection-model]`.
- **Reorder mechanism:** detach-and-splice of live DOM row nodes; `nameInputs` kept in step. `FIX:[players.cpp-strcpy]`.
- **Remove-while-selected:** deleting the selected row clears selection (VCL behavior); deleting an earlier row shifts the index.

## 3. Issuance History (protocol-relevant)

1. First code issuance had defects (pane-vs-row index confusion, stale `rowIdx` captures, class-as-text), caught in self-review — reissued corrected same session.
2. **Transcription drift incident:** the reissued artifact read `row.netWealth` correctly; the on-disk workspace copy diverged at the `standingsDialog` standings-table line — `row.netWorth` (see §5). Root cause of the Session 18 regression. Lesson: on-disk state must be re-verified after every artifact reissue, not assumed identical.

## 4. Tag Ledger

- `FIDELITY:[players.cpp — single Move Up/Move Down pair, right column, both initially disabled]`
- `FIDELITY:[buttons enabled iff a row is selected; boundary clicks silently no-op]`
- `FIDELITY:[selection follows the moved row, permitting click-walking]`
- `FIX:[orig BitBtn5Click strcpy into char buffer[25] — replaced by DOM node splice]`
- `DEVIATION:[selection = row highlight + mousedown/focus, not orig listbox model]`
- `FIX:[rev-2 first-issuance defects — reissued corrected same session]`
- `FIX:[standings-networth-typo — on-disk dialogs.ts read row.netWorth vs scaffold's FinalStanding.netWealth; one-line rename, verified fix]`
- `FIX:[pipeline-no-typecheck — Session 19a: tsc gate added to build.sh; infrastructure only, no shipped-behavior change, no DEVIATION warranted]`
- `FIDELITY:[players.dfm-caption — dialog heading "Player Information", not "New Game"]` *(19b)*
- `FIDELITY:[players.cpp-maxlength — name inputs MaxLength = 15 (orig comment: "Maximum name length=15 chars + NULL")]` *(19b)*
- `FIDELITY:[players.cpp-updatebuts-go — Go! disabled iff list empty, per orig UpdateButs() BitBtn3 branch]` *(19b)*
- `FIDELITY:[players.cpp-btbtn2click-remove-guard-dropped — orig removes unconditionally; port's length>1 guard removed so the list CAN reach empty]` *(19b)*
- `DEVIATION:[prefill-single — port prefills one "Player 1" row; orig starts empty (Go! disabled on entry). Lee-approved, solo quick-start]` *(19b)*
- `FIDELITY:[menupdate-polarity — port mainUpdate() maps all five MenuUpdate() gates with exact polarity; High Scores/About/Quit ungated in both]` *(19c)*
- `VERIFIED-NO-DEFECT:[doconclude-force-reentry — bootstrap open item #2: End Game self-disables via mainUpdate() on both conclusion paths; force=true reachable only while progress, mirroring orig EndGame1Click]` *(19c — new ledger category, introduced here)*

## 5. REGRESSION REPORT — CLOSED

**Symptom:** End Game and natural game end showed no standings modal, no high-scores modal; console: `TypeError: can't access property "toString", amount is undefined` at `formatMoney`, 4× repeats.

**Root cause:** Property-name typo in the on-disk `dialogs.ts` `standingsDialog` standings-table loop — `row.netWorth` where the scaffold type (`FinalStanding`) and producer (`finishStandings`) define `netWealth`. TS-level type error (VSCode flagged it; the IDE diagnostic was available but unnoticed during debugging) that shipped anyway because the build pipeline transpiles without type-checking (esbuild-style). At runtime `row.netWorth === undefined` → `formatMoney(undefined)` → `amount.toString()` throws mid-table-build, aborting before `modal()` appended the overlay — hence "nothing appears."

**Diagnosis trail (for the record):** healthy instrumented standings payload ruled out the data; grep proved the bundle current (ruled out stale build); Firefox's odd stack attribution (anonymous arrows attributed to enclosing functions, e.g. `doConclude` frames and the phantom `endGame` name) initially suggested impossible call edges and sent investigation toward bundle corruption. Stack was truthful; the named-frame misattribution was the red herring.

**Resolution:** one-line rename `netWorth` → `netWealth` in dialogs.ts. **Verified: both end paths (End Game menu, natural final Continue) now show standings modal → tabbed high-scores modal.**

**Mitigations recommended (procedural):**
1. **Add `tsc --noEmit` as a pre-build gate** — ✅ **IMPLEMENTED Session 19a (§8).**
2. **Treat IDE diagnostics as first-class evidence** — check the Problems panel before runtime debugging. Reinforced 19a: misconfigured toolchains also mislead, in the opposite direction (false errors from wrong lib target — §8.3).
3. **Re-verify on-disk state after artifact reissues** — divergence between artifact and workspace is now a demonstrated failure mode (§3.2).
4. High-score table confirmed unpolluted by the four failed attempts: winner's 9,600 vs. 1,000,000 default floor meant no insertion qualified, so no duplicate/malformed entries were written. (Also incidentally reconfirms the "no duplicate insertions" baseline item held.)

## 6. Verification Status — ALL CLOSED

| Check | Result |
|---|---|
| Reorder buttons, Go! turn-order commit, remove-while-selected | **Verified** |
| End Game path → standings modal → high-scores modal | **Verified** (post-fix) |
| Natural game end (final Continue) → same sequence | **Verified** (post-fix) |
| High-scores storage integrity | **Confirmed clean** |
| Bootstrap §6 baseline | Exercise during testing; no outstanding anomalies reported |

**Player reorder task and end-game regression: CLOSED.**

## 7. Out-of-Scope Observations (logged, not acted on)

- ~~Dialog caption: orig "Player Information"; port "New Game".~~ **DONE 19b (§10).**
- ~~Go! disable vs. status message when list empty.~~ **DONE 19b (§10).**
- ~~Name length: orig `MaxLength = 15`; port unbounded.~~ **DONE 19b (§10).**
- Tournament fallback: scaffold `startGame` verified to replicate orig 1-player TOURNAMENT → CLASSIC downgrade (`QUIRK-FIDELITY:[tournament-downgrade]`) — closed from prior open item. *(Relevant to solo play: one player + Tournament auto-downgrades to Classic, faithful.)*
- ~~`doConclude(true)` after conclusion: candidate defect.~~ **CLOSED 19c — verified NOT a defect (§11).**
- Carried forward: TOURNAMENT spot-check (rev-11 R15 caveat), unrun secondary checks, verify-before-ship trivia, tile-art extraction seam.

## 8. SESSION 19a — BUILD GATE (bootstrap open item #1) — CLOSED

### 8.1 Objective

Make type errors fail the build, per Session 18 §5 mitigation 1 — the single guard that would have prevented the entire Session 18 regression hunt. Infrastructure change only; no shipped behavior affected, hence no `DEVIATION` tag.

### 8.2 Toolchain discovery saga

1. `npx tsc --noEmit` initially printed version/usage text only. Root cause: **npm resolved `tsc` to the deprecated `tsc@2.0.4` shim package** (pre-TypeScript-era artifact, no type-checking at all), not the TypeScript compiler. The `npm WARN deprecated tsc@2.0.4` line confirmed it. Lesson: a bare `npx <name>` fetches whatever package owns that name on npm; verify the resolved binary is the intended tool.
2. Resolved by installing native `tsc` via apt and invoking directly (no `npx`).
3. First honest run produced **58 errors across all 3 files** — but all of class TS2583 / TS2550 / TS2737 ("Cannot find name 'BigInt'", "Property 'from' does not exist", "BigInt literals not available when targeting lower than ES2020"): tsc's *default* target/lib assumes a pre-ES2015 standard library, while the port legitimately uses `BigInt`, `Array.from`, `Set`, `startsWith`, and `1n` literals throughout. **False alarms from misconfiguration, zero genuine type errors.** Retroactively confirms the Session 18 `netWealth` rename was the only latent type breakage in the tree.
4. Correction: `--target es2020 --lib es2020,dom` (DOM lib required — renderer/dialogs touch `HTMLElement` et al.). Clean exit. Runtime output was never at risk: esbuild targets modern browsers regardless; this was purely about what the checker believes exists.

### 8.3 Resulting on-disk changes (tooling only)

- **New `tsconfig.json`** (minimal, no `strict`): `target: es2020`, `lib: [es2020, dom]`, `noEmit: true`, files = `scaffold.ts`, `renderer.ts`, `dialogs.ts`.
- **`build.sh` (canonical build, gated):**
  ```
  tsc && npx esbuild renderer.ts --bundle --format=iife --global-name=SM --outfile=bundle.js
  ```
  `&&` chaining: tsc exit code gates esbuild — a type error aborts the build before `bundle.js` is written.
- `check.sh` superseded/retired (its flag-laden manual command was replaced by tsconfig-driven `tsc`); keep only if a standalone type-check entry point is wanted.
- `strict: true` deliberately **not** enabled — separate future decision; would surface a batch of null-flow/uninitialized-field warnings in code written without it.

### 8.4 Verification record

1. **Baseline:** tsconfig-driven `tsc` exits clean (post-lib correction).
2. **Positive:** full `./build.sh` green — bundle 77.1 kb, esbuild banner, fresh output.
3. **Negative (gate proven able to fail):** sabotaged `dialogs.ts:680` (`view.sharesOwned` → `view.sharesOwnd`) → tsc error at exact line/column (property not on view type — same error class as Session 18's `netWorth`), build aborted, no esbuild run, `bundle.js` not rewritten. Line reverted; rerun green. **Full fail→held→fix→pass cycle witnessed.**

### 8.5 Baseline amendment

Regression baseline gains: **gated build passes (`./build.sh` green)**; expected-negative: sabotaged type error blocks the bundle. Going forward, transcription drift against the types is caught at build time before it reaches `bundle.js` — the Session 18 failure mode is structurally closed.

## 9. Open Items (post-Session 19)

1. ~~Build gate~~ **CLOSED (§8).**
2. ~~`doConclude(true)` post-game re-entry~~ **CLOSED — verified not a defect (§11).**
3. ~~Cosmetic backlog~~ **CLOSED — verified (§10.4).**
4. Carried from §7: TOURNAMENT spot-check, unrun secondary checks, verify-before-ship trivia sweep (incl. §11.6 `.dfm` initial-menu-state trivia), tile-art extraction seam.
5. Housekeeping: cross-reference §11 in `RENDERER-NOTES.md` (that archive is renderer-layer; this verification concerns `renderer.ts` but was recorded here as the active session record).

## 10. SESSION 19b — COSMETIC BACKLOG (bootstrap open item #3) — CLOSED

### 10.1 Source verification (Players.cpp + Players.dfm, submitted this session)

| Item | Original evidence | Port before |
|---|---|---|
| Dialog caption | `.dfm` TPlayInfo: `Caption "Player Information"` | heading read "New Game" |
| Name length | `.dfm` Edit1 `MaxLength` property; `BitBtn1Click` comment "Maximum name length=15 chars + NULL" | inputs unbounded |
| Go! on empty list | `UpdateButs()`: `Count == 0` → `BitBtn3 (Go!) Enabled = false`, else `true` | never disabled; click shows status message instead |

All three claims verified against submitted sources — no unverified claims in the resulting code.

### 10.2 Design decision — option C (Lee's call)

The Go! rule is only observable if the list can reach empty. In the port the empty state was previously **unreachable**: rev 1 prefilled two rows AND guarded the per-row remove buttons with `nameInputs.length > 1`. Options considered: (A) add the rule as dead code; (B) full fidelity — also drop the prefill and start empty like orig; (C) drop the remove-guard and disable Go! at zero, keeping a (now single-row) prefill. **Chosen: C**, with Lee's amendment: prefill is **one** row ("Player 1") rather than two — solo quick-start; a second player is one "+ Add player" click away.

- `DEVIATION:[prefill-single]` replaces the implicit rev-1 two-row prefill (which was itself undocumented relative to orig's empty start — now properly ledgered).
- Orig's `BitBtn3Click` guards with `if (numplays > 0)`; the port's dead `names.length < 1` status branch is **removed** — its job moves to the disabled state, matching orig mechanics.
- `status` element retained (layout parity with other dialogs) but now idle in `newGameDialog`.
- Orig `UpdateButs()` also conditions a shared **Remove** button on selection; the port's per-row "−" buttons are inherently row-scoped, so that clause is subsumed under the existing `DEVIATION:[selection-model]` — not separately implemented.

### 10.3 Implementation summary (dialogs.ts rev 3)

All changes confined to `newGameDialog`:

1. Heading `'New Game'` → `'Player Information'`.
2. `addName`: `inp.maxLength = 15;` (hard clamp at entry, as the VCL edit control did; Go!'s existing `trim()` retained).
3. Prefill: single `addName('Player 1')`.
4. Remove-guard dropped: per-row "−" deletes unconditionally (orig `BitBtn2Click`); last-row deletion falls through to `setSelected(-1)`.
5. `updateMoveButs()` → `updateButs()` (orig name), now also setting `go.disabled = nameInputs.length === 0`. Called from `setSelected` (covers removes), from the Add button (covers adds — orig `BitBtn1Click` calls `UpdateButs` post-add), and initial state set once at `go` creation. Add button's count cap (`MAX_PLAYERS`) unchanged.
6. Go! handler: unreachable empty-list branch deleted.

### 10.4 Verification record (Lee, live)

| Check | Result |
|---|---|
| Heading reads "Player Information" | **Verified** |
| One prefilled row "Player 1"; Go! enabled | **Verified** |
| Remove all players → Go! disabled | **Verified** |
| "+ Add player" → Go! re-enables | **Verified** |
| Clicking Go! starts the game | **Verified** |
| `./build.sh` green (gate guards transcription) | **Verified** |

Remaining unrun from the §10.4 draft list: the >15-char clamp check, the Session 18 reorder/click-walking re-run, and the solo-Tournament auto-downgrade confirmation. Fold into the §9 item-4 sweep.

## 11. SESSION 19c — OPEN ITEM #2 VERIFICATION: `doConclude(true)` RE-ENTRY — CLOSED, NO DEFECT

### 11.1 The claim under test

Bootstrap open item #2 / §7: "End Game menu re-enables post-game (`endGame.disabled = !s.progress`) and force=true bypasses the `concluded` guard — clicking End Game after a game concludes re-runs the tail (re-insert + `finishStandings` over post-`createComs` state). Candidate defect."

### 11.2 Sources submitted

`OverForm.cpp` (Finish()), `SMMain.cpp` (BitBtn1Click, EndGame1Click, MenuUpdate, closemain), `scaffold.ts` (finishStandings, concludeGame), `renderer.ts` rev 13.

### 11.3 Static analysis — the claimed chain is unreachable

Trace: `doConclude` — **both** branches — runs its synchronous sequence to completion, ending in `this.mainUpdate()` *before* `standingsDialog(...)` is called. `mainUpdate()`'s final block is the port's `MenuUpdate`:

```typescript
this.menuButtons['newGame'].disabled = s.progress;
this.menuButtons['newGrid'].disabled = s.progress;
this.gridSizeSelect.disabled = s.progress;
this.menuButtons['prefs'].disabled = s.progress;
this.menuButtons['endGame'].disabled = !s.progress;
```

`s.progress` is `false` on both conclusion paths at that moment (menu force branch sets it; natural end arrives via `advanceTurn` having set it), so **End Game is disabled the instant either conclusion fires** and stays disabled until `startGame` sets `progress = true` again. `menuButtons['endGame']` is assigned in exactly two places in rev 13 — creation and this line (grep-confirmed).

### 11.4 Polarity mapping vs. orig `MenuUpdate()`

| Orig `SMMain.cpp` | Port `renderer.ts` | Match |
|---|---|---|
| `CreateNewGrid1->Enabled = !progress` | `newGrid.disabled = s.progress` | ✓ |
| `GridSize1->Enabled = !progress` | `gridSizeSelect.disabled = s.progress` | ✓ |
| `EndGame1->Enabled = progress` | `endGame.disabled = !s.progress` | ✓ |
| `NewGame1->Enabled = !progress` | `newGame.disabled = s.progress` | ✓ |
| `Preferences1->Enabled = !progress` | `prefs.disabled = s.progress` | ✓ |
| High Scores / About / Quit — not gated | not gated | ✓ |

All five gated items and all three ungated items match. This is a faithful port of `MenuUpdate()`, not a partial one — the "only tracks endGame" worry raised mid-session proved unfounded.

**Key insight:** the original has no `concluded` flag and no guard inside `Finish()`; **the menu state IS the guard**. Post-game, End Game is simply not clickable because `EndGame1Click` sets `progress=false` and then calls `MenuUpdate()`, which disables the very item that invoked it. The port reproduces this mechanism exactly.

### 11.5 `force=true` is correct behavior, not a defect

Orig `EndGame1Click` deliberately concludes mid-game with **no guard** — End Game is *supposed* to work while playing. In the port, `force=true` is reachable only while `progress` is true (the button is disabled otherwise), which is precisely the original's reachable state. The `concluded` guard exists to protect the *renderer-specific* Continue/"See Results" viewer path — a port addition for a control the original didn't have (orig's `BitBtn1` is `!sels & progress`, also self-disabling).

Theoretical double-activation hole: `force=true` has no internal guard, so a hypothetical second synchronous invocation would re-run the tail. This is **faithful** — orig `EndGame1Click` is equally unguarded, and in both implementations the sole protection is the menu disabling itself. Unreachable in practice (browsers do not dispatch `click` on disabled buttons, and the first handler's `mainUpdate()` disables it synchronously).

Tail composition also checked: orig redraws the board (clearing selection boxes) before `Finish()`; the port's `redrawGrid()` runs after `createComs` but still synchronously before the modal is appended/painted. The grid's cell contents are unchanged by `createComs` (it resets company *records*, not cells), so the final painted board state is identical — no observable gap.

Trivia (non-issue): the force branch sets `s.progress = false` twice (branch + shared line). Harmless redundancy; no behavioral effect.

### 11.6 Empirical confirmation (Lee, live)

> "Clicking 'End Game' indeed closes out the game and disables the button until a new game is started."

Static analysis and observed behavior agree. **Open item #2: CLOSED — verified faithful, no defect. No code change.**

### 11.7 Residual unverified trivia

Orig `FormCreate` calls `MainUpdate()` but **not** `MenuUpdate()` — so the original's *initial* menu enablement comes from `SMMain.dfm` control defaults, which have not been inspected. The port initializes via `mainUpdate()` (New Game / Create New Grid / Grid Size / Preferences enabled; End Game disabled). Almost certainly matches, but unverifiable without the `.dfm`. Logged for the verify-before-ship sweep (§9 item 4); no action proposed.

---
*Session 18: player reorder + end-game regression — closed. 19a: build gate — closed. 19b: cosmetic backlog — closed, verified. 19c: item-#2 verification — closed, no defect. Remaining: §9 item-4 sweep (TOURNAMENT spot-check, unrun secondary checks, verify-before-ship trivia incl. §11.7, tile-art seam) and the RENDERER-NOTES cross-reference.*
