// schema-version: 1.0
import type { Language as LanguagesBase } from "../datasource/language";
/** View Language. */
export const language = (init: Partial<Language>): Language => ({ ...init } as Language);
export interface Language extends LanguagesBase {}
