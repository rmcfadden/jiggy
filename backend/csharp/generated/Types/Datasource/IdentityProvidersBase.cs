// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type IdentityProvidersBase. */
public class IdentityProvidersBase : Base
{
    public long IdentityProviderTypeId { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public bool IsEnabled { get; set; } = true;
    public bool IsBuiltin { get; set; }
    public bool IsDeleted { get; set; }
}
