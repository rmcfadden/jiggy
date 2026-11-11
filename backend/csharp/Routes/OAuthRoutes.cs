using System.Text.Json;
using Backend.Services;

namespace Backend.Routes;

public static class OAuthRoutes
{
    public static void MapOAuth(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/oauth/token", async (HttpContext context, OAuthService service) =>
        {
            context.Response.Headers.CacheControl = "no-store";
            context.Response.Headers.Pragma = "no-cache";
            // RFC 6749 requests are form-encoded; JSON is accepted too.
            var parameters = new Dictionary<string, string>();
            if (context.Request.HasFormContentType)
                foreach (var (key, value) in await context.Request.ReadFormAsync()) parameters[key] = value.ToString();
            else
                try
                {
                    var json = await JsonSerializer.DeserializeAsync<Dictionary<string, JsonElement>>(context.Request.Body);
                    foreach (var (key, value) in json ?? [])
                        if (value.ValueKind == JsonValueKind.String) parameters[key] = value.GetString()!;
                }
                catch (JsonException)
                {
                    return Results.Json(new { error = "invalid_request", error_description = "body must be form-encoded or JSON" }, statusCode: StatusCodes.Status400BadRequest);
                }
            try
            {
                var r = await service.Token(parameters, context.Connection.RemoteIpAddress);
                return Results.Ok(new { access_token = r.AccessToken, issued_token_type = r.IssuedTokenType, token_type = r.TokenType, expires_in = r.ExpiresIn, refresh_token = r.RefreshToken });
            }
            catch (OAuthException e)
            {
                return Results.Json(new { error = e.Error, error_description = e.Message }, statusCode: StatusCodes.Status400BadRequest);
            }
        });
    }
}
