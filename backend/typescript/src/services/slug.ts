/**
 * The URL form of a name: diacritics stripped, lowercased, apostrophes dropped, every other run of characters
 * outside `a-z0-9` collapsed to one `-`, no leading or trailing `-`. Puzzle and category names are looked up by
 * this form, so the same algorithm lives in the Rust and C# backends and in `@jiggy/shared`; the cases in
 * `backend/data/slug-cases.json` keep the four in step.
 */
export function slug(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
