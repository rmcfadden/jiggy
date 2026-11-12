// schema-version: 1.0
namespace Backend.Types.Datasource;

/** Type ReviewFeedback. */
public class ReviewFeedback : Base
{
    public long ReviewId { get; set; }
    public long UserId { get; set; }
    public bool IsPositive { get; set; }
}
