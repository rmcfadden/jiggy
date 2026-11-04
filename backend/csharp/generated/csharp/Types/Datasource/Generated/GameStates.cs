// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type GameStates. */
public class GameStates : Base
{
    public long GameId { get; set; }
    public long UserId { get; set; }
    public string State { get; set; } = "";
}
