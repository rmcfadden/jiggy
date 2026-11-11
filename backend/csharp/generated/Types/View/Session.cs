// schema-version: 1.0
namespace Backend.Types.View;

/** View Session. */
public class Session : Backend.Types.Datasource.SessionsBase
{
    public string SessionTypeName { get; set; } = "";
}
