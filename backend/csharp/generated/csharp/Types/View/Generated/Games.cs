// schema-version: 1.0
using System.Collections.Generic;

namespace Backend.Types.View;

/** View Games. */
public class Games : Backend.Types.Datasource.GamesBase
{
    public Dictionary<string, string> Settings { get; set; } = [];
    public List<Categories> Categories { get; set; } = [];
}
