using Backend.Services;

namespace Backend.Routes;

public static class GameParentsRoutes
{
    public static void MapGameParents(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/games_parents");
        group.MapGet("/", async (GameParentsService service) => Results.Ok(await service.List()));
        group.MapGet("/{id:long}", async (long id, GameParentsService service) =>
            await service.Get(id) is { } row ? Results.Ok(row) : Results.NotFound());
        group.MapPost("/", async (GameParentInput input, GameParentsService service) =>
        {
            var row = await service.Create(input);
            return Results.Created($"/api/games_parents/{row.Id}", row);
        });
        group.MapPut("/{id:long}", async (long id, GameParentInput input, GameParentsService service) =>
            await service.Update(id, input) is { } row ? Results.Ok(row) : Results.NotFound());
        group.MapDelete("/{id:long}", async (long id, GameParentsService service) =>
            await service.Delete(id) ? Results.NoContent() : Results.NotFound());
    }
}
