using System.Text.Json;
using System.Text.Json.Nodes;
using Backend.Services.Gameplay;
using Xunit;

namespace Tests;

public class GameplayTests
{
    static readonly GameServiceRegistry Registry = new();

    static GameSetup Setup(int cols, int rows, string config) => new(cols, rows, (JsonObject)JsonNode.Parse(config)!);

    static int Status(Action act) => Assert.Throws<GameException>(act).Status;

    static MoveAction Move(int piece, double x, double y) => new(piece, x, y);

    static PlaceAction Place(int piece, int slot) => new(piece, slot);

    [Fact]
    public void ParseAction_accepts_the_two_contracts_and_rejects_everything_else()
    {
        GameAction Parse(string json) => GameAction.Parse(JsonDocument.Parse(json).RootElement);
        Assert.Equal(Place(1, 2), Parse("""{"type":"place","piece":1,"slot":2}"""));
        Assert.Equal(Move(1, -3.5, 4), Parse("""{"type":"move","piece":1,"x":-3.5,"y":4}"""));
        foreach (var bad in new[] { "null", "[]", "\"x\"", "{}", """{"type":"fly"}""", """{"type":"place","piece":-1,"slot":0}""", """{"type":"place","piece":1.5,"slot":0}""", """{"type":"place","piece":1,"slot":0,"extra":1}""", """{"type":"move","piece":0,"x":"1","y":0}""" })
            Assert.Equal(400, Status(() => Parse(bad)));
    }

    [Fact]
    public void An_unknown_parent_has_no_service_and_a_bad_grid_cannot_start()
    {
        Assert.Equal(422, Status(() => Registry.ForParent("chess")));
        Assert.Equal(422, Status(() => Registry.ForParent("scrambled").Start(Setup(0, 3, "{}"))));
    }

    [Fact]
    public void NextPieces_panel_mistakes_and_solving()
    {
        var service = Registry.ForParent("next-pieces");
        var state = service.Start(Setup(2, 2, """{"panelSize":2,"order":"sequential"}"""));
        Assert.Equal([0, 1, 2, 3], state.Queue!);
        Assert.Equal(2, state.Visible);
        Assert.Equal(409, Status(() => service.Action(state, Place(3, 3)))); // not in the panel
        Assert.Equal(400, Status(() => service.Action(state, Move(0, 0, 0)))); // wrong action kind
        var wrong = service.Action(state, Place(0, 1));
        Assert.False(wrong.Correct);
        Assert.Equal(1, wrong.State.Mistakes);
        Assert.Equal("""{"mistakes":1}""", wrong.Delta.ToJsonString());
        for (var piece = 0; piece < 4; piece++)
        {
            var result = service.Action(state, Place(piece, piece));
            Assert.True(result.Correct);
            state = result.State;
        }
        Assert.True(state.Solved);
        Assert.Equal(409, Status(() => service.Action(state, Place(0, 0)))); // already solved
    }

    [Fact]
    public void A_filled_slot_is_refused()
    {
        var service = Registry.ForParent("next-pieces");
        var next = service.Action(service.Start(Setup(2, 1, """{"panelSize":2}""")), Place(0, 0)).State;
        Assert.Equal(409, Status(() => service.Action(next, Place(1, 0))));
    }

    [Fact]
    public void LastX_leaves_exactly_X_pieces_and_the_same_seed_gives_the_same_game()
    {
        var service = Registry.ForParent("last-x");
        const string config = """{"remaining":3,"seed":7}""";
        var a = service.Start(Setup(3, 3, config));
        Assert.Equal(3, a.Queue!.Length);
        Assert.Equal(3, a.Placed!.Count(p => !p));
        Assert.Equal(a.ToJson().ToJsonString(), service.Start(Setup(3, 3, config)).ToJson().ToJsonString());
        var state = a;
        foreach (var piece in a.Queue) state = service.Action(state, Place(piece, piece)).State;
        Assert.True(state.Solved);
    }

    [Fact]
    public void Scrambled_pieces_start_loose_snap_home_and_placed_pieces_are_locked()
    {
        var service = Registry.ForParent("scrambled");
        var start = service.Start(Setup(3, 2, """{"seed":5,"freeBuild":false}"""));
        Assert.Equal(6, start.Offsets!.Length);
        Assert.False(start.Solved);
        Assert.All(start.Offsets, o => Assert.NotEqual(Offset.Home, o));
        Assert.Equal(409, Status(() => service.Action(start, Move(9, 0, 0))));
        Assert.Equal(409, Status(() => service.Action(start, Move(0, 1e9, 0))));
        Assert.Equal(400, Status(() => service.Action(start, Place(0, 0))));

        var near = service.Action(start, Move(0, 10, -10));
        Assert.True(near.Correct);
        Assert.Equal(Offset.Home, near.State.Offsets![0]);
        Assert.Equal(["0"], near.Delta["offsets"]!.AsObject().Select(p => p.Key));
        Assert.Equal(409, Status(() => service.Action(near.State, Move(0, 50, 50))));

        var far = service.Action(start, Move(1, 500, 500));
        Assert.False(far.Correct);
        Assert.Equal(new Offset(500, 500), far.State.Offsets![1]);

        var state = start;
        for (var i = 0; i < 6; i++) state = service.Action(state, Move(i, 0, 0)).State;
        Assert.True(state.Solved);
    }

    [Fact]
    public void Scrambled_free_build_moves_joined_pieces_together()
    {
        var service = Registry.ForParent("scrambled");
        var state = service.Start(Setup(3, 1, """{"seed":2,"freeBuild":true}"""));
        state = service.Action(state, Move(1, 400, 400)).State;
        state = service.Action(state, Move(0, 405, 398)).State;
        Assert.Equal(state.Offsets![0], state.Offsets[1]); // piece 0 locked onto its neighbour
        var moved = service.Action(state, Move(0, 300, 300));
        Assert.Equal(new Offset(300, 300), moved.State.Offsets![0]);
        Assert.Equal(new Offset(300, 300), moved.State.Offsets[1]);
    }

    [Fact]
    public void Fold_replays_the_first_row_and_the_later_deltas()
    {
        var service = Registry.ForParent("scrambled");
        var start = service.Start(Setup(2, 2, """{"seed":3,"freeBuild":false}"""));
        var state = start;
        var rows = new List<JsonObject> { start.ToJson() };
        foreach (var action in new GameAction[] { Move(0, 5, 5), Move(1, 400, 0) })
        {
            var result = service.Action(state, action);
            rows.Add(result.Delta);
            state = result.State;
        }
        Assert.Equal(state.ToJson().ToJsonString(), PuzzleGameService.Fold(rows).ToJson().ToJsonString());
        Assert.Equal(404, Status(() => PuzzleGameService.Fold([])));
    }
}
