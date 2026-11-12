// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type Review. */
public class Review : Base
{
    public long UserId { get; set; }
    public string Comment { get; set; } = "";
    public decimal Rating { get; set; }
    public bool IsModerated { get; set; }
}
