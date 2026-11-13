// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type ApplicationSettingsBase. */
public class ApplicationSettingsBase : Base
{
    public long ApplicationId { get; set; }
    public string Name { get; set; } = "";
    public string Value { get; set; } = "";
}
