using Backend.Services;

namespace Backend.Routes;

/// <summary>Puzzles by the slug of their name, public like the rest of the catalog.</summary>
public static class PuzzlesRoutes
{
    public static void MapPuzzles(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/puzzles/{name}", async (string name, GamesService service) =>
            await service.GetByName(name) is { } row ? Results.Ok(row) : Results.NotFound());
        app.MapGet("/api/category/{name}/puzzles", async (string name, GamesService service) =>
            await service.ListByCategoryName(name) is { } list ? Results.Ok(list) : Results.NotFound());
    }
}
