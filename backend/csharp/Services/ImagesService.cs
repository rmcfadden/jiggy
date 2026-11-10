using Backend.Services.Images;
using Backend.Types.View;
using Datasources;
using MimeTypeRow = Backend.Types.Datasource.MimeType;

namespace Backend.Services;

/// <summary>What the API exchanges; <c>Url</c> is the resource's <c>location</c>.</summary>
public record ImageDto(long Id, string Uuid, string Name, string MimeType, string Description, string Url, DateTime Created, DateTime Updated);

public record ImageUpload(Stream Data, string ContentType, string? FileName);

public class UnsupportedImageTypeException(string type) : Exception($"unsupported image type: {type}");

public class ImagesService(ICRUDRepository<Resource> repo, ICRUDRepository<MimeTypeRow> mimes, IImageStorage storage)
{
    static readonly Dictionary<string, string> Extensions = new()
    {
        ["image/jpeg"] = ".jpg", ["image/png"] = ".png", ["image/gif"] = ".gif", ["image/webp"] = ".webp",
        ["image/svg+xml"] = ".svg", ["image/bmp"] = ".bmp", ["image/tiff"] = ".tif", ["image/x-icon"] = ".ico", ["image/avif"] = ".avif",
    };

    /// <summary>
    /// Stores the image and, for raster types, a resized copy as a second resource named <c>{name}_thumbnail</c>.
    /// </summary>
    public async Task<ImageDto> Create(ImageUpload upload, string? name, string? description)
    {
        upload = Normalized(upload);
        await CheckMime(upload.ContentType);
        var bytes = await ReadAll(upload.Data);
        var image = await CreateRow(name ?? upload.FileName ?? "", description ?? "", upload.ContentType, bytes);
        await SaveThumbnail(image.Name, description ?? "", bytes);
        return image;
    }

    /// <summary>Looks an image up by id, uuid or name (first one given wins); null when none matches.</summary>
    public async Task<ImageDto?> Find(long? id = null, Guid? guid = null, string? name = null)
    {
        var row = await FindRow(id, guid, name);
        return row is null ? null : ToDto(row);
    }

    /// <summary>Merges the fields present into the stored row, swapping the bytes when <paramref name="upload"/> is given; null when it does not exist. The thumbnail row follows.</summary>
    public async Task<ImageDto?> Replace(long id, ImageUpload? upload, string? name, string? description)
    {
        var row = await repo.ReadSingleById(id);
        if (row is null || row.IsDeleted) return null;
        var oldName = row.ResourceName;
        byte[]? bytes = null;
        if (upload is not null)
        {
            upload = Normalized(upload);
            await CheckMime(upload.ContentType);
            bytes = await ReadAll(upload.Data);
            var oldKey = storage.KeyFromUrl(row.Location);
            row.MimeTypeName = upload.ContentType;
            // A fresh key, so caches of the old URL cannot serve the new bytes.
            row.Location = await storage.Save(KeyFor(Guid.NewGuid(), upload.ContentType), new MemoryStream(bytes), upload.ContentType);
            await storage.Delete(oldKey);
        }
        row.ResourceName = name ?? row.ResourceName;
        row.Description = description ?? row.Description;
        await repo.Update(row);

        if (!row.ResourceName.EndsWith(Thumbnails.Suffix))
        {
            if (bytes is not null)
            {
                await DeleteRow(await FindRow(name: oldName + Thumbnails.Suffix));
                await SaveThumbnail(row.ResourceName, row.Description, bytes);
            }
            else if (await FindRow(name: oldName + Thumbnails.Suffix) is { } thumb)
            {
                thumb.ResourceName = row.ResourceName + Thumbnails.Suffix;
                thumb.Description = row.Description;
                await repo.Update(thumb);
            }
        }
        return ToDto(row);
    }

    /// <summary>Removes the image, its stored bytes and its thumbnail.</summary>
    public async Task<bool> Delete(long id)
    {
        var row = await repo.ReadSingleById(id);
        if (row is null || row.IsDeleted) return false;
        if (!row.ResourceName.EndsWith(Thumbnails.Suffix)) await DeleteRow(await FindRow(name: row.ResourceName + Thumbnails.Suffix));
        await DeleteRow(row);
        return true;
    }

    /// <summary>
    /// Uploads every image under <paramref name="directory"/>/&lt;category&gt;/&lt;slug&gt;.* (the frontend catalog) as resource <c>slug</c>
    /// with the category as description. Names that already exist are skipped; returns the names added.
    /// </summary>
    public async Task<List<string>> AddSamples(string directory)
    {
        var added = new List<string>();
        if (!Directory.Exists(directory)) return added;
        foreach (var file in Directory.EnumerateFiles(directory, "*", SearchOption.AllDirectories).Order())
        {
            var type = Extensions.FirstOrDefault(e => e.Value == Path.GetExtension(file).ToLowerInvariant().Replace(".jpeg", ".jpg")).Key;
            var name = Path.GetFileNameWithoutExtension(file);
            if (type is null || await FindRow(name: name) is not null) continue;
            await using var data = File.OpenRead(file);
            await Create(new(data, type, Path.GetFileName(file)), name, new DirectoryInfo(Path.GetDirectoryName(file)!).Name);
            added.Add(name);
        }
        return added;
    }

    public Task<Stream?> Open(string key) => storage.Open(key);

    /// <summary>Content type for a stored key, from its extension.</summary>
    public static string? ContentTypeOf(string key) =>
        Extensions.FirstOrDefault(e => key.EndsWith(e.Value, StringComparison.OrdinalIgnoreCase)).Key;

    /// <summary>Drops parameters such as <c>; charset</c> and lowercases, so the type matches the seeded mime_type names.</summary>
    static ImageUpload Normalized(ImageUpload upload) => upload with { ContentType = upload.ContentType.Split(';')[0].Trim().ToLowerInvariant() };

    static string KeyFor(Guid uuid, string contentType) => uuid.ToString("N") + Extensions[contentType];

    async Task<ImageDto> CreateRow(string name, string description, string contentType, byte[] bytes)
    {
        var row = new Resource { ResourceName = name, MimeTypeName = contentType, Description = description };
        row.Location = await storage.Save(KeyFor(row.Uuid, contentType), new MemoryStream(bytes), contentType);
        var created = await repo.Create(row);
        return ToDto(await repo.ReadSingleById(created.Id) ?? created);
    }

    /// <summary>Adds the <c>{name}_thumbnail</c> resource when the bytes are a raster image (and not already a thumbnail).</summary>
    async Task SaveThumbnail(string name, string description, byte[] bytes)
    {
        if (name.EndsWith(Thumbnails.Suffix) || Thumbnails.Make(bytes) is not { } thumb) return;
        await CreateRow(name + Thumbnails.Suffix, description, "image/jpeg", thumb);
    }

    async Task<Resource?> FindRow(long? id = null, Guid? guid = null, string? name = null)
    {
        await foreach (var row in repo.Read())
        {
            if (row.IsDeleted) continue;
            var match = id is not null ? row.Id == id : guid is not null ? row.Uuid == guid : row.ResourceName == name;
            if (match) return row;
        }
        return null;
    }

    async Task DeleteRow(Resource? row)
    {
        if (row is null) return;
        await storage.Delete(storage.KeyFromUrl(row.Location));
        await repo.Delete(row);
    }

    static async Task<byte[]> ReadAll(Stream data)
    {
        using var buffer = new MemoryStream();
        await data.CopyToAsync(buffer);
        return buffer.ToArray();
    }

    /// <summary>Only the image types we know an extension for, and that exist in mime_type, are accepted.</summary>
    async Task CheckMime(string contentType)
    {
        if (!Extensions.ContainsKey(contentType)) throw new UnsupportedImageTypeException(contentType);
        await foreach (var m in mimes.Read())
            if (m.Name == contentType) return;
        throw new UnsupportedImageTypeException(contentType);
    }

    static ImageDto ToDto(Resource row) =>
        new(row.Id, row.Uuid.ToString(), row.ResourceName, row.MimeTypeName, row.Description, row.Location, row.Created, row.Updated);
}
