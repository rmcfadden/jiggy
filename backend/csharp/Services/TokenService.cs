using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;
using Backend.Types.Datasource;
using Backend.Types.View;
using Datasources;

namespace Backend.Services;

/// <summary>JWT_SECRET (required, 32+ characters) and the optional TTLs in seconds.</summary>
public record TokenSettings(string JwtSecret, long SigninTtl, long AccessTtl, long RefreshTtl)
{
    /// <summary>Reads configuration/environment, falling back to <c>.env</c> in the working directory (the real environment wins).</summary>
    public static TokenSettings From(IConfiguration config)
    {
        var file = File.Exists(".env") ? File.ReadAllLines(".env") : [];
        string? Get(string key)
        {
            var value = config[key];
            if (!string.IsNullOrEmpty(value)) return value;
            return file.Select(l => l.Split('=', 2)).Where(p => p.Length == 2 && p[0].Trim() == key).Select(p => p[1].Trim()).FirstOrDefault(v => v.Length > 0);
        }
        long Seconds(string key, long fallback) => long.TryParse(Get(key), out var v) ? v : fallback;
        var secret = Get("JWT_SECRET");
        if (secret is null || secret.Length < 32) throw new InvalidOperationException("JWT_SECRET must be set to at least 32 characters");
        return new TokenSettings(secret, Seconds("SIGNIN_TOKEN_TTL", 300), Seconds("JWT_ACCESS_TTL", 86_400), Seconds("JWT_REFRESH_TTL", 86_400));
    }
}

public record IssuedToken(string Value, long ExpiresIn);

/// <summary>Issues, validates and revokes signin, JWT access and JWT refresh tokens. Only a SHA-256 hash of each token is stored.</summary>
public class TokenService(
    ICRUDRepository<Token> tokens,
    ICRUDRepository<UserToken> userTokens,
    IReadonlyRepository<TokenType> tokenTypes,
    TokenSettings settings)
{
    public const string SigninTokenType = "signin_token";
    public const string AccessTokenType = "jwt_access_token";
    public const string RefreshTokenType = "jwt_refresh_token";

    static string Sha256(string value) => Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(value)));

    /// <summary>Short-lived, single-use opaque token handed back by signin and exchanged at /api/oauth/token.</summary>
    public Task<IssuedToken> IssueSignin(long userId) =>
        Store(userId, SigninTokenType, $"signin:{Guid.NewGuid()}", Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(32)), settings.SigninTtl);

    public Task<IssuedToken> IssueAccess(long userId, string userUuid, string sessionUuid) =>
        IssueJwt(userId, userUuid, sessionUuid, "access", AccessTokenType, settings.AccessTtl);

    public Task<IssuedToken> IssueRefresh(long userId, string userUuid, string sessionUuid) =>
        IssueJwt(userId, userUuid, sessionUuid, "refresh", RefreshTokenType, settings.RefreshTtl);

    /// <summary>The stored row when <paramref name="plain"/> is a live token of <paramref name="typeName"/> (enabled, not deleted, not revoked, not expired).</summary>
    public async Task<Token?> Validate(string plain, string typeName)
    {
        if (typeName != SigninTokenType)
        {
            var claims = Jwt.Verify(plain, settings.JwtSecret, DateTimeOffset.UtcNow.ToUnixTimeSeconds());
            if (claims?["typ"]?.GetValue<string>() != (typeName == AccessTokenType ? "access" : "refresh")) return null;
        }
        var hash = Sha256(plain);
        await foreach (var row in tokens.Read())
        {
            if (row.Secret != hash || row.TokenTypeName != typeName) continue;
            return row.IsEnabled && !row.IsDeleted && row.Revoked is null && row.Expires > DateTime.UtcNow ? row : null;
        }
        return null;
    }

    /// <summary>The user a stored token was issued to.</summary>
    public async Task<long?> UserIdOf(Token row)
    {
        await foreach (var link in userTokens.Read())
            if (link.TokenId == row.Id) return link.UserId;
        return null;
    }

    /// <summary>Marks a token revoked (and disabled) so it can never validate again.</summary>
    public async Task Revoke(Token row)
    {
        if (row.Revoked is not null) return;
        row.Revoked = DateTime.UtcNow;
        row.IsEnabled = false;
        await tokens.Update(row);
    }

    /// <summary>Revokes every live access/refresh token that was issued for the session.</summary>
    public async Task RevokeForSession(string sessionUuid)
    {
        var prefix = $"session:{sessionUuid}:";
        var rows = new List<Token>();
        await foreach (var row in tokens.Read())
            if (row.Name.StartsWith(prefix, StringComparison.Ordinal)) rows.Add(row);
        foreach (var row in rows) await Revoke(row);
    }

    Task<IssuedToken> IssueJwt(long userId, string userUuid, string sessionUuid, string typ, string typeName, long ttl)
    {
        var jti = Guid.NewGuid().ToString();
        var iat = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var claims = new JsonObject { ["sub"] = userUuid, ["sid"] = sessionUuid, ["jti"] = jti, ["typ"] = typ, ["iat"] = iat, ["exp"] = iat + ttl };
        return Store(userId, typeName, $"session:{sessionUuid}:{jti}", Jwt.Sign(claims, settings.JwtSecret), ttl);
    }

    async Task<IssuedToken> Store(long userId, string typeName, string name, string value, long ttl)
    {
        var created = await tokens.Create(new Token
        {
            TokenTypeId = await TypeId(typeName),
            Name = name,
            Secret = Sha256(value),
            Expires = DateTime.UtcNow.AddSeconds(ttl),
        });
        try
        {
            await userTokens.Create(new UserToken { UserId = userId, TokenId = created.Id });
        }
        catch
        {
            await tokens.Delete(created); // an unlinked token could never be traced back to its user
            throw;
        }
        return new IssuedToken(value, ttl);
    }

    async Task<long> TypeId(string name)
    {
        await foreach (var row in tokenTypes.Read())
            if (row.Name == name) return row.Id;
        throw new InvalidOperationException($"token type \"{name}\" is missing; run the migrations");
    }
}
