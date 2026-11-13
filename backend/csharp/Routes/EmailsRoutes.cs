using System.Text.Json;
using Backend.Services;

namespace Backend.Routes;

public static class EmailsRoutes
{
    /// <summary>POST /api/emails/confirm is public (the code is the credential); POST /resend and GET /status need a signed-in user.</summary>
    public static void MapEmails(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/emails");
        group.AddEndpointFilter(Errors);

        group.MapPost("/confirm", async (JsonElement? body, EmailConfirmationService service) =>
        {
            if (body is not { ValueKind: JsonValueKind.Object } o || !o.TryGetProperty("code", out var code) || code.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(code.GetString()))
                return Results.Json(new { error = "code is required" }, statusCode: StatusCodes.Status400BadRequest);
            await service.Confirm(code.GetString()!);
            return Results.Ok(new { confirmed = true });
        });
        group.MapGet("/status", async (HttpContext http, EmailConfirmationService service) =>
        {
            var status = await service.Status(GamePlaysRoutes.User(http));
            return Results.Ok(status is { } s ? new { email = (string?)s.Email, verified = s.Verified } : new { email = (string?)null, verified = false });
        }).AddEndpointFilter(GamePlaysRoutes.Authenticate);
        group.MapPost("/resend", async (HttpContext http, EmailConfirmationService service) =>
        {
            await service.Resend(GamePlaysRoutes.User(http));
            return Results.Json(new { sent = true }, statusCode: StatusCodes.Status202Accepted);
        }).AddEndpointFilter(GamePlaysRoutes.Authenticate);
    }

    static async ValueTask<object?> Errors(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        try
        {
            return await next(context);
        }
        catch (ConfirmException error)
        {
            return Results.Json(new { error = error.Message }, statusCode: error.Status);
        }
    }
}
