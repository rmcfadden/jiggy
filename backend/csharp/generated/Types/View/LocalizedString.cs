// schema-version: 1.0
namespace Backend.Types.View;

/** View LocalizedString. */
public class LocalizedString
{
    public long Id { get; set; }
    public System.Guid Uuid { get; set; } = Guid.NewGuid();
    public System.DateTime Created { get; set; } = DateTime.UtcNow;
    public System.DateTime Updated { get; set; } = DateTime.UtcNow;
    public byte[] Version { get; set; } = new byte[] { 0 };
    public string Value { get; set; } = "";
    public bool IsEnabled { get; set; } = true;
    public bool IsDeleted { get; set; }
    public string Name { get; set; } = "";
    public string LanguageName { get; set; } = "";
}
