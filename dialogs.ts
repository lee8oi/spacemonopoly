// ============================================================================
// SPACE MONOPOLY PORT — DIALOG LAYER BARREL (dialogs.ts) — rev 9 (barrel)
// Structural split of the rev-8 monolith (Session 27, spine §15.4): this file
// is now a pure re-export surface. Implementation lives in the modules —
//   dialogs-core.ts   CSS injection, el(), modal(), REV-6 modal queue, boxes
//   dialogs-events.ts founding / split / merger announcement dialogs
//   dialogs-game.ts   new game, trade (pre-Batch-F layout; rework = rev 2),
//                     player details
//   dialogs-meta.ts   prefs, high scores, standings, about, quit
// renderer.ts's `import ... from './dialogs'` surface is UNCHANGED (wildcard
// re-exports; the public API is exactly rev 8's). renderer.ts untouched.
// History/rationale: DIALOGS-NOTES.md (§15.4 split ruling; §15.3 relocation
// rule) / RENDERER-NOTES.md; full narrative in RENDERER-ARCHIVE.md.
// ============================================================================

export * from './dialogs-core';
export * from './dialogs-events';
export * from './dialogs-game';
export * from './dialogs-meta';
