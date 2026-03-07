// PATCH: Replace the drafts query in src/routes/drafts.js
// The GET /api/drafts/:userId handler should use this query instead of the current one.
// This adds engagement_likes, engagement_replies, engagement_retweets from observed_tweets.

// FIND this line in drafts.js:
//   app.get('/api/drafts/:userId', async (req, res) => {

// REPLACE the query inside with:

const DRAFTS_QUERY = `
  SELECT
    d.id,
    d.opportunity_id,
    d.user_id,
    d.content,
    d.llm_source,
    d.status,
    d.edited_content,
    d.created_at,
    d.expires_at,
    d.reply_text,
    d.response_type,
    d.target_word_count,
    d.actual_word_count,
    d.circadian_mood,
    d.energy_level,
    d.raw_ollama_response,
    o.tweet_id,
    ot.content AS tweet_content,
    ot.author_handle,
    ot.engagement_likes,
    ot.engagement_replies,
    ot.engagement_retweets,
    ot.engagement_views,
    CASE
      WHEN ot.tweet_id IS NOT NULL THEN 'https://x.com/' || ot.author_handle || '/status/' || ot.tweet_id
      ELSE NULL
    END AS tweet_url
  FROM drafts d
  LEFT JOIN opportunities o ON d.opportunity_id = o.id
  LEFT JOIN observed_tweets ot ON o.tweet_id = ot.tweet_id
  WHERE d.user_id = $1
  ORDER BY d.created_at DESC
`;

// Usage: const result = await db.query(DRAFTS_QUERY, [userId]);

module.exports = { DRAFTS_QUERY };
