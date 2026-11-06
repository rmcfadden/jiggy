// schema-version: 1.0
import type { StringName as StringNameBase } from "../datasource/stringName";
/** View StringName. */
export const stringName = (init: Partial<StringName>): StringName => ({ ...init } as StringName);
export interface StringName extends StringNameBase {}
