# Space Monopoly

A faithful web port of **Space Monopoly**, the turn-based strategy board
game originally written by **David Vivash** for Windows.

Play it directly in a modern browser — no plugins, no installation.

## The Original Game

Space Monopoly is a multiplayer business/strategy game by David Vivash,
released for Windows around 2001. A distant cousin of Sid Sackson's
classic board game *Acquire*, it strips the theme down to a star-spanning
property-and-shares economy:

- Players start with £6,000 in cash.
- Placing pieces on the board claims squares; when adjacent squares are
  joined into a group, a company is formed on them.
- Each company has a share price that rises as the company grows. Every
  turn, players can buy (or sell) shares in any active company.
- When a growing company engulfs a smaller one, the smaller company is
  taken over: its shareholders are bought out and the survivor grows
  larger and more valuable.
- There is no computer opponent — it's a hotseat game for 2–4 human
  players (its sweet spot), though more can join.
- At the end of the game, the player with the highest total wealth —
  cash plus the value of their shareholdings — wins.

## This Port

This project recreates the game as a self-contained web application:

- **Written in TypeScript**, bundled by esbuild into a single plain
  JavaScript file — no runtime dependencies or frameworks.
- **Canvas-based board rendering** with a faithful, pixel-styled
  presentation of the original's companies, tokens, and board chrome.
- **Hotseat play for 2–4 players**, just like the original.
- **Three board sizes** (16×12, 22×18, and 28×24) selectable in the
  preferences menu.
- The goal of the port is *fidelity*: where the original had quirks
  (including its idiosyncratic spellings, such as the "&Betelguese"
  company caption), the port reproduces them deliberately rather than
  silently "fixing" them.

## Project Structure

| File | Role |
|---|---|
| `scaffold.ts` | Core game engine and rules (self-contained) |
| `renderer.ts` | Application shell: turn flow, event wiring, update loop |
| `renderer-chrome.ts` | UI chrome: palette, styles, menus, panels, player list |
| `renderer-board.ts` | Board canvas: painting, resizing, mouse input |
| `dialogs.ts` | Barrel re-export for the dialog modules |
| `dialogs-core.ts` | Shared dialog framework (modals, common controls) |
| `dialogs-game.ts` | In-game dialogs (trading, buy/sell, and friends) |
| `dialogs-events.ts` | Event-driven dialogs |
| `dialogs-meta.ts` | Meta dialogs (help, about, preferences) |

`renderer.ts` is the bundle entry point; `bundle.js` (generated) is what
`index.html` loads.

## Building

The build is driven by the included `build.sh`. It runs the TypeScript
compiler as a whole-project type-check, then bundles from the
`renderer.ts` entry point into a single `bundle.js` (IIFE, exposed as the
global `SM`):

```bash
./build.sh
```

Under the hood that is:

```bash
tsc && npx esbuild renderer.ts --bundle --format=iife --global-name=SM --outfile=bundle.js
```

Requirements: the [TypeScript compiler](https://www.typescriptlang.org/)
(`tsc`) on your PATH, and [Node.js](https://nodejs.org/) (for `npx`, which
fetches esbuild on demand).

## Playing

1. Run `./build.sh` once.
2. Open `index.html` in a web browser.
3. From the menus, set up the number of players and choose a board size
   (small, medium, or large).
4. Take turns placing pieces on the board; use the game menus to buy
   and sell shares as companies form and grow.
5. When the game ends, the wealthiest player — cash plus shares — wins.

The in-game Help menu explains the rest. The game runs entirely
client-side.

## Credits & License

- The original **Space Monopoly** was written by **David Vivash**.
  This port exists to keep his game playable on modern systems and is
  offered as a tribute to the original.
- This port's code is licensed under the **GNU General Public License,
  version 2.0** (SPDX: `GPL-2.0-only`). You may redistribute and/or
  modify it under the terms of the GPL as published by the Free Software
  Foundation; see the `LICENSE` file in this repository for details.

"Space Monopoly" and the original game are the creation of David Vivash;
all trademarks belong to their respective owners.
