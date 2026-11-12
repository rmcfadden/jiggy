using System.Text.Json.Nodes;

namespace Backend.Services.Gameplay;

/// <summary>Scrambled pieces: every piece starts loose around the board and is dragged home (or joined to its neighbours).</summary>
public class ScrambledGameService(Func<string>? newId = null) : PuzzleGameService(newId)
{
    static readonly string[] Sides = ["top", "left", "right", "bottom"];

    public override string Type => "scrambled";

    protected override PuzzleState Initial(GameSetup setup, Grid grid)
    {
        var side = Sides.FirstOrDefault(s => s == setup.Text("startSide")) ?? "random";
        var loose = (int)Math.Floor(setup.Number("looseCount", 0));
        var state = PuzzleState.For(Type, grid);
        state.FreeBuild = !(setup.Config["freeBuild"] is JsonValue v && v.TryGetValue<bool>(out var b) && !b);
        var offsets = Puzzle.ScatterOffsets(new Puzzle.Scatter(grid.Cols, grid.Rows, grid.Seed, side, loose == 0 ? grid.Total : loose, setup.Number("viewPercent", 40), setup.Number("spread", 30)));
        state.Pieces = grid.Guids.Select((g, i) => (g, i)).ToDictionary(p => p.g, p => offsets[p.i]);
        return state;
    }

    protected override bool IsSolved(PuzzleState state) => Puzzle.IsSolved(state.Offsets());

    protected override ActionResult Apply(PuzzleState state, GameAction action)
    {
        if (action is not MoveAction move) throw Unsupported(action);
        var guids = state.Guids();
        if (!state.PieceIndexes().TryGetValue(move.Piece, out var piece)) throw new GameException(409, $"there is no piece {move.Piece}");
        // A piece may be dropped anywhere in a few board-widths around the solved picture, no further.
        var limit = Math.Max(state.Cols, state.Rows) * Puzzle.PieceSize * 4;
        if (Math.Abs(move.X) > limit || Math.Abs(move.Y) > limit) throw new GameException(409, "the piece was moved off the board area");
        var offsets = state.Offsets();
        if (offsets[piece] == Offset.Home) throw new GameException(409, $"piece {move.Piece} is already placed");

        // Joined pieces move as one: the dragged piece's whole group takes the drop, then settles together.
        var freeBuild = state.FreeBuild ?? true;
        var group = freeBuild ? Puzzle.ConnectedPieces(offsets, state.Cols, piece) : [piece];
        var moved = offsets.Select((o, i) => group.Contains(i) ? new Offset(move.X, move.Y) : o).ToArray();
        var next = freeBuild
            ? Puzzle.SettleGroup(moved, state.Cols, group)
            : moved.Select((o, i) => i == piece ? Puzzle.SnapPiece(o) : o).ToArray();
        var at = next[piece];
        string[] Names(IEnumerable<int> indexes) => indexes.Select(i => guids[i]).ToArray();

        var placed = at == Offset.Home;
        var events = new List<StateEvent> { placed ? new PiecesAdded(Names(group)) : new PiecesMoved(Names(group), at.X, at.Y) };
        // Landing against a neighbour makes a bigger group; say so with the whole new group.
        if (!placed && freeBuild)
        {
            var joined = Puzzle.ConnectedPieces(next, state.Cols, piece);
            if (joined.Count > group.Count) events.Add(new PiecesJoined(Names(joined), at.X, at.Y));
        }
        return new ActionResult(state.Apply(events), events, placed ? MoveResult.Placed : MoveResult.Moved, placed);
    }
}
