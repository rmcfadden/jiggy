import { createRng } from "./piece-generator";
import type { StartSide } from "./puzzle";

export type GameType = "scrambled" | "next-pieces" | "last-x";

export const GAME_TYPES: { id: GameType; name: string; description: string }[] = [
  { id: "scrambled", name: "Scrambled pieces", description: "Every piece starts in the tray, shuffled." },
  { id: "next-pieces", name: "Next pieces in panel", description: "The panel only offers the next few pieces." },
  { id: "last-x", name: "Solve last X pieces", description: "The puzzle starts nearly done; finish the last few." },
];

/** Which edge of the board the piece panel is docked to. */
export type PanelDock = "top" | "bottom" | "left" | "right";

/** Whether the zoom control lays its buttons out in a row or a column. */
export type ZoomOrientation = "vertical" | "horizontal";

export type GameConfig = {
  type: GameType;
  /** Drives every shuffle, so a config always starts the same game. */
  seed: number;
  /** next-pieces: how many pieces the panel offers at once. */
  panelSize: number;
  /** next-pieces: the order pieces are offered in. */
  order: "sequential" | "random";
  /** next-pieces: where the piece panel is docked. */
  panelDock: PanelDock;
  /** last-x: how many pieces are left to place. */
  remaining: number;
  /** scrambled: share of the window the puzzle board fills, in percent. */
  viewPercent: number;
  /** scrambled: which side of the board the loose pieces start on. */
  startSide: StartSide;
  /** scrambled: how many pieces start loose; 0 means all of them. */
  looseCount: number;
  /** scrambled: how far apart loose pieces are pushed, 0-100; 0 is purely random. */
  spread: number;
  /** Layout of the zoom control on the board. */
  zoomOrientation: ZoomOrientation;
};

export const DEFAULT_GAME_CONFIG: GameConfig = {
  type: "scrambled",
  seed: 1,
  panelSize: 3,
  order: "sequential",
  panelDock: "bottom",
  remaining: 5,
  viewPercent: 40,
  startSide: "random",
  looseCount: 0,
  spread: 30,
  zoomOrientation: "vertical",
};

export type GameState = {
  total: number;
  /** `placed[i]` is true once piece `i` sits in its slot. */
  placed: boolean[];
  /** Pieces still to place, in the order the panel offers them. */
  queue: number[];
  /** How many pieces from the front of `queue` the panel shows. */
  visible: number;
  mistakes: number;
};

function shuffle<T>(items: T[], rng: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createGame(config: GameConfig, total: number): GameState {
  const rng = createRng(config.seed);
  const all = Array.from({ length: total }, (_, i) => i);
  const placed = all.map(() => false);
  const clamp = (n: number) => Math.min(total, Math.max(1, Math.floor(n)));

  switch (config.type) {
    case "scrambled":
      return { total, placed, queue: shuffle(all, rng), visible: total, mistakes: 0 };
    case "next-pieces": {
      const queue = config.order === "random" ? shuffle(all, rng) : all;
      return { total, placed, queue, visible: clamp(config.panelSize), mistakes: 0 };
    }
    case "last-x": {
      const queue = shuffle(all, rng).slice(0, clamp(config.remaining));
      for (const i of all) placed[i] = !queue.includes(i);
      return { total, placed, queue, visible: queue.length, mistakes: 0 };
    }
  }
}

/** The pieces the panel currently offers. */
export function trayPieces(state: GameState): number[] {
  return state.queue.slice(0, state.visible);
}

export function isGameSolved(state: GameState): boolean {
  return state.queue.length === 0;
}

/** Tries to put `piece` into `slot`; a wrong slot counts as a mistake. */
export function placePiece(state: GameState, piece: number, slot: number): { state: GameState; correct: boolean } {
  if (!trayPieces(state).includes(piece) || state.placed[slot]) return { state, correct: false };
  if (piece !== slot) return { state: { ...state, mistakes: state.mistakes + 1 }, correct: false };
  const placed = state.placed.map((p, i) => p || i === slot);
  return { state: { ...state, placed, queue: state.queue.filter((q) => q !== piece) }, correct: true };
}
