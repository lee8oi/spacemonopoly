# DIALOGS-NOTES.md — Player Reorder Design Record

**Artifact:** `dialogs-ts`
**Target rev:** 2 (from rev 1, Session 17 split)
**Session:** 18
**Scope:** New-game setup dialog — Move Up / Move Down player reordering
**Files touched:** `dialogs.ts` only. `renderer.ts` rev 13, `scaffold.ts` (frozen Session 13) untouched.

---

## 1. Task Statement

Port the original's Move Up / Move Down controls from `Players.cpp` (BitBtn5 / BitBtn6) into the new-game setup dialog. Cosmetic backlog item #1.

**Hard constraint:** the original performs `strcpy` into `char buffer[25]` during the reorder. That is an overflow pattern and must **not** be reproduced. The port replicates the UX only, swapping by reference.

---

## 2. Design Finding — Layout Divergence From Bootstrap

| Aspect | Bootstrap Session 18 | Original (`Players.cpp` + screenshot) |
|---|---|---|
| Control count | One `↑` + one `↓` per player row | **One** Move Up + **one** Move Down for the whole list |
| Placement | Beside each name row | Right-hand button column, top-aligned to the list box |
| Target of action | That row | The **selected** entry in the list box |
| Disable rule | Row 1 Up off; last row Down off | Applies to selection index instead |

**Recommendation: follow the original (Option A).** It satisfies your point 1 (separate column) and point 2 (matches existing dialog element styling, since Add/Remove/Go!/Cancel already live in that column). Per-row buttons would be a `DEVIATION` with no upside, and would break the visual parity the R15/R16 verifications were built on.

Reference layout, read from the screenshot:

```
┌─ Play...tion ───────────────────────────┐
│ [ Players ] [ Game Type ]               │
│ ┌───────────────┐  ┌──────────────────┐ │
│ │ Lee           │  │   Move Up        │ │
│ │               │  ├──────────────────┤ │
│ │               │  │   Move Down      │ │
│ │               │  │                  │ │
│ │               │  │                  │ │
│ └───────────────┘  ├──────────────────┤ │
│  Name: [ Lee     ] │   Remove         │ │
│                    ├──────────────────┤ │
│                    │   Add            │ │
│                    └──────────────────┘ │
│              [ Go! ]  [ Cancel ]        │
└─────────────────────────────────────────┘
```

Left column: list box, then `Name:` label + text field beneath it.
Right column: move pair at top, edit pair at bottom (Remove aligned to the name row, Add below it).

---

## 3. Option A — Implementation Plan (recommended)

### 3.1 Markup structure

Wrap the existing list box and the new buttons in a two-column flex container. Existing rev 1 nodes are reused, not replaced.

```html
<div class="ng-players-pane">
  <div class="ng-pane-left">
    <ul id="ng-player-list" class="ng-listbox" role="listbox" aria-label="Players"></ul>
    <div class="ng-name-row">
      <label for="ng-name-input">Name:</label>
      <input id="ng-name-input" class="dlg-input" type="text" />
    </div>
  </div>

  <div class="ng-pane-right">
    <div class="ng-btn-group">
      <button id="ng-move-up"   class="dlg-btn" type="button">Move Up</button>
      <button id="ng-move-down" class="dlg-btn" type="button">Move Down</button>
    </div>
    <div class="ng-btn-group">
      <button id="ng-remove" class="dlg-btn" type="button">Remove</button>
      <button id="ng-add"    class="dlg-btn" type="button">Add</button>
    </div>
  </div>
</div>
```

Names above are indicative — rev 2 must bind to whatever rev 1 actually calls these nodes. Class names reuse the existing dialog button class so styling is inherited rather than redefined (your point 2).

### 3.2 CSS

Only layout, no new visual vocabulary:

```css
.ng-players-pane {
  display: flex;
  gap: 8px;
  align-items: stretch;
}
.ng-pane-left  { display: flex; flex-direction: column; flex: 1 1 auto; min-width: 0; }
.ng-pane-right { display: flex; flex-direction: column; justify-content: space-between; flex: 0 0 auto; }
.ng-btn-group  { display: flex; flex-direction: column; gap: 6px; }
.ng-listbox    { flex: 1 1 auto; overflow-y: auto; }
```

`justify-content: space-between` reproduces the original's split — move pair pinned to the top of the column, edit pair to the bottom.

### 3.3 Reorder routine — reference-safe swap

```ts
const MAX_PLAYERS = 6; // unchanged

/** Move the currently selected player by `delta` (-1 = up, +1 = down). */
function reorderSelectedPlayer(delta: number): void {
  const list = getPlayerListEl();
  const idx = getSelectedPlayerIndex();
  const rows = Array.from(list.children) as HTMLElement[];
  const next = idx + delta;

  if (idx < 0 || next < 0 || next >= rows.length) return;

  // Detach-and-splice on live DOM node references.
  // No string copying, no fixed-size buffer, no index arithmetic against a
  // C-style char array -- deliberately diverges from Players.cpp's
  // strcpy(char[25]) path.
  const [row] = rows.splice(idx, 1);
  rows.splice(next, 0, row);

  list.replaceChildren(...rows); // preserves node identity and bound listeners
  setSelectedPlayerIndex(next);  // selection follows the moved row
  syncReorderButtons();
}
```

`replaceChildren` moves the existing nodes; it does not clone or reparse them. Any listeners or per-row dataset attributes attached at build time survive the swap. This is the whole reason the port is safe where the original was not.

If rev 1 builds rows by re-rendering from a player array instead of keeping node references, the equivalent move is a single `splice` on that array followed by the existing render call — functionally identical, still no buffer involved.

### 3.4 Enable/disable synchronisation

Called after every structural change (add, remove, reorder, selection change):

```ts
function syncReorderButtons(): void {
  const count = getPlayerListEl().children.length;
  const idx = getSelectedPlayerIndex();

  setUpDisabled(idx <= 0 || idx >= count);          // nothing selected, or first row
  setDownDisabled(idx < 0 || idx >= count - 1);     // nothing selected, or last row
}
```

Boundaries covered:

- zero or one player → both disabled
- first row selected → Up disabled, Down enabled
- last row selected → Down disabled, Up enabled
- middle row → both enabled
- no selection → both disabled
- at `MAX_PLAYERS = 6` → reordering unaffected (unlike Add, which stays capped)

### 3.5 Interaction

- Click a row → selects it, `syncReorderButtons()` runs.
- Move Up / Move Down → `reorderSelectedPlayer(±1)`.
- Selection follows the moved row, so a user can hold-click to walk a player up several places.
- **No animation, no transition, no scroll smoothing** — instant DOM swap, per your point 3.
- Keyboard parity (optional, cheap): `Alt+ArrowUp` / `Alt+ArrowDown` on a focused row routes to the same routine.

### 3.6 What does not change

- Add / Remove behaviour, including the 6-player cap and the name-field binding.
- `Go!` / `Cancel` semantics.
- Player order is still fixed at new-game commit — reordering only affects the draft list inside the dialog. **No game-logic change.** Scaffold untouched.
- Prefs draft-commit flow (R8 faithful-dead) is not in this path; the players pane is dialog-local state until `Go!`.

---

## 4. Option B — Per-Row Buttons (deferred, not recommended)

Kept on record only in case rev 1 turns out to be structurally row-oriented with no selection model to bind to. Under this variant each row carries its own `↑` / `↓`, with row 0's Up and row N-1's Down disabled, and the swap acts on that row's index rather than on a selection cursor. It costs two extra buttons per row (up to 24 extra focus targets at max players), departs visually from the original, and would need a `DEVIATION` tag with justification. Do not ship this without confirming the original's selection model really is absent.

---

## 5. Tag Ledger

- `FIDELITY:[players.cpp BitBtn5/BitBtn6 — single move pair in the right-hand button column, acting on the selected list entry]`
- `FIDELITY:[add/remove pair retains its position and behaviour]`
- `FIX:[orig Players.cpp strcpy into char buffer[25] during reorder — overflow pattern removed; port swaps DOM node references]`
- `QUIRK-[selection follows the moved row, permitting repeated click-walking]`
- `DEVIATION:[port disables inapplicable move buttons; whether the original greys out or silently no-ops is unverified — see §7]`

---

## 6. Regression Impact (bootstrap §6 subset)

Unaffected by this change, expected to remain green: boot circles, same-size new game keeps circles, grid-size reroll, founding → trade dialog chain, split/merger tables (R15), triple merge → split, both end paths → standings + tabbed scores (R16), no duplicate high-score insertions, fraudster messages, prefs flow, quit confirm.

Directly exercised by this change:

1. Add six players → reorder works at the cap.
2. Move a player from position 1 to 6 and back; confirm order persists through `Go!`.
3. Select first row → Up disabled. Select last row → Down disabled.
4. Remove the selected player → selection and button states re-sync, no stale cursor.
5. Add a player while the last row is selected → Down re-enables correctly.
6. Cancel after reordering → reopened dialog shows a clean default order (confirm rev 1's reset behaviour holds).
7. Names and any per-row metadata travel with the row on move (no mis-pairing).

---

## 7. Open Items Carried Forward

- **Verify original disable behaviour.** If `Players.cpp` leaves the move buttons permanently enabled and simply no-ops at the boundaries, the port's disabled state becomes a deliberate `DEVIATION` and must be logged as such rather than as fidelity.
- **Confirm rev 1 node names and row construction.** Rev 2 must bind to the real identifiers; the names in §3.1 are placeholders.
- **Decide whether this record lives here or folds into `renderer-notes` rev 14**, since `dialogs.ts` was carved out of `renderer.ts` in Session 17.
- TOURNAMENT spot-check (rev-11 R15 caveat) remains open and is unrelated to this task.
