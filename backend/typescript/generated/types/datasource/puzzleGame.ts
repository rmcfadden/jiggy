// schema-version: 1.0
/** Type PuzzleGame. */
export const puzzleGame = (init: Partial<PuzzleGame>): PuzzleGame => Object.assign(new PuzzleGame(), init);
export class PuzzleGame {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gameId!: number;
  templateId!: number;
  imageId!: number | null;
}
