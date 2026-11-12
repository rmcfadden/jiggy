using System.Text.Json.Nodes;

namespace Backend.Services.Gameplay;

/// <summary>
/// The games where the player drops pieces from a panel into slots: a piece goes in its own slot or counts as a
/// mistake. Subclasses decide only which pieces are in the queue and how many the panel shows.
/// </summary>
public abstract class TrayGameService(Func<string>? newId = null) : PuzzleGameService(newId)
{
    protected abstract (int[] Queue, int Visible) Layout(GameSetup setup, int[] all, Rng rng, int total);

    protected static int Clamp(double n, int total) => (int)Math.Clamp(Math.Floor(n), 1, total);

    protected override PuzzleState Initial(GameSetup setup, Grid grid)
    {
        var (queue, visible) = Layout(setup, Enumerable.Range(0, grid.Total).ToArray(), new Rng(grid.Seed), grid.Total);
        var state = PuzzleState.For(Type, grid);
        state.Queue = queue.Select(i => grid.Guids[i]).ToArray();
        state.Visible = visible;
        return state;
    }

    protected override bool IsSolved(PuzzleState state) => (state.Queue ?? []).Length == 0;

    protected override ActionResult Apply(PuzzleState state, GameAction action)
    {
        if (action is not PlaceAction place) throw Unsupported(action);
        if (!state.PieceIndexes().TryGetValue(place.Piece, out var index)) throw new GameException(409, $"there is no piece {place.Piece}");
        if (place.Slot >= state.Total) throw new GameException(409, $"there is no slot {place.Slot}");
        if (!(state.Queue ?? []).Take(state.Visible ?? 0).Contains(place.Piece)) throw new GameException(409, $"piece {place.Piece} is not in the panel");
        if (!(state.Queue ?? []).Contains(state.Guids()[place.Slot])) throw new GameException(409, $"slot {place.Slot} is already filled");
        if (index != place.Slot)
        {
            // A wrong slot is a legal try that fails: it costs a mistake and changes nothing else.
            var next = state.Clone();
            next.Mistakes++;
            return new ActionResult(next, [], MoveResult.Denied, false, $"piece {place.Piece} does not belong in slot {place.Slot}");
        }
        StateEvent[] events = [new PiecesAdded([place.Piece])];
        return new ActionResult(state.Apply(events), events, MoveResult.Placed, true);
    }
}

/// <summary>Next pieces in panel: the panel offers the next few pieces of the queue, in order or shuffled.</summary>
public class NextPiecesGameService(Func<string>? newId = null) : TrayGameService(newId)
{
    public override string Type => "next-pieces";

    protected override (int[] Queue, int Visible) Layout(GameSetup setup, int[] all, Rng rng, int total) =>
        (setup.Text("order") == "random" ? Rng.Shuffle(all, rng) : all, Clamp(setup.Number("panelSize", 3), total));
}

/// <summary>Solve last X pieces: all but X random pieces start placed, the player places the rest.</summary>
public class LastXGameService(Func<string>? newId = null) : TrayGameService(newId)
{
    public override string Type => "last-x";

    protected override (int[] Queue, int Visible) Layout(GameSetup setup, int[] all, Rng rng, int total)
    {
        var queue = Rng.Shuffle(all, rng).Take(Clamp(setup.Number("remaining", 5), total)).ToArray();
        return (queue, queue.Length);
    }
}

/// <summary>Maps a parent game's <c>location</c> to the service that runs its games.</summary>
public class GameServiceRegistry
{
    readonly Dictionary<string, PuzzleGameService> services;

    public GameServiceRegistry() : this([new ScrambledGameService(), new NextPiecesGameService(), new LastXGameService()]) { }

    public GameServiceRegistry(IEnumerable<PuzzleGameService> all) => services = all.ToDictionary(s => s.Type);

    /// <summary>The service for a parent <c>location</c>; 422 when no service runs that kind of game.</summary>
    public PuzzleGameService ForParent(string location) =>
        services.TryGetValue(location, out var service) ? service : throw new GameException(422, $"no game service for \"{location}\"");
}
