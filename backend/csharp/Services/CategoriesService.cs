using Backend.Types.View;
using Datasources;

namespace Backend.Services;

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

    static List<CategoryNode> Children(List<Category> rows, long? parent) =>
        rows.Where(c => c.CategoryId == parent)
            .Select(c => new CategoryNode(c.Name.ToLowerInvariant(), c.Name, c.Description, Children(rows, c.Id)))
            .ToList();
}
