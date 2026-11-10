// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type PuzzleGame. */
public class PuzzleGame : Base
{
    public long GameId { get; set; }
    public long TemplateId { get; set; }
    public long? ImageId { get; set; }
}
