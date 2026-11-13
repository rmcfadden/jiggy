// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type ServiceSettingsBase. */
public class ServiceSettingsBase : Base
{
    public long ServiceId { get; set; }
    public string Name { get; set; } = "";
    public string Value { get; set; } = "";
}
