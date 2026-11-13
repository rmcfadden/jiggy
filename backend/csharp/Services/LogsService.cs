using Backend.Types.View;
using Datasources;

namespace Backend.Services;

/// <summary>Application log kept in the database (<c>logs</c> rows with a type and optional name/value attributes). The log type names are seeded: Error, Information, Verbose, Trace.</summary>
public class LogsService(ICRUDRepository<Log> logs, ILogger<LogsService> console)
{
    /// <summary>Writes one entry. A failure to log is printed and swallowed: logging must never break the request that caused it.</summary>
    public async Task Write(string level, string message, IDictionary<string, string>? attributes = null)
    {
        try
        {
            await logs.Create(new Log { LogTypeName = level, Message = message, Attributes = attributes is null ? [] : new Dictionary<string, string>(attributes) });
        }
        catch (Exception error)
        {
            console.LogError("log {Level}: {Message} (not stored: {Error})", level, message, error.Message);
        }
    }

    public Task Error(string message, IDictionary<string, string>? attributes = null) => Write("Error", message, attributes);

    public Task Information(string message, IDictionary<string, string>? attributes = null) => Write("Information", message, attributes);

    public Task Verbose(string message, IDictionary<string, string>? attributes = null) => Write("Verbose", message, attributes);

    public Task Trace(string message, IDictionary<string, string>? attributes = null) => Write("Trace", message, attributes);
}
