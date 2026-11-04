// schema-version: 1.0
/** Type UserSettings. */
export const userSettings = (init: Partial<UserSettings>): UserSettings => ({ ...init } as UserSettings);
export class UserSettings {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  userId!: number;
  name!: string;
  value!: string;
}
