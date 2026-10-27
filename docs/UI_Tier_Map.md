# Session 5 — UI-Tier Map (SMMain.cpp analysis)

Exit deliverable for Session 5. Components × state × rendering responsibility,
sufficient to plan Session 6.

---

## 1. Critical Reversals to Earlier Assumptions

### 1.1 Money is `large`, not `__int64` (UNRESOLVED — top of file queue)

All game money and share counts (`Player[].Money`, `Player[].Shares`,
`Company[].Value`) are instances of class `large` (large.h, UNREAD), with
`.output(char*)`, arithmetic, and comparison operators.

- The Session 1 decision `type Money = number` was based on
  `CurrencyUnit::output(__int64)` — a different type.
- If `large` wraps `__int64`: `number` stands, no scaffold change.
- If `large` is string/arbitrary-precision: BigInt migration required.
- **ACTION: read large.h before ANY money-touching port work.**

### 1.2 Grid is not fixed 16×16

`Game`'s `GameGrid(16,16)` is a boot default immediately overridden by
`setGridSize()`. Real geometries:

| Size | Cells | Tile px | Turns | iStart (imagelist offset) |
|---|---|---|---|---|
| SMALL | 16×12 | 37×40 | 80 | 0 |
| MEDIUM | 22×18 | 27×27 | 120 | 11 |
| LARGE | 28×24 | 21×20 | 160 | 22 |

**ACTION: demote `GRID_WIDTH`/`GRID_HEIGHT` in game.ts to "boot default";
SMMain's `setGridSize` owns sizing. Geometry config should become data.**

### 1.3 Prefs persistence is DEAD CODE in the original

`FormCreate` has the entire `Prefs::load("Preferences")` block commented out.
The original never persists preferences; the Preferences form mutates
in-memory state only. PORT PLAN DECISION REQUIRED:
- (a) faithful port: leave load/save unwired, or
- (b) wire the existing TS Storage adapter (already built).

### 1.4 Cell semantics (now verified)

| Value | Meaning | Render tile |
|---|---|---|
| 0 | empty | checkerboard `iStart + (x+y)%2` |
| 1 | circle (resource: +500 to placement) | `iStart+2` |
| 2 | diamond (resource: +100, absorbed by company) | `iStart+3` |
| 3–7 | company ID (0–4) + 3 | `iStart+1+value` |
| — | selection highlight (animated) | `iStart+9` / `iStart+10` |

Exactly 5 companies. ImageList blocks of 11 tiles per grid size.

---

## 2. Forms Inventory (from includes + usage)

| Form (var) | Header | Role | Owns game state? | Renders board? |
|---|---|---|---|---|
| Main (TMain) | SMMain.h | Application spine, board screen, turn flow | YES (globals below) | YES (Screen canvas) |
| PlayInfo | (SMMain.h or Players.h?) | New-game setup (players, game type) | Sets numplays, gametype, Player array | no |
| ComForm | ComForm.h | Company interaction (buy/sell shares) | mutates Player/Company | no |
| ComInfo (ComInfoForm) | ComInfoForm.h | Company info; 5 toolbuttons gated on Exist | reads Company | no |
| Merger | Merger.h | Merger resolution dialog; `Merger()` fn defined here | mutates Company/Player | no |
| SplitForm | SplitForm.h | Company split (ComSplit at Value ≥ 3200) | mutates Company/Player | no |
| OverForm | OverForm.h | Final standings (Finish) | reads Player/Company | no |
| AboutForm | AboutForm.h | About box | no | no |
| GridManagerForm | GridManager.h | Grid editor (opened from Panel3) | mutates GameGrid directly | probably |
| HighScores | HighScores.h | Score table (also `HighScores(bool)` fn) | reads Player | no |
| ComEditForm | ComEditForm.h | Company editor | mutates Company | no |
| playerDetailsForm | playerDetails.h | Per-player share portfolio (dbl-click player list) | reads Player/Company | no |
| preferencesForm | Preferences.h | Preference toggles | mutates Prefs (in-memory) | no |

Supporting units: Players.h (Record/ComRecord structs; likely gridStore,
ComStore), CommaIt (comma() thousands separator), large.h (money type).

---

## 3. SMMain Global State Registry

Globals owned by SMMain.cpp (must be captured by the port's "app state"):

| Global | Type | Meaning |
|---|---|---|
| blwid, blhit | int | Tile pixel size (per grid size) |
| gridxsize, gridysize | int | Logical grid dims (kept SEPARATE from GameGrid's own _x/_y — desync risk, port should derive from grid) |
| iStart | int | ImageList block offset per grid size |
| gridtype, gametype | int | SMALL/MEDIUM/LARGE; CLASSIC/TOURNAMENT |
| curplay, turn, numplays, maxturns | int | Turn/player counters |
| progress, sels, hand | bool | Game running; selections shown; hover cursor |
| Choice[5][2] | int | Current 5 selectable squares (−1 = erased) |
| Player, Company | heap arrays | Record[] / ComRecord[] (defs in Players.h) |
| gridStore, ComStore | (declared elsewhere, likely Players.h) | TOURNAMENT per-player world snapshots (grids + company Exist/Value) |

Tournament mode = full per-player grid snapshots, restored on player switch.
Note: `Game` singleton holds ONLY Prefs + GameGrid — most "game state" lives in
these SMMain globals. The port's architecture decision: hoist these into an
AppState module (mirroring) vs. redistribute into Game (refactor — recommended,
but a PORT_PLAN deviation to log).

---

## 4. Game-State Touch-Point Map (SMMain.cpp → data layer)

| Function | Grid reads | Grid writes | Prefs | Notes |
|---|---|---|---|---|
| BitBtn1Click (end turn) | ✔ (snapshot) | ✔ (restore) | — | Tournament store/restore; turn counters |
| CreateGrid | — | randomise() | — | |
| setGridSize | — | resize(), randomise() | — | Geometry authority |
| go() | ✔ (choice legality) | — | — | Chooses 5 legal squares; PURE LOGIC + UI mix |
| action(x,y) | ✔ | ✔ (place/merge/spread) | — | Core turn resolution; recursive on merger |
| comAdjoining | ✔ | — | — | PURE — no VCL |
| Spread | ✔ | ✔ | — | PURE |
| UpdateGrid | ✔ | ✔ (absorbs diamonds) | — | PURE; returns square value |
| ComSize | ✔ | — | — | PURE |
| redrawGrid / DrawSels / Timer1Timer | ✔ | — | — | Rendering only |
| MoneyShow | — | — | ✔ currency output | Rendering; leaks into ComInfo buttons |
| MainUpdate / MenuUpdate | — | — | — | Reads Company/Player for enable/disable |
| Image1MouseDown/Move | — | — | ✔ mergers/expansion/companies flags | Input handling |
| ListBox1DblClick | — | — | ✔ details flag, currency | Player details dialog |
| closemain / EndGame / Quit | — | — | — | Lifecycle; deletes Player/Company |

Extraction candidates for Session 6 logic module (pure, no VCL):
`comAdjoining`, `Spread`, `UpdateGrid`, `ComSize`, choice-picking from `go()`,
turn-advance arithmetic from `BitBtn1Click`, placement rules from
`Image1MouseDown` (condM/condE logic).

Referenced-but-defined-elsewhere (unread): `Finish`, `HighScores`,
`CreateComs`, `NewCompany`, `ComSplit`, `Info`, `UpdateButs`, `comma`, `Merger`.
Prototyped-here-but-unused: `CheckNewComp`, `CheckMerger` (dead code —
likely superseded by comAdjoining/action).

---

## 5. Bugs / Quirks Log (add to PORT_PLAN deviations)

1. `Main->BitBtn1->Enabled = !sels & progress;` — bitwise AND on bools (works by accident)
2. `ListBox1DblClick`: `new char[64]` per loop iteration, never freed (memory leak)
3. CLASSIC end condition `turn == maxturns` — exact equality; a skipped count would never end the game
4. Recursive `action()` after mergers — bounded by 5 companies; safe but fragile pattern
5. `gridxsize/gridysize` globals can desync from GameGrid's actual dims
6. Neighbor-walk pattern (xa/ya stepping) duplicated 3× with slightly different code — consolidate in port
7. `setGridSize` erases the canvas with Brush/Pen = container color before switching — a full repaint concern for the Canvas 2D port (trivial there)

---

## 6. Renderer Plan (Canvas 2D + DOM) — sketch

**Board (Canvas 2D):** one `<canvas>`, logical size = grid dims × tile px.
- Static layer: checkerboard + circles/diamonds/companies → redrawn on
  `redrawGrid` triggers (same call sites as original).
- Selection layer: 5 highlight tiles, animated rotation via the Timer1
  equivalent (`requestAnimationFrame` + interval state, 5-slot cycle).
- Tiles: original used ImageList bitmaps. Port options: (a) draw programmatic
  shapes on canvas (fast, no assets), (b) port bitmaps to PNG sprite sheet.
  Recommend (a) first pass — circle/diamond/company-color fills reproduce
  semantics without asset extraction.
- Hit-testing: `x = floor(offsetX / tileW)`, `y = floor(offsetY / tileH)`
  (direct port of integer division).
- Hover: track pointer over Choice squares → CSS cursor swap
  (`cursor: pointer`), replacing crHandPoint/crArrow.

**DOM chrome:** sidebar (player name, money label, turn counter — Label5/6,
Panel3), company buttons ×5 (enabled by Exist), buy-indicator dots (Shape6–10,
white = affordable, company color = not), player ListBox, menu bar, modal
dialogs as DOM overlays. MessageBox calls → HTML dialogs/modals.

**Timer:** Timer1 (~selection animation) → `setInterval`/rAF-driven state,
disabled on placement — direct lifecycle port.

---

## 7. Reprioritized File Queue

1. **large.h** — BLOCKER for money representation; gates all economy porting
2. **Players.h** — Record/ComRecord structs, Player/Company shape, gridStore/
   ComStore declarations (tournament snapshot storage), PlayInfo?
3. **GridManager(.h/.cpp)** — grid editor; also informs how board editing
   interacts with GameGrid (and completes render-plan validation)
4. **ComForm / ComInfoForm / ComEditForm** — economy interaction cluster
5. **Merger / SplitForm / OverForm** — game-event dialogs
6. **HighScores / playerDetails / Preferences / AboutForm / CommaIt** — leaf
   forms, port anytime

---

## 8. Session 6 Recommendation

Read **large.h + Players.h** together (both small, both blocking): settles
Money once and for all, and yields the Record/ComRecord shapes that every
form touches. Then Session 6 can extract the pure logic module
(action/comAdjoining/Spread/UpdateGrid/ComSize/choices) into TS with real
types — the highest-value, lowest-UI-dependency translation in the port.

Exit criteria for Session 6: money decision CONFIRMED or MIGRATED;
Record/ComRecord ported; logic module extracted with unit-testable API.
