using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Backend.Services;

/// <summary>Minimal HS256 JWT sign/verify; enough for our own tokens, no external dependency.</summary>
public static class Jwt
{
    static readonly string Header = Base64Url.EncodeToString(Encoding.UTF8.GetBytes("{\"alg\":\"HS256\",\"typ\":\"JWT\"}"));

    static byte[] Mac(string secret, string body) => HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(body));

    public static string Sign(JsonObject claims, string secret)
    {
        var body = $"{Header}.{Base64Url.EncodeToString(Encoding.UTF8.GetBytes(claims.ToJsonString()))}";
        return $"{body}.{Base64Url.EncodeToString(Mac(secret, body))}";
    }

    /// <summary>The claims when the signature matches and the token has not expired; otherwise null.</summary>
    public static JsonObject? Verify(string token, string secret, long nowSeconds)
    {
        var parts = token.Split('.');
        if (parts.Length != 3 || parts[0] != Header) return null; // also rejects alg=none and other algorithms
        try
        {
            if (!CryptographicOperations.FixedTimeEquals(Base64Url.DecodeFromChars(parts[2]), Mac(secret, $"{parts[0]}.{parts[1]}"))) return null;
            var claims = JsonNode.Parse(Base64Url.DecodeFromChars(parts[1])) as JsonObject;
            return claims?["exp"]?.GetValue<long>() > nowSeconds ? claims : null;
        }
        catch (Exception e) when (e is FormatException or JsonException or InvalidOperationException)
        {
            return null;
        }
    }
}
