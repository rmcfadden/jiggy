// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type IdentityProviderSettingsBase. */
public class IdentityProviderSettingsBase : Base
{
    public long IdentityProviderId { get; set; }
    public string Name { get; set; } = "";
    public string Value { get; set; } = "";
}
