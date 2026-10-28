# DIALOGS-NOTES.md — Player Reorder + End-Game Regression Record (rev 3) + Session 19 Build Gate

**Artifacts:** `dialogs-ts` (code, rev 2 — unchanged this session); `dialogs-notes` (this document)
**Rev:** 3 — Session 18 record (closed) + Session 19 build-gate record (closed)
**Sessions:** 18, 19
**Files affected, Session 19:** build tooling only — new `tsconfig.json`, revised `build.sh`. **Zero edits to `scaffold.ts`, `renderer.ts`, `dialogs.ts`.**

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

- Dialog caption: orig "Player Information"; port "New Game".
- Go! disable vs. status message when list empty.
- Name length: orig `MaxLength = 15`; port unbounded.
- Tournament fallback: scaffold `startGame` verified to replicate orig 1-player TOURNAMENT → CLASSIC downgrade (`QUIRK-FIDELITY:[tournament-downgrade]`) — closed from prior open item.
- `doConclude(true)` after conclusion: End Game menu re-enables post-game (`endGame.disabled = !s.progress`) and force=true bypasses the `concluded` guard — clicking End Game after a game concludes re-runs the tail (re-insert + `finishStandings` over post-`createComs` state). Candidate defect; needs a decision (guard vs. orig behavior verification). **This is bootstrap open item #2 — next priority after cosmetics if taken in order.**
- Carried forward: TOURNAMENT spot-check (rev-11 R15 caveat), unrun secondary checks, verify-before-ship trivia, tile-art extraction seam.

## 8. SESSION 19 — BUILD GATE (bootstrap open item #1) — CLOSED

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

Regression baseline gains: **gated build passes (`./build.sh` green)**; expected-negative: sabotaged type error blocks the bundle.

## 9. Open Items (post-Session 19, priority order)

1. ~~Build gate~~ **CLOSED (§8).**
2. `doConclude(true)` post-game re-entry (see §7).
3. Cosmetic backlog per orig `Players.cpp`/`.dfm` (see §7): caption, Go!-empty disable, `MaxLength = 15`. Requires source citations before writing diffs.
4. Carried from §7: TOURNAMENT spot-check, unrun secondary checks, verify-before-ship trivia sweep, tile-art extraction seam.

---
*Session 18: player reorder + end-game regression — closed. Session 19: build gate — closed. Next: Lee's call; default candidate per bootstrap = cosmetic backlog, pending source excerpts.*
