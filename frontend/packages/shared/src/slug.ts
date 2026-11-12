/**
 * The URL form of a name: diacritics stripped, lowercased, apostrophes dropped, every other run of characters
 * outside `a-z0-9` collapsed to one `-`, no leading or trailing `-`. The three backends look puzzles and
 * categories up by this form; the cases in `backend/data/slug-cases.json` keep all four implementations in step.
 */
export function slug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
