using Backend.Services;

namespace Backend.Routes;

public static class GameSummariesRoutes
{
    public static void MapGameSummaries(this IEndpointRouteBuilder app) =>
        app.MapGet("/api/games_summaries", async (GameSummariesService service) => Results.Ok(await service.List()));
}
