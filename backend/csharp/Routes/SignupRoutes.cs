using System.Text.Json;
using Backend.Services;

namespace Backend.Routes;

public static class SignupRoutes
{
    public static void MapSignup(this IEndpointRouteBuilder app)
    {
        // The body is read as raw JSON so a non-string username/email is a 400 rather than a model-binding failure.
        app.MapPost("/api/signup", async (JsonElement? body, SignupService service, HttpContext context) =>
        {
            context.Response.Headers.CacheControl = "no-store";
            var fields = body is { ValueKind: JsonValueKind.Object } obj ? obj : (JsonElement?)null;
            if (!TryString(fields, "password", out var password) || string.IsNullOrEmpty(password)
                || !TryString(fields, "username", out var username) || !TryString(fields, "email", out var email))
                return Results.BadRequest(new { error = "password is required; username and email must be strings" });
            try
            {
                var result = await service.Signup(new SignupInput(username, email, password));
                return Results.Json(
                    new { username = result.Username, signin_token = result.Signin.Value, expires_in = result.Signin.ExpiresIn },
                    statusCode: StatusCodes.Status201Created);
            }
            catch (SignupException error)
            {
                return Results.Json(new { error = error.Message }, statusCode: error.Status);
            }
        });
    }

    /// <summary>True when the property is absent, null or a string (value is null unless it is a string).</summary>
    static bool TryString(JsonElement? obj, string name, out string? value)
    {
        value = null;
        if (obj is null || !obj.Value.TryGetProperty(name, out var property)) return true;
        switch (property.ValueKind)
        {
            case JsonValueKind.Null:
                return true;
            case JsonValueKind.String:
                value = property.GetString();
                return true;
            default:
                return false;
        }
    }
}
