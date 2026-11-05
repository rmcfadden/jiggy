// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type GameInstanceBase. */
public class GameInstanceBase : Base
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public long GameId { get; set; }
    public long GameConfigId { get; set; }
    public bool IsDeleted { get; set; }
    public bool IsEnabled { get; set; } = true;
}
