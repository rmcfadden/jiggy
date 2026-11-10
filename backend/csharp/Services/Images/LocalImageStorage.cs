namespace Backend.Services.Images;

/// <summary>Writes images to a folder on disk; the API serves them back at <c>/api/images/files/{key}</c>. For local testing.</summary>
public class LocalImageStorage(string directory, string publicBaseUrl) : IImageStorage
{
    readonly string root = Path.GetFullPath(directory);

    public async Task<string> Save(string key, Stream data, string contentType)
    {
        Directory.CreateDirectory(root);
        await using var file = File.Create(PathFor(key));
        await data.CopyToAsync(file);
        return $"{publicBaseUrl.TrimEnd('/')}/api/images/files/{key}";
    }

    public Task<Stream?> Open(string key)
    {
        var path = PathFor(key);
        return Task.FromResult<Stream?>(File.Exists(path) ? File.OpenRead(path) : null);
    }

    public Task Delete(string key)
    {
        var path = PathFor(key);
        if (File.Exists(path)) File.Delete(path);
        return Task.CompletedTask;
    }

    /// <summary>Keys are plain file names; anything that could leave the folder is rejected.</summary>
    string PathFor(string key)
    {
        if (key.Length == 0 || key != Path.GetFileName(key) || key.StartsWith('.'))
            throw new ArgumentException("invalid image key", nameof(key));
        return Path.Combine(root, key);
    }
}
