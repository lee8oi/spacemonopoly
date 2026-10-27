// ============================================================================
// SPACE MONOPOLY PORT — DATA + LOGIC LAYER (single-file build)
// Sources ported: Basic.h, Game.h/.cpp, CurrencyUnit.h/.cpp, Prefs.h/.cpp,
//   GameGrid.h/.cpp, Grid.h, large.h (→BigInt), SMMain.h/.cpp,
//   Players.cpp, Merger.cpp, SplitForm.cpp, ComForm.cpp, ComInfoForm.cpp,
//   CommaIt.cpp, OverForm.cpp, HighScores.cpp, Preferences.cpp (flow).
// Status: LOGIC LAYER FEATURE-COMPLETE (Session 12). Session 13 AMENDMENT:
//   startGame new-game board spec corrected (FIX:[phase3-verified] there) —
//   the only sanctioned change since freeze. Remaining reads (AboutForm,
//   StockForm check) are analysis-only.
// Tags: // FIX:[orig bug fixed]  // DEVIATION:[behavior differs]
//       // QUIRK-FIDELITY:[orig quirk preserved]
// Full rationale/history for every tag: see SCAFFOLD-NOTES.md (archive).
// GridManager form: dead in orig (no handlers) — deliberately not ported.
// tsconfig target ES2022+ (static {} block, BigInt literals).
// ============================================================================

// --- From Basic.h ---
export type Size = number;   // orig: unsigned long int
export type Index = number;  // orig: long int

// --- From large.h — ELIMINATED → native BigInt (license + capability).
// Ammeraal 1996 "All rights reserved" code excluded from this GPL v2
// port; money/share-counts were arbitrary precision, so BigInt is the
// faithful substitute. sqrt(large) unimplemented (unobserved in game
// code). large(const char*) ≡ BigInt(text) — used by trade dialogs.
export type Money = bigint;

// ---------------------------------------------------------------------------
// From CurrencyUnit.h + CurrencyUnit.cpp
// NOTE: orig source is Windows-1252; default symbol assumed £ (\u00A3) —
// raw byte still unverified (open item).
export class CurrencyUnit {
  private _unit: string;
  private _prefix: boolean; // true = before amount

  constructor(unit = '\u00A3', prefix = true) {
    this._unit = unit;
    this._prefix = prefix;
  }

  setUnit(u: string): boolean { // 1–3 char limit enforced
    if (u.length < 1 || u.length > 3) return false;
    this._unit = u;
    return true;
  }

  getUnit(): string { return this._unit; }
  setPrefix(): void { this._prefix = true; }
  setPostfix(): void { this._prefix = false; }
  isPrefix(): boolean { return this._prefix; }
  isPostfix(): boolean { return !this._prefix; }

  output(amount: string): string {
    return this._prefix ? this.getUnit() + amount : amount + this.getUnit();
  }

  // DEVIATION:[_i64toa] String(amount) for |amount| < 2^53. Game money is
  // BigInt, not this __int64 path — real formatting is toString→comma→output.
  outputInt(amount: number): string {
    return this.output(String(amount));
  }

  clone(): CurrencyUnit {
    return new CurrencyUnit(this._unit, this._prefix);
  }
}

// ---------------------------------------------------------------------------
// From CommaIt.cpp — groups of three from the right.
// DEVIATION:[comma-negative] orig counts a leading '-' as a digit
// (garbled negatives); port groups digits only. Money never negative in
// practice, so no observable difference.
export function comma(str: string): string {
  const negative = str.startsWith('-');
  const digits = negative ? str.slice(1) : str;
  if (digits.length <= 3) return str;
  const firstGroup = digits.length % 3 || 3;
  let out = digits.slice(0, firstGroup);
  for (let i = firstGroup; i < digits.length; i += 3) {
    out += ',' + digits.slice(i, i + 3);
  }
  return negative ? '-' + out : out;
}

// ---------------------------------------------------------------------------
// From Grid.h — pure data structure.
export class Grid<ELT> {
  // FIX:[zero-init] orig `new ELT[_y]` left POD cells as garbage; explicit
  // initial value required here.
  protected _cells: ELT[][] = [];
  protected _x: number;
  protected _y: number;

  constructor(xsize: number = 16, ysize: number = 16, initialValue: ELT) {
    this._x = xsize;
    this._y = ysize;
    this.init(initialValue);
  }

  private init(initialValue: ELT): void {
    this._cells = Array.from({ length: this._x }, () =>
      Array.from({ length: this._y }, () => initialValue),
    );
  }

  // Replaces orig's duplicated gridxsize/gridysize globals (desync risk).
  getWidth(): number { return this._x; }
  getHeight(): number { return this._y; }

  clone(): Grid<ELT> {
    const g = new Grid<ELT>(this._x, this._y, this._cells[0][0]);
    this.forEachCell((v, x, y) => (g._cells[x][y] = v));
    return g;
  }

  copyFrom(grid: Grid<ELT>): Grid<ELT> {
    if (grid === this) return this; // self-assignment check preserved
    if (grid._x !== this._x || grid._y !== this._y) {
      this.resize(grid._x, grid._y, grid._cells[0][0]);
    }
    for (let iy = 0; iy < this._y; iy++) {
      // FIX:[ub-loop] orig had uninitialized ix (undefined behavior).
      for (let ix = 0; ix < this._x; ix++) {
        this._cells[ix][iy] = grid._cells[ix][iy];
      }
    }
    return this;
  }

  get(x: number, y: number): ELT { return this._cells[x][y]; }
  set(x: number, y: number, value: ELT): void { this._cells[x][y] = value; }

  clear(value: ELT): void {
    for (let iy = 0; iy < this._y; iy++) {
      for (let ix = 0; ix < this._x; ix++) {
        this._cells[ix][iy] = value;
      }
    }
  }

  resize(x: number, y: number, initialValue: ELT): void {
    this._x = x;
    this._y = y;
    this.init(initialValue);
  }

  forEachCell(fn: (value: ELT, x: number, y: number) => void): void {
    for (let iy = 0; iy < this._y; iy++) {
      for (let ix = 0; ix < this._x; ix++) {
        fn(this._cells[ix][iy], ix, iy);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// From GameGrid.h + GameGrid.cpp
export class GameGrid extends Grid<number> {
  constructor(xsize: number = 16, ysize: number = 16) {
    super(xsize, ysize, 0);
  }

  // Covariant clone (tournament snapshot store holds GameGrid[]).
  clone(): GameGrid {
    const g = new GameGrid(this._x, this._y);
    this.forEachCell((v, x, y) => (g._cells[x][y] = v));
    return g;
  }

  // DEVIATION:[rng] Math.random(); same 1/30 density, sequences not
  // reproducible (orig: wall-clock-seeded rand(); no replay files exist).
  randomise(): void {
    for (let j = 0; j < this._y; j++) {
      for (let i = 0; i < this._x; i++) {
        this._cells[i][j] = Math.floor(Math.random() * 30) === 1 ? 1 : 0;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// From Prefs.h + Prefs.cpp
// Semantics (orig control names): mergersSet = forceMergers;
// expansionSet = forceExpansion; detailsSet = hideDetails (TRUE =
// details HIDDEN); companiesSet = allowCreation.
export const PREFS_FORMAT_DOC =
  'line 1: currency unit symbol, then LF, then 5 flag chars (1/0): ' +
  'prefix, mergers, expansion, details, companies';

export class Prefs {
  private _cu: CurrencyUnit;
  private _mergers: boolean;
  private _expansion: boolean;
  private _details: boolean;
  private _companies: boolean;

  constructor() {
    this._cu = new CurrencyUnit();
    this._mergers = false;
    this._expansion = false;
    this._details = false;
    this._companies = false;
  }

  getCurrencyUnit(): CurrencyUnit { return this._cu.clone(); }
  mergersSet(): boolean { return this._mergers; }
  expansionSet(): boolean { return this._expansion; }
  detailsSet(): boolean { return this._details; } // true = hidden
  companiesSet(): boolean { return this._companies; }

  setCurrencyUnit(cu: CurrencyUnit): void { this._cu = cu.clone(); }
  setMergers(flag: boolean): void { this._mergers = flag; }
  setExpansion(flag: boolean): void { this._expansion = flag; }
  setDetails(flag: boolean): void { this._details = flag; }
  setCompanies(flag: boolean): void { this._companies = flag; }

  // Exact original wire format (Prefs.cpp save):
  serialize(): string {
    return (
      this._cu.getUnit() + '\n' +
      (this._cu.isPrefix() ? '1' : '0') +
      (this._mergers ? '1' : '0') +
      (this._expansion ? '1' : '0') +
      (this._details ? '1' : '0') +
      (this._companies ? '1' : '0')
    );
  }

  // FIX:[parse-guard] bounds-safe port of Prefs.cpp load().
  deserialize(text: string): boolean {
    const nl = text.indexOf('\n');
    if (nl < 0) return false;
    const unit = text.slice(0, Math.min(nl, 3));
    const flags = text.slice(nl + 1);
    if (!this._cu.setUnit(unit)) return false;
    this._cu = new CurrencyUnit(unit, flags.charAt(0) === '1');
    this._mergers = flags.charAt(1) === '1';
    this._expansion = flags.charAt(2) === '1';
    this._details = flags.charAt(3) === '1';
    this._companies = flags.charAt(4) === '1';
    return true;
  }

  // QUIRK-FIDELITY:[prefs-half-wired] orig writes "Preferences" on the
  // form's Save button but its only reader (FormCreate) is commented out.
  load(storage: Storage, key: string): boolean {
    const text = storage.getItem(key);
    return text !== null && this.deserialize(text);
  }

  save(storage: Storage, key: string): boolean {
    try {
      storage.setItem(key, this.serialize());
      return true;
    } catch {
      return false; // mirrors fopen()==NULL failure path
    }
  }

  // Prefs-by-value assignment (orig operator=; used by prefs-form flow).
  assignFrom(prefs: Prefs): Prefs {
    this._cu = prefs._cu.clone();
    this._mergers = prefs._mergers;
    this._expansion = prefs._expansion;
    this._details = prefs._details;
    this._companies = prefs._companies;
    return this;
  }
}

// ---------------------------------------------------------------------------
// From Game.h + Game.cpp — boot defaults only; geometry via GRID_CONFIGS.
export const GRID_DEFAULT_WIDTH = 16;
export const GRID_DEFAULT_HEIGHT = 16;

export class Game {
  private static _instance: Game;

  private readonly _prefs: Prefs;
  private readonly _grid: GameGrid;

  private constructor() {
    this._prefs = new Prefs();
    this._grid = new GameGrid(GRID_DEFAULT_WIDTH, GRID_DEFAULT_HEIGHT);
  }

  static {
    Game._instance = new Game();
  }

  static getInstance(): Game { return Game._instance; }

  getPrefs(): Prefs { return this._prefs; }
  getGrid(): GameGrid { return this._grid; }
}

export function getGame(): Game {
  return Game.getInstance();
}

// ===========================================================================
// ===================== TYPES, STATE, CONSTANTS =============================
// ===========================================================================

// From SMMain.h — orig struct Record: { AnsiString Name; large Money;
// large Shares[5]; }
export interface PlayerRecord {
  name: string;
  money: Money;
  shares: Money[]; // per company (5)
}

// From SMMain.h — orig struct ComRecord: { AnsiString Name; int Value;
// bool Exist; int Color; }. Value stays plain int (splits at 3200) —
// mixed precision is faithful; only money/shares are BigInt.
export interface ComRecord {
  name: string;
  value: number;
  exist: boolean;
  color: string; // orig TColor int → CSS color string
}

export const CLASSIC = 0;
export const TOURNAMENT = 1;
export type GameType = typeof CLASSIC | typeof TOURNAMENT;

export const SMALL = 0;
export const MEDIUM = 1;
export const LARGE = 2;
export type GridType = typeof SMALL | typeof MEDIUM | typeof LARGE;

// From setGridSize(): geometry + pacing bundle per grid size.
// QUIRK-FIDELITY:[menu-labels] orig menu captions say 16x16 / 20x20 /
// 32x32 but actual grids are 16x12 / 22x18 / 28x24.
export interface GridConfig {
  xsize: number;
  ysize: number;
  tileW: number; // blwid
  tileH: number; // blhit
  maxTurns: number;
  iStart: number; // ImageList1 tileset base index
}
export const GRID_CONFIGS: Record<GridType, GridConfig> = {
  [SMALL]:  { xsize: 16, ysize: 12, tileW: 37, tileH: 40, maxTurns: 80,  iStart: 0 },
  [MEDIUM]: { xsize: 22, ysize: 18, tileW: 27, tileH: 27, maxTurns: 120, iStart: 11 },
  [LARGE]:  { xsize: 28, ysize: 24, tileW: 21, tileH: 20, maxTurns: 160, iStart: 22 },
};

// Cell semantics (verified in SMMain.cpp redrawGrid/action):
export const CELL_EMPTY = 0;
export const CELL_CIRCLE = 1;      // +500 to adjacent placement
export const CELL_DIAMOND = 2;      // +100, absorbed by placement
export const COMPANY_CELL_BASE = 3; // cell = companyId + 3

// ImageList1 tile indices (offset from iStart) — full spec in NOTES:
//   checkerboard bg = (x+y)%2; circle 2; diamond 3; company c = 4+c;
//   selection 9; timer-active selection (yellow frame) 10.
export const TILE_CIRCLE = 2;
export const TILE_DIAMOND = 3;
export const TILE_COMPANY_BASE = 4;
export const TILE_SELECTION = 9;
export const TILE_SELECTION_ACTIVE = 10;

export const NUM_COMPANIES = 5;
export const START_MONEY: Money = 6000n;   // Players.cpp BitBtn3Click
export const SPLIT_THRESHOLD = 3200;      // Value >= 3200 → ComSplit
export const FOUNDER_FREE_SHARES: Money = 5n; // ComForm.cpp NewCompany

// From Players.cpp CreateComs(): fixed company roster.
export const COMPANY_DEFS: ReadonlyArray<{ name: string; color: string }> = [
  { name: 'Atlantis Ltd.', color: '#ff0000' }, // clRed
  { name: 'Betelguese',    color: '#00ff00' }, // clLime
  { name: 'Cannon Inc.',  color: '#ffff00' }, // clYellow
  { name: 'Debenese',      color: '#008080' }, // clTeal
  { name: 'Eridnus Corp.', color: '#0000ff' }, // clBlue
];

// ---------------------------------------------------------------------------
// App-state mirror of SMMain.cpp/SMMain.h globals. Orig kept game state in
// loose file-scope globals; port MIRRORS this rather than redistributing
// into Game (smaller deviation). GC fixes orig's array leaks for free.
export interface TournamentStore {
  grids: GameGrid[];
  comRecords: ComRecord[];
}

export class AppState {
  grid: GameGrid = getGame().getGrid();
  gridType: GridType = SMALL;
  gameType: GameType = CLASSIC;

  progress = false; // game in progress
  sels = false;     // selections shown
  turn = 0;
  maxTurns = GRID_CONFIGS[SMALL].maxTurns;
  numplays = 0;
  curplay = 0;

  // Choice[5][2] — five selectable squares; [-1,-1] when erased.
  // NOTE: TMain's `choice[5]` member is a dead duplicate — not ported.
  choice: Array<[number, number]> = [
    [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1],
  ];

  player: PlayerRecord[] = [];
  company: ComRecord[] = [];

  // From ComInfoForm.cpp: company shown by trade dialog; current player's
  // max affordable purchase (recomputed by companyInfo).
  comnum = 0;
  maxbuy: Money = 0n;

  tournament: TournamentStore | null = null; // non-null iff TOURNAMENT

  gridConfig(): GridConfig {
    return GRID_CONFIGS[this.gridType];
  }
}

// ---------------------------------------------------------------------------
// From Players.cpp — game setup

// From CreateComs(): fresh company array.
export function createComs(state: AppState): void {
  state.company = COMPANY_DEFS.map((def) => ({
    name: def.name,
    value: 0,
    exist: false,
    color: def.color,
  }));
}

// From Players.cpp BitBtn3Click (Go!): players + tournament init.
// QUIRK-FIDELITY:[tournament-downgrade] 1-player TOURNAMENT silently
// downgrades to CLASSIC.
export function startGame(
  state: AppState,
  playerNames: string[],
  requestedGameType: GameType,
): void {
  state.gameType =
    requestedGameType === TOURNAMENT && playerNames.length === 1
      ? CLASSIC
      : requestedGameType;

  state.numplays = playerNames.length;
  state.player = playerNames.map((name) => ({
    name,
    money: START_MONEY,
    shares: [0n, 0n, 0n, 0n, 0n],
  }));

  // FIX:[phase3-verified] (SESSION 13 AMENDMENT — the first sanctioned
  // change to this frozen file; see SCAFFOLD-NOTES). Orig BitBtn3Click
  // calls Game::getInstance().getGrid().clear() — but Grid::clear() in
  // Grid.h iterates an UNINITIALIZED `ix` (undefined behavior, same bug
  // family as FIX:[ub-loop]). Observable behavior of Lee's binary
  // (authoritative testimony): circles SURVIVE a new game; company and
  // diamond cells do NOT. A value-blind clear() cannot be content-
  // selective, so the exact original mechanism is unresolved (candidates:
  // unseen Game.cpp logic, a go() preamble, or further UB interplay —
  // logged open). Port implements the OBSERVED SPEC: keep circles, strip
  // companies and diamonds. Supersedes the former clear(CELL_EMPTY),
  // which produced a blank board.
  state.grid.forEachCell((v, x, y) => {
    state.grid.set(x, y, v === CELL_CIRCLE ? CELL_CIRCLE : CELL_EMPTY);
  });

  state.progress = true;
  createComs(state);
  state.turn = 0;
  state.curplay = 0;

  if (state.gameType === TOURNAMENT) {
    state.tournament = {
      grids: Array.from({ length: state.numplays }, () =>
        state.grid.clone(),
      ),
      comRecords: Array.from(
        { length: state.numplays * NUM_COMPANIES },
        () => ({ name: '', value: 0, exist: false, color: '' }),
      ),
    };
  } else {
    state.tournament = null;
  }
}

// From SMMain.cpp BitBtn1Click — end-of-turn bookkeeping + tournament
// snapshot/restore.
// FIX:[turn-eq] orig CLASSIC `if (++turn == maxturns)` is exact equality
// (a skipped increment would never end the game); ported as >=.
// QUIRK-FIDELITY:[tournament-maxturns] TOURNAMENT maxturns+1 off-by-one
// preserved.
export function advanceTurn(state: AppState): void {
  const t = state.tournament;
  const gw = state.grid.getWidth();
  const gh = state.grid.getHeight();

  if (t && state.gameType === TOURNAMENT) {
    // Snapshot outgoing player's world...
    const g = state.grid;
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        t.grids[state.curplay].set(x, y, g.get(x, y));
      }
    }
    for (let i = 0; i < NUM_COMPANIES; i++) {
      t.comRecords[state.curplay * NUM_COMPANIES + i].exist =
        state.company[i].exist;
      t.comRecords[state.curplay * NUM_COMPANIES + i].value =
        state.company[i].value;
    }

    state.curplay = state.curplay + 1;
    if (state.curplay + 1 > state.numplays) state.curplay = 0;

    // ...restore incoming player's world.
    const stored = t.grids[state.curplay];
    for (let y = 0; y < stored.getHeight(); y++) {
      for (let x = 0; x < stored.getWidth(); x++) {
        state.grid.set(x, y, stored.get(x, y));
      }
    }
    for (let i = 0; i < NUM_COMPANIES; i++) {
      state.company[i].exist =
        t.comRecords[state.curplay * NUM_COMPANIES + i].exist;
      state.company[i].value =
        t.comRecords[state.curplay * NUM_COMPANIES + i].value;
    }
  } else {
    // CLASSIC: sequential turns.
    state.curplay = state.curplay + 1;
    if (state.curplay + 1 > state.numplays) state.curplay = 0;
  }

  switch (state.gameType) {
    case CLASSIC:
      state.turn++;
      if (state.turn >= state.maxTurns) state.progress = false;
      break;
    case TOURNAMENT:
      if (state.curplay === 0) state.turn++;
      if (state.curplay === 0 && state.turn >= state.maxTurns + 1) {
        state.progress = false;
      }
      break;
  }
}

// ===========================================================================
// ===================== PURE GAME LOGIC (SMMain.cpp) =========================
// ===========================================================================

// Neighbor offsets per orig xa/ya stepping, in visit order:
// N(0,-1), E(1,0), W(-1,0), S(0,1).
const NEIGHBOR_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [0, -1], [1, 0], [-1, 0], [0, 1],
];

export interface AdjoiningInfo {
  comadj: number;   // count of DISTINCT adjoining companies
  circle: number;   // adjoining circles
  diamond: number;  // adjoining diamonds
  next: boolean[];  // which companies adjoin (index = company id)
  comnext: number;  // last-seen adjoining company id (-1 if none)
}

// From SMMain.cpp comAdjoining(): scans the 4-neighborhood of (x,y).
export function comAdjoining(
  state: AppState,
  x: number,
  y: number,
): AdjoiningInfo {
  const g = state.grid;
  const cfg = state.gridConfig();

  const info: AdjoiningInfo = {
    comadj: 0,
    circle: 0,
    diamond: 0,
    next: [false, false, false, false, false],
    comnext: -1,
  };

  for (const [xa, ya] of NEIGHBOR_OFFSETS) {
    // Bounds guards, verbatim from original:
    if (
      !((x === 0 && xa === -1) ||
        (y === 0 && ya === -1) ||
        (x === cfg.xsize - 1 && xa === 1) ||
        (y === cfg.ysize - 1 && ya === 1))
    ) {
      const cell = g.get(x + xa, y + ya);
      if (cell === CELL_CIRCLE) {
        info.circle++;
      } else if (cell === CELL_DIAMOND) {
        info.diamond++;
      } else if (cell >= COMPANY_CELL_BASE) {
        const com = cell - COMPANY_CELL_BASE;
        if (!info.next[com]) info.comadj++;
        info.next[com] = true;
        info.comnext = com;
      }
    }
  }

  return info;
}

// From SMMain.cpp Spread(): rebrand all cells of company `from` to `to`.
export function spread(
  state: AppState,
  to: number,
  from: number,
): void {
  const g = state.grid;
  for (let j = 0; j < g.getHeight(); j++) {
    for (let i = 0; i < g.getWidth(); i++) {
      if (g.get(i, j) === from) g.set(i, j, to);
    }
  }
}

// From SMMain.cpp UpdateGrid(): placement value from adjoining resources
// (base 100, circle +500, diamond +100); ABSORBS adjacent diamonds into
// the placing company. Returns the value.
export function updateGrid(
  state: AppState,
  x: number,
  y: number,
): number {
  const g = state.grid;
  const cfg = state.gridConfig();
  let value = 100;

  for (const [xa, ya] of NEIGHBOR_OFFSETS) {
    if (
      !((x === 0 && xa === -1) ||
        (y === 0 && ya === -1) ||
        (x === cfg.xsize - 1 && xa === 1) ||
        (y === cfg.ysize - 1 && ya === 1))
    ) {
      const cell = g.get(x + xa, y + ya);
      if (cell === CELL_CIRCLE) {
        value += 500;
      } else if (cell === CELL_DIAMOND) {
        value += 100;
        g.set(x + xa, y + ya, g.get(x, y));
      }
    }
  }

  return value;
}

// From SMMain.cpp ComSize(): size of company `com` in squares.
export function comSize(state: AppState, com: number): number {
  const g = state.grid;
  let size = 0;
  for (let j = 0; j < g.getHeight(); j++) {
    for (let i = 0; i < g.getWidth(); i++) {
      if (g.get(i, j) === com + COMPANY_CELL_BASE) size++;
    }
  }
  return size;
}

// From SMMain.cpp EraseChoices():
export function eraseChoices(state: AppState): void {
  for (let i = 0; i < NUM_COMPANIES; i++) {
    state.choice[i] = [-1, -1];
  }
}

// From SMMain.cpp go() — choice selection (pure part).
// FIX:[rejection-loop] orig goto-redo rejection sampling could spin
// forever on a nearly-full board; port retries bounded, then falls back
// to a deterministic linear scan.
// QUIRK-FIDELITY:[double-east] orig's !newok validation visits
// N,E,W,S,E (East twice) — harmless (booleans only); 4-neighborhood is
// behaviorally identical.
export function pickChoices(state: AppState): void {
  const g = state.grid;
  const cfg = state.gridConfig();

  let newok = false;
  for (let i = 0; i < NUM_COMPANIES; i++) {
    if (!state.company[i].exist) newok = true;
  }

  const picked: Array<[number, number]> = [];
  const taken = new Set<string>();
  const isValid = (cx: number, cy: number): boolean => {
    if (g.get(cx, cy) !== CELL_EMPTY) return false;
    for (const [px, py] of picked) {
      if (px === cx && py === cy) return false;
    }
    if (!newok) {
      // Must adjoin a company; adjoining only circle/diamond is rejected.
      let cord = false;
      let ntocom = false;
      for (const [xa, ya] of NEIGHBOR_OFFSETS) {
        const nx = cx + xa;
        const ny = cy + ya;
        if (nx < 0 || ny < 0 || nx >= cfg.xsize || ny >= cfg.ysize) continue;
        const cell = g.get(nx, ny);
        if (cell === CELL_CIRCLE || cell === CELL_DIAMOND) cord = true;
        if (cell >= COMPANY_CELL_BASE) ntocom = true;
      }
      if (!ntocom && cord) return false;
    }
    return true;
  };

  let attempts = 0;
  while (picked.length < NUM_COMPANIES && attempts < 10000) {
    attempts++;
    const cx = Math.floor(Math.random() * cfg.xsize);
    const cy = Math.floor(Math.random() * cfg.ysize);
    if (isValid(cx, cy) && !taken.has(`${cx},${cy}`)) {
      picked.push([cx, cy]);
      taken.add(`${cx},${cy}`);
    }
  }

  // Deterministic fallback: fill remaining slots left-to-right.
  if (picked.length < NUM_COMPANIES) {
    outer: for (let y = 0; y < cfg.ysize; y++) {
      for (let x = 0; x < cfg.xsize; x++) {
        if (picked.length >= NUM_COMPANIES) break outer;
        if (!taken.has(`${x},${y}`) && isValid(x, y)) {
          picked.push([x, y]);
          taken.add(`${x},${y}`);
        }
      }
    }
  }

  for (let i = 0; i < NUM_COMPANIES; i++) {
    state.choice[i] = picked[i] ?? [-1, -1];
  }
}

// From SMMain.cpp go() — full presentation sequence (canonical order:
// hide selections → redraw → money display → pick → show → draw → start
// selector timer → update UI). Renderer supplies the side effects.
export interface OfferChoicesHooks {
  redrawGrid(): void;
  moneyShow(): void;
  drawSels(): void;            // only if sels
  startSelectorTimer(): void;  // Timer1->Enabled = true
  mainUpdate(): void;
}

export function offerChoices(state: AppState, ui: OfferChoicesHooks): void {
  state.sels = false;
  ui.redrawGrid();
  ui.moneyShow();
  pickChoices(state);
  state.sels = true;
  ui.drawSels();
  ui.startSelectorTimer();
  ui.mainUpdate();
}

// From SMMain.cpp go()/Image1MouseDown — placement rule enforcement.
// Returns error string for UI display, or null if OK.
export function checkPlacementRules(
  state: AppState,
  x: number,
  y: number,
): string | null {
  const prefs = getGame().getPrefs();
  if (!(prefs.mergersSet() || prefs.expansionSet())) return null;

  const info = comAdjoining(state, x, y);

  let condM = false; // some choice would cause a merger
  let condE = false; // some choice would expand a company
  for (let ch = 0; ch < NUM_COMPANIES; ch++) {
    const [cx, cy] = state.choice[ch];
    if (cx < 0) continue;
    const here = comAdjoining(state, cx, cy);
    if (prefs.mergersSet() && here.comadj > 1) condM = true;
    if (prefs.expansionSet() && here.comadj > 0) condE = true;
  }

  if (prefs.mergersSet() && condM && info.comadj < 2) {
    return 'You must choose a square that causes a merger';
  }

  if (
    prefs.expansionSet() &&
    condE &&
    (prefs.companiesSet()
      ? info.circle === 0 && info.diamond === 0 && info.comadj === 0
      : info.comadj === 0)
  ) {
    if (prefs.companiesSet()) {
      return 'You must choose a square that expands a company (or creates a new one)';
    }
    return 'You must choose a square that expands a company';
  }

  return null;
}

// ---------------------------------------------------------------------------
// From SMMain.cpp action() — core turn resolution. UI side effects via
// hooks; state mutations stay testable. Orig recurses after each merger
// (depth <= 4, bounded by company count); ported as a loop.
export interface ActionHooks {
  redrawGrid(): void;
  moneyShow(): void;
  mainUpdate(): void;
  newCompany(x: number, y: number): void;      // ComForm flow
  comSplit(companyId: number): void;           // Value >= 3200
  merger(survivorId: number, absorbedId: number): void;
}

export function action(
  state: AppState,
  x: number,
  y: number,
  hooks: ActionHooks,
): void {
  let placed = false;
  while (!placed) {
    placed = true;

    const info = comAdjoining(state, x, y);
    const g = state.grid;

    if (info.comadj === 0) {
      // Not next to any company:
      if (info.circle > 0 || info.diamond > 0) {
        hooks.newCompany(x, y);
      } else {
        g.set(x, y, CELL_DIAMOND);
        hooks.redrawGrid();
      }
    } else if (info.comadj === 1) {
      // Expands the single adjoining company:
      g.set(x, y, info.comnext + COMPANY_CELL_BASE);
      const val = updateGrid(state, x, y);
      state.company[info.comnext].value += val;

      // Shareholders paid: all players (CLASSIC) or current (TOURNAMENT).
      if (state.gameType === CLASSIC) {
        for (let i = 0; i < state.numplays; i++) {
          state.player[i].money +=
            state.player[i].shares[info.comnext] * BigInt(val);
        }
      } else {
        state.player[state.curplay].money +=
          state.player[state.curplay].shares[info.comnext] * BigInt(val);
      }

      if (state.company[info.comnext].value >= SPLIT_THRESHOLD) {
        hooks.redrawGrid();
        hooks.comSplit(info.comnext);
      }

      hooks.redrawGrid();
      hooks.moneyShow();
    } else {
      // Between 2+ companies: MERGER. Larger company survives.
      let coma = info.next.findIndex((v) => v);
      let comb = -1;
      for (let j = coma + 1; j < NUM_COMPANIES; j++) {
        if (info.next[j]) { comb = j; break; }
      }

      if (comSize(state, comb) > comSize(state, coma)) {
        const t = coma; coma = comb; comb = t; // coma is survivor
      }

      g.set(x, y, CELL_DIAMOND);
      hooks.redrawGrid();
      hooks.merger(coma, comb);
      g.set(x, y, coma + COMPANY_CELL_BASE);
      spread(state, coma + COMPANY_CELL_BASE, comb + COMPANY_CELL_BASE);
      state.company[comb].exist = false;

      placed = false; // re-evaluate for chained mergers
    }
  }

  hooks.mainUpdate();
  hooks.redrawGrid();
}

// ===========================================================================
// ==================== MERGER / SPLIT HOOK BODIES ===========================
// ===========================================================================

// From Merger.cpp — merger resolution.
// QUIRK-FIDELITY:[tournament-no-conversion] TOURNAMENT performs cash
// payout but NO share conversion (orig's conversion loop range
// [curplay, curplay) is empty).
// QUIRK-FIDELITY:[zombie-shares] absorbed shares are never zeroed, even in
// CLASSIC; Total() counts them at frozen value until the slot re-forms
// via NewCompany (CLASSIC-only reset).
export function mergerHook(
  state: AppState,
  survivorId: number,
  absorbedId: number,
): void {
  const absorbed = state.company[absorbedId];
  const survivor = state.company[survivorId];

  // Cash payout: CLASSIC all players, TOURNAMENT current player only.
  const startPlayer = state.gameType === TOURNAMENT ? state.curplay : 0;
  const endPlayer =
    state.gameType === TOURNAMENT ? state.curplay + 1 : state.numplays;
  for (let i = startPlayer; i < endPlayer; i++) {
    state.player[i].money +=
      state.player[i].shares[absorbedId] * BigInt(absorbed.value);
  }

  // Share conversion (CLASSIC only — see tournament quirk above):
  if (state.gameType === CLASSIC) {
    for (let i = 0; i < state.numplays; i++) {
      state.player[i].shares[survivorId] +=
        state.player[i].shares[absorbedId];
    }
  }

  // Survivor value = combined; absorbed retains name/value/color.
  survivor.value += absorbed.value;
}

// From SplitForm.cpp — 2-for-1 stock split (value halves, count doubles).
export function comSplitHook(
  state: AppState,
  companyId: number,
): void {
  const company = state.company[companyId];
  company.value = Math.floor(company.value / 2);

  const startPlayer = state.gameType === TOURNAMENT ? state.curplay : 0;
  const endPlayer =
    state.gameType === TOURNAMENT ? state.curplay + 1 : state.numplays;

  for (let i = startPlayer; i < endPlayer; i++) {
    state.player[i].shares[companyId] *= 2n;
  }
}

// ===========================================================================
// ==================== NEW COMPANY, TRADING ==================================
// ===========================================================================

// From ComForm.cpp NewCompany() — founds a company; founder gets 5 free
// shares + cash = company value; value = updateGrid(x,y) (also absorbs
// adjacent diamonds); CLASSIC resets all players' shares in the slot.
// QUIRK-FIDELITY:[newcompany-noop] if all 5 companies exist: silent no-op,
// placement lost (returns null).
export function newCompanyHook(
  state: AppState,
  x: number,
  y: number,
): number | null {
  for (let i = 0; i < NUM_COMPANIES; i++) {
    if (!state.company[i].exist) {
      state.grid.set(x, y, i + COMPANY_CELL_BASE);
      state.company[i].exist = true;
      state.company[i].value = updateGrid(state, x, y);

      if (state.gameType === CLASSIC) {
        for (let j = 0; j < state.numplays; j++) {
          state.player[j].shares[i] = 0n;
        }
      }

      state.player[state.curplay].shares[i] = FOUNDER_FREE_SHARES;
      state.player[state.curplay].money += BigInt(state.company[i].value);

      return i;
    }
  }
  return null;
}

// From ComInfoForm.cpp Info() — trade-dialog view model.
export interface CompanyInfoView {
  comnum: number;
  name: string;
  value: number;        // share price (plain int)
  color: string;
  sharesOwned: Money;   // current player's holding
  maxbuy: Money;        // affordable shares (floor division)
  sizeSquares: number;  // company territory size
  majorShareholder: { playerIndex: number; shares: Money } | null;
}

export function companyInfo(state: AppState, com: number): CompanyInfoView {
  state.comnum = com;

  // maxbuy = Money / Value. FIX:[divide-zero] zero share price (degenerate
  // state) → 0 affordable; orig would hit Ammeraal divide-by-zero.
  const value = state.company[com].value;
  const money = state.player[state.curplay].money;
  state.maxbuy = value > 0 ? money / BigInt(value) : 0n;

  // Major shareholder: highest across ALL players (even in TOURNAMENT —
  // deliberate fidelity; displays rivals' standings).
  let numshares = 0n;
  let player = 0;
  for (let i = 0; i < state.numplays; i++) {
    if (state.player[i].shares[com] > numshares) {
      numshares = state.player[i].shares[com];
      player = i;
    }
  }

  return {
    comnum: com,
    name: state.company[com].name,
    value,
    color: state.company[com].color,
    sharesOwned: state.player[state.curplay].shares[com],
    maxbuy: state.maxbuy,
    sizeSquares: comSize(state, com),
    majorShareholder:
      numshares > 0n ? { playerIndex: player, shares: numshares } : null,
  };
}

// From SMMain.cpp MoneyShow() — affordability-dot predicate (highlight iff
// money >= price AND company exists). Dot rendering is UI-layer.
export function canAffordCompany(state: AppState, com: number): boolean {
  return (
    state.company[com].exist &&
    state.player[state.curplay].money >= BigInt(state.company[com].value)
  );
}

// From ComInfoForm.cpp — buy N shares. Validation mirrors orig:
// 1 <= amount <= maxbuy. UI parses amount as BigInt(text) (large(text)).
export function buyShares(
  state: AppState,
  com: number,
  amount: Money,
): boolean {
  companyInfo(state, com); // refresh maxbuy
  if (amount > state.maxbuy || amount < 1n) {
    return false;
  }
  const price = BigInt(state.company[com].value);
  state.player[state.curplay].shares[com] += amount;
  state.player[state.curplay].money -= amount * price;
  return true;
}

// From ComInfoForm.cpp BitBtn3Click — sell N shares.
export function sellShares(
  state: AppState,
  com: number,
  amount: Money,
): boolean {
  if (amount > state.player[state.curplay].shares[com] || amount < 1n) {
    return false;
  }
  const price = BigInt(state.company[com].value);
  state.player[state.curplay].shares[com] -= amount;
  state.player[state.curplay].money += amount * price;
  return true;
}

// From ComInfoForm.cpp BitBtn7Click — sell all shares in this company.
export function sellAllShares(state: AppState, com: number): void {
  const price = BigInt(state.company[com].value);
  state.player[state.curplay].money +=
    state.player[state.curplay].shares[com] * price;
  state.player[state.curplay].shares[com] = 0n;
}

// From ComInfoForm.cpp BitBtn8Click — buy maximum affordable shares.
export function buyMaxShares(state: AppState, com: number): void {
  companyInfo(state, com); // recompute maxbuy
  const price = BigInt(state.company[com].value);
  state.player[state.curplay].shares[com] += state.maxbuy;
  state.player[state.curplay].money -= state.maxbuy * price;
}

// ===========================================================================
// ============ FINAL STANDINGS (OverForm.cpp) + HIGH SCORES ==================
// ===========================================================================

// From HighScores.cpp Total() — a player's net wealth (correct version;
// contrast Finish()'s buggy inline copy below).
export function totalWealth(state: AppState, pnum: number): Money {
  let worth = 0n;
  for (let i = 0; i < NUM_COMPANIES; i++) {
    worth += state.player[pnum].shares[i] * BigInt(state.company[i].value);
  }
  return worth + state.player[pnum].money;
}

// From OverForm.cpp Finish() — final standings computation.
// FIX:[cumulative-worth] ORIGINAL BUG: `worth` declared outside the player
// loop accumulated across players, so standings showed each player's worth
// including all previous players'. Winner unaffected (uses Total()). Port
// computes fresh per player.
export interface FinalStanding {
  name: string;
  money: Money;
  shareWorth: Money;
  netWealth: Money;
}

export interface FinalStandings {
  turn: number;
  biggestCompany: { comnum: number; name: string; size: number };
  winner: { playerIndex: number; name: string; netWealth: Money };
  standings: FinalStanding[];
}

export function finishStandings(state: AppState): FinalStandings {
  // Biggest company by territory.
  let bigcom = 0;
  let csize = 0;
  for (let i = 0; i < NUM_COMPANIES; i++) {
    if (comSize(state, i) > csize) {
      csize = comSize(state, i);
      bigcom = i;
    }
  }

  // Winner by net wealth (correct totalWealth).
  let play = 0;
  let dosh = 0n;
  for (let i = 0; i < state.numplays; i++) {
    if (dosh < totalWealth(state, i)) {
      play = i;
      dosh = totalWealth(state, i);
    }
  }

  // Per-player standings (cumulative-worth bug FIXED):
  const standings: FinalStanding[] = [];
  for (let i = 0; i < state.numplays; i++) {
    let worth = 0n;
    for (let j = 0; j < NUM_COMPANIES; j++) {
      worth += state.player[i].shares[j] * BigInt(state.company[j].value);
    }
    standings.push({
      name: state.player[i].name,
      money: state.player[i].money,
      shareWorth: worth,
      netWealth: worth + state.player[i].money,
    });
  }

  return {
    turn: state.turn,
    biggestCompany: {
      comnum: bigcom,
      name: state.company[bigcom].name,
      size: csize,
    },
    winner: { playerIndex: play, name: state.player[play].name, netWealth: dosh },
    standings,
  };
}

// ---------------------------------------------------------------------------
// From HighScores.h/.cpp — persistent score tables: 3 (per grid size)
// × 10 entries. Defaults: "David" / 1,000,000. events = planned-but-
// unimplemented orig feature flag, always false on insert ("events were
// off (as they're not here yet!...)").
export interface ScoreRecord {
  name: string;
  wealth: Money;
  events: boolean;
  newEntry: boolean; // transient: highlights just-inserted rows
}

export const SCORE_TABLES = 3;
export const SCORE_ENTRIES = 10;
const DEFAULT_SCORE_NAME = 'David';
const DEFAULT_SCORE_WEALTH: Money = 1000000n;

function defaultScores(): ScoreRecord[][] {
  return Array.from({ length: SCORE_TABLES }, () =>
    Array.from({ length: SCORE_ENTRIES }, () => ({
      name: DEFAULT_SCORE_NAME,
      wealth: DEFAULT_SCORE_WEALTH,
      events: false,
      newEntry: false,
    })),
  );
}

// DEVIATION:[scores-format] orig persisted as 4-lines-per-record text
// (name/wealth/char-sum-checksum/events) through a homemade cipher
// (crypt.cpp — "smv1" magic, NUL-truncating read, delete[] on
// AnsiString::c_str() memory: actively corrupting failure modes; parser
// also overflowed buffer[64]). Port: same data shape, JSON/localStorage.
export function loadScores(storage: Storage, key: string): ScoreRecord[][] {
  const text = storage.getItem(key);
  if (text === null) return defaultScores();
  try {
    const parsed = JSON.parse(text) as Array<Array<{ name: string; wealth: string; events: boolean }>>;
    if (
      !Array.isArray(parsed) ||
      parsed.length !== SCORE_TABLES ||
      parsed.some((t) => !Array.isArray(t) || t.length !== SCORE_ENTRIES)
    ) {
      return defaultScores();
    }
    return parsed.map((table) =>
      table.map((rec) => ({
        name: rec.name,
        wealth: BigInt(rec.wealth),
        events: rec.events,
        newEntry: false,
      })),
    );
  } catch {
    return defaultScores(); // corrupt → fresh defaults (orig: CreateScores)
  }
}

export function saveScores(
  storage: Storage,
  key: string,
  scores: ScoreRecord[][],
): boolean {
  try {
    storage.setItem(
      key,
      JSON.stringify(scores.map((t) =>
        t.map((r) => ({
          name: r.name,
          wealth: r.wealth.toString(),
          events: r.events,
        })),
      )),
    );
    return true;
  } catch {
    return false; // mirrors fopen()==NULL failure path
  }
}

// From HighScores.cpp HighScores(insert) — each player's netWealth is
// offered to their grid-size table; first beaten entry triggers
// shift-down + insert (drops previous #10). Orig's redundant `if (i>0)`
// guard in the shift loop omitted (unreachable: i > j >= 0).
export function highScores(
  state: AppState,
  insert: boolean,
  storage: Storage,
  key: string,
): ScoreRecord[][] {
  const scores = loadScores(storage, key);

  if (insert) {
    for (let pnum = 0; pnum < state.numplays; pnum++) {
      const netwealth = totalWealth(state, pnum);
      const table = scores[state.gridType];
      for (let j = 0; j < SCORE_ENTRIES; j++) {
        if (netwealth > table[j].wealth) {
          for (let i = SCORE_ENTRIES - 1; i > j; i--) {
            table[i] = { ...table[i - 1] };
          }
          table[j] = {
            name: state.player[pnum].name,
            wealth: netwealth,
            events: false,
            newEntry: true,
          };
          break;
        }
      }
    }
  }

  saveScores(storage, key, scores);
  return scores;
}

// ===========================================================================
// ==================== PLAYER DETAILS, END-GAME ==============================
// ===========================================================================

// From SMMain.cpp ListBox1DblClick — player portfolio view model (shown
// when detailsSet() is FALSE; "hidden due to preferences" box otherwise —
// gating is UI-layer).
// QUIRK-FIDELITY:[zombie-exclusion] sums share worth over EXISTING
// companies only — zombie shares included in Total()/high scores but
// excluded here; the two displays can legitimately disagree.
// UI bugs not ported (logged): phantom blank ListView row (stray Add());
// leaked char[64] per company (GC moot).
export interface PlayerDetailRow {
  companyId: number;
  name: string;
  shares: Money;
  worth: Money; // shares × current value
}

export interface PlayerDetailsView {
  playerIndex: number;
  name: string;
  money: Money;
  rows: PlayerDetailRow[]; // existing companies only (zombie note above)
  shareWealth: Money;       // sum of rows — NOT totalWealth()
  netWealth: Money;         // shareWealth + money
}

export function playerDetailsView(
  state: AppState,
  pnum: number,
): PlayerDetailsView {
  const rows: PlayerDetailRow[] = [];
  let wealth = 0n;

  for (let i = 0; i < NUM_COMPANIES; i++) {
    if (state.company[i].exist) {
      const shares = state.player[pnum].shares[i];
      const worthOfShares = shares * BigInt(state.company[i].value);
      rows.push({
        companyId: i,
        name: state.company[i].name,
        shares,
        worth: worthOfShares,
      });
      wealth += worthOfShares;
    }
  }

  return {
    playerIndex: pnum,
    name: state.player[pnum].name,
    money: state.player[pnum].money,
    rows,
    shareWealth: wealth,
    netWealth: wealth + state.player[pnum].money,
  };
}

// From SMMain.cpp — shared end-of-game tail (BitBtn1Click !progress branch
// ≡ EndGame1Click): progress=false → Finish → HighScores(true) →
// CreateComs. Renderer stops selector timer + erases choices first.
// (Orig comment: "This should set all companies' existance to false".)
export function concludeGame(
  state: AppState,
  storage: Storage,
  key: string,
): FinalStandings {
  state.progress = false;
  const standings = finishStandings(state);
  highScores(state, true, storage, key);
  createComs(state);
  return standings;
}

// ===========================================================================
// ==================== PREFERENCES FORM (draft-commit flow) ==================
// ===========================================================================

// From Preferences.cpp — TpreferencesForm flow expressed as data.
// FormShow caches game prefs; Okay commits draft→game; Cancel/X restores
// controls from cache then closeForm COMMITS anyway — but since it
// round-trips the unchanged cache, Cancel is a net no-op despite
// literally writing game prefs (convoluted but faithful; main form is
// disabled while the dialog is up, so nothing races). Port expresses
// Cancel as "discard the draft" — observably identical.
// QUIRK-FIDELITY:[prefs-no-validate] setChanges constructs
// CurrencyUnit(text, ...) directly — setUnit() never called, so the 1–3
// char limit is bypassed; serialize() can emit records deserialize()
// rejects. Port's constructor likewise does not validate (faithful);
// renderer MAY validate at input (UI affordance the orig lacks).
// RENDERER SPEC: allowCreation checkbox is disabled unless forceExpansion
// is checked (forceExpansionClick) — constrains reachable prefs.
export const PREFERENCES_STORE_KEY = 'Preferences'; // orig filename

// Draft = cached copy of game prefs (FormShow). Renderer controls bind to
// this; live Prefs untouched until commit.
export function openPreferencesDraft(): Prefs {
  const draft = new Prefs();
  draft.assignFrom(getGame().getPrefs());
  return draft;
}

// From setChanges(): apply draft to the game's live prefs.
export function commitPreferences(draft: Prefs): void {
  getGame().getPrefs().assignFrom(draft);
}

// From saveButtonClick(): commit, then persist.
export function savePreferences(
  draft: Prefs,
  storage: Storage,
  key: string = PREFERENCES_STORE_KEY,
): boolean {
  commitPreferences(draft);
  return draft.save(storage, key);
}

// PERSISTENCE DECISION (OPEN, Lee to resolve): orig WRITES "Preferences"
// on Save but never READS it. Options: (a) faithful-dead: ship
// savePreferences, never load; (b) wired: also load on startup (logged
// DEVIATION); (c) drop persistence. Loader provided regardless:
export function loadPreferences(
  storage: Storage,
  key: string = PREFERENCES_STORE_KEY,
): boolean {
  return getGame().getPrefs().load(storage, key);
}

// ============================================================================
// END OF SINGLE-FILE SCAFFOLD — logic layer frozen at Session 12;
// Session 13 amendment: FIX:[phase3-verified] in startGame (see header).
// ============================================================================
