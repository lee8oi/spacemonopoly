# Space Monopoly — JS Port Master Plan

## 1. Project Overview

Port of Space Monopoly (© 1998–2001 David Vivash, GPL v2) from Borland C++ Builder 3 source to JavaScript/TypeScript for the browser.

- Source repo: github.com/SparkeyinVA/Space-Monopoly (sourceCode/spacemonopoly)
- Original structure: VCL forms (.cpp/.h/.dfm triples), Mercurial history in .hg
- Port license: GPL v2 (derivative work requirement if distributed)

## 2. Working Protocol

One source file (or .h+.cpp pair) per session. At session start, paste:

1. Tail of STATUS.md
2. Latest HANDOFF_NN.md
3. The current session's source file contents

Session ends with: regenerated STATUS.md, updated SOURCE_MAP.md / GLOSSARY.md rows, new HANDOFF doc.

### Directory Roles

    docs/PORT_PLAN.md      This file — constitution. Conventions and decisions.
    docs/STATUS.md         Living snapshot: done / in-progress / blocked
    docs/SOURCE_MAP.md     Per-file translation status ledger
    docs/GLOSSARY.md       Symbol translation table (anti-drift)
    docs/HANDOFF_NN.md     Per-session handoff outlines

## 3. Module Architecture (proposed)

    src/
      core/          Framework-agnostic game logic (no DOM)
        game.js      Turn flow, win conditions, game state
        grid.js      Board representation (Grid + GameGrid merged)
        player.js    Player entities, cash, shares held
        company.js  Company entities, share price math
        merger.js    Merger/acquisition rules (logic extracted from Merger form)
        prefs.js     Preferences (settings schema only)
        money.js     Currency arithmetic (replaces CurrencyUnit/large)
      util/
        format.js    Number display (replaces CommaIt)
        rng.js       Random with seeding, if original PRNG is observable
      ui/
        main.js      Main screen (from SMMain)
        board.js     Board rendering (from GridManager drawing code)
        dialogs.js   Merger/trade/info dialogs
        forms/       Setup, scores, about, game-over screens
      assets/        Extracted graphics/audio (from .dfm/resources)

Rule: core/ modules must never import from ui/. Forms' event handlers are
mined for logic and moved to core/; UI receives logic results only.

## 4. Source File Map

Legend — Category: L = pure logic, F = VCL form, U = utility, X = discard/replace

| Source file(s) | Category | Destination | Notes | Status |
|---|---|---|---|---|
| Game.h/.cpp | L | core/game.js | Central rules engine — port FIRST | ⬜ |
| GameGrid.h/.cpp | L | core/grid.js | Merge with Grid | ⬜ |
| Grid.h/.cpp | L | core/grid.js | Board representation | ⬜ |
| SMMain.h/.cpp/.dfm | F | core/game.js + ui/main.js | Turn flow lives in event handlers — extract | ⬜ |
| GridManager.h/.cpp/.dfm | F | ui/board.js + core/grid.js | Board drawing; logic split | ⬜ |
| Merger.h/.cpp/.dfm | F | core/merger.js + ui/dialogs.js | Merger rules in handlers | ⬜ |
| SplitForm.h/.cpp/.dfm | F | core/merger.js + ui/dialogs.js | Share splits | ⬜ |
| StockForm.h/.cpp/.dfm | F | ui/dialogs.js | Share trading UI | ⬜ |
| ComForm.h/.cpp/.dfm | F | ui/dialogs.js | Company list | ⬜ |
| ComInfoForm.h/.cpp/.dfm | F | ui/dialogs.js | Company detail | ⬜ |
| ComEditForm.h/.cpp/.dfm | F | ui/forms/ | Company editor | ⬜ |
| Players.h/.cpp/.dfm | F | core/player.js + ui/forms/ | Setup dialog + player logic | ⬜ |
| playerDetails.h/.cpp/.dfm | F | ui/forms/ | Player detail view | ⬜ |
| Preferences.h/.cpp/.dfm | F | core/prefs.js + ui/forms/ | Options dialog | ⬜ |
| Prefs.h/.cpp | L | core/prefs.js | Settings model | ⬜ |
| HighScoresForm.h/.cpp/.dfm | F | ui/forms/ | Scores display | ⬜ |
| HighScores.h/.cpp | L | ui/forms/ | Score persistence — swap Crypt for JSON/localStorage | ⬜ |
| HighForm.h/.cpp/.dfm | F | ui/forms/ | Legacy score form | ⬜ |
| OverForm.h/.cpp/.dfm | F | ui/forms/ | Game over screen | ⬜ |
| AboutForm.h/.cpp/.dfm | F | ui/forms/ | Trivial | ⬜ |
| CurrencyUnit.h/.cpp | U | core/money.js | Replace with Number or BigInt (verify max values) | ⬜ |
| large.h/.cpp | U | core/money.js | Big-int math — likely delete after verification | ⬜ |
| CommaIt.h/.cpp | U | util/format.js | Replace with toLocaleString | ⬜ |
| Crypt.h/.cpp | X | — | Save obfuscation — drop | ⬜ |
| Basic.h | U | — | Read first; likely macros/utilities | ⬜ |
| Vector.h / Container.h / Compressor.h | U | — | Templates — replace with native JS | ⬜ |
| SpacePoly2.cpp/.mak/.res, SPACE.ICO | X | build/ | Project/build artifacts — reference only | ⬜ |
| scores | U | assets/ | Sample data for HighScores format | ⬜ |

## 5. Conventions

TO BE FINALIZED after reading Game.h. Placeholders:

- Language: JS or TS (decide session 1; leaning TS for struct typing)
- Naming: original C++ m_iHungarian stripped (m_iShares → shares)
- Rendering: DOM vs Canvas (decide after reviewing GridManager drawing)
- Money: Number vs BigInt (decide after reading large.h)
- Fixed-point vs floating time/turn counters if any

## 6. Translation Order

Phase 0 — Reconnaissance (read-only sessions):
1. Basic.h, Game.h — type/convention foundations
2. large.h, CurrencyUnit.h — money representation decision
3. SMMain.cpp skim — turn-flow outline (no translation)

Phase 1 — Core logic port: Game → Grid/GameGrid → Prefs → Players logic
Phase 2 — Dialog/form logic extraction: Merger, SplitForm, StockForm
Phase 3 — UI shell: main screen, board rendering
Phase 4 — Peripheral forms, high scores (JSON), polish

## 7. Decision Log

| # | Date | Decision | Reason |
|---|---|---|---|
| 1 | — | Use SparkeyinVA source, not Ghidra decompilation | Original source recovered on GitHub |
| 2 | — | One file per session workflow | Context limit management |
