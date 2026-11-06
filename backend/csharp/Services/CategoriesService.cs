using Backend.Types.View;
using Datasources;

namespace Backend.Services;

public record CategoryNode(string Id, string Name, string Description, List<CategoryNode> Children);

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

    static List<CategoryNode> Children(List<Category> rows, long? parent) =>
        rows.Where(c => c.CategoryId == parent)
            .Select(c => new CategoryNode(c.Name.ToLowerInvariant(), c.Name, c.Description, Children(rows, c.Id)))
            .ToList();
}
