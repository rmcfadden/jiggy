// schema-version: 1.0
using System.Collections.Generic;

namespace Backend.Types.View;

/** View GameParent. */
public class GameParent : Backend.Types.Datasource.GameParentBase
{
    public Dictionary<string, string> Settings { get; set; } = [];
}
