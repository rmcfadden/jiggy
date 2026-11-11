// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type SessionsBase. */
public class SessionsBase : Base
{
    public long SessionTypeId { get; set; }
    public long? UserId { get; set; }
    public long? RelativeExpiration { get; set; }
    public System.DateTime? AbsoluteExpiration { get; set; }
    public System.DateTime? Revoked { get; set; }
    public System.DateTime? Expired { get; set; }
    public bool IsEnabled { get; set; } = true;
}
