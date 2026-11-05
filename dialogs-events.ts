// ============================================================================
// SPACE MONOPOLY PORT — EVENT DIALOGS MODULE (dialogs-events.ts) — rev 1
// Founding / split / merger announcement dialogs (orig NewCom / SplitForm /
// Merger form). Structural split of dialogs.ts rev 8 (Session 27, spine
// §15.4): content carried VERBATIM — region commentary relocates to the
// spine at each region's next substantive reissue (§15.3 piggyback rule),
// so it is intentionally preserved here until then. History/rationale:
// DIALOGS-NOTES.md / RENDERER-NOTES.md; full narrative in RENDERER-ARCHIVE.md.
//
// Rev 1 = verbatim carry from dialogs.ts rev 8; zero behavior change.
// ============================================================================

import type {
  AppState,
  Money,
} from './scaffold';
import {
  TOURNAMENT,
} from './scaffold';
import {
  el,
  modal,
  queueModal,
} from './dialogs-core';

// R15 view-model rows: per-player table content for split/merger dialogs,
// captured EAGERLY in renderer.ts's actionHooks (queued-modal safety);
// presented here.
export interface SplitTableRow {
  playerIndex: number;
  name: string;
  sharesBefore: Money;
  sharesAfter: Money;
}
export interface MergerTableRow {
  playerIndex: number;
  name: string;
  absorbedShares: Money;  // shares in the absorbed company (never zeroed — zombie quirk)
  survivorShares: Money;  // post-conversion holding in the survivor (CLASSIC)
  moneyEarned: Money;     // payout = absorbed shares × pre-merger absorbed value
}

// ============================================================================
// FOUNDING DIALOG
// ============================================================================

// FIDELITY:[comform-modal] — orig NewCom modal: company name, starting
// share price, founder's grant. On dismissal, orig immediately opens
// Info(i) — the trade dialog for the new company — chained via onDismiss.
// Session 24 rev 4 (Batch A): wording formalized to orig screenshot
// evidence (DIALOGS-NOTES §12.4) — headline "New Company!", bold lead
// "A new company has been formed", then the three orig sentences.
// Color banner retained (DEVIATION:[color-banner] — orig is plain).
export function foundingDialog(
  state: AppState,
  companyId: number,
  formatMoney: (amount: bigint) => string,
  onDismiss?: () => void,
): void {
  queueModal((release) => {
    const s = state;
    const c = s.company[companyId];
    const founder = s.player[s.curplay];
    const box = el('div');
    box.appendChild(el('h3', undefined, 'New Company!'));

    const banner = el('div', 'sm-splitbanner');
    const swatch = el('span', 'sm-swatch');
    swatch.style.background = c.color;
    banner.appendChild(swatch);
    banner.appendChild(el('strong', undefined, c.name));
    box.appendChild(banner);

    const lead = el('div');
    lead.appendChild(el('strong', undefined, 'A new company has been formed.'));
    box.appendChild(lead);

    box.appendChild(el('div', undefined,
      `The new company's name is ${c.name}.`));
    box.appendChild(el('div', undefined,
      `The shares will start at ${formatMoney(BigInt(c.value))} each.`));
    box.appendChild(el('div', undefined,
      `${founder.name} will get five free shares in the company and ` +
      `${formatMoney(BigInt(c.value))}.`));

    const actions = el('div', 'sm-actions');
    const ok = el('button', undefined, 'OK');
    actions.appendChild(ok);
    box.appendChild(actions);
    const dismiss = modal(box);
    ok.addEventListener('click', () => {
      dismiss();
      release();
      onDismiss?.(); // orig: NewCom->ShowModal(); then Info(i);
    });
  });
}

// ============================================================================
// SPLIT DIALOG
// ============================================================================

// FIDELITY:[splitform-modal] — orig SplitForm dialog announcing a 2-for-1
// split, with the orig per-player ListView restored (R15): one row per
// player — name / shares before / shares after — populated over the same
// range the orig loops (CLASSIC: all players; TOURNAMENT: current only).
// Rows are EAGER-CAPTURED in renderer.ts's actionHooks (queued-modal
// safety); only presentation lives here.
// Session 24 rev 4 (Batch A): wording formalized to orig screenshot
// evidence — headline "Shares Split Two For One!", orig two-sentence body
// (the port's value-reached line and share-price bullet are DROPPED per
// DIALOGS-NOTES §12.3 — both facts are carried by the orig sentence);
// table captions "Shares Before Split" / "Shares After Split".
export function splitDialog(
  state: AppState,
  companyId: number,
  oldPrice: number,
  rows: SplitTableRow[],
  formatMoney: (amount: bigint) => string,
): void {
  queueModal((release) => {
    const s = state;
    const c = s.company[companyId];
    const box = el('div');
    box.appendChild(el('h3', undefined, 'Shares Split Two For One!'));

    const banner = el('div', 'sm-splitbanner');
    const swatch = el('span', 'sm-swatch');
    swatch.style.background = c.color;
    banner.appendChild(swatch);
    banner.appendChild(el('strong', undefined, c.name));
    box.appendChild(banner);

    box.appendChild(el('div', undefined,
      `Shares in ${c.name} have split two for one. The previous share ` +
      `price of ${formatMoney(BigInt(oldPrice))} has been changed to ` +
      `${formatMoney(BigInt(c.value))}.`));

    // R15: orig SplitForm ListView — name / shares before / shares after.
    const table = el('table');
    const head = el('tr');
    for (const h of ['Player', 'Shares Before Split', 'Shares After Split']) {
      head.appendChild(el('th', undefined, h));
    }
    table.appendChild(head);
    for (const r of rows) {
      const tr = el('tr');
      if (r.playerIndex === s.curplay) tr.style.fontWeight = '700';
      tr.appendChild(el('td', undefined, r.name));
      tr.appendChild(el('td', undefined, r.sharesBefore.toString()));
      tr.appendChild(el('td', undefined, r.sharesAfter.toString()));
      table.appendChild(tr);
    }
    box.appendChild(table);

    // FIX:[tournament-doubling-hint]: mode-aware doubling note.
    box.appendChild(el('div', 'sm-hint',
      s.gameType === TOURNAMENT
        ? 'Only the current player\u2019s shares are doubled in Tournament (original behavior).'
        : 'All shareholders have had their share counts doubled.'));

    const actions = el('div', 'sm-actions');
    const ok = el('button', undefined, 'OK');
    actions.appendChild(ok);
    box.appendChild(actions);

    const dismiss = modal(box);
    ok.addEventListener('click', () => {
      dismiss();  // remove the overlay from the DOM...
      release();  // ...then free the queue for the next dialog
    });
  });
}

// ============================================================================
// MERGER DIALOG
// ============================================================================

// FIDELITY:[mergerform-modal] — orig Merger form dialog with the per-player
// ListView restored (R15): one row per player — name / shares in the
// survivor / shares in the absorbed company / money earned — over the same
// range the orig loops (CLASSIC: all players; TOURNAMENT: current only).
// Row data is captured in renderer.ts's merger hook (mutation-before-
// display, eager capture for queued-modal safety); only presentation here.
// Session 24 rev 4 (Batch A): wording formalized to orig screenshot
// evidence — the orig three sentences replace the port's combined-value
// line (DROPPED per DIALOGS-NOTES §12.3); table columns reordered
// SURVIVOR-FIRST per orig evidence ("Shares in Cannon Inc." precedes
// "Shares in Debenese" in the original screenshot). Color banners retained
// (DEVIATION:[color-banner]).
// Session 25 (rev 7): the vestigial oldSurvivorValue/absorbedValue params
// PRUNED — they were unused since Batch A and were retained only for
// call-site stability; the renderer call site drops them in rev 24.
export function mergerDialog(
  state: AppState,
  survivorId: number,
  absorbedId: number,
  rows: MergerTableRow[],
  formatMoney: (amount: bigint) => string,
): void {
  queueModal((release) => {
    const s = state;
    const survivor = s.company[survivorId];
    const absorbed = s.company[absorbedId];
    const box = el('div');
    box.appendChild(el('h3', undefined, 'Merger!'));

    // Absorbed banner (struck-through name to signal it's gone).
    const banner = el('div', 'sm-splitbanner');
    const swAb = el('span', 'sm-swatch');
    swAb.style.background = absorbed.color;
    const abName = el('strong', undefined, absorbed.name);
    abName.style.textDecoration = 'line-through';
    banner.appendChild(swAb);
    banner.appendChild(abName);
    banner.appendChild(el('span', undefined, 'has been taken over by'));
    box.appendChild(banner);
    const banner2 = el('div', 'sm-splitbanner');
    const swSv = el('span', 'sm-swatch');
    swSv.style.background = survivor.color;
    banner2.appendChild(swSv);
    banner2.appendChild(el('strong', undefined, survivor.name));
    box.appendChild(banner2);

    // Orig Merger body (Batch A): three formalized sentences.
    box.appendChild(el('div', undefined,
      `There has been a merger between ${survivor.name} and ` +
      `${absorbed.name}.`));
    box.appendChild(el('div', undefined,
      `The new company will take the name of ${survivor.name}.`));
    box.appendChild(el('div', undefined,
      `The cost of ${survivor.name} shares will be ` +
      `${formatMoney(BigInt(survivor.value))}.`));

    // R15: orig Merger ListView — name / shares in survivor / shares in
    // absorbed / money earned (survivor first, per orig evidence).
    const table = el('table');
    const head = el('tr');
    for (const h of ['Player', `Shares in ${survivor.name}`, `Shares in ${absorbed.name}`, 'Money Earned']) {
      head.appendChild(el('th', undefined, h));
    }
    table.appendChild(head);
    for (const r of rows) {
      const tr = el('tr');
      if (r.playerIndex === s.curplay) tr.style.fontWeight = '700';
      tr.appendChild(el('td', undefined, r.name));
      tr.appendChild(el('td', undefined, r.survivorShares.toString()));
      tr.appendChild(el('td', undefined, r.absorbedShares.toString()));
      tr.appendChild(el('td', undefined, formatMoney(r.moneyEarned)));
      table.appendChild(tr);
    }
    box.appendChild(table);

    if (s.gameType === TOURNAMENT) {
      // QUIRK tournament-no-conversion: TOURNAMENT payouts without
      // conversion — surfaced rather than hidden.
      box.appendChild(el('div', 'sm-hint',
        'Tournament: shares are not converted \u2014 only the cash payout occurs (original behavior).'));
    }

    box.appendChild(el('div', 'sm-hint',
      `${absorbed.name} no longer exists; its squares now belong to ` +
      `${survivor.name}.`));

    const actions = el('div', 'sm-actions');
    const ok = el('button', undefined, 'OK');
    actions.appendChild(ok);
    box.appendChild(actions);

    const dismiss = modal(box);
    ok.addEventListener('click', () => {
      dismiss();
      release();
    });
  });
}
