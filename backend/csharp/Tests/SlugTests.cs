using System.Text.Json;
using Backend.Services;
using Xunit;

namespace Tests;

public class SlugTests
{
    [Fact]
    public void Slug_matches_the_shared_cases()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "../../../../../data/slug-cases.json");
        var cases = JsonDocument.Parse(File.ReadAllText(path)).RootElement.EnumerateArray().ToList();
        Assert.NotEmpty(cases);
        foreach (var c in cases)
            Assert.Equal(c.GetProperty("slug").GetString(), Slug.Of(c.GetProperty("name").GetString()!));
    }
}
