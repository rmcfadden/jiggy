// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type GamePlayAction. */
public class GamePlayAction : Base
{
    public long GamePlayId { get; set; }
    public long UserId { get; set; }
    public string Action { get; set; } = "";
}
