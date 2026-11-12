using System.Text.Json;
using Backend.Services;
using Backend.Services.Gameplay;

namespace Backend.Routes;

public static class GamePlaysRoutes
{
    const string UserKey = "userId";

    public static void MapGamePlays(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/game_plays");
        group.AddEndpointFilter(Authenticate);
        group.AddEndpointFilter(GameErrors);

        group.MapPost("/", async (JsonElement? body, HttpContext http, GamePlaysService service) =>
        {
            if (body is not { ValueKind: JsonValueKind.Object } o || !o.TryGetProperty("game_id", out var id) || !id.TryGetInt64(out var gameId))
                throw new GameException(400, "game_id must be an integer");
            return Results.Json(await service.Start(gameId, User(http)), statusCode: StatusCodes.Status201Created);
        });
        group.MapGet("/", async (string? finished, HttpContext http, GamePlaysService service) =>
        {
            if (finished != "false" && finished != "true") throw new GameException(400, "finished must be true or false");
            return Results.Ok(await service.List(User(http), finished == "true"));
        });
        group.MapPost("/{id:long}/action", async (long id, JsonElement? body, HttpContext http, GamePlaysService service) =>
            Results.Ok(await service.Action(id, User(http), body)));
        group.MapGet("/{id:long}/state", async (long id, HttpContext http, GamePlaysService service) =>
            Results.Ok(await service.State(id, User(http))));
        group.MapGet("/{id:long}/states", async (long id, HttpContext http, GamePlaysService service) =>
            Results.Ok(await service.States(id, User(http))));
        group.MapGet("/{id:long}/actions", async (long id, HttpContext http, GamePlaysService service) =>
            Results.Ok(await service.ActionList(id, User(http))));
        group.MapPost("/{id:long}/finish", async (long id, HttpContext http, GamePlaysService service) =>
            Results.Ok(await service.Finish(id, User(http))));
    }

    static long User(HttpContext http) => (long)http.Items[UserKey]!;

    /// <summary>
    /// Requires <c>Authorization: Bearer &lt;access token&gt;</c> (the JWT from /api/oauth/token). On success the user's id is
    /// in <c>HttpContext.Items</c>; otherwise the request is answered 401 and never reaches the route.
    /// </summary>
    static async ValueTask<object?> Authenticate(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var http = context.HttpContext;
        var header = http.Request.Headers.Authorization.ToString();
        var parts = header.Split(' ', 2, StringSplitOptions.TrimEntries);
        var tokens = http.RequestServices.GetRequiredService<TokenService>();
        var row = parts.Length == 2 && parts[0].Equals("Bearer", StringComparison.OrdinalIgnoreCase) && parts[1].Length > 0
            ? await tokens.Validate(parts[1], TokenService.AccessTokenType)
            : null;
        var userId = row is null ? null : await tokens.UserIdOf(row);
        if (userId is null)
        {
            http.Response.Headers.WWWAuthenticate = "Bearer";
            return Results.Json(new { error = "a valid access token is required" }, statusCode: StatusCodes.Status401Unauthorized);
        }
        http.Items[UserKey] = userId.Value;
        return await next(context);
    }

    /// <summary>Game errors carry their own HTTP status; anything else is a 500.</summary>
    static async ValueTask<object?> GameErrors(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        try
        {
            return await next(context);
        }
        catch (GameException error)
        {
            return Results.Json(new { error = error.Message }, statusCode: error.Status);
        }
    }
}
