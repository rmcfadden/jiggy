namespace Backend.Services.Gameplay;

/// <summary>Board geometry: scattering loose pieces, snapping and joining them. Ported from the frontend's puzzle.ts.</summary>
public static class Puzzle
{
    /// <summary>Size of one piece cell, in puzzle units (the frontend's <c>PIECE_SIZE</c>).</summary>
    public const double PieceSize = 100;
    const double Tolerance = PieceSize * 0.25;

    public record Scatter(int Cols, int Rows, uint Seed, string Side, int Count, double ViewPercent, double Spread);

    static (double X, double Y) ViewMargins(int cols, int rows, double viewPercent)
    {
        var f = Math.Clamp(viewPercent / 100, 0.2, 0.8);
        var w = cols * PieceSize;
        var h = rows * PieceSize;
        return (Math.Max(PieceSize * 1.25, (w / f - w) / 2), Math.Max(PieceSize * 1.25, (h / f - h) / 2));
    }

    /// <summary>Deterministic starting offsets for each piece (row-major), measured from its solved position.</summary>
    public static Offset[] ScatterOffsets(Scatter s)
    {
        var total = s.Cols * s.Rows;
        var count = Math.Clamp(s.Count, 1, total);
        var rng = new Rng(s.Seed ^ 0x5bd1e995);
        var (mx, my) = ViewMargins(s.Cols, s.Rows, s.ViewPercent);
        var w = s.Cols * PieceSize;
        var h = s.Rows * PieceSize;
        var half = PieceSize / 2;
        double Between(double lo, double hi) => lo + rng.Next() * (hi - lo);

        double[]? Band(string side) => side switch
        {
            "top" => [-mx + half, w + mx - half, -my + half, -half],
            "bottom" => [-mx + half, w + mx - half, h + half, h + my - half],
            "left" => [-mx + half, -half, -my + half, h + my - half],
            "right" => [w + half, w + mx - half, -my + half, h + my - half],
            _ => null,
        };
        Offset Target()
        {
            if (Band(s.Side) is { } b) return new Offset(Between(b[0], b[1]), Between(b[2], b[3]));
            while (true)
            {
                var x = Between(-mx + half, w + mx - half);
                var y = Between(-my + half, h + my - half);
                if (x < -half || x > w + half || y < -half || y > h + half) return new Offset(x, y);
            }
        }

        // Mitchell's best-candidate: of several random targets, take the one farthest from the pieces already placed.
        var candidates = 1 + (int)Math.Floor(Math.Clamp(s.Spread, 0, 100) + 0.5);
        var taken = new List<Offset>();
        Offset SpreadTarget()
        {
            var best = Target();
            var bestGap = -1.0;
            for (var c = 0; c < candidates; c++)
            {
                var t = c == 0 ? best : Target();
                var gap = taken.Count == 0 ? double.PositiveInfinity : taken.Min(o => Math.Sqrt((o.X - t.X) * (o.X - t.X) + (o.Y - t.Y) * (o.Y - t.Y)));
                if (gap > bestGap) (best, bestGap) = (t, gap);
            }
            taken.Add(best);
            return best;
        }

        // Pick which pieces are loose with a partial Fisher-Yates shuffle, before any target is drawn.
        var ids = Enumerable.Range(0, total).ToArray();
        for (var i = 0; i < count; i++)
        {
            var j = i + (int)Math.Floor(rng.Next() * (total - i));
            (ids[i], ids[j]) = (ids[j], ids[i]);
        }
        var loose = ids.Take(count).ToHashSet();

        var result = new Offset[total];
        for (var i = 0; i < total; i++)
        {
            if (!loose.Contains(i)) continue;
            var t = SpreadTarget();
            var cx = (i % s.Cols + 0.5) * PieceSize;
            var cy = (i / s.Cols + 0.5) * PieceSize;
            result[i] = new Offset(t.X - cx, t.Y - cy);
        }
        return result;
    }

    /// <summary>Locks a piece onto its solved position (offset 0,0) when dropped close enough.</summary>
    public static Offset SnapPiece(Offset o) => Math.Sqrt(o.X * o.X + o.Y * o.Y) <= Tolerance ? Offset.Home : o;

    static IEnumerable<int> Neighbours(int cols, int length, int i)
    {
        var col = i % cols;
        if (col > 0) yield return i - 1;
        if (col < cols - 1 && i + 1 < length) yield return i + 1;
        if (i - cols >= 0) yield return i - cols;
        if (i + cols < length) yield return i + cols;
    }

    /// <summary>Pieces joined to <paramref name="index"/>: grid neighbours (row-major, <paramref name="cols"/> wide) that share its offset.</summary>
    public static List<int> ConnectedPieces(Offset[] offsets, int cols, int index)
    {
        const double epsilon = 0.5;
        var order = new List<int> { index };
        var seen = new HashSet<int> { index };
        var stack = new Stack<int>([index]);
        while (stack.Count > 0)
        {
            var i = stack.Pop();
            foreach (var j in Neighbours(cols, offsets.Length, i))
            {
                if (seen.Contains(j)) continue;
                if (Math.Abs(offsets[j].X - offsets[i].X) < epsilon && Math.Abs(offsets[j].Y - offsets[i].Y) < epsilon)
                {
                    seen.Add(j);
                    order.Add(j);
                    stack.Push(j);
                }
            }
        }
        return order;
    }

    /// <summary>Drops a group of joined pieces: it locks onto the template, or onto the nearest grid neighbour within tolerance.</summary>
    public static Offset[] SettleGroup(Offset[] offsets, int cols, List<int> group)
    {
        var own = offsets[group[0]];
        Offset? target = Math.Sqrt(own.X * own.X + own.Y * own.Y) <= Tolerance ? Offset.Home : null;
        if (target is null)
        {
            var members = group.ToHashSet();
            var best = Tolerance;
            foreach (var i in group)
                foreach (var j in Neighbours(cols, offsets.Length, i))
                {
                    if (members.Contains(j)) continue;
                    var gap = Math.Sqrt((offsets[j].X - own.X) * (offsets[j].X - own.X) + (offsets[j].Y - own.Y) * (offsets[j].Y - own.Y));
                    if (gap <= best) (best, target) = (gap, offsets[j]);
                }
        }
        if (target is not { } to) return offsets;
        return offsets.Select((o, i) => group.Contains(i) ? to : o).ToArray();
    }

    public static bool IsSolved(Offset[] offsets) => offsets.All(o => o == Offset.Home);
}
