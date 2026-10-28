# DIALOGS-NOTES.md — Session 18–19 Record (rev 4)

**Artifacts:** `dialogs-ts` (code, rev 3); `dialogs-notes` (this document)
**Rev:** 4 — Sessions 18 (closed) + 19 build gate (closed, §8) + 19 cosmetics (§10)
**Sessions:** 18, 19
**Files affected:** Session 19a: tooling only (`tsconfig.json` new, `build.sh` gated; zero shipped-code edits). Session 19b: `dialogs.ts` only (rev 3; scaffold, renderer untouched).

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
- `FIX:[pipeline-no-typecheck — Session 19: tsc gate added to build.sh; infrastructure only, no shipped-behavior change, no DEVIATION warranted]`
- `FIDELITY:[players.dfm-caption — dialog heading "Player Information", not "New Game"]` *(Session 19b)*
- `FIDELITY:[players.cpp-maxlength — name inputs MaxLength = 15 (orig comment: "Maximum name length=15 chars + NULL")]` *(Session 19b)*
- `FIDELITY:[players.cpp-updatebuts-go — Go! disabled iff list empty, per orig UpdateButs() BitBtn3 branch]` *(Session 19b)*
- `FIDELITY:[players.cpp-btbtn2click-remove-guard-dropped — orig removes unconditionally; port's length>1 guard removed so the list CAN reach empty]` *(Session 19b)*
- `DEVIATION:[prefill-single — port prefills one "Player 1" row; orig starts empty (Go! disabled on entry). Lee-approved, solo quick-start]` *(Session 19b)*

## 5. REGRESSION REPORT — CLOSED

**Symptom:** End Game and natural game end showed no standings modal, no high-scores modal; console: `TypeError: can't access property "toString", amount is undefined` at `formatMoney`, 4× repeats.

**Root cause:** Property-name typo in the on-disk `dialogs.ts` `standingsDialog` standings-table loop — `row.netWorth` where the scaffold type (`FinalStanding`) and producer (`finishStandings`) define `netWealth`. TS-level type error (VSCode flagged it; the IDE diagnostic was available but unnoticed during debugging) that shipped anyway because the build pipeline transpiles without type-checking (esbuild-style). At runtime `row.netWorth === undefined` → `formatMoney(undefined)` → `amount.toString()` throws mid-table-build, aborting before `modal()` appended the overlay — hence "nothing appears."

**Diagnosis trail (for the record):** healthy instrumented standings payload ruled out the data; grep proved the bundle current (ruled out stale build); Firefox's odd stack attribution (anonymous arrows attributed to enclosing functions, e.g. `doConclude` frames and the phantom `endGame` name) initially suggested impossible call edges and sent investigation toward bundle corruption. Stack was truthful; the named-frame misattribution was the red herring.

**Resolution:** one-line rename `netWorth` → `netWealth` in dialogs.ts. **Verified: both end paths (End Game menu, natural final Continue) now show standings modal → tabbed high-scores modal.**

**Mitigations recommended (procedural):**
1. **Add `tsc --noEmit` as a pre-build gate** — ✅ **IMPLEMENTED Session 19 (§8).**
2. **Treat IDE diagnostics as first-class evidence** — check the Problems panel before runtime debugging. Reinforced Session 19: misconfigured toolchains also mislead, in the opposite direction (false errors from wrong lib target — see §8.3).
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

- ~~Dialog caption: orig "Player Information"; port "New Game".~~ **DONE Session 19b (§10).**
- ~~Go! disable vs. status message when list empty.~~ **DONE Session 19b (§10).**
- ~~Name length: orig `MaxLength = 15`; port unbounded.~~ **DONE Session 19b (§10).**
- Tournament fallback: scaffold `startGame` verified to replicate orig 1-player TOURNAMENT → CLASSIC downgrade (`QUIRK-FIDELITY:[tournament-downgrade]`) — closed from prior open item. *(Relevant to solo play: one player + Tournament selected auto-downgrades to Classic, faithful.)*
- `doConclude(true)` after conclusion: End Game menu re-enables post-game (`endGame.disabled = !s.progress`) and force=true bypasses the `concluded` guard — clicking End Game after a game concludes re-runs the tail (re-insert + `finishStandings` over post-`createComs` state). Candidate defect; needs a decision (guard vs. orig behavior verification). **Bootstrap open item #2 — now the top open item.**
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

## 9. Open Items (post-Session 19, priority order)

1. ~~Build gate~~ **CLOSED (§8).**
2. `doConclude(true)` post-game re-entry (see §7) — **top open item.**
3. ~~Cosmetic backlog~~ **DONE, pending verification (§10).**
4. Carried from §7: TOURNAMENT spot-check, unrun secondary checks, verify-before-ship trivia sweep, tile-art extraction seam.

## 10. SESSION 19b — COSMETIC BACKLOG (bootstrap open item #3)

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
5. `updateMoveButs()` → `updateButs()` (orig name), now also setting `go.disabled = nameInputs.length === 0`. Called from `setSelected` (covers removes), from the Add button (covers adds — orig `BitBtn1Click` calls `UpdateButs` post-add), and initial state set once at `go` creation (`go.disabled = nameInputs.length === 0;`). Add button's count cap (`MAX_PLAYERS`) unchanged.
6. Go! handler: unreachable empty-list branch deleted.

### 10.4 Verification checklist (Lee to run)

1. `./build.sh` green (gate now guards transcription too).
2. New-game dialog: heading reads "Player Information"; one prefilled row "Player 1"; Go! enabled.
3. Empty the list (remove the last row) → move pair AND Go! all disabled; no status message.
4. "+ Add player" → Go! re-enables.
5. Type >15 chars in a name input → clamped at 15.
6. Remove-while-selected, reorder, click-walking, Go! turn-order commit — re-run Session 18 checks (same code paths touched).
7. Solo game start + Tournament selected → auto-downgrades to CLASSIC (existing quirk; easiest to confirm now that solo is the default start).

---
*Session 18: player reorder + end-game regression — closed. Session 19a: build gate — closed. Session 19b: cosmetic backlog — code issued rev 3, verification pending. Next: §7 `doConclude(true)` post-game re-entry (needs orig `OverForm.cpp` / end-menu sources), or Lee's call.*
