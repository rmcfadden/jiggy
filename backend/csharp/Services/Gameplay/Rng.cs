namespace Backend.Services.Gameplay;

/// <summary>Mulberry32, the same generator as the frontend's <c>createRng</c> and the other backends.</summary>
public sealed class Rng(uint seed)
{
    uint a = seed;

    public double Next()
    {
        unchecked
        {
            a += 0x6d2b79f5;
            var t = a;
            t = (t ^ (t >> 15)) * (t | 1);
            t ^= t + (t ^ (t >> 7)) * (t | 61);
            return (t ^ (t >> 14)) / 4294967296.0;
        }
    }

    public static T[] Shuffle<T>(IEnumerable<T> items, Rng rng)
    {
        var a = items.ToArray();
        for (var i = a.Length - 1; i > 0; i--)
        {
            var j = (int)Math.Floor(rng.Next() * (i + 1));
            (a[i], a[j]) = (a[j], a[i]);
        }
        return a;
    }
}
