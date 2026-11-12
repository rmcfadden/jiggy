using System.Text.Json.Nodes;

namespace Backend.Services.Gameplay;

/// <summary>Scrambled pieces: every piece starts loose around the board and is dragged home (or joined to its neighbours).</summary>
public class ScrambledGameService : PuzzleGameService
{
    static readonly string[] Sides = ["top", "left", "right", "bottom"];

    public override string Type => "scrambled";

    protected override PuzzleState Initial(GameSetup setup, Grid grid)
    {
        var side = Sides.FirstOrDefault(s => s == setup.Text("startSide")) ?? "random";
        var loose = (int)Math.Floor(setup.Number("looseCount", 0));
        var state = PuzzleState.For(Type, grid);
        state.FreeBuild = !(setup.Config["freeBuild"] is JsonValue v && v.TryGetValue<bool>(out var b) && !b);
        state.Offsets = Puzzle.ScatterOffsets(new Puzzle.Scatter(grid.Cols, grid.Rows, grid.Seed, side, loose == 0 ? grid.Total : loose, setup.Number("viewPercent", 40), setup.Number("spread", 30)));
        return state;
    }

    protected override bool IsSolved(PuzzleState state) => Puzzle.IsSolved(state.Offsets ?? []);

    protected override ActionResult Apply(PuzzleState state, GameAction action)
    {
        if (action is not MoveAction move) throw Unsupported(action);
        var offsets = state.Offsets ?? [];
        if (move.Piece >= state.Total) throw new GameException(409, $"there is no piece {move.Piece}");
        // A piece may be dropped anywhere in a few board-widths around the solved picture, no further.
        var limit = Math.Max(state.Cols, state.Rows) * Puzzle.PieceSize * 4;
        if (Math.Abs(move.X) > limit || Math.Abs(move.Y) > limit) throw new GameException(409, "the piece was moved off the board area");
        if (offsets[move.Piece] == Offset.Home) throw new GameException(409, $"piece {move.Piece} is already placed");

        var freeBuild = state.FreeBuild ?? true;
        var group = freeBuild ? Puzzle.ConnectedPieces(offsets, state.Cols, move.Piece) : [move.Piece];
        var moved = offsets.Select((o, i) => group.Contains(i) ? new Offset(move.X, move.Y) : o).ToArray();
        var next = freeBuild
            ? Puzzle.SettleGroup(moved, state.Cols, group)
            : moved.Select((o, i) => i == move.Piece ? Puzzle.SnapPiece(o) : o).ToArray();

        var changes = new JsonObject();
        for (var i = 0; i < next.Length; i++)
            if (next[i] != offsets[i]) changes[i.ToString()] = PuzzleState.OffsetJson(next[i]);
        var newState = state.Clone();
        newState.Offsets = next;
        return new ActionResult(newState, new JsonObject { ["offsets"] = changes }, next[move.Piece] == Offset.Home);
    }
}
