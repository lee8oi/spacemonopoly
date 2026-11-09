// ============================================================================
// SPACE MONOPOLY PORT — META DIALOGS MODULE (dialogs-meta.ts) — rev 2
// Preferences (orig Preferences.cpp), high scores (orig HighScores), final
// standings (orig OverForm Finish), about, quit confirm. Structural split
// of dialogs.ts rev 8 (Session 27, spine §15.4): content carried VERBATIM;
// region commentary relocates to the spine at each region's next
// substantive reissue (§15.3 piggyback rule). History/rationale:
// DIALOGS-NOTES.md / RENDERER-NOTES.md; full narrative in RENDERER-ARCHIVE.md.
//
// Rev 2 (Session 32): About dialog expanded per Lee ruling (queue item 2):
// one-line credit to original author (David Vivash), one-line port
// description, and a basic gameplay list — wrapped in a scrollable
// container (inline max-height/overflow-y) so the card stays compact.
// Orig AboutBox was finished/trivial and carried no gameplay text, so the
// summary is a Lee-sanctioned port ADDITION, not a fidelity restoration.
// All other regions carried verbatim from rev 1.
// Rev 1 = verbatim carry from dialogs.ts rev 8; zero behavior change.
// ============================================================================

import type {
  AppState,
  GridType,
  FinalStandings,
  ScoreRecord,
} from './scaffold';
import {
  SMALL,
  MEDIUM,
  LARGE,
  GRID_CONFIGS,
  CurrencyUnit,
  highScores,
  openPreferencesDraft,
  commitPreferences,
  savePreferences,
} from './scaffold';
import {
  el,
  modal,
} from './dialogs-core';

// ============================================================================
// PREFERENCES (draft-commit flow; orig Preferences.cpp)
// ============================================================================

// Session 26 rev 8 (Batch E): presentation redesigned to orig screenshot
// evidence (DIALOGS-NOTES §12.4) — single page (DEVIATION:[single-page-
// prefs]) with two group sections: "Currency Settings" (unit stays
// free-text per R11 renderer-validation deviation; Prefix/Postfix converted
// from select to RADIO PAIR per orig radio evidence) and "Gameplay
// Options" (renamed from orig "Multiplayer Options" per ruling §12.6-6 —
// the orig's own subtext admits single-player use) with the orig subtext
// verbatim and orig checkbox wording (Force Mergers / Force Expansion /
// Allow Company Creation — indented, disabled unless expansion /
// Hide Player Details). Buttons Save / Okay / Cancel per §12.6-5
// semantics. Persistence WIRED (DEVIATION:[prefs-wired], supersedes the
// R8 faithful-dead settlement): Save = commit + persist
// (savePreferences); Okay = commit only (commitPreferences), no persist;
// Cancel = discard draft. Read side: loadPreferences() activates at
// renderer boot — ships with renderer rev 25 (Batch G); until then the
// write path lands first (deliberate sequencing, Session 26 ruling).
export function prefsDialog(
  moneyShow: () => void,
  storage: Storage,
  key: string,
): void {
  const draft = openPreferencesDraft();
  const box = el('div');
  box.appendChild(el('h3', undefined, 'Preferences'));

  // --- Currency Settings group (orig General tab evidence §12.2-8) ---
  box.appendChild(el('div', 'sm-grouptitle', 'Currency Settings'));
  const unitRow = el('div', 'sm-row');
  unitRow.appendChild(el('span', undefined, 'Currency unit:'));
  const unitInput = el('input') as HTMLInputElement;
  unitInput.type = 'text';
  unitInput.maxLength = 3; // R11: renderer validation (orig lacks it)
  unitInput.value = draft.getCurrencyUnit().getUnit();
  unitRow.appendChild(unitInput);
  box.appendChild(unitRow);

  // Prefix / Postfix radio pair (rev 8: converted from select per §12.4).
  let prefixSelected = draft.getCurrencyUnit().isPrefix();
  const prefixRow = el('div', 'sm-row');
  const mkCurRadio = (label: string, value: boolean, checked: boolean): void => {
    const inp = el('input') as HTMLInputElement;
    inp.type = 'radio';
    inp.name = 'sm-curpos';
    inp.checked = checked;
    inp.addEventListener('change', () => {
      if (inp.checked) prefixSelected = value;
    });
    prefixRow.appendChild(inp);
    prefixRow.appendChild(el('span', undefined, label));
  };
  mkCurRadio('Prefix (\u00A3500)', true, prefixSelected);
  mkCurRadio('Postfix (500\u00A3)', false, !prefixSelected);
  box.appendChild(prefixRow);

  // --- Gameplay Options group (renamed per §12.6-6) ---
  box.appendChild(el('div', 'sm-grouptitle', 'Gameplay Options'));
  box.appendChild(el('div', 'sm-hint',
    '(Recommended for multiplayer games, but can be used for single player games)'));

  const mkCheck = (
    label: string,
    checked: boolean,
    indent: boolean,
  ): HTMLInputElement => {
    const row = el('div', 'sm-row' + (indent ? ' sm-indent' : ''));
    const cb = el('input') as HTMLInputElement;
    cb.type = 'checkbox';
    cb.checked = checked;
    row.appendChild(cb);
    row.appendChild(el('span', undefined, label));
    box.appendChild(row);
    return cb;
  };
  const mergers = mkCheck('Force Mergers', draft.mergersSet(), false);
  const expansion = mkCheck('Force Expansion', draft.expansionSet(), false);
  const details = mkCheck('Hide Player Details', draft.detailsSet(), false);
  const companies = mkCheck('Allow Company Creation', draft.companiesSet(), true);

  // RENDERER SPEC (orig forceExpansionClick): allowCreation disabled
  // unless forceExpansion is checked.
  const syncCompanies = (): void => {
    companies.disabled = !expansion.checked;
  };
  expansion.addEventListener('change', syncCompanies);
  syncCompanies();

  const status = el('div', 'sm-status');
  const actions = el('div', 'sm-actions');
  const save = el('button', undefined, 'Save');
  const okay = el('button', undefined, 'Okay');
  const cancel = el('button', undefined, 'Cancel');
  actions.appendChild(save);
  actions.appendChild(okay);
  actions.appendChild(cancel);
  box.appendChild(status);
  box.appendChild(actions);

  const close = modal(box);
  cancel.addEventListener('click', close); // Cancel = discard draft (no-op net)

  // Validation + draft fill (shared by Save and Okay; §12.6-5 semantics).
  const applyDraft = (): boolean => {
    const unit = unitInput.value.trim();
    if (unit.length < 1 || unit.length > 3) {
      status.textContent = 'Currency unit must be 1\u20133 characters.';
      return false;
    }
    draft.setCurrencyUnit(new CurrencyUnit(unit, prefixSelected));
    draft.setMergers(mergers.checked);
    draft.setExpansion(expansion.checked);
    draft.setDetails(details.checked);
    draft.setCompanies(companies.checked);
    return true;
  };

  // §12.6-5: Save = apply to live game + persist (write path; the
  // read-at-boot side ships with renderer rev 25 / Batch G).
  save.addEventListener('click', () => {
    if (!applyDraft()) return;
    savePreferences(draft, storage, key);
    moneyShow();
    close();
  });

  // §12.6-5: Okay = apply to live game + close, NO persist.
  okay.addEventListener('click', () => {
    if (!applyDraft()) return;
    commitPreferences(draft);
    moneyShow();
    close();
  });
}

// ============================================================================
// HIGH SCORES (FIDELITY:[highscores-tabs], R16 RETIRED)
// ============================================================================

// Shared tabbed presentation (orig 3-grid PageControl equivalent). Used by
// BOTH the standalone High Scores menu dialog and the end-of-game second
// modal; the current grid's tab is ACTIVATED on entry (orig behavior on
// insert). New entries are bold + row-tinted (orig used row selection).
// Session 24 rev 6 (Batch C): tab captions DERIVED AT RUNTIME from
// GRID_CONFIGS actual geometry (labels can no longer drift if a grid
// config changes; orig captions overstated Medium/Large and are
// deliberately corrected per Lee ruling DIALOGS-NOTES §12.6-3);
// Position/Name/Net Wealth header row added; button Close → Okay.
export function scoresTableDialog(
  scores: ScoreRecord[][],
  gridType: GridType,
  formatMoney: (amount: bigint) => string,
): void {
  const box = el('div');
  box.appendChild(el('h3', undefined, 'High Scores'));

  // Captions from ACTUAL geometry (e.g. "16 by 12", "22 by 18",
  // "28 by 24") — orig captions, corrected to match reality.
  const labels = ([SMALL, MEDIUM, LARGE] as GridType[]).map((t) => {
    const cfg = GRID_CONFIGS[t];
    return `${cfg.xsize} by ${cfg.ysize}`;
  });

  // Tab strip.
  const tabs = el('div', 'sm-tabs');
  const tabBtns: HTMLButtonElement[] = [];

  // Tab body — rebuilt on switch.
  const tabBody = el('div');
  const renderTable = (t: number): void => {
    tabBody.textContent = '';
    const table = el('table');
    // Orig header row (HighScores.dfm ListView Columns).
    const head = el('tr');
    for (const h of ['Position', 'Name', 'Net Wealth']) {
      head.appendChild(el('th', undefined, h));
    }
    table.appendChild(head);
    for (let j = 0; j < scores[t].length; j++) {
      const rec = scores[t][j];
      const tr = el('tr');
      if (rec.newEntry) tr.className = 'sm-newentry';
      tr.appendChild(el('td', undefined, `${j + 1}.`));
      tr.appendChild(el('td', undefined, rec.name));
      tr.appendChild(el('td', undefined, formatMoney(rec.wealth)));
      table.appendChild(tr);
    }
    tabBody.appendChild(table);
    for (let i = 0; i < tabBtns.length; i++) {
      tabBtns[i].className = i === t ? 'sm-tabactive' : '';
    }
  };

  for (let t = 0; t < scores.length; t++) {
    const tab = el('button', undefined, labels[t]);
    tab.addEventListener('click', () => renderTable(t));
    tabs.appendChild(tab);
    tabBtns.push(tab);
  }
  box.appendChild(tabs);
  box.appendChild(tabBody);

  const actions = el('div', 'sm-actions');
  const ok = el('button', undefined, 'Okay');
  actions.appendChild(ok);
  box.appendChild(actions);
  const close = modal(box);
  ok.addEventListener('click', close);

  // Orig PageControl activates the CURRENT grid's tab (on insert, and
  // by extension when viewing); render it initially.
  renderTable(gridType);
}

// Standalone High Scores menu dialog — same tabbed presentation.
// (highScores(insert=false) still SAVES unconditionally — orig
// unconditional SaveScores; defaults materialize on disk.)
export function scoresDialog(
  state: AppState,
  formatMoney: (amount: bigint) => string,
  storage: Storage,
  key: string,
): void {
  const scores = highScores(state, false, storage, key);
  scoresTableDialog(scores, state.gridType, formatMoney);
}

// ============================================================================
// FINAL STANDINGS (orig OverForm Finish)
// ============================================================================

// FIDELITY:[highscores-modal] (rev 12): orig end-of-game sequence is
// Finish() → GameOver modal → HighScores(true) modal — two sequential
// dialogs. onClose chains the high-scores second modal.
// Session 24 rev 5 (Batch B): presentation reworded to orig screenshot
// evidence (DIALOGS-NOTES §12.4) — heading "Game Over!", intro
// "At turn N…" with the orig standby line, the four-line orig summary
// block replaces the winner one-liner, table captions Money Left /
// Worth of shares / Net Wealth, button OK.
export function standingsDialog(
  st: FinalStandings,
  formatMoney: (amount: bigint) => string,
  onClose?: () => void,
): void {
  const box = el('div');
  box.appendChild(el('h3', undefined, 'Game Over!'));

  const intro = el('div');
  intro.textContent =
    `At turn ${st.turn} the game is finally over. ` +
    'Below are the game\u2019s final standings\u2026';
  box.appendChild(intro);

  // Orig summary block (OverForm): four label/value lines.
  const summary: Array<[string, string]> = [
    ['Largest company', st.biggestCompany.name],
    ['Size of company', `${st.biggestCompany.size} squares`],
    ['Winning Player', st.winner.name],
    ['Net Wealth of player', formatMoney(st.winner.netWealth)],
  ];
  for (const [k, v] of summary) {
    const r = el('div', 'sm-row');
    r.appendChild(el('span', undefined, `${k}:`));
    r.appendChild(el('strong', undefined, v));
    box.appendChild(r);
  }

  const table = el('table');
  const head = el('tr');
  for (const h of ['Player', 'Money Left', 'Worth of shares', 'Net Wealth']) {
    head.appendChild(el('th', undefined, h));
  }
  table.appendChild(head);
  for (const row of st.standings) {
    const tr = el('tr');
    tr.appendChild(el('td', undefined, row.name));
    tr.appendChild(el('td', undefined, formatMoney(row.money)));
    tr.appendChild(el('td', undefined, formatMoney(row.shareWorth)));
    tr.appendChild(el('td', undefined, formatMoney(row.netWealth)));
    table.appendChild(tr);
  }
  box.appendChild(table);
  box.appendChild(el('div', 'sm-hint', 'Results recorded in the high scores.'));

  const actions = el('div', 'sm-actions');
  const ok = el('button', undefined, 'OK');
  actions.appendChild(ok);
  box.appendChild(actions);
  const close = modal(box);
  ok.addEventListener('click', () => {
    close();
    onClose?.(); // orig: Finish(); then HighScores(true);
  });
}

// ============================================================================
// ABOUT (orig AboutForm finished/trivial — NOTES §7; content is a
// Lee-ruled port ADDITION beyond the orig card, not fidelity restoration)
// ============================================================================

// Session 32 rev 2: description content per Lee ruling — credit line,
// port line, six-beat gameplay list — inside a scrollable body so the
// modal stays compact regardless of content length (acceptance = user-
// perceived, rule 2; max-height is a tunable, not a geometry contract).
export function aboutDialog(): void {
  const box = el('div');
  box.appendChild(el('h3', undefined, 'Space Monopoly'));

  // Scrollable body: inline style keeps this a single-file reissue (no
  // chrome/CSS coupling); promote to a chrome class in the CSS survey
  // batch if Lee prefers a class-based home.
  const body = el('div');
  body.style.maxHeight = '240px';
  body.style.overflowY = 'auto';

  // One-line credit to the original author.
  body.appendChild(el('div', undefined,
    'Original Space Monopoly created by David Vivash.'));

  // One-line port description (carries rev 1\u2019s logic/renderer split).
  body.appendChild(el('div', 'sm-hint',
    'This is a TypeScript browser port: the logic is a faithful port; ' +
    'the renderer approximates the original visuals.'));

  // Basic gameplay information.
  body.appendChild(el('div', 'sm-grouptitle', 'How to play'));
  const list = el('ul');
  const beats = [
    '2\u20134 players take turns at one computer (hotseat), each starting with \u00A36,000.',
    'On your turn, place a piece on the board to claim a square.',
    'When claimed squares join up, companies form on them; a company\u2019s ' +
      'share price rises as it grows.',
    'Each turn you can buy or sell shares in any active company.',
    'When a growing company engulfs a smaller one, the smaller is taken ' +
      'over and its shareholders are bought out.',
    'When the game ends, the player with the highest net wealth \u2014 ' +
      'cash plus share value \u2014 wins.',
  ];
  for (const b of beats) list.appendChild(el('li', undefined, b));
  body.appendChild(list);
  box.appendChild(body);

  const actions = el('div', 'sm-actions');
  const ok = el('button', undefined, 'Dismiss');
  actions.appendChild(ok);
  box.appendChild(actions);
  const close = modal(box);
  ok.addEventListener('click', close);
}

// ============================================================================
// QUIT (orig closemain ≈ confirm + reload; R7)
// ============================================================================

export function quitConfirm(progress: boolean, reload: () => void): void {
  const box = el('div');
  box.appendChild(el('h3', undefined, 'Are you sure you want to quit?'));
  if (progress) {
    box.appendChild(el('div', undefined,
      'If you quit now your score will not be recorded in the High Scores Table.'));
  }
  const actions = el('div', 'sm-actions');
  const yes = el('button', undefined, 'Yes');
  const no = el('button', undefined, 'No');
  actions.appendChild(yes);
  actions.appendChild(no);
  box.appendChild(actions);
  const close = modal(box);
  no.addEventListener('click', close);
  yes.addEventListener('click', reload);
}
