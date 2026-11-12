using System.Text.Json;
using System.Text.Json.Nodes;
using Backend.Services.Gameplay;
using Xunit;

namespace Tests;

public class GameplayTests
{
    /// <summary>A GUID maker that counts, so a test knows every piece's GUID. Real plays use random v4 GUIDs.</summary>
    static Func<string> Counter()
    {
        var n = 0;
        return () => $"00000000-0000-4000-8000-{++n:D12}";
    }

    static GameServiceRegistry NewRegistry() =>
        new([new ScrambledGameService(Counter()), new NextPiecesGameService(Counter()), new LastXGameService(Counter())]);

    static readonly GameServiceRegistry Registry = NewRegistry();
    const string Forged = "ffffffff-ffff-4fff-8fff-ffffffffffff";

    static GameSetup Setup(int cols, int rows, string config) => new(cols, rows, (JsonObject)JsonNode.Parse(config)!);

    static int Status(Action act) => Assert.Throws<GameException>(act).Status;

    static string G(PuzzleState state, int i) => state.Guids()[i];

    static Offset At(PuzzleState state, int i) => state.Pieces![G(state, i)];

    static MoveAction Move(string piece, double x, double y) => new(piece, x, y);

    static PlaceAction Place(string piece, int slot) => new(piece, slot);

    [Fact]
    public void ParseAction_accepts_the_two_contracts_and_rejects_everything_else()
    {
        GameAction Parse(string json) => GameAction.Parse(JsonDocument.Parse(json).RootElement);
        Assert.Equal(Place(Forged, 2), Parse($$"""{"type":"place","piece":"{{Forged}}","slot":2}"""));
        Assert.Equal(Move(Forged, -3.5, 4), Parse($$"""{"type":"move","piece":"{{Forged.ToUpperInvariant()}}","x":-3.5,"y":4}"""));
        foreach (var bad in new[]
                 {
                     "null", "[]", "\"x\"", "{}", """{"type":"fly"}""", """{"type":"place","piece":1,"slot":0}""", """{"type":"place","piece":"nope","slot":0}""",
                     $$"""{"type":"place","piece":"{{Forged}}","slot":-1}""", $$"""{"type":"place","piece":"{{Forged}}","slot":0,"extra":1}""", $$"""{"type":"move","piece":"{{Forged}}","x":"1","y":0}""",
                 })
            Assert.Equal(400, Status(() => Parse(bad)));
    }

    [Fact]
    public void An_unknown_parent_has_no_service_and_a_bad_grid_cannot_start()
    {
        Assert.Equal(422, Status(() => Registry.ForParent("chess")));
        Assert.Equal(422, Status(() => Registry.ForParent("scrambled").Start(Setup(0, 3, "{}"))));
    }

    [Fact]
    public void The_matrix_holds_unique_guids_and_two_plays_never_share_one()
    {
        var real = new GameServiceRegistry().ForParent("scrambled"); // real random GUIDs
        var a = real.Start(Setup(4, 3, """{"seed":1}"""));
        var b = real.Start(Setup(4, 3, """{"seed":1}"""));
        Assert.Equal(3, a.Matrix.Length);
        Assert.All(a.Matrix, row => Assert.Equal(4, row.Length));
        Assert.Equal(12, a.Guids().Distinct().Count());
        Assert.Empty(a.Guids().Intersect(b.Guids()));
        // The same seed still lays pieces out the same way: only the names differ.
        Assert.Equal(a.Offsets(), b.Offsets());
    }

    [Fact]
    public void NextPieces_panel_mistakes_and_solving()
    {
        var service = NewRegistry().ForParent("next-pieces");
        var state = service.Start(Setup(2, 2, """{"panelSize":2,"order":"sequential"}"""));
        var p = state.Guids();
        Assert.Equal(p, state.Queue!);
        Assert.Equal(2, state.Visible);
        Assert.Equal(409, Status(() => service.Action(state, Place(p[3], 3)))); // not in the panel
        Assert.Equal(409, Status(() => service.Action(state, Place(Forged, 0)))); // not a piece of this play
        Assert.Equal(400, Status(() => service.Action(state, Move(p[0], 0, 0)))); // wrong action kind
        var wrong = service.Action(state, Place(p[0], 1));
        Assert.Equal(MoveResult.Denied, wrong.Result);
        Assert.False(wrong.Correct);
        Assert.Empty(wrong.Events);
        Assert.Equal(1, wrong.State.Mistakes);
        for (var slot = 0; slot < 4; slot++)
        {
            var result = service.Action(state, Place(p[slot], slot));
            Assert.Equal(MoveResult.Placed, result.Result);
            Assert.Equal(new PiecesAdded([p[slot]]).ToJson().ToJsonString(), result.Events.Single().ToJson().ToJsonString());
            state = result.State;
        }
        Assert.True(state.Solved);
        Assert.Equal(409, Status(() => service.Action(state, Place(p[0], 0)))); // already solved
    }

    [Fact]
    public void A_filled_slot_is_refused()
    {
        var service = Registry.ForParent("next-pieces");
        var state = service.Start(Setup(2, 1, """{"panelSize":2}"""));
        var next = service.Action(state, Place(G(state, 0), 0)).State;
        Assert.Equal(409, Status(() => service.Action(next, Place(G(state, 1), 0))));
    }

    [Fact]
    public void LastX_leaves_exactly_X_pieces_and_the_same_seed_gives_the_same_game()
    {
        var service = NewRegistry().ForParent("last-x");
        const string config = """{"remaining":3,"seed":7}""";
        var a = service.Start(Setup(3, 3, config));
        Assert.Equal(3, a.Queue!.Length);
        Assert.Equal(a.ToJson().ToJsonString(), NewRegistry().ForParent("last-x").Start(Setup(3, 3, config)).ToJson().ToJsonString()); // counter GUIDs repeat per registry
        var state = a;
        foreach (var piece in a.Queue) state = service.Action(state, Place(piece, Array.IndexOf(a.Guids(), piece))).State;
        Assert.True(state.Solved);
    }

    [Fact]
    public void Scrambled_pieces_start_loose_snap_home_and_placed_pieces_are_locked()
    {
        var service = Registry.ForParent("scrambled");
        var start = service.Start(Setup(3, 2, """{"seed":5,"freeBuild":false}"""));
        Assert.Equal(6, start.Pieces!.Count);
        Assert.False(start.Solved);
        Assert.All(start.Pieces.Values, o => Assert.NotEqual(Offset.Home, o));
        Assert.Equal(409, Status(() => service.Action(start, Move(Forged, 0, 0))));
        Assert.Equal(409, Status(() => service.Action(start, Move(G(start, 0), 1e9, 0))));
        Assert.Equal(400, Status(() => service.Action(start, Place(G(start, 0), 0))));

        var near = service.Action(start, Move(G(start, 0), 10, -10));
        Assert.Equal(MoveResult.Placed, near.Result);
        Assert.True(near.Correct);
        Assert.Equal(new PiecesAdded([G(start, 0)]).ToJson().ToJsonString(), near.Events.Single().ToJson().ToJsonString());
        Assert.Equal(Offset.Home, At(near.State, 0));
        Assert.Equal(409, Status(() => service.Action(near.State, Move(G(start, 0), 50, 50))));

        var far = service.Action(start, Move(G(start, 1), 500, 500));
        Assert.Equal(MoveResult.Moved, far.Result);
        Assert.False(far.Correct);
        Assert.Equal(new PiecesMoved([G(start, 1)], 500, 500).ToJson().ToJsonString(), far.Events.Single().ToJson().ToJsonString());
        Assert.Equal(new Offset(500, 500), At(far.State, 1));

        var state = start;
        for (var i = 0; i < 6; i++) state = service.Action(state, Move(G(start, i), 0, 0)).State;
        Assert.True(state.Solved);
    }

    [Fact]
    public void Scrambled_free_build_a_joined_group_moves_as_one_with_one_event_naming_every_piece()
    {
        var service = Registry.ForParent("scrambled");
        var state = service.Start(Setup(3, 1, """{"seed":2,"freeBuild":true}"""));
        var (a, b, c) = (G(state, 0), G(state, 1), G(state, 2));
        state = service.Action(state, Move(b, 400, 400)).State;
        // Piece 0 lands beside piece 1: it settles onto it and the two are joined.
        var join = service.Action(state, Move(a, 405, 398));
        Assert.Equal(MoveResult.Moved, join.Result);
        Assert.Equal(2, join.Events.Count);
        Assert.Equal(new PiecesMoved([a], 400, 400).ToJson().ToJsonString(), join.Events[0].ToJson().ToJsonString()); // the settled position, not the raw drop
        Assert.IsType<PiecesJoined>(join.Events[1]);
        Assert.Equal(new[] { a, b }.Order(), join.Events[1].Pieces.Order());
        Assert.Equal(At(join.State, 0), At(join.State, 1));

        // Dragging either member now moves both, as a single pieces_moved event.
        var moved = service.Action(join.State, Move(b, 300, 300));
        var e = Assert.IsType<PiecesMoved>(Assert.Single(moved.Events));
        Assert.Equal(new[] { a, b }.Order(), e.Pieces.Order());
        Assert.Equal(new Offset(300, 300), At(moved.State, 0));
        Assert.Equal(new Offset(300, 300), At(moved.State, 1));
        Assert.NotEqual(new Offset(300, 300), At(moved.State, 2)); // piece c is not part of the group
        Assert.NotNull(c);

        // Dropping the whole group on the template places every member in one pieces_added event.
        var home = service.Action(moved.State, Move(a, 0, 0));
        Assert.Equal(MoveResult.Placed, home.Result);
        var added = Assert.IsType<PiecesAdded>(Assert.Single(home.Events));
        Assert.Equal(new[] { a, b }.Order(), added.Pieces.Order());
        Assert.Equal(Offset.Home, At(home.State, 0));
        Assert.Equal(Offset.Home, At(home.State, 1));
    }

    static JsonObject Row(ActionResult r) => new()
    {
        ["events"] = new JsonArray(r.Events.Select(e => (JsonNode)e.ToJson()).ToArray()),
        ["mistakes"] = r.State.Mistakes,
        ["solved"] = r.State.Solved,
    };

    [Fact]
    public void Fold_replays_the_first_row_and_the_stored_event_rows()
    {
        var service = Registry.ForParent("scrambled");
        var start = service.Start(Setup(2, 2, """{"seed":3,"freeBuild":false}"""));
        var state = start;
        var rows = new List<JsonObject> { start.ToJson() };
        foreach (var action in new GameAction[] { Move(G(start, 0), 5, 5), Move(G(start, 1), 400, 0) })
        {
            var result = service.Action(state, action);
            rows.Add(Row(result));
            state = result.State;
        }
        Assert.Equal(state.ToJson().ToJsonString(), PuzzleGameService.Fold(rows).ToJson().ToJsonString());
        Assert.Equal(404, Status(() => PuzzleGameService.Fold([])));
        Assert.Equal(409, Status(() => PuzzleGameService.Fold([new JsonObject { ["type"] = "scrambled", ["offsets"] = new JsonArray() }]))); // stored before GUIDs
    }

    [Fact]
    public void Fold_replays_tray_games_mistakes_included()
    {
        var service = NewRegistry().ForParent("next-pieces");
        var start = service.Start(Setup(2, 1, """{"panelSize":2}"""));
        var (p0, p1) = (G(start, 0), G(start, 1));
        var state = start;
        var rows = new List<JsonObject> { start.ToJson() };
        foreach (var action in new GameAction[] { Place(p0, 1), Place(p0, 0), Place(p1, 1) })
        {
            var result = service.Action(state, action);
            rows.Add(Row(result));
            state = result.State;
        }
        Assert.Equal(1, state.Mistakes);
        Assert.True(state.Solved);
        Assert.Equal(state.ToJson().ToJsonString(), PuzzleGameService.Fold(rows).ToJson().ToJsonString());
    }
}
