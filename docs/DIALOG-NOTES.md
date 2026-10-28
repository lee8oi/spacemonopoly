# DIALOGS-NOTES.md — Player Reorder + End-Game Regression Record (rev 2, closed)

**Artifact:** `dialogs-ts`
**Rev:** 2 — reorder verified; end-game regression diagnosed and resolved (Session 18)
**Session:** 18
**Files affected:** `dialogs.ts` only (one line). Scaffold, renderer untouched.

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

## 5. REGRESSION REPORT — CLOSED

**Symptom:** End Game and natural game end showed no standings modal, no high-scores modal; console: `TypeError: can't access property "toString", amount is undefined` at `formatMoney`, 4× repeats.

**Root cause:** Property-name typo in the on-disk `dialogs.ts` `standingsDialog` standings-table loop — `row.netWorth` where the scaffold type (`FinalStanding`) and producer (`finishStandings`) define `netWealth`. TS-level type error (VSCode flagged it; the IDE diagnostic was available but unnoticed during debugging) that shipped anyway because the build pipeline transpiles without type-checking (esbuild-style). At runtime `row.netWorth === undefined` → `formatMoney(undefined)` → `amount.toString()` throws mid-table-build, aborting before `modal()` appended the overlay — hence "nothing appears."

**Diagnosis trail (for the record):** healthy instrumented standings payload ruled out the data; grep proved the bundle current (ruled out stale build); Firefox's odd stack attribution (anonymous arrows attributed to enclosing functions, e.g. `doConclude` frames and the phantom `endGame` name) initially suggested impossible call edges and sent investigation toward bundle corruption. Stack was truthful; the named-frame misattribution was the red herring.

**Resolution:** one-line rename `netWorth` → `netWealth` in dialogs.ts. **Verified: both end paths (End Game menu, natural final Continue) now show standings modal → tabbed high-scores modal.**

**Mitigations recommended (procedural):**
1. **Add `tsc --noEmit` (or `tsc -b`) as a pre-build gate** so type errors fail the build. This single guard would have prevented the entire session-long regression hunt.
2. **Treat IDE diagnostics as first-class evidence** — check the Problems panel before runtime debugging.
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
- `doConclude(true)` after conclusion: End Game menu re-enables post-game (`endGame.disabled = !s.progress`) and force=true bypasses the `concluded` guard — clicking End Game after a game concludes re-runs the tail (re-insert + `finishStandings` over post-`createComs` state). Candidate defect; needs a decision (guard vs. orig behavior verification).
- Carried forward: TOURNAMENT spot-check (rev-11 R15 caveat), unrun secondary checks, verify-before-ship trivia, tile-art extraction seam.
