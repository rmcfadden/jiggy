using System.Text.Json;
using Backend.Types.View;
using Datasources;

namespace Backend.Services;

/// <summary>A refused request; <see cref="Status"/> is the HTTP status the route answers with (400, 409 or 429).</summary>
public class ConfirmException(string message, int status) : Exception(message)
{
    public int Status { get; } = status;
}

/// <summary>
/// Confirming an email address: a short-lived single-use code is mailed as a link; opening it marks the email verified.
/// The code is a token of type <c>email_confirmation</c> (only its hash is stored), linked to the email by <c>email_tokens</c>.
/// </summary>
public class EmailConfirmationService(
    TokenService tokens,
    UserService users,
    TemplatesService templates,
    ICRUDRepository<Email> emails,
    ICRUDRepository<Contact> contacts,
    EmailService mail,
    LogsService logs,
    IConfiguration config)
{
    /// <summary>Language of the <c>confirm_email</c> template used for every message until accounts carry a language.</summary>
    const string Language = "en";

    const string TemplateType = "confirm_email";

    /// <summary>A second email is refused while the last one is younger than this.</summary>
    static readonly TimeSpan ResendAfter = TimeSpan.FromMinutes(1);

    readonly string siteBaseUrl = (config["SITE_BASE_URL"] ?? "http://localhost:5174").TrimEnd('/');

    /// <summary>Mails the confirmation link for <paramref name="emailId"/> (which belongs to <paramref name="userId"/>). Failures are logged, never thrown: an account must not be lost because the mail server is down; the user can ask for another message.</summary>
    public async Task Send(long userId, long emailId, string username, string address)
    {
        try
        {
            var template = await templates.ContentFor(TemplateType, Language) ?? throw new InvalidOperationException($"template \"{TemplateType}\" ({Language}) is missing; run setup");
            var issued = await tokens.IssueEmailConfirmation(userId, emailId);
            var url = $"{siteBaseUrl}/confirm-email?code={issued.Value}";
            string Field(string key) => template.TryGetProperty(key, out var v) ? v.GetString() ?? "" : "";
            string Fill(string text, bool escape) => text.Replace("{{username}}", escape ? System.Net.WebUtility.HtmlEncode(username) : username).Replace("{{confirm_url}}", url);
            await mail.Send(address, Fill(Field("subject"), false), Fill(Field("text"), false), Fill(Field("html"), true));
            await logs.Information("confirmation email sent", new Dictionary<string, string> { ["user_id"] = userId.ToString(), ["email_id"] = emailId.ToString() });
        }
        catch (Exception error)
        {
            await logs.Error("confirmation email not sent", new Dictionary<string, string> { ["user_id"] = userId.ToString(), ["email_id"] = emailId.ToString(), ["error"] = error.Message });
        }
    }

    /// <summary>The user's email address and whether it is confirmed, or null when the account has no email.</summary>
    public async Task<(string Email, bool Verified)?> Status(long userId)
    {
        var mine = await ContactIds(userId);
        Email? found = null;
        await foreach (var row in emails.Read())
            if (mine.Contains(row.ContactId) && (found is null || (row.IsPrimary && !found.IsPrimary))) found = row;
        return found is null ? null : (found.Address, found.IsVerified);
    }

    /// <summary>Sends a new link to the user's unverified email, unless one went out in the last minute.</summary>
    public async Task Resend(long userId)
    {
        var user = await users.FindById(userId);
        var mine = await ContactIds(userId);
        Email? email = null;
        await foreach (var row in emails.Read())
            if (mine.Contains(row.ContactId) && !row.IsVerified) email = row;
        if (user is null || email is null) throw new ConfirmException("there is no unconfirmed email on this account", 409);
        var last = await tokens.LastEmailConfirmation(email.Id);
        if (last is not null && DateTime.UtcNow - last < ResendAfter) throw new ConfirmException("a confirmation email was sent a moment ago; please wait a minute", 429);
        await Send(userId, email.Id, user.Username, email.Address);
    }

    /// <summary>Verifies the email the code was sent for and uses the code up.</summary>
    public async Task Confirm(string code)
    {
        async Task<Exception> Refuse(string reason)
        {
            await logs.Information("email confirmation refused", new Dictionary<string, string> { ["reason"] = reason });
            return new ConfirmException("this confirmation link is invalid, expired or already used", 400);
        }
        var token = await tokens.Validate(code.Trim(), TokenService.EmailConfirmationTokenType) ?? throw await Refuse("unknown, expired or used code");
        var emailId = await tokens.EmailIdOf(token) ?? throw await Refuse("code is not linked to an email");
        Email? email = null;
        await foreach (var row in emails.Read())
            if (row.Id == emailId) email = row;
        if (email is null) throw await Refuse("email no longer exists");
        if (!email.IsVerified)
        {
            email.IsVerified = true;
            await emails.Update(email);
        }
        await tokens.Revoke(token);
        await logs.Information("email confirmed", new Dictionary<string, string> { ["email_id"] = emailId.ToString() });
    }

    async Task<HashSet<long>> ContactIds(long userId)
    {
        var ids = new HashSet<long>();
        await foreach (var row in contacts.Read())
            if (row.UserId == userId) ids.Add(row.Id);
        return ids;
    }
}
