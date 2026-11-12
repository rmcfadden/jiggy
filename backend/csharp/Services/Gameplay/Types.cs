using System.Text.Json;
using System.Text.Json.Nodes;

namespace Backend.Services.Gameplay;

/// <summary>A refused request; <see cref="Status"/> is the HTTP status the API answers with.</summary>
public class GameException(int status, string message) : Exception(message)
{
    public int Status { get; } = status;
}

public readonly record struct Offset(double X, double Y)
{
    public static readonly Offset Home = new(0, 0);
}

/// <summary>What a game needs to start: the template grid and the game's designer config (the <c>config.config</c> part).</summary>
public record GameSetup(long Cols, long Rows, JsonObject Config)
{
    public double Number(string key, double fallback) =>
        Config[key] is JsonValue v && v.TryGetValue<double>(out var d) ? d : fallback;

    public string? Text(string key) => Config[key] is JsonValue v && v.TryGetValue<string>(out var s) ? s : null;
}

public record Grid(int Cols, int Rows, int Total, uint Seed, string[] Guids);

/// <summary>
/// The full state of a play. <c>Matrix[row][col]</c> is the GUID of the piece whose solved cell that is; GUIDs are random
/// per play, so a player cannot guess one. Scrambled games keep every piece's offset from its solved cell in Pieces
/// (0,0 means placed). Tray games (<c>next-pieces</c>, <c>last-x</c>) use Queue (GUIDs still to place) and Visible; a cell is filled once its piece has left the queue.
/// </summary>
public class PuzzleState
{
    public string Type { get; set; } = "";
    public int Cols { get; set; }
    public int Rows { get; set; }
    public int Total { get; set; }
    public long Mistakes { get; set; }
    public bool Solved { get; set; }
    public bool? FreeBuild { get; set; }
    public string[][] Matrix { get; set; } = [];
    public Dictionary<string, Offset>? Pieces { get; set; }
    public string[]? Queue { get; set; }
    public int? Visible { get; set; }

    public static PuzzleState For(string type, Grid grid) =>
        new() { Type = type, Cols = grid.Cols, Rows = grid.Rows, Total = grid.Total, Matrix = ToMatrix(grid.Guids, grid.Cols) };

    static string[][] ToMatrix(string[] guids, int cols) =>
        Enumerable.Range(0, guids.Length / cols).Select(row => guids.Skip(row * cols).Take(cols).ToArray()).ToArray();

    /// <summary>The piece GUIDs row-major: index <c>i</c> is the piece whose solved cell is <c>i</c>.</summary>
    public string[] Guids() => Matrix.SelectMany(r => r).ToArray();

    public Dictionary<string, int> PieceIndexes() => Guids().Select((g, i) => (g, i)).ToDictionary(p => p.g, p => p.i);

    /// <summary>The pieces' offsets in row-major order, the shape the shared puzzle rules work on.</summary>
    public Offset[] Offsets() => Guids().Select(g => Pieces is not null && Pieces.TryGetValue(g, out var o) ? o : Offset.Home).ToArray();

    public PuzzleState Clone() => new()
    {
        Type = Type, Cols = Cols, Rows = Rows, Total = Total, Mistakes = Mistakes, Solved = Solved, FreeBuild = FreeBuild, Matrix = Matrix,
        Pieces = Pieces is null ? null : new(Pieces), Queue = Queue?.ToArray(), Visible = Visible,
    };

    /// <summary>Applies events to a copy of the state. This is the one place state changes are defined, for live play and replay alike.</summary>
    public PuzzleState Apply(IEnumerable<StateEvent> events)
    {
        var next = Clone();
        var index = PieceIndexes();
        foreach (var e in events)
            foreach (var guid in e.Pieces)
            {
                if (!index.ContainsKey(guid)) throw new GameException(409, $"there is no piece {guid}");
                switch (e)
                {
                    case PiecesAdded:
                        if (next.Pieces is not null) next.Pieces[guid] = Offset.Home;
                        if (next.Queue is not null) next.Queue = next.Queue.Where(q => q != guid).ToArray();
                        break;
                    case PiecesMoved m:
                        if (next.Pieces is not null) next.Pieces[guid] = new Offset(m.X, m.Y);
                        break;
                    case PiecesJoined j:
                        if (next.Pieces is not null) next.Pieces[guid] = new Offset(j.X, j.Y);
                        break;
                }
            }
        return next;
    }

    public JsonObject ToJson()
    {
        var o = new JsonObject { ["type"] = Type, ["cols"] = Cols, ["rows"] = Rows, ["total"] = Total, ["mistakes"] = Mistakes, ["solved"] = Solved };
        if (FreeBuild is { } free) o["freeBuild"] = free;
        o["matrix"] = new JsonArray(Matrix.Select(row => (JsonNode)new JsonArray(row.Select(g => (JsonNode)JsonValue.Create(g)!).ToArray())).ToArray());
        if (Pieces is { } pieces)
        {
            var map = new JsonObject();
            foreach (var guid in Guids()) map[guid] = OffsetJson(pieces[guid]);
            o["pieces"] = map;
        }
        if (Queue is { } queue) o["queue"] = new JsonArray(queue.Select(q => (JsonNode)JsonValue.Create(q)!).ToArray());
        if (Visible is { } visible) o["visible"] = visible;
        return o;
    }

    public static JsonNode OffsetJson(Offset o) => new JsonObject { ["x"] = o.X, ["y"] = o.Y };

    /// <summary>Reads a state back from its JSON; 409 for a play stored before GUIDs, 500 when a row is not a state this server wrote.</summary>
    public static PuzzleState FromJson(JsonObject o)
    {
        if (o["matrix"] is null) throw new GameException(409, "the play was stored in an old format");
        try
        {
            return new PuzzleState
            {
                Type = o["type"]!.GetValue<string>(),
                Cols = o["cols"]!.GetValue<int>(),
                Rows = o["rows"]!.GetValue<int>(),
                Total = o["total"]!.GetValue<int>(),
                Mistakes = o["mistakes"]!.GetValue<long>(),
                Solved = o["solved"]!.GetValue<bool>(),
                FreeBuild = o["freeBuild"]?.GetValue<bool>(),
                Matrix = o["matrix"]!.AsArray().Select(r => r!.AsArray().Select(g => g!.GetValue<string>()).ToArray()).ToArray(),
                Pieces = o["pieces"]?.AsObject().ToDictionary(p => p.Key, p => new Offset(p.Value!["x"]!.GetValue<double>(), p.Value["y"]!.GetValue<double>())),
                Queue = o["queue"]?.AsArray().Select(n => n!.GetValue<string>()).ToArray(),
                Visible = o["visible"]?.GetValue<int>(),
            };
        }
        catch (Exception e) when (e is NullReferenceException or InvalidOperationException or FormatException)
        {
            throw new GameException(500, "stored game state is corrupt");
        }
    }
}

/// <summary>A change to the state. Each names every piece it affects, because joined pieces move as one.</summary>
public abstract record StateEvent(string Type, string[] Pieces)
{
    public abstract JsonObject ToJson();

    protected static JsonArray Names(string[] pieces) => new(pieces.Select(p => (JsonNode)JsonValue.Create(p)!).ToArray());

    public static StateEvent FromJson(JsonNode? n)
    {
        try
        {
            var pieces = n!["pieces"]!.AsArray().Select(p => p!.GetValue<string>()).ToArray();
            return n["type"]!.GetValue<string>() switch
            {
                "pieces_moved" => new PiecesMoved(pieces, n["x"]!.GetValue<double>(), n["y"]!.GetValue<double>()),
                "pieces_added" => new PiecesAdded(pieces),
                "pieces_joined" => new PiecesJoined(pieces, n["x"]!.GetValue<double>(), n["y"]!.GetValue<double>()),
                var other => throw new GameException(500, $"unknown state event: {other}"),
            };
        }
        catch (Exception e) when (e is NullReferenceException or InvalidOperationException or FormatException)
        {
            throw new GameException(500, "stored game state is corrupt");
        }
    }
}

/// <summary>The pieces are at a new coordinate: the final, settled position, never the raw drop.</summary>
public record PiecesMoved(string[] Pieces, double X, double Y) : StateEvent("pieces_moved", Pieces)
{
    public override JsonObject ToJson() => new() { ["type"] = Type, ["pieces"] = Names(Pieces), ["x"] = X, ["y"] = Y };
}

/// <summary>The pieces entered the puzzle at their solved cell.</summary>
public record PiecesAdded(string[] Pieces) : StateEvent("pieces_added", Pieces)
{
    public override JsonObject ToJson() => new() { ["type"] = Type, ["pieces"] = Names(Pieces) };
}

/// <summary>These pieces now sit together as one group at (X, Y).</summary>
public record PiecesJoined(string[] Pieces, double X, double Y) : StateEvent("pieces_joined", Pieces)
{
    public override JsonObject ToJson() => new() { ["type"] = Type, ["pieces"] = Names(Pieces), ["x"] = X, ["y"] = Y };
}

/// <summary>A move a player asks for. Anything else is rejected before it reaches the rules.</summary>
public abstract record GameAction(string Kind)
{
    public abstract JsonObject ToJson();

    /// <summary>Parses an untrusted body; 400 for unknown types, extra fields or bad values.</summary>
    public static GameAction Parse(JsonElement? body)
    {
        if (body is not { ValueKind: JsonValueKind.Object } raw) throw new GameException(400, "action must be a JSON object");
        void Only(params string[] allowed)
        {
            foreach (var p in raw.EnumerateObject())
                if (!allowed.Contains(p.Name)) throw new GameException(400, $"unknown field: {p.Name}");
        }
        int Int(string name) =>
            raw.TryGetProperty(name, out var v) && v.ValueKind == JsonValueKind.Number && v.TryGetInt32(out var i) && i >= 0
                ? i : throw new GameException(400, $"{name} must be a non-negative integer");
        double Finite(string name) =>
            raw.TryGetProperty(name, out var v) && v.ValueKind == JsonValueKind.Number && v.TryGetDouble(out var d) && double.IsFinite(d)
                ? d : throw new GameException(400, $"{name} must be a finite number");
        string Guid(string name) =>
            raw.TryGetProperty(name, out var v) && v.ValueKind == JsonValueKind.String && System.Guid.TryParseExact(v.GetString(), "D", out var g)
                ? g.ToString("D") : throw new GameException(400, $"{name} must be a piece GUID");
        var type = raw.TryGetProperty("type", out var t) && t.ValueKind == JsonValueKind.String ? t.GetString() : null;
        switch (type)
        {
            case "move":
                Only("type", "piece", "x", "y");
                return new MoveAction(Guid("piece"), Finite("x"), Finite("y"));
            case "place":
                Only("type", "piece", "slot");
                return new PlaceAction(Guid("piece"), Int("slot"));
            default:
                throw new GameException(400, "type must be \"move\" or \"place\"");
        }
    }
}

public record MoveAction(string Piece, double X, double Y) : GameAction("move")
{
    public override JsonObject ToJson() => new() { ["type"] = "move", ["piece"] = Piece, ["x"] = X, ["y"] = Y };
}

public record PlaceAction(string Piece, int Slot) : GameAction("place")
{
    public override JsonObject ToJson() => new() { ["type"] = "place", ["piece"] = Piece, ["slot"] = Slot };
}

/// <summary><c>placed</c>: pieces went into their solved cell. <c>moved</c>: pieces moved (maybe joined). <c>denied</c>: a legal try that failed (a wrong slot).</summary>
public static class MoveResult
{
    public const string Moved = "moved", Placed = "placed", Denied = "denied";
}

/// <summary>What applying an action gives back: the new state, the events to store, the outcome and whether the move was correct.</summary>
public record ActionResult(PuzzleState State, IReadOnlyList<StateEvent> Events, string Result, bool Correct, string? Reason = null);
