// schema-version: 1.0
/** Type GameReview. */
export const gameReview = (init: Partial<GameReview>): GameReview => Object.assign(new GameReview(), init);
export class GameReview {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gameId!: number;
  reviewId!: number;
}
