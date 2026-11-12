// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type AuthenticationMethodsBase. */
public class AuthenticationMethodsBase : Base
{
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public bool IsDefault { get; set; } = true;
    public bool IsEnabled { get; set; } = true;
}
