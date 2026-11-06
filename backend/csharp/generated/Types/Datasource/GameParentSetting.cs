// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type GameParentSetting. */
public class GameParentSetting : Base
{
    public long GameParentId { get; set; }
    public string Name { get; set; } = "";
    public string Value { get; set; } = "";
}
