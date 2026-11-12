// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type AuthorizationCodesBase. */
public class AuthorizationCodesBase : Base
{
    public long? SessionId { get; set; }
    public string Code { get; set; } = "";
    public bool IsUsed { get; set; } = true;
    public bool IsDeleted { get; set; }
}
