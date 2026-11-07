// ============================================================================
// SPACE MONOPOLY PORT — RENDERER BOARD (renderer-board.ts) — rev 1
// Split from renderer.ts rev 25 (rev-26 wave, Session 30). ZERO BEHAVIOR
// CHANGE; method bodies carried VERBATIM from rev 25 except ownership
// re-points: board-local fields keep `this.`; anything owned elsewhere is
// reached via `app.` / `app.chrome.` (full-app-object plumbing — no
// accessor machinery). Session-17 dialogs-split precedent.
// This module OWNS: canvas + 2D context, selector timer state
// (handle + Tag), and the ResizeObserver over the board region.
// Palette constants + the boardRegion ELEMENT are chrome-owned (built
// in AppChrome); board holds the runtime (fit, observe, paint).
// Chrome stylesheet loads BEFORE canvas painting (injectStyles runs in
// AppChrome, constructed before AppBoard — order preserved from rev 25).
// ============================================================================

import {
  CELL_EMPTY,
  CELL_CIRCLE,
  CELL_DIAMOND,
  COMPANY_CELL_BASE,
  NUM_COMPANIES,
  checkPlacementRules,
  action,
  eraseChoices,
} from './scaffold';
import {
  CHECKER_A,
  CHECKER_B,
  GRID_LINE,
  CIRCLE_FILL,
  CIRCLE_STROKE,
  DIAMOND_FILL,
  DIAMOND_STROKE,
  SEL_FILL,
  SEL_BORDER_NORMAL,
  SEL_BORDER_ACTIVE,
  ACTIVE_STROKE,
} from './renderer-chrome';
import { el, msgBox } from './dialogs';
import type { SpaceMonopolyApp } from './renderer';

const TIMER_INTERVAL_MS = 250;        // orig Timer1 interval unknown; chosen

export class AppBoard {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private resizeObs: ResizeObserver | null = null;
  private timerHandle: number | null = null;
  private timerTag = 0; // Timer1 Tag, cycles 0..4

  constructor(private readonly app: SpaceMonopolyApp) {
    this.canvas = el('canvas', 'sm-board');
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.app.chrome.boardRegion.appendChild(this.canvas);
  }

  // Called by the shell constructor at the SAME point rev 25 created the
  // observer (after setGridSize(SMALL)) — construction order preserved.
  initResizeObserver(): void {
    this.resizeObs = new ResizeObserver(() => this.fitBoard());
    this.resizeObs.observe(this.app.chrome.boardRegion);
  }

  // Responsive fit. Computes the largest aspect-preserving board inside
  // the board region, sets the canvas' CSS size to it and the backing
  // store to display size × devicePixelRatio (crisp at any DPR — no
  // upscale blur). Early-returns on zero-size regions (constructor /
  // detached roots); the ResizeObserver delivers the first real fit once
  // layout lands. FIX:[click-mapping]'s rect-proportional mouse mapping
  // is immune to display scaling, so clicks stay correct at every size
  // with no mouse-side changes.
  fitBoard(): void {
    const cfg = this.app.state.gridConfig();
    const baseW = cfg.xsize * cfg.tileW;
    const baseH = cfg.ysize * cfg.tileH;
    const rw = this.app.chrome.boardRegion.clientWidth;
    const rh = this.app.chrome.boardRegion.clientHeight;
    if (rw <= 0 || rh <= 0) return;
    const scale = Math.min(rw / baseW, rh / baseH);
    const dispW = Math.max(1, Math.floor(baseW * scale));
    const dispH = Math.max(1, Math.floor(baseH * scale));
    this.canvas.style.width = `${dispW}px`;
    this.canvas.style.height = `${dispH}px`;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(dispW * dpr);
    this.canvas.height = Math.round(dispH * dpr);
    this.redrawGrid();
  }

  redrawGrid(): void {
    const s = this.app.state;
    const cfg = s.gridConfig();
    const ctx = this.ctx;
    const baseW = cfg.xsize * cfg.tileW;
    const baseH = cfg.ysize * cfg.tileH;

    // Map base-tile drawing units onto the backing store. ALL existing
    // draw sites (drawCellEntity, drawSels) remain in base units and
    // scale for free. clearRect is in BASE units too — clearing
    // canvas.width/height here would clear in transformed units and
    // misbehave (backing-store pixels ≠ base units). Keep clear bounds
    // in base units.
    ctx.setTransform(
      this.canvas.width / baseW, 0, 0, this.canvas.height / baseH, 0, 0,
    );
    ctx.clearRect(0, 0, baseW, baseH);

    for (let y = 0; y < cfg.ysize; y++) {
      for (let x = 0; x < cfg.xsize; x++) {
        // Checkerboard — ImageList iStart + (x+y)%2 equivalent.
        // DEVIATION:[dark-checker] — dark palette per B1.
        ctx.fillStyle = (x + y) % 2 === 0 ? CHECKER_A : CHECKER_B;
        ctx.fillRect(x * cfg.tileW, y * cfg.tileH, cfg.tileW, cfg.tileH);
        this.drawCellEntity(x, y);
      }
    }

    // Thin cell borders — single grid-line pass AFTER the fills/entities
    // so lines read over both checker phases.
    ctx.strokeStyle = GRID_LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= cfg.xsize; x++) {
      ctx.moveTo(x * cfg.tileW, 0);
      ctx.lineTo(x * cfg.tileW, baseH);
    }
    for (let y = 0; y <= cfg.ysize; y++) {
      ctx.moveTo(0, y * cfg.tileH);
      ctx.lineTo(baseW, y * cfg.tileH);
    }
    ctx.stroke();

    this.drawSels();
  }

  // SEAM — board-entity art at drawCellEntity(). Swap point if extracted
  // .res bitmaps are ever wanted. Contract: draws in BASE tile units
  // under the canvas transform.
  //
  // Entities:
  //  (1) COMPANY_CELL_BASE+: symmetric CROSS TOKEN in company color,
  //      thick dark outline tracing all edges. Geometry (square cells,
  //      DEVIATION:[square-cells]): center square 70% of the cell; ALL
  //      FOUR arms use the SAME span fraction (46% half-span); arm
  //      width 33%. DEVIATION:[company-initial] — white letter A–E on
  //      the center square, stroked-outline halo, 40%-of-cell font.
  //  (2) CELL_CIRCLE: faithful BLUE circle (brightened for dark checker).
  //  (3) CELL_DIAMOND: faithful YELLOW rotated square, flat fill.
  //  DEVIATION:[token-flat-shading] — no bevels/drop shadows.
  private drawCellEntity(x: number, y: number): void {
    const s = this.app.state;
    const cfg = s.gridConfig();
    const cell = s.grid.get(x, y);
    if (cell === CELL_EMPTY) return;
    const ctx = this.ctx;
    const cx = x * cfg.tileW + cfg.tileW / 2;
    const cy = y * cfg.tileH + cfg.tileH / 2;
    const m = Math.min(cfg.tileW, cfg.tileH);
    if (cell === CELL_CIRCLE) {
      // Faithful blue circle, brightened for dark board.
      // Size: ~90% of smaller tile dimension.
      const r = m * 0.45;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = CIRCLE_FILL;
      ctx.fill();
      ctx.strokeStyle = CIRCLE_STROKE;
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (cell === CELL_DIAMOND) {
      // Faithful yellow rotated square, near-full cell, flat fill +
      // black outline only (highlight ellipse removed — it read as a
      // spurious glyph at cell sizes).
      const r = m * 0.48;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
      ctx.fillStyle = DIAMOND_FILL;
      ctx.fill();
      ctx.strokeStyle = DIAMOND_STROKE;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (cell >= COMPANY_CELL_BASE) {
      const com = cell - COMPANY_CELL_BASE;
      const color = s.company[com]?.color ?? '#888';

      // Symmetric cross (square cells): all four arms use the SAME
      // span fraction of the cell; no vertical full-bleed.
      const centerSize = m * 0.70;
      const armW = m * 0.33;
      const halfSpan = m * 0.46;
      const halfCs = centerSize / 2;
      const armLen = halfSpan - halfCs;

      ctx.fillStyle = color;
      ctx.strokeStyle = '#12121c';
      ctx.lineWidth = 2;

      // Center square.
      ctx.fillRect(cx - halfCs, cy - halfCs, centerSize, centerSize);
      ctx.strokeRect(cx - halfCs, cy - halfCs, centerSize, centerSize);

      // Arms — top, bottom, left, right (identical geometry both axes).
      ctx.fillRect(cx - armW / 2, cy - halfSpan, armW, armLen);
      ctx.strokeRect(cx - armW / 2, cy - halfSpan, armW, armLen);
      ctx.fillRect(cx - armW / 2, cy + halfCs, armW, armLen);
      ctx.strokeRect(cx - armW / 2, cy + halfCs, armW, armLen);
      ctx.fillRect(cx - halfSpan, cy - armW / 2, armLen, armW);
      ctx.strokeRect(cx - halfSpan, cy - armW / 2, armLen, armW);
      ctx.fillRect(cx + halfCs, cy - armW / 2, armLen, armW);
      ctx.strokeRect(cx + halfCs, cy - armW / 2, armLen, armW);

      // DEVIATION:[company-initial] — white letter A–E on the center
      // square (stroked-outline halo + bold 40% font).
      const letter = String.fromCharCode(65 + com);
      const fontSize = Math.floor(m * 0.4);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.lineWidth = Math.max(2, m * 0.06);
      ctx.strokeStyle = '#12121c';
      ctx.strokeText(letter, cx, cy);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(letter, cx, cy);
    }
  }

  // Sels: normal selection = solid royal blue fill + thick white border;
  // active (timer-cycled) = solid blue square + thick lime-green border.
  private drawSels(): void {
    const s = this.app.state;
    if (!s.sels) return;
    const cfg = s.gridConfig();
    const ctx = this.ctx;
    for (let i = 0; i < NUM_COMPANIES; i++) {
      const [cx, cy] = s.choice[i];
      if (cx < 0 || cy < 0) continue; // fewer than 5 valid picks is legal
      const px = cx * cfg.tileW;
      const py = cy * cfg.tileH;
      if (i === this.timerTag) {
        // Active: solid blue square + thick green border.
        ctx.fillStyle = SEL_FILL;
        ctx.fillRect(px, py, cfg.tileW, cfg.tileH);
        ctx.strokeStyle = ACTIVE_STROKE;
        ctx.lineWidth = 3;
        ctx.strokeRect(px + 2, py + 2, cfg.tileW - 4, cfg.tileH - 4);
      } else {
        // Normal: solid blue fill + thick white border.
        ctx.fillStyle = SEL_FILL;
        ctx.fillRect(px, py, cfg.tileW, cfg.tileH);
        ctx.strokeStyle = SEL_BORDER_NORMAL;
        ctx.lineWidth = 3;
        ctx.strokeRect(px + 2, py + 2, cfg.tileW - 4, cfg.tileH - 4);
      }
    }
  }

  startSelectorTimer(): void {
    this.stopSelectorTimer();
    this.timerHandle = window.setInterval(() => {
      this.timerTag = (this.timerTag + 1) % NUM_COMPANIES;
      this.redrawGrid();
    }, TIMER_INTERVAL_MS);
  }

  stopSelectorTimer(): void {
    if (this.timerHandle !== null) {
      window.clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  // --- Mouse (FIX:[click-mapping] rect-proportional mapping) -----------------
  // Correct even if the canvas is CSS-scaled (flex squeeze, host page,
  // DPR oddities) — this is what lets the board stay responsive with
  // zero mouse-side changes.

  private cellFromEvent(e: MouseEvent): [number, number] | null {
    const cfg = this.app.state.gridConfig();
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    if (fx < 0 || fy < 0 || fx >= 1 || fy >= 1) return null;
    const x = Math.floor(fx * cfg.xsize);
    const y = Math.floor(fy * cfg.ysize);
    if (x < 0 || y < 0 || x >= cfg.xsize || y >= cfg.ysize) return null;
    return [x, y];
  }

  private onMouseDown(e: MouseEvent): void {
    const s = this.app.state;
    if (!s.progress) return;
    const cell = this.cellFromEvent(e);
    if (!cell) return;
    const [x, y] = cell;
    const inChoice = s.choice.some(([cx, cy]) => cx === x && cy === y);
    if (!inChoice) {
      this.app.flashHint('Click one of the five flashing squares!'); // R12
      return;
    }

    const err = checkPlacementRules(s, x, y);
    if (err !== null) {
      msgBox('Game Information...', err);
      return;
    }

    this.stopSelectorTimer();
    s.sels = false;
    eraseChoices(s);
    action(s, x, y, this.app.actionHooks());
  }

  private onMouseMove(e: MouseEvent): void {
    const s = this.app.state;
    if (!s.progress) {
      this.canvas.style.cursor = 'default';
      return;
    }
    const cell = this.cellFromEvent(e);
    const over =
      cell !== null && s.choice.some(([cx, cy]) => cx === cell[0] && cy === cell[1]);
    this.canvas.style.cursor = over ? 'pointer' : 'default'; // crHandPoint
  }
}
