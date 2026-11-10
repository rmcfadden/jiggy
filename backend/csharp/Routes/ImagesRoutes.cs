using Backend.Services;

namespace Backend.Routes;

public static class ImagesRoutes
{
    public static void MapImages(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/images").DisableAntiforgery();

        // With id, guid or name, looks one image up (the result carries the image url); with none, lists every image.
        group.MapGet("/", async (long? id, Guid? guid, string? name, ImagesService service) =>
        {
            if (id is null && guid is null && name is null) return Results.Ok(await service.List());
            return await service.Find(id, guid, name) is { } image ? Results.Ok(image) : Results.NotFound();
        });
        group.MapGet("/{id:long}", async (long id, ImagesService service) =>
            await service.Find(id) is { } image ? Results.Ok(image) : Results.NotFound());

        // Serves bytes for the local store; with S3 clients use the stored url directly.
        group.MapGet("/files/{key}", async (string key, ImagesService service) =>
        {
            if (ImagesService.ContentTypeOf(key) is not { } contentType) return Results.NotFound();
            Stream? data;
            try { data = await service.Open(key); }
            catch (ArgumentException) { return Results.NotFound(); }
            return data is null ? Results.NotFound() : Results.Stream(data, contentType);
        });

        group.MapPost("/", async (HttpRequest request, ImagesService service) =>
        {
            var form = await request.ReadFormAsync();
            if (form.Files["file"] is not { } file) return Results.BadRequest(new { error = "multipart field 'file' is required" });
            try
            {
                await using var data = file.OpenReadStream();
                var image = await service.Create(new(data, file.ContentType, file.FileName), Field(form, "name"), Field(form, "description"));
                return Results.Created($"/api/images/{image.Id}", image);
            }
            catch (UnsupportedImageTypeException e)
            {
                return Results.BadRequest(new { error = e.Message });
            }
        });

        // Every field is optional: send a file to swap the image, name/description to edit the metadata.
        group.MapPut("/{id:long}", async (long id, HttpRequest request, ImagesService service) =>
        {
            var form = await request.ReadFormAsync();
            try
            {
                if (form.Files["file"] is { } file)
                {
                    await using var data = file.OpenReadStream();
                    return await service.Replace(id, new(data, file.ContentType, file.FileName), Field(form, "name"), Field(form, "description")) is { } image
                        ? Results.Ok(image) : Results.NotFound();
                }
                return await service.Replace(id, null, Field(form, "name"), Field(form, "description")) is { } meta
                    ? Results.Ok(meta) : Results.NotFound();
            }
            catch (UnsupportedImageTypeException e)
            {
                return Results.BadRequest(new { error = e.Message });
            }
        });

        group.MapDelete("/{id:long}", async (long id, ImagesService service) =>
            await service.Delete(id) ? Results.NoContent() : Results.NotFound());
    }

    static string? Field(IFormCollection form, string key) => form.TryGetValue(key, out var v) && v.Count > 0 ? v[0] : null;
}
