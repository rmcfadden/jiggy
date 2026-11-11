// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type TokensBase. */
public class TokensBase : Base
{
    public long TokenTypeId { get; set; }
    public string Name { get; set; } = "";
    public string Secret { get; set; } = "";
    public bool IsEnabled { get; set; } = true;
    public System.DateTime Expires { get; set; }
    public System.DateTime? Revoked { get; set; }
    public bool IsDeleted { get; set; }
}
