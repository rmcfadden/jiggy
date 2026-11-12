// schema-version: 1.0
/** Type OauthGrantType. */
export const oauthGrantType = (init: Partial<OauthGrantType>): OauthGrantType => Object.assign(new OauthGrantType(), init);
export class OauthGrantType {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name: string = "";
  description: string = "";
  isCustom: boolean = false;
  isEnabled: boolean = true;
  isLegacy: boolean = false;
}
