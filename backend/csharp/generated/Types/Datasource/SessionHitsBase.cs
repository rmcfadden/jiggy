// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type SessionHitsBase. */
public class SessionHitsBase : Base
{
    public long SessionId { get; set; }
    public byte[] IpAddress { get; set; } = [];
}
