// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type GamePlayState. */
public class GamePlayState : Base
{
    public long GamePlayId { get; set; }
    public string StateChange { get; set; } = "";
}
