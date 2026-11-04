// schema-version: 1.0
import type { Categories as CategoriesBase } from "../datasource/categories";
/** View Categories. */
export const categories = (init: Partial<Categories>): Categories => ({ ...init } as Categories);
export interface Categories extends CategoriesBase {}
