// schema-version: 1.0
import type { LocalizedStringBase } from "../datasource/localizedStringBase";
/** View LocalizedString. */
export const localizedString = (init: Partial<LocalizedString>): LocalizedString => ({ ...init } as LocalizedString);
export interface LocalizedString extends Omit<LocalizedStringBase, "localizedStringNameId" | "languageId"> {
  name: string;
  languageName: string;
}
