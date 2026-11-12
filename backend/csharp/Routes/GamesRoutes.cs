using Backend.Services;

namespace Backend.Routes;

public static class GamesRoutes
{
    public static void MapGames(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/games");
        group.MapGet("/", async (GamesService service) => Results.Ok(await service.List()));
        group.MapGet("/{id:long}", async (long id, GamesService service) =>
            await service.Get(id) is { } row ? Results.Ok(row) : Results.NotFound());
        group.MapPost("/", async (GameInput input, GamesService service) =>
        {
            try
            {
                var row = await service.Create(input);
                return Results.Created($"/api/games/{row.Id}", row);
            }
            catch (InvalidGameException e)
            {
                return Results.BadRequest(new { error = e.Message });
            }
            catch (DuplicateGameNameException e)
            {
                return Results.Conflict(new { error = e.Message });
            }
        });
        group.MapPut("/{id:long}", async (long id, GameInput input, GamesService service) =>
        {
            try
            {
                return await service.Update(id, input) is { } row ? Results.Ok(row) : Results.NotFound();
            }
            catch (InvalidGameException e)
            {
                return Results.BadRequest(new { error = e.Message });
            }
            catch (DuplicateGameNameException e)
            {
                return Results.Conflict(new { error = e.Message });
            }
        });
        group.MapDelete("/{id:long}", async (long id, GamesService service) =>
            await service.Delete(id) ? Results.NoContent() : Results.NotFound());
    }
}
