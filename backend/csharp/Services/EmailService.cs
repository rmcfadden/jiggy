using MailKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Backend.Services;

/// <summary>
/// Sends mail over SMTP. Settings: SMTP_HOST (unset = log the message instead of sending), SMTP_PORT, SMTP_USERNAME,
/// SMTP_PASSWORD, SMTP_FROM (default "no-reply@localhost"), SMTP_SECURE = starttls (default) | tls | none.
/// </summary>
public class EmailService
{
    readonly LogsService logs;
    readonly string? host;
    readonly int port;
    readonly SecureSocketOptions security;
    readonly string? username, password;
    readonly string from;

    public EmailService(IConfiguration config, LogsService logs)
    {
        this.logs = logs;
        var get = Settings.Lookup(config);
        from = get("SMTP_FROM") ?? "no-reply@localhost";
        host = get("SMTP_HOST");
        if (host is null) return;
        var secure = (get("SMTP_SECURE") ?? "starttls").ToLowerInvariant();
        security = secure switch
        {
            "starttls" => SecureSocketOptions.StartTls,
            "tls" => SecureSocketOptions.SslOnConnect,
            "none" => SecureSocketOptions.None,
            _ => throw new InvalidOperationException($"SMTP_SECURE must be starttls, tls or none, not \"{secure}\""),
        };
        port = int.TryParse(get("SMTP_PORT"), out var p) ? p : secure == "tls" ? 465 : 587;
        username = get("SMTP_USERNAME");
        password = get("SMTP_PASSWORD");
    }

    /// <summary>Sends a text + html message. Without SMTP settings the message is written to the log (Information) and counts as sent, so a developer can follow the link in it.</summary>
    public async Task Send(string to, string subject, string text, string html)
    {
        if (host is null)
        {
            await logs.Information("email not sent: SMTP_HOST is not set", new Dictionary<string, string> { ["to"] = to, ["subject"] = subject, ["text"] = text });
            return;
        }
        try
        {
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(from));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;
            message.Body = new BodyBuilder { TextBody = text, HtmlBody = html }.ToMessageBody();
            using var client = new SmtpClient();
            await client.ConnectAsync(host, port, security);
            if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password)) await client.AuthenticateAsync(username, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            await logs.Information("email sent", new Dictionary<string, string> { ["to"] = to, ["subject"] = subject });
        }
        catch (Exception error)
        {
            await logs.Error("email failed", new Dictionary<string, string> { ["to"] = to, ["subject"] = subject, ["error"] = error.Message });
            throw;
        }
    }
}
