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

public record Grid(int Cols, int Rows, int Total, uint Seed);

/// <summary>
/// The full state of a play. Tray games (<c>next-pieces</c>, <c>last-x</c>) use Placed, Queue and Visible; scrambled
/// uses Offsets, each piece's distance from its solved position (0,0 means placed).
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
    public bool[]? Placed { get; set; }
    public int[]? Queue { get; set; }
    public int? Visible { get; set; }
    public Offset[]? Offsets { get; set; }

    public static PuzzleState For(string type, Grid grid) => new() { Type = type, Cols = grid.Cols, Rows = grid.Rows, Total = grid.Total };

    public PuzzleState Clone() => new()
    {
        Type = Type, Cols = Cols, Rows = Rows, Total = Total, Mistakes = Mistakes, Solved = Solved, FreeBuild = FreeBuild,
        Placed = Placed?.ToArray(), Queue = Queue?.ToArray(), Visible = Visible, Offsets = Offsets?.ToArray(),
    };

    public JsonObject ToJson()
    {
        var o = new JsonObject { ["type"] = Type, ["cols"] = Cols, ["rows"] = Rows, ["total"] = Total, ["mistakes"] = Mistakes, ["solved"] = Solved };
        if (FreeBuild is { } free) o["freeBuild"] = free;
        if (Placed is { } placed) o["placed"] = new JsonArray(placed.Select(p => (JsonNode)JsonValue.Create(p)).ToArray());
        if (Queue is { } queue) o["queue"] = new JsonArray(queue.Select(q => (JsonNode)JsonValue.Create(q)).ToArray());
        if (Visible is { } visible) o["visible"] = visible;
        if (Offsets is { } offsets) o["offsets"] = new JsonArray(offsets.Select(OffsetJson).ToArray());
        return o;
    }

    public static JsonNode OffsetJson(Offset o) => new JsonObject { ["x"] = o.X, ["y"] = o.Y };

    /// <summary>Reads a state back from its JSON; 500 when a stored row is not a state this server wrote.</summary>
    public static PuzzleState FromJson(JsonObject o)
    {
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
                Placed = o["placed"]?.AsArray().Select(n => n!.GetValue<bool>()).ToArray(),
                Queue = o["queue"]?.AsArray().Select(n => n!.GetValue<int>()).ToArray(),
                Visible = o["visible"]?.GetValue<int>(),
                Offsets = o["offsets"]?.AsArray().Select(n => new Offset(n!["x"]!.GetValue<double>(), n["y"]!.GetValue<double>())).ToArray(),
            };
        }
        catch (Exception e) when (e is NullReferenceException or InvalidOperationException or FormatException)
        {
            throw new GameException(500, "stored game state is corrupt");
        }
    }
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
        var type = raw.TryGetProperty("type", out var t) && t.ValueKind == JsonValueKind.String ? t.GetString() : null;
        switch (type)
        {
            case "move":
                Only("type", "piece", "x", "y");
                return new MoveAction(Int("piece"), Finite("x"), Finite("y"));
            case "place":
                Only("type", "piece", "slot");
                return new PlaceAction(Int("piece"), Int("slot"));
            default:
                throw new GameException(400, "type must be \"move\" or \"place\"");
        }
    }
}

public record MoveAction(int Piece, double X, double Y) : GameAction("move")
{
    public override JsonObject ToJson() => new() { ["type"] = "move", ["piece"] = Piece, ["x"] = X, ["y"] = Y };
}

public record PlaceAction(int Piece, int Slot) : GameAction("place")
{
    public override JsonObject ToJson() => new() { ["type"] = "place", ["piece"] = Piece, ["slot"] = Slot };
}

/// <summary>What applying an action gives back: the new state, the delta to store and whether the move was correct.</summary>
public record ActionResult(PuzzleState State, JsonObject Delta, bool Correct);
