using Backend.Services;

namespace Backend.Routes;

public static class CategoriesRoutes
{
    public static void MapCategories(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/categories", async (CategoriesService service) => Results.Ok(await service.Tree()));
    }
}
