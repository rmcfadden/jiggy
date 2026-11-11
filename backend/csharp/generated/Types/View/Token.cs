// schema-version: 1.0
namespace Backend.Types.View;

/** View Token. */
public class Token : Backend.Types.Datasource.TokensBase
{
    public string TokenTypeName { get; set; } = "";
    public string Description { get; set; } = "";
}
