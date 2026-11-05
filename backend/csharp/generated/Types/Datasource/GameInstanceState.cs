// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type GameInstanceState. */
public class GameInstanceState : Base
{
    public long GameInstanceId { get; set; }
    public long UserId { get; set; }
    public string State { get; set; } = "";
}
