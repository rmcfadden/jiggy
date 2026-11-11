using Backend.Types.View;
using Datasources;

namespace Backend.Services;

/// <summary>Authenticates user credentials and issues a signin token to be exchanged at /api/oauth/token.</summary>
public class SigninService(UserService users, TokenService tokens, ICRUDRepository<Contact> contacts, ICRUDRepository<Email> emails)
{
    /// <summary><paramref name="username"/> may be a username or an email address. Null for an unknown user, a wrong password or a disabled account (callers must not distinguish them).</summary>
    public async Task<IssuedToken?> Signin(string username, string password)
    {
        username = await ResolveUsername(username.Trim());
        if (!await users.VerifyPassword(username, password)) return null;
        var user = await users.Find(username);
        return user is { IsEnabled: true } ? await tokens.IssueSignin(user.Id) : null;
    }

    /// <summary>A username stays as it is; an email address is mapped to its owner (emails.contact_id -> contacts.user_id).</summary>
    async Task<string> ResolveUsername(string identifier)
    {
        if (!identifier.Contains('@') || await users.Find(identifier) is not null) return identifier;
        var address = identifier.ToLowerInvariant();
        long? contactId = null;
        await foreach (var row in emails.Read())
            if (row.Address.ToLowerInvariant() == address) contactId = row.ContactId;
        if (contactId is null) return identifier;
        await foreach (var row in contacts.Read())
            if (row.Id == contactId) return (await users.FindById(row.UserId))?.Username ?? identifier;
        return identifier;
    }
}
