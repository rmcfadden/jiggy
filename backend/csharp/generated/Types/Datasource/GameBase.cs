// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type GameBase. */
public class GameBase : Base
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public long GameParentId { get; set; }
    public long GameParentConfigId { get; set; }
    public bool IsDeleted { get; set; }
    public bool IsEnabled { get; set; } = true;
}
