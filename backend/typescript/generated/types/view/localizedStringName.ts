// schema-version: 1.0
import type { LocalizedStringName as LocalizedStringNameBase } from "../datasource/localizedStringName";
/** View LocalizedStringName. */
export const localizedStringName = (init: Partial<LocalizedStringName>): LocalizedStringName => ({ ...init } as LocalizedStringName);
export interface LocalizedStringName extends LocalizedStringNameBase {}
