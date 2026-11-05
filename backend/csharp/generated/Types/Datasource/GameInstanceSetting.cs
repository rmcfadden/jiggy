// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type GameInstanceSetting. */
public class GameInstanceSetting : Base
{
    public long GameInstanceId { get; set; }
    public string Name { get; set; } = "";
    public string Value { get; set; } = "";
}
