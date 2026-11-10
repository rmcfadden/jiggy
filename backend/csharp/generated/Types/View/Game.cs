// schema-version: 1.0
using System.Collections.Generic;

namespace Backend.Types.View;

/** View Game. */
public class Game : Backend.Types.Datasource.GameBase
{
    public Dictionary<string, string> Settings { get; set; } = [];
    public Dictionary<string, string> Attributes { get; set; } = [];
    public List<Category> Categories { get; set; } = [];
}
