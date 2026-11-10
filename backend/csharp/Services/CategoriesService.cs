using System.Text.Json;
using Backend.Types.View;
using Datasources;

namespace Backend.Services;

/// <summary>One entry of <c>backend/data/categories.json</c>; roots may list children.</summary>
public record CategorySeed(string Name, string? Description, List<CategorySeed>? Children);

public record CategoryNode(string Id, string Name, string Description, List<CategoryNode> Children);

/// <summary>A category as a flat row, keyed by its database id, for attaching categories to games.</summary>
public record CategoryRow(long Id, long? ParentId, string Name, string Description);

public class CategoriesService(ICRUDRepository<Category> repo)
{
    /// <summary>Categories as a tree, where <c>Id</c> is the lowercased name.</summary>
    public async Task<List<CategoryNode>> Tree()
    {
        var rows = new List<Category>();
        await foreach (var row in repo.Read())
            if (row.IsEnabled && !row.IsDeleted) rows.Add(row);
        return Children(rows, null);
    }

    /// <summary>Every enabled category with its database id and parent, in id order.</summary>
    public async Task<List<CategoryRow>> Flat()
    {
        var rows = new List<CategoryRow>();
        await foreach (var row in repo.Read())
            if (row.IsEnabled && !row.IsDeleted) rows.Add(new(row.Id, row.CategoryId, row.Name, row.Description));
        return rows.OrderBy(r => r.Id).ToList();
    }

    /// <summary>
    /// Adds the categories in the JSON file at <paramref name="path"/> that are not there yet, matching on name and parent
    /// (deleted rows count, so a removed category is not brought back); returns the names it added.
    /// </summary>
    public async Task<List<string>> AddCategories(string path)
    {
        var seeds = JsonSerializer.Deserialize<List<CategorySeed>>(await File.ReadAllTextAsync(path), new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];
        var rows = new List<Category>();
        await foreach (var row in repo.Read()) rows.Add(row);
        var added = new List<string>();

        async Task<Category> Ensure(CategorySeed seed, long? parent)
        {
            var found = rows.FirstOrDefault(c => c.CategoryId == parent && string.Equals(c.Name, seed.Name, StringComparison.OrdinalIgnoreCase));
            if (found is not null) return found;
            var created = await repo.Create(new Category { CategoryId = parent, Name = seed.Name, Description = seed.Description ?? "" });
            rows.Add(created);
            added.Add(seed.Name);
            return created;
        }

        foreach (var root in seeds)
        {
            var parent = await Ensure(root, null);
            foreach (var child in root.Children ?? []) await Ensure(child, parent.Id);
        }
        return added;
    }

    static List<CategoryNode> Children(List<Category> rows, long? parent) =>
        rows.Where(c => c.CategoryId == parent)
            .Select(c => new CategoryNode(c.Name.ToLowerInvariant(), c.Name, c.Description, Children(rows, c.Id)))
            .ToList();
}
