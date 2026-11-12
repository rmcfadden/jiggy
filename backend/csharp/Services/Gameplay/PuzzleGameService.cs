using System.Text.Json.Nodes;

namespace Backend.Services.Gameplay;

/// <summary>
/// The code that runs a puzzle game. The shared base holds what the game types have in common: it builds the starting
/// state, refuses anything that is not a legal move and decides when the game is solved. Subclasses only supply the
/// starting layout and the rules of one move kind. The state is never taken from a client: it is the result of
/// <see cref="Start"/> plus every accepted <see cref="Action"/>.
/// </summary>
public abstract class PuzzleGameService
{
    /// <summary>Biggest puzzle the server will start; a guard against absurd templates.</summary>
    const long MaxPieces = 2_500;

    public abstract string Type { get; }
    protected abstract PuzzleState Initial(GameSetup setup, Grid grid);
    protected abstract ActionResult Apply(PuzzleState state, GameAction action);
    protected abstract bool IsSolved(PuzzleState state);

    /// <summary>The first state of a play; 422 when the template or config cannot make a game.</summary>
    public PuzzleState Start(GameSetup setup)
    {
        if (setup.Cols < 1 || setup.Rows < 1 || setup.Cols * setup.Rows > MaxPieces)
            throw new GameException(422, $"the game's template has no usable grid ({setup.Cols}x{setup.Rows})");
        var grid = new Grid((int)setup.Cols, (int)setup.Rows, (int)(setup.Cols * setup.Rows), unchecked((uint)(long)setup.Number("seed", 1)));
        var state = Initial(setup, grid);
        state.Solved = IsSolved(state);
        return state;
    }

    /// <summary>Applies one player action: 400 for a move this game type does not have, 409 for an illegal move.</summary>
    public ActionResult Action(PuzzleState state, GameAction action)
    {
        if (state.Solved) throw new GameException(409, "the game is already solved");
        var result = Apply(state, action);
        var solved = IsSolved(result.State);
        result.State.Solved = solved;
        if (solved) result.Delta["solved"] = true;
        return result;
    }

    /// <summary>The result of a play being finished. A play may be finished early; Solved says whether it was completed.</summary>
    public (bool Solved, long Mistakes) Finish(PuzzleState state) => (state.Solved, state.Mistakes);

    protected GameException Unsupported(GameAction action) => new(400, $"a {Type} game has no \"{action.Kind}\" action");

    /// <summary>
    /// Rebuilds a state from its stored changes: the first row is the full state and each later row replaces the keys it
    /// names. <c>offsets</c> is the exception, it is stored sparsely as <c>{ pieceIndex: {x, y} }</c> and patched in place.
    /// </summary>
    public static PuzzleState Fold(IReadOnlyList<JsonObject> changes)
    {
        if (changes.Count == 0) throw new GameException(404, "the play has no state");
        var state = (JsonObject)changes[0].DeepClone();
        foreach (var change in changes.Skip(1))
            foreach (var (key, value) in change.ToList())
            {
                if (key == "offsets" && value is JsonObject sparse)
                {
                    var offsets = state["offsets"] as JsonArray ?? [];
                    foreach (var (index, offset) in sparse)
                        if (int.TryParse(index, out var i) && i < offsets.Count) offsets[i] = offset?.DeepClone();
                    state["offsets"] = offsets;
                }
                else state[key] = value?.DeepClone();
            }
        return PuzzleState.FromJson(state);
    }
}
