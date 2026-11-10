using SkiaSharp;

namespace Backend.Services.Images;

public static class Thumbnails
{
    public const string Suffix = "_thumbnail";
    public const int Width = 480;

    /// <summary>A JPEG no wider than <see cref="Width"/>, or null when the bytes are not a raster image Skia can decode (svg, tiff, avif...).</summary>
    public static byte[]? Make(byte[] image)
    {
        using var source = SKBitmap.Decode(image);
        if (source is null) return null;
        var width = Math.Min(Width, source.Width);
        var height = Math.Max(1, (int)Math.Round(source.Height * (width / (double)source.Width)));
        using var small = source.Resize(new SKImageInfo(width, height), new SKSamplingOptions(SKCubicResampler.Mitchell));
        if (small is null) return null;
        using var data = SKImage.FromBitmap(small).Encode(SKEncodedImageFormat.Jpeg, 80);
        return data?.ToArray();
    }
}
