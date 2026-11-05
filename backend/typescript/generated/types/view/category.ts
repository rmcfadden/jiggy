// schema-version: 1.0
import type { Category as CategoryBase } from "../datasource/category";
/** View Category. */
export const category = (init: Partial<Category>): Category => ({ ...init } as Category);
export interface Category extends CategoryBase {}
