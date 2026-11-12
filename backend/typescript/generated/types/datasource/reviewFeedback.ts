// schema-version: 1.0
/** Type ReviewFeedback. */
export const reviewFeedback = (init: Partial<ReviewFeedback>): ReviewFeedback => Object.assign(new ReviewFeedback(), init);
export class ReviewFeedback {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  reviewId!: number;
  userId!: number;
  isPositive: boolean = false;
}
