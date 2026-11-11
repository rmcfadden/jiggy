namespace Backend.Services;

/// <summary>Authenticates user credentials and issues a signin token to be exchanged at /api/oauth/token.</summary>
public class SigninService(UserService users, TokenService tokens)
{
    /// <summary>Null for an unknown user, a wrong password or a disabled account (callers must not distinguish them).</summary>
    public async Task<IssuedToken?> Signin(string username, string password)
    {
        username = username.Trim();
        if (!await users.VerifyPassword(username, password)) return null;
        var user = await users.Find(username);
        return user is { IsEnabled: true } ? await tokens.IssueSignin(user.Id) : null;
    }
}
