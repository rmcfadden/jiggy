using Backend.Services;

namespace Backend.Routes;

public static class TemplatesRoutes
{
    public static void MapTemplates(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/templates");
        group.MapGet("/", async (string? type, TemplatesService service) => Results.Ok(await service.List(type)));
        group.MapGet("/{id:long}", async (long id, TemplatesService service) =>
            await service.Get(id) is { } row ? Results.Ok(row) : Results.NotFound());
        group.MapPost("/", async (TemplateInput input, TemplatesService service) =>
        {
            try
            {
                var row = await service.Create(input);
                return Results.Created($"/api/templates/{row.Id}", row);
            }
            catch (UnknownTemplateTypeException e)
            {
                return Results.BadRequest(new { error = e.Message });
            }
        });
        group.MapPut("/{id:long}", async (long id, TemplateInput input, TemplatesService service) =>
        {
            try
            {
                return await service.Update(id, input) is { } row ? Results.Ok(row) : Results.NotFound();
            }
            catch (UnknownTemplateTypeException e)
            {
                return Results.BadRequest(new { error = e.Message });
            }
        });
        group.MapDelete("/{id:long}", async (long id, TemplatesService service) =>
            await service.Delete(id) ? Results.NoContent() : Results.NotFound());
    }
}
