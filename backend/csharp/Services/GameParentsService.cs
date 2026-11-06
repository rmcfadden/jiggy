using Backend.Types.View;
using Datasources;

namespace Backend.Services;

public record GameParentInput(string? Name, string? Description, string? Location, bool? IsEnabled);

public class GameParentsService(ICRUDRepository<GameParent> repo)
{
    /// <summary>The game types the designer ships with; <c>Location</c> is the id the frontend matches on.</summary>
    static readonly GameParentInput[] BuiltIn =
    [
        new("Scrambled pieces", "Every piece starts in the tray, shuffled.", "scrambled", null),
        new("Next pieces in panel", "The panel only offers the next few pieces.", "next-pieces", null),
        new("Solve last X pieces", "The puzzle starts nearly done; finish the last few.", "last-x", null),
    ];

    public async Task<List<GameParent>> List()
    {
        var rows = new List<GameParent>();
        await foreach (var row in repo.Read())
            if (!row.IsDeleted) rows.Add(row);
        return rows;
    }

    public async Task<GameParent?> Get(long id)
    {
        var row = await repo.ReadSingleById(id);
        return row is { IsDeleted: false } ? row : null;
    }

    public Task<GameParent> Create(GameParentInput input) => repo.Create(Apply(new GameParent(), input));

    /// <summary>Merges the fields present in <paramref name="input"/> into the stored row; null when it does not exist.</summary>
    public async Task<GameParent?> Update(long id, GameParentInput input)
    {
        var row = await Get(id);
        if (row is null) return null;
        Apply(row, input);
        await repo.Update(row);
        return row;
    }

    public async Task<bool> Delete(long id)
    {
        var row = await Get(id);
        if (row is null) return false;
        await repo.Delete(row);
        return true;
    }

    /// <summary>Adds the built-in parent games that are not there yet; returns the names it added.</summary>
    public async Task<List<string>> AddParentGames()
    {
        var have = (await List()).Select(g => g.Location).ToHashSet();
        var added = new List<string>();
        foreach (var game in BuiltIn.Where(g => !have.Contains(g.Location!)))
        {
            await Create(game);
            added.Add(game.Name!);
        }
        return added;
    }

    static GameParent Apply(GameParent row, GameParentInput input)
    {
        row.Name = input.Name ?? row.Name;
        row.Description = input.Description ?? row.Description;
        row.Location = input.Location ?? row.Location;
        row.IsEnabled = input.IsEnabled ?? row.IsEnabled;
        return row;
    }
}
