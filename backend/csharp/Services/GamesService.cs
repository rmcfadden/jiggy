using System.Text.Json;
using Backend.Types.Datasource;
using Datasources;
using GameView = Backend.Types.View.Game;

namespace Backend.Services;

/// <summary>
/// What the API exchanges. A game is a puzzle described by three things: its <c>TemplateId</c>, its background
/// <c>ImageId</c> and its <c>Config</c> (every setting of the designer panel, as JSON). They are stored as game settings
/// (<c>template_uid</c>, <c>image_id</c>, <c>config</c>) without foreign keys, so each game keeps its own template and image.
/// </summary>
public record GameDto(long Id, string Uuid, string Name, string Description, string Parent, long TemplateId, long? ImageId, JsonElement Config, List<long> CategoryIds, string? ThumbnailUrl, DateTime Created, DateTime Updated);

/// <summary>A game as the list returns it: without <c>Config</c>, which <c>Get</c> loads for the one that is selected.</summary>
public record GameListItem(long Id, string Uuid, string Name, string Description, string Parent, long TemplateId, long? ImageId, List<long> CategoryIds, string? ThumbnailUrl, DateTime Created, DateTime Updated);

public record GameInput(string? Name, string? Description, string? Parent, long? TemplateId, long? ImageId, JsonElement? Config, List<long>? CategoryIds);

/// <summary>One entry of the puzzles seed file (<c>backend/data/puzzles.json</c>); <c>Slug</c> is the image resource name, <c>Setup</c> the full default config.</summary>
public record PuzzleSeed(string Slug, string Name, string? Description, string Parent, string Template, List<string>? Categories, JsonElement Setup);

public class InvalidGameException(string message) : Exception(message);

/// <summary>The name (or its slug) belongs to another game, so the two could not be told apart in a URL.</summary>
public class DuplicateGameNameException(string message) : Exception(message);

public class GamesService(
    ICRUDRepository<GameView> repo,
    ICRUDRepository<GameCategory> gameCategories,
    CategoriesService categories,
    GameParentsService parents,
    TemplatesService templates,
    ImagesService images)
{
    const string ConfigKey = "config";
    /// <summary>Setting holding the uuid of the game's template.</summary>
    const string TemplateKey = "template_uid";
    /// <summary>Setting holding the id of the game's background image (a cms resource); absent when it has none.</summary>
    const string ImageKey = "image_id";
    /// <summary>Attribute holding the pieces in the game's template (<c>cols * rows</c>).</summary>
    public const string PieceCount = "pieceCount";

    public async Task<List<GameListItem>> List()
    {
        var templateIds = await TemplateIds();
        var categoryOf = await CategoriesByGame();
        var thumbs = await images.ThumbnailUrls();
        var list = new List<GameListItem>();
        foreach (var game in await Games())
            if (game.Settings.GetValueOrDefault(TemplateKey) is { } uid && templateIds.TryGetValue(uid, out var templateId)) list.Add(ToListItem(game, templateId, await ParentOf(game), categoryOf.GetValueOrDefault(game.Id) ?? [], thumbs));
        return list;
    }

    public async Task<GameDto?> Get(long id)
    {
        var game = await repo.ReadSingleById(id);
        if (game is null || game.IsDeleted) return null;
        return game.Settings.GetValueOrDefault(TemplateKey) is { } uid && (await TemplateIds()).TryGetValue(uid, out var templateId)
            ? ToDto(game, templateId, await ParentOf(game), await CategoryIdsOf(id), await images.ThumbnailUrls())
            : null;
    }

    /// <summary>The game whose name has this slug (see <see cref="Slug"/>), as <c>Get</c> returns it; null when there is none.</summary>
    public async Task<GameDto?> GetByName(string name)
    {
        var game = (await Games()).FirstOrDefault(g => Slug.Of(g.Name) == name);
        return game is null ? null : await Get(game.Id);
    }

    /// <summary>The games filed under the category with this slug or any of its sub-categories; null when there is no such category.</summary>
    public async Task<List<GameListItem>?> ListByCategoryName(string name)
    {
        if (await categories.FindBySlug(name) is not { } ids) return null;
        return (await List()).Where(g => g.CategoryIds.Any(ids.Contains)).ToList();
    }

    /// <summary>Creates the game; the template, image and parent must exist.</summary>
    public async Task<GameDto> Create(GameInput input)
    {
        var parent = await FindParent(input.Parent ?? throw new InvalidGameException("parent is required"));
        var templateId = input.TemplateId ?? throw new InvalidGameException("templateId is required");
        var templateUid = await TemplateUid(templateId);
        await CheckImage(input.ImageId);
        await CheckCategories(input.CategoryIds);
        await CheckName(input.Name ?? "", null);

        var game = new GameView
        {
            Name = input.Name ?? "",
            Description = input.Description ?? "",
            GameParentId = parent.Id,
            Settings = Settings(templateUid, input.ImageId, input.Config),
            Attributes = await AttributesOf(templateId),
        };
        var created = await repo.Create(game);
        await SetCategories(created.Id, input.CategoryIds ?? []);
        return ToDto(await repo.ReadSingleById(created.Id) ?? created, templateId, parent.Location, await CategoryIdsOf(created.Id), await images.ThumbnailUrls());
    }

    /// <summary>Merges the fields present in <paramref name="input"/>; null when the game does not exist.</summary>
    public async Task<GameDto?> Update(long id, GameInput input)
    {
        var game = await repo.ReadSingleById(id);
        if (game is null || game.IsDeleted || !game.Settings.ContainsKey(TemplateKey)) return null;
        var settings = new Dictionary<string, string>(game.Settings);

        if (input.Parent is not null) game.GameParentId = (await FindParent(input.Parent)).Id;
        if (input.TemplateId is { } templateId)
        {
            settings[TemplateKey] = await TemplateUid(templateId);
            foreach (var (name, value) in await AttributesOf(templateId)) game.Attributes[name] = value;
        }
        if (input.ImageId is { } imageId)
        {
            await CheckImage(imageId);
            settings[ImageKey] = imageId.ToString();
        }
        await CheckCategories(input.CategoryIds);
        if (input.Name is not null && input.Name != game.Name) await CheckName(input.Name, id);
        game.Name = input.Name ?? game.Name;
        game.Description = input.Description ?? game.Description;
        if (input.Config is { } config) settings[ConfigKey] = config.GetRawText();
        game.Settings = settings;
        await repo.Update(game);
        if (input.CategoryIds is not null) await SetCategories(id, input.CategoryIds);
        return ToDto(await repo.ReadSingleById(id) ?? game, (await TemplateIds())[settings[TemplateKey]], await ParentOf(game), await CategoryIdsOf(id), await images.ThumbnailUrls());
    }

    public async Task<bool> Delete(long id)
    {
        var game = await repo.ReadSingleById(id);
        if (game is null || game.IsDeleted) return false;
        await SetCategories(id, []);
        await repo.Delete(game);
        return true;
    }

    /// <summary>
    /// Creates the sample puzzles in the seed file at <paramref name="path"/> whose game name is missing; existing games are
    /// never changed. The parent, template, image and categories of each entry must already exist (run the earlier setup
    /// steps first), otherwise it throws naming the entry. Returns the names added.
    /// </summary>
    public async Task<List<string>> AddPuzzles(string path)
    {
        var seeds = JsonSerializer.Deserialize<List<PuzzleSeed>>(await File.ReadAllTextAsync(path), new JsonSerializerOptions(JsonSerializerDefaults.Web)) ?? [];
        var present = new HashSet<string>();
        await foreach (var row in repo.Read()) present.Add(row.Name);
        var templateIds = (await templates.List("jigsaw")).ToDictionary(t => t.Name, t => t.Id);
        var categoryIds = (await categories.Flat()).Where(c => c.ParentId is not null).ToDictionary(c => c.Name, c => c.Id, StringComparer.OrdinalIgnoreCase);
        var added = new List<string>();
        foreach (var seed in seeds)
        {
            if (present.Contains(seed.Name)) continue;
            try
            {
                var templateId = templateIds.TryGetValue(seed.Template, out var t) ? t : throw new InvalidGameException($"unknown template: {seed.Template}");
                var image = await images.Find(name: seed.Slug) ?? throw new InvalidGameException($"unknown image: {seed.Slug}");
                var ids = (seed.Categories ?? []).Select(c => categoryIds.TryGetValue(c, out var id) ? id : throw new InvalidGameException($"unknown category: {c}")).ToList();
                await Create(new(seed.Name, seed.Description, seed.Parent, templateId, image.Id, seed.Setup, ids));
            }
            catch (InvalidGameException e)
            {
                throw new InvalidGameException($"puzzle '{seed.Slug}': {e.Message}");
            }
            added.Add(seed.Name);
        }
        return added;
    }

    async Task<List<GameView>> Games()
    {
        var rows = new List<GameView>();
        await foreach (var row in repo.Read())
            if (!row.IsDeleted) rows.Add(row);
        return rows;
    }

    /// <summary>
    /// Gives every game its attributes where they are missing or its template changed behind its back (run by
    /// <c>setup</c>); returns the names of the games it updated.
    /// </summary>
    public async Task<List<string>> AddAttributes()
    {
        var templateIds = await TemplateIds();
        var updated = new List<string>();
        foreach (var game in await Games())
        {
            if (game.Settings.GetValueOrDefault(TemplateKey) is not { } uid || !templateIds.TryGetValue(uid, out var templateId)) continue;
            var wanted = await AttributesOf(templateId);
            if (wanted.All(a => game.Attributes.GetValueOrDefault(a.Key) == a.Value)) continue;
            foreach (var (name, value) in wanted) game.Attributes[name] = value;
            await repo.Update(game);
            updated.Add(game.Name);
        }
        return updated;
    }

    /// <summary>The attributes a game gets from its template: <c>pieceCount</c> is <c>cols * rows</c> of the template's JSON.</summary>
    async Task<Dictionary<string, string>> AttributesOf(long templateId)
    {
        var content = (await templates.Get(templateId))?.Content;
        long Get(string name) => content is { ValueKind: JsonValueKind.Object } c && c.TryGetProperty(name, out var v) && v.TryGetInt64(out var n) ? n : 0;
        return new() { [PieceCount] = (Get("cols") * Get("rows")).ToString() };
    }

    async Task<Dictionary<long, List<long>>> CategoriesByGame()
    {
        var map = new Dictionary<long, List<long>>();
        await foreach (var row in gameCategories.Read())
        {
            if (!map.TryGetValue(row.GameId, out var ids)) map[row.GameId] = ids = [];
            ids.Add(row.CategoryId);
        }
        foreach (var ids in map.Values) ids.Sort();
        return map;
    }

    async Task<List<long>> CategoryIdsOf(long gameId) => (await CategoriesByGame()).GetValueOrDefault(gameId) ?? [];

    /// <summary>Makes the game belong to exactly <paramref name="ids"/>, adding and removing only the rows that differ.</summary>
    async Task SetCategories(long gameId, List<long> ids)
    {
        var wanted = ids.ToHashSet();
        var present = new HashSet<long>();
        foreach (var row in await gameCategories.Read().ToListAsync())
        {
            if (row.GameId != gameId) continue;
            if (wanted.Contains(row.CategoryId) && present.Add(row.CategoryId)) continue;
            await gameCategories.Delete(row);
        }
        foreach (var id in wanted.Except(present).Order())
            await gameCategories.Create(new GameCategory { GameId = gameId, CategoryId = id });
    }

    /// <summary>Rejects a name whose slug another game has; deleted games count, as the unique index on <c>name</c> keeps their names.</summary>
    async Task CheckName(string name, long? exceptId)
    {
        var wanted = Slug.Of(name);
        if (wanted == "") throw new InvalidGameException("name must contain a letter or digit");
        await foreach (var row in repo.Read())
            if (row.Id != exceptId && (row.Name == name || Slug.Of(row.Name) == wanted))
                throw new DuplicateGameNameException($"a puzzle named '{row.Name}' already exists");
    }

    async Task CheckCategories(List<long>? ids)
    {
        if (ids is null) return;
        var known = (await categories.Flat()).Select(c => c.Id).ToHashSet();
        if (ids.FirstOrDefault(id => !known.Contains(id), -1) is var bad && bad != -1) throw new InvalidGameException($"unknown category: {bad}");
    }

    async Task<Backend.Types.View.GameParent> FindParent(string location) =>
        (await parents.List()).FirstOrDefault(p => p.Location == location) ?? throw new InvalidGameException($"unknown parent game: {location}");

    async Task<string> ParentOf(GameView game) => (await parents.Get(game.GameParentId))?.Location ?? "";

    /// <summary>The uuid stored in a game's <c>template_uid</c> setting; throws when the template does not exist.</summary>
    async Task<string> TemplateUid(long id) => (await templates.Get(id))?.Uuid ?? throw new InvalidGameException($"unknown template: {id}");

    /// <summary>Template uuid to template id.</summary>
    async Task<Dictionary<string, long>> TemplateIds() => (await templates.List()).ToDictionary(t => t.Uuid, t => t.Id);

    async Task CheckImage(long? id)
    {
        if (id is { } image && await images.Find(id: image) is null) throw new InvalidGameException($"unknown image: {image}");
    }

    static Dictionary<string, string> Settings(string templateUid, long? imageId, JsonElement? config)
    {
        var settings = new Dictionary<string, string> { [TemplateKey] = templateUid };
        if (imageId is { } image) settings[ImageKey] = image.ToString();
        if (config is { } c) settings[ConfigKey] = c.GetRawText();
        return settings;
    }

    static GameDto ToDto(GameView game, long templateId, string parent, List<long> categoryIds, Dictionary<long, string> thumbs)
    {
        var item = ToListItem(game, templateId, parent, categoryIds, thumbs);
        var config = game.Settings.TryGetValue(ConfigKey, out var json) ? JsonDocument.Parse(json).RootElement.Clone() : JsonDocument.Parse("{}").RootElement.Clone();
        return new(item.Id, item.Uuid, item.Name, item.Description, item.Parent, item.TemplateId, item.ImageId, config, item.CategoryIds, item.ThumbnailUrl, item.Created, item.Updated);
    }

    static GameListItem ToListItem(GameView game, long templateId, string parent, List<long> categoryIds, Dictionary<long, string> thumbs)
    {
        long? imageId = game.Settings.TryGetValue(ImageKey, out var id) && long.TryParse(id, out var n) ? n : null;
        return new(game.Id, game.Uuid.ToString(), game.Name, game.Description, parent, templateId, imageId, categoryIds, imageId is { } image ? thumbs.GetValueOrDefault(image) : null, game.Created, game.Updated);
    }
}
