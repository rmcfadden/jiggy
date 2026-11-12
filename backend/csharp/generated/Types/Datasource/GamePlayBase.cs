// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type GamePlayBase. */
public class GamePlayBase : Base
{
    public long GameId { get; set; }
    public long UserId { get; set; }
    public System.DateTime? Finished { get; set; }
}
