using Backend.Types.View;
using Datasources;

namespace Backend.Services;

/// <summary>What the list API returns: no uuid or dates, categories trimmed to id and name.</summary>
public record GameSummaryDto(long Id, string Name, string Description, string ParentName, string ThumbnameLocation, List<CategorySummaryDto> Categories, Dictionary<string, string> Attributes);

public record CategorySummaryDto(long Id, string Name);

/// <summary>A summary plus the join columns the service needs to filter and pick the thumbnail.</summary>
class GameSummaryRow : GameSummary
{
    public bool GameDeleted { get; set; }
    public bool GameEnabled { get; set; }
    public long? ImageId { get; set; }
    public string? ImageLocation { get; set; }
}

/// <summary>
/// Read-only summaries of the playable games, from one join over games, game parents, puzzles, images and
/// categories. The thumbnail is a second resource named <c>{image}_thumbnail</c>, which a join cannot reach, so it
/// is filled from <see cref="ImagesService.ThumbnailUrls"/> (the image itself when there is none).
/// </summary>
public class GameSummariesService
{
    /// <summary>Property names to columns. A path such as <c>GameParent.Name</c> is qualified by its entity (<c>game_parents.name</c>).</summary>
    static readonly Dictionary<string, string> Properties = new()
    {
        ["GameParentId"] = "game_parent_id",
        ["GameId"] = "game_id",
        ["ImageId"] = "image_id",
        ["CategoryId"] = "category_id",
        ["IsDeleted"] = "is_deleted",
        ["IsEnabled"] = "is_enabled",
    };

    static readonly Dictionary<string, string> Entities = new()
    {
        ["Game"] = "games",
        ["GameParent"] = "game_parents",
        ["PuzzleGame"] = "puzzle_games",
        ["Resource"] = "resources",
        ["GameCategory"] = "game_categories",
        ["Category"] = "categories",
        ["GameAttribute"] = "game_attributes",
    };

    // Fields are paths; each alias is the result-column name the nested mapper reads.
    static readonly SelectStatement Joined = new(new()
    {
        Table = "Game",
        Fields = ["Game.Id", "Game.Name", "Game.Description", "Game.IsDeleted", "Game.IsEnabled", "GameParent.Name", "PuzzleGame.ImageId", "Resource.Location", "GameCategory.CategoryId", "Category.Name", "GameAttribute.Name", "GameAttribute.Value"],
        Aliases = ["Id", "Name", "Description", "GameDeleted", "GameEnabled", "ParentName", "ImageId", "ImageLocation", "CategoryId", "CategoryName", "AttributeName", "AttributeValue"],
        Joins =
        [
            new Join(JoinKind.Inner, "GameParent", "GameParent.Id", "Game.GameParentId"),
            new Join(JoinKind.Inner, "PuzzleGame", "PuzzleGame.GameId", "Game.Id"),
            new Join(JoinKind.Left, "Resource", "Resource.Id", "PuzzleGame.ImageId"),
            new Join(JoinKind.Left, "GameCategory", "GameCategory.GameId", "Game.Id"),
            new Join(JoinKind.Left, "Category", "Category.Id", "GameCategory.CategoryId"),
            new Join(JoinKind.Left, "GameAttribute", "GameAttribute.GameId", "Game.Id"),
        ],
        OrderBy = [OrderBy.Asc("Game.Id"), OrderBy.Asc("GameCategory.CategoryId"), OrderBy.Asc("GameAttribute.Name")],
    });

    readonly ReadonlyRepository<GameSummaryRow> rows;
    readonly ImagesService images;

    public GameSummariesService(IConnection connection, ImagesService images)
    {
        this.images = images;
        rows = new ReadonlyRepository<GameSummaryRow>(connection, new ReadonlyRepositoryMappingOptions<GameSummaryRow>
        {
            Entity = "Game",
            EntityMapper = new DictionaryMapper<string>(Entities),
            PropertyMappings = new DictionaryMapper<string>(Properties),
        });
        rows.AddEnriched(
            new("Categories", "Id", "CategoryId", Type: EnrichmentPropertyType.List),
            rows,
            new NestedToObjectEnrichmentStrategy<GameSummaryRow>(new TypeMap
            {
                Key = "Id",
                Fields = new Dictionary<string, TypeMapField>
                {
                    ["Id"] = "Id",
                    ["Name"] = "Name",
                    ["Description"] = "Description",
                    ["ParentName"] = "ParentName",
                    ["GameDeleted"] = "GameDeleted",
                    ["GameEnabled"] = "GameEnabled",
                    ["ImageId"] = "ImageId",
                    ["ImageLocation"] = "ImageLocation",
                    ["Attributes"] = new TypeMapField.Dictionary("AttributeName", "AttributeValue"),
                    ["Categories"] = new TypeMapGroup
                    {
                        Key = "CategoryId",
                        Fields = new Dictionary<string, TypeMapField> { ["Id"] = "CategoryId", ["Name"] = "CategoryName" },
                    },
                },
            }));
    }

    /// <summary>Every enabled, undeleted game by id.</summary>
    public async IAsyncEnumerable<GameSummary> Read()
    {
        var thumbs = await images.ThumbnailUrls();
        var found = new List<GameSummaryRow>();
        await foreach (var row in rows.Read(Joined)) found.Add(row);
        foreach (var row in found.Where(r => !r.GameDeleted && r.GameEnabled))
        {
            row.ThumbnameLocation = (row.ImageId is { } image && thumbs.TryGetValue(image, out var thumb) ? thumb : null) ?? row.ImageLocation ?? "";
            yield return row;
        }
    }

    public async Task<List<GameSummaryDto>> List()
    {
        var list = new List<GameSummaryDto>();
        await foreach (var s in Read())
            list.Add(new GameSummaryDto(s.Id, s.Name, s.Description, s.ParentName, s.ThumbnameLocation, s.Categories.Select(c => new CategorySummaryDto(c.Id, c.Name)).ToList(), s.Attributes));
        return list;
    }
}
