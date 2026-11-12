import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { slug } from "./slug";

const cases = JSON.parse(
  readFileSync(new URL("../../../../backend/data/slug-cases.json", import.meta.url), "utf8"),
) as { name: string; slug: string }[];

describe("slug", () => {
  it("matches the cases shared with the backends", () => {
    for (const c of cases) expect(slug(c.name), c.name).toBe(c.slug);
  });
});
