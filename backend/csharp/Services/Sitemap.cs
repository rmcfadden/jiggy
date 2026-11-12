using System.Globalization;
using System.Security;
using System.Text;

namespace Backend.Services;

/// <summary>One page of the site: a path such as <c>/puzzles/matterhorn-at-sunset</c> and, when known, the UTC date it last changed (<c>YYYY-MM-DD</c>).</summary>
public record SitemapUrl(string Path, string? LastMod = null);

/// <summary>A file the <c>sitemap</c> command writes.</summary>
public record SitemapFile(string Name, string Xml);

/// <summary>The sitemaps.org XML for the site's pages.</summary>
public static class Sitemap
{
    /// <summary>The protocol allows 50,000 URLs (and 50 MB) per file.</summary>
    public const int MaxUrlsPerFile = 50_000;

    const string Ns = "http://www.sitemaps.org/schemas/sitemap/0.9";

    /// <summary>The UTC date of a stored timestamp; one without a kind is taken as UTC, which is how the databases hold them.</summary>
    public static string Date(DateTime value) =>
        (value.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(value, DateTimeKind.Utc) : value.ToUniversalTime()).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

    /// <summary>Escapes text for use in XML element content.</summary>
    public static string Escape(string text) =>
        text.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace("\"", "&quot;").Replace("'", "&apos;");

    /// <summary>The pages of the site: the puzzle list, a page per category and a page per puzzle, named by the slug of their names.</summary>
    public static List<SitemapUrl> Pages(IEnumerable<string> categories, IEnumerable<(string Name, DateTime Updated)> puzzles)
    {
        var pages = new List<SitemapUrl> { new("/puzzles") };
        var seen = new HashSet<string>();
        foreach (var name in categories)
            if (Slug.Of(name) is { Length: > 0 } s && seen.Add($"c/{s}")) pages.Add(new($"/category/{s}"));
        foreach (var (name, updated) in puzzles)
            if (Slug.Of(name) is { Length: > 0 } s && seen.Add($"p/{s}")) pages.Add(new($"/puzzles/{s}", Date(updated)));
        return pages;
    }

    /// <summary>
    /// One file named <paramref name="fileName"/> when the URLs fit; otherwise numbered files (<c>sitemap-1.xml</c>, ...) of at
    /// most <paramref name="max"/> URLs plus a sitemap index under <paramref name="fileName"/> that lists them.
    /// </summary>
    public static List<SitemapFile> Build(string baseUrl, IReadOnlyList<SitemapUrl> urls, string fileName = "sitemap.xml", int max = MaxUrlsPerFile)
    {
        var baseUri = baseUrl.TrimEnd('/');
        var ext = System.IO.Path.GetExtension(fileName);
        var stem = fileName[..^ext.Length];

        string UrlSet(IEnumerable<SitemapUrl> chunk)
        {
            var sb = new StringBuilder($"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"{Ns}\">\n");
            foreach (var u in chunk)
            {
                sb.Append($"  <url>\n    <loc>{Escape(baseUri + u.Path)}</loc>");
                if (u.LastMod is not null) sb.Append($"\n    <lastmod>{Escape(u.LastMod)}</lastmod>");
                sb.Append("\n  </url>\n");
            }
            return sb.Append("</urlset>\n").ToString();
        }

        if (urls.Count <= max) return [new(fileName, UrlSet(urls))];
        var files = urls.Chunk(max).Select((chunk, i) => new SitemapFile($"{stem}-{i + 1}{ext}", UrlSet(chunk))).ToList();
        var index = new StringBuilder($"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<sitemapindex xmlns=\"{Ns}\">\n");
        foreach (var f in files) index.Append($"  <sitemap>\n    <loc>{Escape($"{baseUri}/{f.Name}")}</loc>\n  </sitemap>\n");
        files.Add(new(fileName, index.Append("</sitemapindex>\n").ToString()));
        return files;
    }
}

/// <summary><c>sitemap [--base-url &lt;url&gt;] [--out &lt;file&gt;]</c>: argument parsing and output around <see cref="Sitemap"/>.</summary>
public static class SitemapCommand
{
    /// <summary>Where <c>npm run dev</c> serves the frontend; <c>--test</c> builds the URLs on it.</summary>
    public const string TestBaseUrl = "http://localhost:5174";

    const string Usage = "usage: sitemap [--test] [--base-url <https://your-site>] [--out <file>]   (base URL defaults to $SITE_BASE_URL or Site:BaseUrl; --test uses the local dev frontend, http://localhost:5174; file to sitemap.xml)";

    /// <summary>The options after the command name; <paramref name="configuredBase"/> is the <c>SITE_BASE_URL</c> / <c>Site:BaseUrl</c> fallback.</summary>
    public static (string BaseUrl, string Out) Parse(string[] args, string? configuredBase)
    {
        string? baseUrl = null, output = null;
        var test = false;
        for (var i = 0; i < args.Length; i++)
        {
            if (args[i] == "--test") { test = true; continue; }
            var value = ++i < args.Length ? args[i] : throw new ArgumentException(Usage);
            switch (args[i - 1])
            {
                case "--base-url": baseUrl = value; break;
                case "--out": output = value; break;
                default: throw new ArgumentException(Usage);
            }
        }
        if (test) configuredBase = TestBaseUrl;
        baseUrl = (baseUrl ?? configuredBase ?? "").Trim();
        if (baseUrl == "") throw new ArgumentException($"the site's base URL is required: pass --base-url or set SITE_BASE_URL\n{Usage}");
        if (!(Uri.TryCreate(baseUrl, UriKind.Absolute, out var uri) && uri.Scheme is "http" or "https" && !baseUrl.Any(char.IsWhiteSpace)))
            throw new ArgumentException($"the base URL must start with http:// or https://: {baseUrl}");
        return (baseUrl, output ?? "sitemap.xml");
    }

    /// <summary>Runs the command (<paramref name="args"/> starts with its name); returns the process exit code.</summary>
    public static async Task<int> Run(CategoriesService categories, GamesService games, string[] args, string? configuredBase)
    {
        try
        {
            var (baseUrl, output) = Parse(args[1..], Environment.GetEnvironmentVariable("SITE_BASE_URL") is { Length: > 0 } env ? env : configuredBase);
            var pages = Sitemap.Pages((await categories.Flat()).Select(c => c.Name), (await games.List()).Select(g => (g.Name, g.Updated)));
            var path = System.IO.Path.GetFullPath(output);
            var dir = System.IO.Path.GetDirectoryName(path)!;
            Directory.CreateDirectory(dir);
            var files = Sitemap.Build(baseUrl, pages, System.IO.Path.GetFileName(path));
            foreach (var file in files) await File.WriteAllTextAsync(System.IO.Path.Combine(dir, file.Name), file.Xml);
            Console.WriteLine($"wrote {pages.Count} URLs to {path}{(files.Count > 1 ? $" ({files.Count - 1} files plus the index)" : "")}");
            return 0;
        }
        catch (ArgumentException error)
        {
            Console.Error.WriteLine(error.Message);
            return 1;
        }
    }
}
