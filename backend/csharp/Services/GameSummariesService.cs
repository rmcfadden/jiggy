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
}

/// <summary>
/// Read-only summaries of the playable games, from one join over games, game parents and categories. The image is
/// the game's <c>image_id</c> setting and the thumbnail a second resource named <c>{image}_thumbnail</c>; neither can
/// be joined, so both are filled from <see cref="ImagesService"/> (the image itself when there is no thumbnail).
/// </summary>
public class GameSummariesService
{
    /// <summary>Property names to columns. A path such as <c>GameParent.Name</c> is qualified by its entity (<c>game_parents.name</c>).</summary>
    static readonly Dictionary<string, string> Properties = new()
    {
        ["GameParentId"] = "game_parent_id",
        ["GameId"] = "game_id",
        ["CategoryId"] = "category_id",
        ["IsDeleted"] = "is_deleted",
        ["IsEnabled"] = "is_enabled",
    };

    static readonly Dictionary<string, string> Entities = new()
    {
        ["Game"] = "games",
        ["GameParent"] = "game_parents",
        ["GameCategory"] = "game_categories",
        ["Category"] = "categories",
        ["GameAttribute"] = "game_attributes",
    };

    // Fields are paths; each alias is the result-column name the nested mapper reads.
    static readonly SelectStatement Joined = new(new()
    {
        Table = "Game",
        Fields = ["Game.Id", "Game.Name", "Game.Description", "Game.IsDeleted", "Game.IsEnabled", "GameParent.Name", "GameCategory.CategoryId", "Category.Name", "GameAttribute.Name", "GameAttribute.Value"],
        Aliases = ["Id", "Name", "Description", "GameDeleted", "GameEnabled", "ParentName", "CategoryId", "CategoryName", "AttributeName", "AttributeValue"],
        Joins =
        [
            new Join(JoinKind.Inner, "GameParent", "GameParent.Id", "Game.GameParentId"),
            new Join(JoinKind.Left, "GameCategory", "GameCategory.GameId", "Game.Id"),
            new Join(JoinKind.Left, "Category", "Category.Id", "GameCategory.CategoryId"),
            new Join(JoinKind.Left, "GameAttribute", "GameAttribute.GameId", "Game.Id"),
        ],
        OrderBy = [OrderBy.Asc("Game.Id"), OrderBy.Asc("GameCategory.CategoryId"), OrderBy.Asc("GameAttribute.Name")],
    });

    readonly ReadonlyRepository<GameSummaryRow> rows;
    readonly ImagesService images;
    readonly ICRUDRepository<Game> games;

    public GameSummariesService(IConnection connection, ImagesService images, ICRUDRepository<Game> games)
    {
        this.images = images;
        this.games = games;
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
        var urls = await images.Urls();
        // A game's image is its image_id setting, which is text without a foreign key, so it cannot be joined.
        var imageOf = new Dictionary<long, long>();
        await foreach (var game in games.Read())
            if (game.Settings.TryGetValue("image_id", out var id) && long.TryParse(id, out var image)) imageOf[game.Id] = image;
        var found = new List<GameSummaryRow>();
        await foreach (var row in rows.Read(Joined)) found.Add(row);
        foreach (var row in found.Where(r => !r.GameDeleted && r.GameEnabled))
        {
            row.ThumbnameLocation = imageOf.TryGetValue(row.Id, out var image) ? thumbs.GetValueOrDefault(image) ?? urls.GetValueOrDefault(image) ?? "" : "";
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
