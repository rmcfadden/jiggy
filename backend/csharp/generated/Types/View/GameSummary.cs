// schema-version: 1.0
using System.Collections.Generic;

namespace Backend.Types.View;

/** View GameSummary. */
public class GameSummary
{
    public long Id { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string ParentName { get; set; } = "";
    public string ThumbnameLocation { get; set; } = "";
    public List<Category> Categories { get; set; } = [];
    public Dictionary<string, string> Attributes { get; set; } = [];
}
