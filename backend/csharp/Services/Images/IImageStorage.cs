namespace Backend.Services.Images;

/// <summary>Where image bytes live. The resource row only keeps the public URL, so a store must be able to map a URL back to its key.</summary>
public interface IImageStorage
{
    /// <summary>Stores <paramref name="data"/> under <paramref name="key"/> and returns its absolute public URL.</summary>
    Task<string> Save(string key, Stream data, string contentType);

    /// <summary>Opens a stored image for serving; null when it does not exist or the store does not serve its own bytes (S3).</summary>
    Task<Stream?> Open(string key);

    Task Delete(string key);

    /// <summary>The storage key a URL returned by <see cref="Save"/> refers to.</summary>
    string KeyFromUrl(string url) => url.Split('?')[0].TrimEnd('/').Split('/')[^1];
}
