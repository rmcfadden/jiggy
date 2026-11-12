using Backend.Services;

namespace Backend.Routes;

public static class GameSummariesRoutes
{
    public static void MapGameSummaries(this IEndpointRouteBuilder app) =>
        app.MapGet("/api/games_summaries", async (GameSummariesService service, ReviewsService reviews) => Results.Ok(await service.List(await reviews.Stats())));
}
