// schema-version: 1.0
/** Type SessionStatesBase. */
export const sessionStatesBase = (init: Partial<SessionStatesBase>): SessionStatesBase => Object.assign(new SessionStatesBase(), init);
export class SessionStatesBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  sessionId!: number;
  state: string = "";
  codeChallenge!: string | null;
  codeChallengeMethod!: string | null;
  revoked!: Date | null;
  isEnabled: boolean = true;
}
