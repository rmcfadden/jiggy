// schema-version: 1.0
/** Type Reviews. */
export const reviews = (init: Partial<Reviews>): Reviews => ({ ...init } as Reviews);
export class Reviews {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gameId!: number;
  userId!: number;
  description!: string;
  rating!: string;
  isApproved!: boolean;
}
