import { expect, it } from "vitest";
import { DEFAULT_GAME_CONFIG, createGame, isGameSolved, placePiece, trayPieces } from "./game";

const config = DEFAULT_GAME_CONFIG;

it("scrambled puts every piece in the tray, shuffled", () => {
  const g = createGame(config, 12);
  expect([...g.queue].sort((a, b) => a - b)).toEqual([...Array(12).keys()]);
  expect(g.queue).not.toEqual([...Array(12).keys()]);
  expect(trayPieces(g)).toHaveLength(12);
});

it("next-pieces only offers panelSize pieces, advancing as they are placed", () => {
  let g = createGame({ ...config, type: "next-pieces", panelSize: 3 }, 6);
  expect(trayPieces(g)).toEqual([0, 1, 2]);
  g = placePiece(g, 0, 0).state;
  expect(trayPieces(g)).toEqual([1, 2, 3]);
});

it("last-x leaves exactly x pieces unplaced", () => {
  const g = createGame({ ...config, type: "last-x", remaining: 4 }, 12);
  expect(g.placed.filter((p) => !p)).toHaveLength(4);
  expect(g.queue.every((i) => !g.placed[i])).toBe(true);
});

it("counts wrong placements and solves when the queue empties", () => {
  let g = createGame({ ...config, type: "last-x", remaining: 2 }, 4);
  const [a, b] = g.queue;
  expect(placePiece(g, a, b)).toMatchObject({ correct: false, state: { mistakes: 1 } });
  g = placePiece(g, a, a).state;
  expect(isGameSolved(g)).toBe(false);
  g = placePiece(g, b, b).state;
  expect(isGameSolved(g)).toBe(true);
});

it("refuses pieces the panel is not offering", () => {
  const g = createGame({ ...config, type: "next-pieces", panelSize: 1 }, 4);
  expect(placePiece(g, 3, 3).correct).toBe(false);
});
