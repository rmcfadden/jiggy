using Backend.Services;
using Xunit;

namespace Tests;

public class SitemapTests
{
    static readonly DateTime Updated = new(2026, 11, 12, 22, 41, 54, DateTimeKind.Utc);

    [Fact]
    public void Pages_lists_the_puzzle_list_categories_and_puzzles_by_slug_once_each()
    {
        var pages = Sitemap.Pages(["Churches & Cathedrals", "Cities", "cities", "!!!"], [("Matterhorn at Sunset", Updated), ("Matterhorn at sunset", Updated)]);
        Assert.Equal(
            [new SitemapUrl("/puzzles"), new("/category/churches-cathedrals"), new("/category/cities"), new("/puzzles/matterhorn-at-sunset", "2026-11-12")],
            pages);
    }

    [Fact]
    public void Build_writes_one_escaped_urlset()
    {
        var files = Sitemap.Build("https://example.com/", [new("/puzzles"), new("/puzzles/a&b", "2026-11-12")]);
        var file = Assert.Single(files);
        Assert.Equal("sitemap.xml", file.Name);
        Assert.Equal(
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n  <url>\n    <loc>https://example.com/puzzles</loc>\n  </url>\n  <url>\n    <loc>https://example.com/puzzles/a&amp;b</loc>\n    <lastmod>2026-11-12</lastmod>\n  </url>\n</urlset>\n",
            file.Xml);
    }

    [Fact]
    public void Build_splits_past_the_limit_and_writes_an_index()
    {
        var files = Sitemap.Build("https://example.com", [new("/puzzles/p1"), new("/puzzles/p2"), new("/puzzles/p3")], "site.xml", 2);
        Assert.Equal(["site-1.xml", "site-2.xml", "site.xml"], files.Select(f => f.Name));
        Assert.Contains("p2", files[0].Xml);
        Assert.DoesNotContain("p3", files[0].Xml);
        Assert.Contains("<sitemapindex", files[2].Xml);
        Assert.Contains("https://example.com/site-1.xml", files[2].Xml);
    }

    [Fact]
    public void Parse_lets_flags_override_the_configured_base_and_requires_one()
    {
        Assert.Equal(("https://a.example", "x/map.xml"), SitemapCommand.Parse(["--base-url", "https://a.example", "--out", "x/map.xml"], "https://b.example"));
        Assert.Equal(("https://b.example", "sitemap.xml"), SitemapCommand.Parse([], "https://b.example"));
        Assert.Equal(("http://localhost:5174", "sitemap.xml"), SitemapCommand.Parse(["--test"], "https://b.example"));
        Assert.Equal(("https://a.example", "sitemap.xml"), SitemapCommand.Parse(["--test", "--base-url", "https://a.example"], null));
        Assert.Throws<ArgumentException>(() => SitemapCommand.Parse([], null));
        Assert.Throws<ArgumentException>(() => SitemapCommand.Parse(["--base-url", "example.com"], null));
        Assert.Throws<ArgumentException>(() => SitemapCommand.Parse(["--bogus", "1"], "https://b.example"));
    }
}
