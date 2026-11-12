using System.Text.Json;
using Backend.Services.Gameplay;
using Datasources;
using Review = Backend.Types.Datasource.Review;
using GameReview = Backend.Types.Datasource.GameReview;

namespace Backend.Services;

/// <summary>
/// Reviews of games. A review is a <c>review</c> row (who, rating, comment) joined to its game by a <c>game_review</c>
/// row. Each user can review a game once; ratings are whole stars from 1 to 5.
/// </summary>
public class ReviewsService(ICRUDRepository<Review> reviews, ICRUDRepository<GameReview> gameReviews, GamesService games, UserService users)
{
    public const int MaxComment = 2000;

    /// <summary>The game's reviews, newest first, with their count and average rating (null when there are none).</summary>
    public async Task<object> List(long? gameId)
    {
        var id = await RequireGame(gameId);
        var found = await ForGame(id);
        var names = new Dictionary<long, string>();
        var list = new List<object>();
        foreach (var r in found.OrderByDescending(r => r.Id))
        {
            if (!names.ContainsKey(r.UserId)) names[r.UserId] = (await users.FindById(r.UserId))?.Username ?? "Unknown";
            list.Add(Dto(r, names[r.UserId]));
        }
        double? average = found.Count == 0 ? null : Math.Round((double)found.Average(r => r.Rating) * 10) / 10;
        return new { gameId = id, count = found.Count, average, reviews = list };
    }

    /// <summary>Review count and average rating (one decimal) for every game that has reviews, by game id.</summary>
    public async Task<Dictionary<long, (int Count, double Average)>> Stats()
    {
        var gameOf = new Dictionary<long, long>();
        await foreach (var link in gameReviews.Read()) gameOf[link.ReviewId] = link.GameId;
        var ratings = new Dictionary<long, List<decimal>>();
        await foreach (var row in reviews.Read())
        {
            if (!gameOf.TryGetValue(row.Id, out var gameId)) continue;
            if (!ratings.TryGetValue(gameId, out var list)) ratings[gameId] = list = [];
            list.Add(row.Rating);
        }
        return ratings.ToDictionary(r => r.Key, r => (r.Value.Count, Math.Round((double)r.Value.Average() * 10) / 10));
    }

    /// <summary>Adds <paramref name="userId"/>'s review of the game; 400 for a bad rating or comment, 404 for an unknown game, 409 for a second review.</summary>
    public async Task<object> Add(long gameId, long userId, JsonElement body)
    {
        if (!body.TryGetProperty("rating", out var r) || r.ValueKind != JsonValueKind.Number || !r.TryGetInt64(out var rating) || rating is < 1 or > 5)
            throw new GameException(400, "rating must be a whole number from 1 to 5");
        var comment = "";
        if (body.TryGetProperty("comment", out var c) && c.ValueKind != JsonValueKind.Null)
        {
            if (c.ValueKind != JsonValueKind.String || c.GetString()!.Length > MaxComment) throw new GameException(400, $"comment must be text of at most {MaxComment} characters");
            comment = c.GetString()!.Trim();
        }
        await RequireGame(gameId);
        if ((await ForGame(gameId)).Any(x => x.UserId == userId)) throw new GameException(409, "you have already reviewed this game");
        var created = await reviews.Create(new Review { UserId = userId, Comment = comment, Rating = rating });
        await gameReviews.Create(new GameReview { GameId = gameId, ReviewId = created.Id });
        return Dto(created, (await users.FindById(userId))?.Username ?? "Unknown");
    }

    static object Dto(Review r, string userName) => new { id = r.Id, userId = r.UserId, userName, rating = (double)r.Rating, comment = r.Comment, created = r.Created };

    async Task<long> RequireGame(long? gameId)
    {
        if (gameId is not { } id || await games.Get(id) is null) throw new GameException(404, $"unknown game: {(gameId is null ? "none" : gameId)}");
        return id;
    }

    async Task<List<Review>> ForGame(long gameId)
    {
        var ids = new HashSet<long>();
        await foreach (var link in gameReviews.Read()) if (link.GameId == gameId) ids.Add(link.ReviewId);
        var found = new List<Review>();
        await foreach (var row in reviews.Read()) if (ids.Contains(row.Id)) found.Add(row);
        return found;
    }
}
