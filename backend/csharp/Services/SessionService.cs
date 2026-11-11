using System.Net;
using System.Net.Sockets;
using Backend.Types.Datasource;
using Backend.Types.View;
using Datasources;

namespace Backend.Services;

public record CreateSessionInput(long UserId, string Type = SessionService.SigninSessionType, IPAddress? Ip = null, long? RelativeExpiration = null, DateTime? AbsoluteExpiration = null);

/// <summary>Creates sessions, records each hit with the caller's IP, and revokes sessions along with their tokens.</summary>
public class SessionService(
    ICRUDRepository<Session> sessions,
    ICRUDRepository<SessionHit> sessionHits,
    IReadonlyRepository<SessionType> sessionTypes,
    TokenService tokens)
{
    public const string SigninSessionType = "Signin";

    public async Task<Session> Create(CreateSessionInput input)
    {
        long? typeId = null;
        await foreach (var row in sessionTypes.Read())
            if (row.Name == input.Type) typeId = row.Id;
        if (typeId is null) throw new InvalidOperationException($"session type \"{input.Type}\" is missing; run the migrations");

        var created = await sessions.Create(new Session
        {
            SessionTypeId = typeId.Value,
            UserId = input.UserId,
            RelativeExpiration = input.RelativeExpiration,
            AbsoluteExpiration = input.AbsoluteExpiration,
        });
        try
        {
            await RecordHit(created.Id, input.Ip);
        }
        catch
        {
            await sessions.Delete(created);
            throw;
        }
        return created;
    }

    /// <summary>Records a hit and returns the session when it is still active; null when unknown, revoked or lapsed.</summary>
    public async Task<Session?> Hit(string uuid, IPAddress? ip = null)
    {
        var found = await Get(uuid);
        if (found is null || !await IsActive(found)) return null;
        await RecordHit(found.Id, ip);
        return found;
    }

    public async Task<Session?> Get(string uuid)
    {
        await foreach (var row in sessions.Read())
            if (row.Uuid.ToString() == uuid) return row;
        return null;
    }

    /// <summary>Active = enabled, not revoked, not past its absolute expiry and not idle longer than its relative expiry.</summary>
    public async Task<bool> IsActive(Session session)
    {
        var now = DateTime.UtcNow;
        if (!session.IsEnabled || session.Revoked is not null || session.Expired is not null) return false;
        if (session.AbsoluteExpiration is { } absolute && absolute <= now) return false;
        if (session.RelativeExpiration is > 0 and var seconds)
        {
            var last = session.Created;
            await foreach (var hit in sessionHits.Read())
                if (hit.SessionId == session.Id && hit.Created > last) last = hit.Created;
            if (last.AddSeconds(seconds) <= now) return false;
        }
        return true;
    }

    /// <summary>Revokes the session and every access/refresh token issued for it. Returns false when it does not exist.</summary>
    public async Task<bool> Revoke(string uuid)
    {
        var found = await Get(uuid);
        if (found is null) return false;
        if (found.Revoked is null)
        {
            found.Revoked = DateTime.UtcNow;
            found.IsEnabled = false;
            await sessions.Update(found);
        }
        await tokens.RevokeForSession(uuid);
        return true;
    }

    Task<SessionHit> RecordHit(long sessionId, IPAddress? ip) => sessionHits.Create(new SessionHit { SessionId = sessionId, IpAddress = IpBytes(ip) });

    /// <summary>16-byte (IPv6) form of an address; IPv4 is mapped to ::ffff:a.b.c.d. Unknown is all zeros.</summary>
    public static byte[] IpBytes(IPAddress? ip) => ip is null ? new byte[16] : (ip.AddressFamily == AddressFamily.InterNetwork ? ip.MapToIPv6() : ip).GetAddressBytes();
}
