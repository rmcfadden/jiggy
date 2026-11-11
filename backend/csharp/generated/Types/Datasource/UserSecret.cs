// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type UserSecret. */
public class UserSecret : Base
{
    public long UserId { get; set; }
    public long SecretId { get; set; }
}
