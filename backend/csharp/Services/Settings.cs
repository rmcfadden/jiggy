namespace Backend.Services;

/// <summary>Reads a setting from configuration/environment, falling back to <c>.env</c> then <c>.env.development</c> (test-only dev defaults, skipped in production) in the working directory. The real environment wins, then <c>.env</c>.</summary>
public static class Settings
{
    public static Func<string, string?> Lookup(IConfiguration config)
    {
        var production = new[] { "APP_ENV", "NODE_ENV", "ASPNETCORE_ENVIRONMENT" }.Any(k => string.Equals(config[k], "production", StringComparison.OrdinalIgnoreCase));
        var file = (production ? new[] { ".env" } : new[] { ".env", ".env.development" }).Where(File.Exists).SelectMany(File.ReadAllLines).ToArray();
        return key =>
        {
            var value = config[key];
            if (!string.IsNullOrEmpty(value)) return value;
            return file.Select(l => l.Split('=', 2)).Where(p => p.Length == 2 && p[0].Trim() == key).Select(p => p[1].Trim()).FirstOrDefault(v => v.Length > 0);
        };
    }
}
