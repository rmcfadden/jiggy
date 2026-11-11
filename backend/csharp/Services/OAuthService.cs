using System.Net;

namespace Backend.Services;

/// <summary>An RFC 6749 error response: <see cref="Error"/> is the OAuth error code.</summary>
public class OAuthException(string error, string description) : Exception(description)
{
    public string Error { get; } = error;
}

public record TokenResponse(string AccessToken, string IssuedTokenType, string TokenType, long ExpiresIn, string RefreshToken);

/// <summary>Token endpoint logic. Only RFC 8693 token exchange of a signin token is supported.</summary>
public class OAuthService(UserService users, TokenService tokens, SessionService sessions, TokenSettings settings)
{
    public const string TokenExchangeGrant = "urn:ietf:params:oauth:grant-type:token-exchange";
    public const string AccessTokenUrn = "urn:ietf:params:oauth:token-type:access_token";

    public async Task<TokenResponse> Token(IReadOnlyDictionary<string, string> parameters, IPAddress? ip)
    {
        string Text(string key) => parameters.GetValueOrDefault(key) ?? "";
        var grant = Text("grant_type");
        if (grant.Length == 0) throw new OAuthException("invalid_request", "grant_type is required");
        if (grant != TokenExchangeGrant) throw new OAuthException("unsupported_grant_type", $"grant_type must be {TokenExchangeGrant}");
        var subject = Text("subject_token");
        if (subject.Length == 0) throw new OAuthException("invalid_request", "subject_token is required");
        // subject_token_type is optional here; when present it must name the kind of token we accept.
        var subjectType = Text("subject_token_type");
        if (subjectType.Length > 0 && subjectType != AccessTokenUrn && subjectType != TokenService.SigninTokenType)
            throw new OAuthException("invalid_request", "unsupported subject_token_type");

        var invalid = new OAuthException("invalid_grant", "subject_token is invalid, expired or already used");
        var row = await tokens.Validate(subject, TokenService.SigninTokenType) ?? throw invalid;
        var userId = await tokens.UserIdOf(row) ?? throw invalid;
        var user = await users.FindById(userId);
        if (user is not { IsEnabled: true }) throw invalid;
        await tokens.Revoke(row); // single use: a replay of the same signin token must fail

        var session = await sessions.Create(new CreateSessionInput(user.Id, Ip: ip, RelativeExpiration: settings.RefreshTtl));
        var access = await tokens.IssueAccess(user.Id, user.Uuid.ToString(), session.Uuid.ToString());
        var refresh = await tokens.IssueRefresh(user.Id, user.Uuid.ToString(), session.Uuid.ToString());
        return new TokenResponse(access.Value, AccessTokenUrn, "Bearer", access.ExpiresIn, refresh.Value);
    }
}
