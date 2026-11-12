using System.Globalization;
using System.Text;

namespace Backend.Services;

public static class Slug
{
    /// <summary>
    /// The URL form of a name: diacritics stripped, lowercased, apostrophes dropped, every other run of characters
    /// outside <c>a-z0-9</c> collapsed to one <c>-</c>, no leading or trailing <c>-</c>. Puzzle and category names are
    /// looked up by this form, so the same algorithm lives in the TypeScript and Rust backends and in
    /// <c>@jiggy/shared</c>; the cases in <c>backend/data/slug-cases.json</c> keep the four in step.
    /// </summary>
    public static string Of(string name)
    {
        var sb = new StringBuilder();
        var pendingDash = false;
        foreach (var c in name.Normalize(NormalizationForm.FormKD))
        {
            if (c is >= '\u0300' and <= '\u036f' or '\'' or '\u2019') continue;
            foreach (var l in c.ToString().ToLowerInvariant())
            {
                if (l is >= 'a' and <= 'z' or >= '0' and <= '9')
                {
                    if (pendingDash && sb.Length > 0) sb.Append('-');
                    pendingDash = false;
                    sb.Append(l);
                }
                else pendingDash = true;
            }
        }
        return sb.ToString();
    }
}
