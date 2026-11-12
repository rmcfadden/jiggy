using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Nodes;
using Backend.Services.Gameplay;
using Datasources;
using Play = Backend.Types.View.GamePlay;
using PlayAction = Backend.Types.Datasource.GamePlayAction;
using PlayState = Backend.Types.Datasource.GamePlayState;
using PlayUser = Backend.Types.Datasource.GamePlayUser;

namespace Backend.Services;

/// <summary>
/// Runs game plays: <c>Start</c> creates a play with its first state, <c>Action</c> hands a player's move to the game
/// service and stores the accepted result, <c>Finish</c> closes the play. A play is read through the <c>game_play</c>
/// view, which brings its participants, state changes and actions in one fetch; writes go to the base repositories.
/// Only this service writes <c>game_play_state</c>, so a client can never set the state, only ask for moves the rules accept.
/// </summary>
public class GamePlaysService(
    ICRUDRepository<Play> plays,
    ICRUDRepository<PlayState> states,
    ICRUDRepository<PlayAction> actions,
    ICRUDRepository<PlayUser> users,
    GamesService games,
    TemplatesService templates,
    GameServiceRegistry registry)
{
    /// <summary>Serialises writes per play so two moves cannot both be checked against the same state.</summary>
    readonly ConcurrentDictionary<long, SemaphoreSlim> locks = new();

    /// <summary>Starts a play of <paramref name="gameId"/> for <paramref name="userId"/>; the game's parent decides which game service runs it.</summary>
    public async Task<object> Start(long gameId, long userId)
    {
        var game = await games.Get(gameId) ?? throw new GameException(404, $"unknown game: {gameId}");
        var service = registry.ForParent(game.Parent);
        var content = (await templates.Get(game.TemplateId))?.Content;
        long Int(string name) => content is { ValueKind: JsonValueKind.Object } c && c.TryGetProperty(name, out var v) && v.TryGetInt64(out var n) ? n : 0;
        var config = game.Config is { ValueKind: JsonValueKind.Object } g && g.TryGetProperty("config", out var inner) && JsonNode.Parse(inner.GetRawText()) is JsonObject o ? o : [];
        var state = service.Start(new GameSetup(Int("cols"), Int("rows"), config));

        var play = await plays.Create(new Play { GameId = gameId, UserId = userId, Finished = null });
        await users.Create(new PlayUser { GamePlayId = play.Id, UserId = userId });
        await states.Create(new PlayState { GamePlayId = play.Id, StateChange = state.ToJson().ToJsonString() });
        return new { id = play.Id, gameId, finished = (DateTime?)null, state = state.ToJson() };
    }

    /// <summary>Applies one action; 400 for a malformed one and 409 for one the rules refuse, storing nothing in both cases.</summary>
    public async Task<object> Action(long playId, long userId, JsonElement? body)
    {
        var action = GameAction.Parse(body);
        using var _ = await Lock(playId);
        var play = await Load(playId, userId);
        if (play.Finished is not null) throw new GameException(409, "the play is finished");
        var state = StateOf(play);
        var result = registry.ForParent(state.Type).Action(state, action);
        // The state row goes first: it is the truth. A failure before the action row leaves a state with no log entry, never a logged move that did not happen.
        await states.Create(new PlayState { GamePlayId = playId, StateChange = StateRow(result) });
        await actions.Create(new PlayAction { GamePlayId = playId, UserId = userId, Action = action.ToJson().ToJsonString() });
        // Solving the puzzle ends the play: `finished` is set by the game, not by the client.
        var finished = result.State.Solved ? await MarkFinished(playId) : play.Finished;
        return new
        {
            accepted = result.Result != MoveResult.Denied, result = result.Result, reason = result.Reason, correct = result.Correct,
            solved = result.State.Solved, finished, events = result.Events.Select(e => e.ToJson()).ToList(), state = result.State.ToJson(),
        };
    }

    /// <summary>One stored state row after the first: the events plus the counters they leave behind.</summary>
    static string StateRow(ActionResult r) => new JsonObject
    {
        ["events"] = new JsonArray(r.Events.Select(e => (JsonNode)e.ToJson()).ToArray()),
        ["mistakes"] = r.State.Mistakes,
        ["solved"] = r.State.Solved,
    }.ToJsonString();

    /// <summary>The user's finished (or, when <paramref name="finished"/> is false, unfinished) plays, newest activity first: plays they are a participant of (<c>game_play_user</c>). <c>lastPlayed</c> is the newest state change.</summary>
    public async Task<object> List(long userId, bool finished)
    {
        var ids = new HashSet<long>();
        await foreach (var row in users.Read()) if (row.UserId == userId) ids.Add(row.GamePlayId);
        var found = new List<(long Id, long GameId, DateTime LastPlayed, DateTime? Finished)>();
        foreach (var id in ids)
        {
            var play = await plays.ReadSingleById(id);
            if (play is null || (play.Finished is not null) != finished) continue;
            found.Add((id, play.GameId, play.States.Select(s => s.Created).Append(play.Created).Max(), play.Finished));
        }
        return found.OrderByDescending(f => f.LastPlayed).ThenByDescending(f => f.Id)
            .Select(f => new { id = f.Id, gameId = f.GameId, lastPlayed = f.LastPlayed, finished = f.Finished }).ToList();
    }

    public async Task<object> State(long playId, long userId)
    {
        var play = await Load(playId, userId);
        return new { id = playId, gameId = play.GameId, finished = play.Finished, state = StateOf(play).ToJson() };
    }

    /// <summary>The play's state after every stored change, first to last, so a client can step through the whole game.</summary>
    public async Task<object> States(long playId, long userId)
    {
        var play = await Load(playId, userId);
        return new { id = playId, gameId = play.GameId, finished = play.Finished, states = PuzzleGameService.FoldAll(play.States.OrderBy(s => s.Id).Select(s => (JsonObject)JsonNode.Parse(s.StateChange)!).ToList()).Select(s => s.ToJson()).ToList() };
    }

    public async Task<object> ActionList(long playId, long userId)
    {
        var play = await Load(playId, userId);
        return play.Actions.OrderBy(a => a.Id)
            .Select(a => new { id = a.Id, userId = a.UserId, action = JsonNode.Parse(a.Action), created = a.Created }).ToList();
    }

    /// <summary>Closes the play (a solved play is already closed). It may be finished early; <c>solved</c> in the result says which.</summary>
    public async Task<object> Finish(long playId, long userId)
    {
        using var _ = await Lock(playId);
        var play = await Load(playId, userId);
        var state = StateOf(play);
        var (solved, mistakes) = registry.ForParent(state.Type).Finish(state);
        // A play that already ended (solved) just reports its result; finishing is idempotent.
        var finished = play.Finished ?? await MarkFinished(playId);
        return new { id = playId, finished, solved, mistakes, state = state.ToJson() };
    }

    /// <summary>
    /// Sets <c>finished</c>. The play is read again first: updating the view repository also rewrites its child lists, so an
    /// update made with a list loaded before this request's new rows would delete those rows.
    /// </summary>
    async Task<DateTime> MarkFinished(long playId)
    {
        var fresh = await plays.ReadSingleById(playId) ?? throw new GameException(404, $"unknown play: {playId}");
        var now = DateTime.UtcNow;
        fresh.Finished = now;
        await plays.Update(fresh);
        return now;
    }

    /// <summary>The play with its users, states and actions; 404 when missing, 403 when <paramref name="userId"/> is not a participant.</summary>
    async Task<Play> Load(long playId, long userId)
    {
        var play = await plays.ReadSingleById(playId) ?? throw new GameException(404, $"unknown play: {playId}");
        if (!play.Users.Any(u => u.Id == userId)) throw new GameException(403, "you are not a player of this game");
        return play;
    }

    static PuzzleState StateOf(Play play) =>
        PuzzleGameService.Fold(play.States.OrderBy(s => s.Id).Select(s => (JsonObject)JsonNode.Parse(s.StateChange)!).ToList());

    async Task<IDisposable> Lock(long playId)
    {
        var gate = locks.GetOrAdd(playId, _ => new SemaphoreSlim(1, 1));
        await gate.WaitAsync();
        return new Releaser(gate);
    }

    sealed class Releaser(SemaphoreSlim gate) : IDisposable
    {
        public void Dispose() => gate.Release();
    }
}
