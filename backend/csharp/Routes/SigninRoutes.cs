using Backend.Services;

namespace Backend.Routes;

public record SigninRequest(string? Username, string? Password);

public static class SigninRoutes
{
    public static void MapSignin(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/signin", async (SigninRequest? body, SigninService service, HttpContext context) =>
        {
            context.Response.Headers.CacheControl = "no-store";
            if (string.IsNullOrEmpty(body?.Username) || string.IsNullOrEmpty(body.Password))
                return Results.BadRequest(new { error = "username and password are required" });
            var issued = await service.Signin(body.Username, body.Password);
            return issued is null
                ? Results.Json(new { error = "invalid username or password" }, statusCode: StatusCodes.Status401Unauthorized)
                : Results.Ok(new { signin_token = issued.Value, expires_in = issued.ExpiresIn });
        });
    }
}
