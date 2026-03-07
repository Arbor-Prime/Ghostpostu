// PATCH: Replace the tracked profiles query in src/routes/tracked-profiles.js
// The GET /api/tracked-profiles/:userId handler should use this query instead.
// This adds last_scanned_at from observation_sessions.

const TRACKED_PROFILES_QUERY = `
  SELECT
    tp.id,
    tp.user_id,
    tp.x_handle,
    tp.priority,
    tp.notes,
    tp.added_at,
    COUNT(DISTINCT ot.id) AS tweet_count,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status IN ('new', 'pending')) AS pending_opportunities,
    MAX(os.started_at) AS last_scanned_at
  FROM tracked_profiles tp
  LEFT JOIN observed_tweets ot ON LOWER(ot.author_handle) = LOWER(tp.x_handle)
  LEFT JOIN opportunities o ON o.tweet_id = ot.tweet_id AND o.user_id = tp.user_id
  LEFT JOIN observation_sessions os ON os.user_id = tp.user_id
  WHERE tp.user_id = $1
  GROUP BY tp.id
  ORDER BY tp.priority ASC, tp.added_at DESC
`;

// Usage: const result = await db.query(TRACKED_PROFILES_QUERY, [userId]);
// result.rows[].last_scanned_at will be a timestamp or null

module.exports = { TRACKED_PROFILES_QUERY };
