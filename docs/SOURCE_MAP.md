# Source File Translation Map

| Source File(s) | Category | Destination | Status | Notes |
|----------------|----------|-------------|--------|-------|
| Game.h / Game.cpp | Logic | core/game.js | ⬜ | Port first; central rules engine |
| GameGrid.h / GameGrid.cpp | Logic | core/grid.js | ⬜ | Merge with Grid logic |
| Grid.h / Grid.cpp | Logic | core/grid.js | ⬜ | Board representation |
| SMMain.h / SMMain.cpp / SMMain.dfm | Form | core/game.js + ui/main.js | ⬜ | Extract turn flow from handlers |
| GridManager.h / GridManager.cpp / GridManager.dfm | Form | ui/board.js + core/grid.js | ⬜ | Board drawing + logic split |
| Merger.h / Merger.cpp / Merger.dfm | Form | core/merger.js + ui/dialogs.js | ⬜ | Merger rules in event handlers |
| SplitForm.h / SplitForm.cpp / SplitForm.dfm | Form | core/merger.js + ui/dialogs.js | ⬜ | Share split logic |
| StockForm.h / StockForm.cpp / StockForm.dfm | Form | ui/dialogs.js | ⬜ | Share trading UI |
| ComForm.h / ComForm.cpp / ComForm.dfm | Form | ui/dialogs.js | ⬜ | Company list display |
| ComInfoForm.h / ComInfoForm.cpp / ComInfoForm.dfm | Form | ui/dialogs.js | ⬜ | Company detail view |
| ComEditForm.h / ComEditForm.cpp / ComEditForm.dfm | Form | ui/forms/com-edit.js | ⬜ | Company editor dialog |
| Players.h / Players.cpp / Players.dfm | Form | core/player.js + ui/forms/setup.js | ⬜ | Player setup + logic |
| playerDetails.h / playerDetails.cpp / playerDetails.dfm | Form | ui/forms/details.js | ⬜ | Player detail view |
| Preferences.h / Preferences.cpp / Preferences.dfm | Form | core/prefs.js + ui/forms/prefs.js | ⬜ | Options dialog |
| Prefs.h / Prefs.cpp | Logic | core/prefs.js | ⬜ | Settings model (no UI) |
| HighScores.h / HighScores.cpp | Logic | ui/form/highscores.js | ⬜ | Swap Crypt for JSON/localStorage |
| HighScoresForm.h / HighScoresForm.cpp / HighScoresForm.dfm | Form | ui/form/highscores.js | ⬜ | Scores UI display |
| HighForm.h / HighForm.cpp / HighForm.dfm | Form | ui/forms/legacy-scores.js | ⬜ | Legacy scores form (deprecated?) |
| OverForm.h / OverForm.cpp / OverForm.dfm | Form | ui/forms/gameover.js | ⬜ | Game over screen |
| AboutForm.h / AboutForm.cpp / AboutForm.dfm | Form | ui/forms/about.js | ⬜ | Trivial; about dialog |
| CurrencyUnit.h / CurrencyUnit.cpp | Utility | core/money.js | ⬜ | Replace with Number or BigInt |
| large.h / large.cpp | Utility | core/money.js | ⬜ | Big-int math — likely delete |
| CommaIt.h / CommaIt.cpp | Utility | util/format.js | ⬜ | Replace with toLocaleString |
| Crypt.h / Crypt.cpp | Discard | — | 🚫 | Save obfuscation — drop entirely |
| Basic.h | Utility | — | ⬜ | Read first; macro/utilities reference |
| Vector.h | Utility | — | ⬜ | Template → native JS arrays |
| Container.h | Utility | — | ⬜ | Template → native JS collections |
| Compressor.h | Utility | — | ⬜ | Template → native JS |
| SpacePoly2.cpp/.mak/.res | Build | — | 🚫 | Project artifacts; reference only |
| SPACE.ICO | Asset | assets/icons/ | ⬜ | Extract for favicon/app icon |
| scores/ | Data | assets/sample-scores/ | ⬜ | Sample high-score data |

Status Legend: ⬜ Not started | 🟡 In progress | ✅ Done | 🚫 Discarded
