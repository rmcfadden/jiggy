using System.Text.Json;
using Backend.Types.Datasource;
using Datasources;
using GameView = Backend.Types.View.Game;

namespace Backend.Services;

/// <summary>
/// What the API exchanges. A game is a puzzle described by three things: its <c>TemplateId</c>, its background
/// <c>ImageId</c> and its <c>Config</c> (every setting of the designer panel, as JSON).
/// </summary>
public record GameDto(long Id, string Uuid, string Name, string Description, string Parent, long TemplateId, long? ImageId, JsonElement Config, DateTime Created, DateTime Updated);

public record GameInput(string? Name, string? Description, string? Parent, long? TemplateId, long? ImageId, JsonElement? Config);

public class InvalidGameException(string message) : Exception(message);

public class GamesService(
    ICRUDRepository<GameView> repo,
    ICRUDRepository<PuzzleGame> puzzles,
    GameParentsService parents,
    TemplatesService templates,
    ImagesService images)
{
    const string ConfigKey = "config";

    public async Task<List<GameDto>> List()
    {
        var puzzleOf = await PuzzlesByGame();
        var list = new List<GameDto>();
        foreach (var game in await Games())
            if (puzzleOf.TryGetValue(game.Id, out var puzzle)) list.Add(ToDto(game, puzzle, await ParentOf(game)));
        return list;
    }

    public async Task<GameDto?> Get(long id)
    {
        var game = await repo.ReadSingleById(id);
        if (game is null || game.IsDeleted) return null;
        return await PuzzleOf(id) is { } puzzle ? ToDto(game, puzzle, await ParentOf(game)) : null;
    }

    /// <summary>Creates the game and its puzzle; the template, image and parent must exist.</summary>
    public async Task<GameDto> Create(GameInput input)
    {
        var parent = await FindParent(input.Parent ?? throw new InvalidGameException("parent is required"));
        var templateId = input.TemplateId ?? throw new InvalidGameException("templateId is required");
        await CheckTemplate(templateId);
        await CheckImage(input.ImageId);

        var game = new GameView
        {
            Name = input.Name ?? "",
            Description = input.Description ?? "",
            GameParentId = parent.Id,
            Settings = Settings(input.Config),
        };
        var created = await repo.Create(game);
        var puzzle = await puzzles.Create(new PuzzleGame { GameId = created.Id, TemplateId = templateId, ImageId = input.ImageId });
        return ToDto(await repo.ReadSingleById(created.Id) ?? created, puzzle, parent.Location);
    }

    /// <summary>Merges the fields present in <paramref name="input"/>; null when the game does not exist.</summary>
    public async Task<GameDto?> Update(long id, GameInput input)
    {
        var game = await repo.ReadSingleById(id);
        if (game is null || game.IsDeleted || await PuzzleOf(id) is not { } puzzle) return null;

        if (input.Parent is not null) game.GameParentId = (await FindParent(input.Parent)).Id;
        if (input.TemplateId is { } templateId)
        {
            await CheckTemplate(templateId);
            puzzle.TemplateId = templateId;
        }
        if (input.ImageId is not null)
        {
            await CheckImage(input.ImageId);
            puzzle.ImageId = input.ImageId;
        }
        game.Name = input.Name ?? game.Name;
        game.Description = input.Description ?? game.Description;
        if (input.Config is not null) game.Settings = Settings(input.Config);
        await repo.Update(game);
        await puzzles.Update(puzzle);
        return ToDto(await repo.ReadSingleById(id) ?? game, puzzle, await ParentOf(game));
    }

    public async Task<bool> Delete(long id)
    {
        var game = await repo.ReadSingleById(id);
        if (game is null || game.IsDeleted) return false;
        if (await PuzzleOf(id) is { } puzzle) await puzzles.Delete(puzzle);
        await repo.Delete(game);
        return true;
    }

    async Task<List<GameView>> Games()
    {
        var rows = new List<GameView>();
        await foreach (var row in repo.Read())
            if (!row.IsDeleted) rows.Add(row);
        return rows;
    }

    async Task<Dictionary<long, PuzzleGame>> PuzzlesByGame()
    {
        var map = new Dictionary<long, PuzzleGame>();
        await foreach (var row in puzzles.Read()) map[row.GameId] = row;
        return map;
    }

    async Task<PuzzleGame?> PuzzleOf(long gameId) => (await PuzzlesByGame()).GetValueOrDefault(gameId);

    async Task<Backend.Types.View.GameParent> FindParent(string location) =>
        (await parents.List()).FirstOrDefault(p => p.Location == location) ?? throw new InvalidGameException($"unknown parent game: {location}");

    async Task<string> ParentOf(GameView game) => (await parents.Get(game.GameParentId))?.Location ?? "";

    async Task CheckTemplate(long id)
    {
        if (await templates.Get(id) is null) throw new InvalidGameException($"unknown template: {id}");
    }

    async Task CheckImage(long? id)
    {
        if (id is { } image && await images.Find(id: image) is null) throw new InvalidGameException($"unknown image: {image}");
    }

    static Dictionary<string, string> Settings(JsonElement? config) =>
        config is { } c ? new() { [ConfigKey] = c.GetRawText() } : [];

    static GameDto ToDto(GameView game, PuzzleGame puzzle, string parent)
    {
        var config = game.Settings.TryGetValue(ConfigKey, out var json) ? JsonDocument.Parse(json).RootElement.Clone() : JsonDocument.Parse("{}").RootElement.Clone();
        return new(game.Id, game.Uuid.ToString(), game.Name, game.Description, parent, puzzle.TemplateId, puzzle.ImageId, config, game.Created, game.Updated);
    }
}
