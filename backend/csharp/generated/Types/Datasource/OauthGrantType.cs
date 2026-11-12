// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type OauthGrantType. */
public class OauthGrantType : Base
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public bool IsCustom { get; set; }
    public bool IsEnabled { get; set; } = true;
    public bool IsLegacy { get; set; }
}
