// schema-version: 1.0
import type { StringBase } from "../datasource/stringBase";
/** View String. */
export const string = (init: Partial<String>): String => ({ ...init } as String);
export interface String extends Omit<StringBase, "stringNameId" | "languageId"> {
  name: string;
  languageName: string;
}
