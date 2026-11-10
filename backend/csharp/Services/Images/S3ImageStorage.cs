using Amazon.S3;
using Amazon.S3.Model;

namespace Backend.Services.Images;

/// <summary>
/// Uploads images to an S3 bucket. The stored URL is permanent, so the bucket (or the CDN in <paramref name="publicBaseUrl"/>)
/// must be publicly readable. Credentials come from the default AWS chain (env vars, profile, role).
/// </summary>
public class S3ImageStorage(IAmazonS3 s3, string bucket, string region, string? publicBaseUrl) : IImageStorage
{
    public async Task<string> Save(string key, Stream data, string contentType)
    {
        await s3.PutObjectAsync(new PutObjectRequest { BucketName = bucket, Key = key, InputStream = data, ContentType = contentType });
        var baseUrl = string.IsNullOrWhiteSpace(publicBaseUrl) ? $"https://{bucket}.s3.{region}.amazonaws.com" : publicBaseUrl.TrimEnd('/');
        return $"{baseUrl}/{key}";
    }

    // Clients fetch from S3 / the CDN directly.
    public Task<Stream?> Open(string key) => Task.FromResult<Stream?>(null);

    public Task Delete(string key) => s3.DeleteObjectAsync(bucket, key);
}
