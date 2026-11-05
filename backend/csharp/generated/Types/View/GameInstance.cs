// schema-version: 1.0
using System.Collections.Generic;

namespace Backend.Types.View;

/** View GameInstance. */
public class GameInstance : Backend.Types.Datasource.GameInstanceBase
{
    public Dictionary<string, string> Settings { get; set; } = [];
    public List<Category> Categories { get; set; } = [];
}
