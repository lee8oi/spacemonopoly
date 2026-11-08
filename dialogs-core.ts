// ============================================================================
// SPACE MONOPOLY PORT — DIALOG CORE MODULE (dialogs-core.ts) — rev 2
// Structural split of dialogs.ts rev 8 (Session 27): this module holds
// dialog CSS injection, shared DOM helpers, the modal wrapper + queue,
// and the generic boxes. History/rationale: ARCHIVE.md (Sections 0–5;
// former DIALOGS-NOTES §13.2 absorbed) / RENDERER-ARCHIVE.md (renderer
// deep history). Former notes files dissolved Session 28.
//
// rev 2 (Session 31), three changes, rest carried VERBATIM from rev 1:
//  (1) FOLD-IN: the `modal` export patch (landed on disk as a chat patch
//      after rev 1) becomes official — zero behavior change, semantics
//      identical.
//  (2) Header history refs repointed to ARCHIVE.md (queued item).
//  (3) NEW — display company palette, DEVIATION:[company-color-contrast]
//      (Lee ruling Session 31): COMPANY_DISPLAY_COLORS +
//      companyDisplayColor(). Scaffold's frozen COMPANY_DEFS (orig
//      clYellow #ffff00 / clLime #00ff00, Players.cpp CreateComs) remains
//      the FIDELITY GROUND TRUTH in state; every DISPLAY site re-points
//      here instead of reading state colors. Lee-ruled display values:
//      yellow #e0e000, green #5eea2f (darkened so white text/dots stay
//      legible on fills); red/teal/blue unchanged.
// ============================================================================

// ============================================================================
// DIALOG CSS — modal/toast/tab classes (rev-3 FIX:[modal-inheritance] rules:
// modals live on document.body, outside .sm-root, so declare own styles).
// Injected by the host (renderer.ts) via injectDialogStyles().
// ============================================================================

const DIALOG_CSS = `
.sm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center; z-index: 100; }
.sm-modal { background: #23233a; border: 1px solid #5a5a85; border-radius: 8px;
  padding: 18px; min-width: 320px; max-width: 520px; max-height: 80vh; overflow: auto;
  color: #e8e8f2; font-family: 'Segoe UI', system-ui, sans-serif; }
.sm-modal button { background: #2a2a44; color: #e8e8f2;
  border: 1px solid #4a4a6a; border-radius: 4px; padding: 4px 12px; cursor: pointer; }
.sm-modal button:disabled { opacity: 0.4; cursor: default; }
.sm-modal h3 { margin: 0 0 10px 0; }
.sm-modal table { border-collapse: collapse; margin: 8px 0; }
.sm-modal td, .sm-modal th { border: 1px solid #4a4a6a; padding: 4px 10px;
  text-align: left; font-size: 13px; }
.sm-modal input[type=text] { background: #14141f; color: #e8e8f2;
  border: 1px solid #4a4a6a; border-radius: 4px; padding: 4px 8px; width: 140px; }
.sm-modal .sm-row { display: flex; gap: 8px; align-items: center; margin: 6px 0;
  flex-wrap: wrap; }
.sm-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.sm-status { color: #ff9a9a; font-size: 13px; min-height: 18px; }
.sm-toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
  background: #2e2e52; border: 1px solid #6a6aa0; border-radius: 6px; padding: 10px 18px;
  z-index: 200; box-shadow: 0 4px 16px rgba(0,0,0,0.5);
  color: #e8e8f2; font-family: 'Segoe UI', system-ui, sans-serif; }
.sm-hint { font-size: 12px; color: #7a7aa0; }
.sm-splitbanner { display: flex; align-items: center; gap: 10px; margin: 8px 0;
  flex-wrap: wrap; }
.sm-splitbanner .sm-swatch { width: 18px; height: 18px; }
/* FIDELITY:[highscores-tabs] (rev 12): tab strip approximating the orig
   3-grid PageControl; new-entry rows tinted (orig used row selection). */
.sm-tabs { display: flex; gap: 4px; margin: 8px 0; }
.sm-tabs button { background: #1d1d30; color: #9a9ac0;
  border: 1px solid #3a3a58; border-radius: 4px 4px 0 0; padding: 4px 14px;
  cursor: pointer; }
.sm-tabs button.sm-tabactive { background: #2a2a44; color: #e8e8f2;
  border-color: #5a5a85; font-weight: 600; }
.sm-tabs button:focus { outline: none; }
tr.sm-newentry { background: #2e2e52; font-weight: 700; }
/* Rev 2: players pane + reorder buttons (orig Players.cpp right column). */
.sm-players-pane { display: flex; gap: 10px; align-items: stretch; }
.sm-pane-left { flex: 1 1 auto; min-width: 0; }
.sm-pane-right { display: flex; flex-direction: column; justify-content: flex-start;
  flex: 0 0 auto; }
.sm-btn-group { display: flex; flex-direction: column; gap: 6px; }
.sm-playerrow { border-radius: 4px; }
.sm-playerrow-selected { background: #2e2e52; }
/* Rev 8: preferences group sections (§12.4 Batch E). */
.sm-grouptitle { font-weight: 600; margin: 12px 0 2px 0; }
.sm-indent { margin-left: 22px; }
`;

export function injectDialogStyles(): void {
  const style = el('style');
  style.textContent = DIALOG_CSS;
  document.head.appendChild(style);
}

// ============================================================================
// SHARED DOM HELPER (exported — renderer.ts chrome reuses it)
// ============================================================================

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

// ============================================================================
// MODAL WRAPPER + QUEUE (moved from renderer.ts; mechanics unchanged)
// ============================================================================

export function modal(content: HTMLElement): () => void {
  const overlay = el('div', 'sm-overlay');
  const box = el('div', 'sm-modal');
  box.appendChild(content);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  return () => overlay.remove();
}

// Sequential modal presentation for game-event announcements. Our modals
// are non-blocking DOM overlays (the orig ShowModal() halted everything);
// queueing preserves "one at a time" if multiple events fire inside a
// single action() (mergers can chain; a merger can trigger a split).
// REV-6 CONTRACT (FIX:[splitdialog-close]): the open() callback receives a
// release() that MUST be called when the dialog closes; callers pair it
// with their own overlay dismissal — dismiss the overlay FIRST, THEN call
// release(). Discarding the modal() return value wedges the queue.
export function queueModal(open: (release: () => void) => void): void {
  modalQueue.push(open);
  pumpQueue();
}

let modalQueue: Array<(release: () => void) => void> = [];
let queueActive = false;

function pumpQueue(): void {
  if (queueActive || modalQueue.length === 0) return;
  queueActive = true;
  const open = modalQueue.shift()!;
  open(() => {
    queueActive = false;
    pumpQueue();
  });
}

// ============================================================================
// DISPLAY COMPANY PALETTE — DEVIATION:[company-color-contrast] (rev 2)
// ============================================================================

// Display values for the five companies, INDEX-ALIGNED with scaffold's
// frozen COMPANY_DEFS (0–4). Scaffold/state keep the orig VCL hues as the
// fidelity record; every DISPLAY site must read THESE, not state colors,
// so the user-visible palette stays consistent across side-panel swatches,
// board tokens, and dialogs. Lee-ruled Session 31: yellow/green darkened
// so white text (band captions, A–E initials) and the white affordability
// dot stay legible on the fills.
export const COMPANY_DISPLAY_COLORS: ReadonlyArray<string> = [
  '#ff0000', // 0 Atlantis Ltd.   — clRed, unchanged
  '#5eea2f', // 1 Betelguese      — orig clLime #00ff00, darkened (Lee)
  '#e0e000', // 2 Cannon Inc.     — orig clYellow #ffff00, darkened (Lee)
  '#008080', // 3 Debenese        — clTeal, unchanged
  '#0000ff', // 4 Eridnus Corp.   — clBlue, unchanged
];

// Display color for company index `com`. `nonexistent` is the caller's
// gray-filler for absent/out-of-range indices (board paints '#888',
// side-panel repaint uses '#555' — pass your site's value to preserve
// its existing behavior exactly).
export function companyDisplayColor(
  com: number,
  nonexistent: string = '#888',
): string {
  return COMPANY_DISPLAY_COLORS[com] ?? nonexistent;
}

// ============================================================================
// GENERIC BOXES (msgBox, toast)
// ============================================================================

export function msgBox(title: string, text: string): void {
  const box = el('div');
  box.appendChild(el('h3', undefined, title));
  box.appendChild(el('div', undefined, text));
  const actions = el('div', 'sm-actions');
  const ok = el('button', undefined, 'OK');
  actions.appendChild(ok);
  box.appendChild(actions);
  const close = modal(box);
  ok.addEventListener('click', close);
}

export function toast(text: string): void {
  const t = el('div', 'sm-toast', text);
  document.body.appendChild(t);
  window.setTimeout(() => t.remove(), 2500);
}
