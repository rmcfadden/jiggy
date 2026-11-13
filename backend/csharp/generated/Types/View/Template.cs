// schema-version: 1.0
namespace Backend.Types.View;

/** View Template. */
public class Template
{
    public long Id { get; set; }
    public System.Guid Uuid { get; set; } = Guid.NewGuid();
    public System.DateTime Created { get; set; } = DateTime.UtcNow;
    public System.DateTime Updated { get; set; } = DateTime.UtcNow;
    public byte[] Version { get; set; } = new byte[] { 0 };
    public string Name { get; set; } = "";
    public string Content { get; set; } = "";
    public string TemplateTypeName { get; set; } = "";
    public string LanguageCode { get; set; } = "";
}
