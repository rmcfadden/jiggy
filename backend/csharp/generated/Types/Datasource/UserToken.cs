// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type UserToken. */
public class UserToken : Base
{
    public long UserId { get; set; }
    public long TokenId { get; set; }
}
