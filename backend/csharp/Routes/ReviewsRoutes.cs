using System.Text.Json;
using Backend.Services;
using Backend.Services.Gameplay;

namespace Backend.Routes;

public static class ReviewsRoutes
{
    /// <summary>Routes under /api/reviews: reading is public, posting a review needs a signed-in user.</summary>
    public static void MapReviews(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reviews");
        group.AddEndpointFilter(GamePlaysRoutes.GameErrors);

        group.MapGet("/", async (long? game_id, ReviewsService service) => Results.Ok(await service.List(game_id)));
        group.MapPost("/", async (JsonElement? body, HttpContext http, ReviewsService service) =>
        {
            if (body is not { ValueKind: JsonValueKind.Object } o || !o.TryGetProperty("game_id", out var id) || !id.TryGetInt64(out var gameId))
                throw new GameException(400, "game_id must be an integer");
            return Results.Json(await service.Add(gameId, GamePlaysRoutes.User(http), o), statusCode: StatusCodes.Status201Created);
        }).AddEndpointFilter(GamePlaysRoutes.Authenticate);
    }
}
