const db = require('../config/database');

function registerStatsRoutes(app) {

  // GET /api/stats/dashboard/:userId — all dashboard data in one call
  app.get('/api/stats/dashboard/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);

      // Total tweets scanned (all time)
      const tweetsResult = await db.query('SELECT COUNT(*) as total FROM observed_tweets');

      // Opportunities stats
      const oppsResult = await db.query(
        'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = \'new\' OR status = \'pending\') as pending FROM opportunities WHERE user_id = $1',
        [userId]
      );

      // Drafts pending
      const draftsResult = await db.query(
        'SELECT COUNT(*) as pending FROM drafts WHERE user_id = $1 AND status = \'pending\'',
        [userId]
      );

      // Replies posted
      const postedResult = await db.query(
        'SELECT COUNT(*) as total FROM posted_replies WHERE user_id = $1',
        [userId]
      );

      // Weekly chart data (last 7 days)
      const weeklyResult = await db.query(`
        SELECT
          date_trunc('day', observed_at)::date as day,
          COUNT(*) as scanned
        FROM observed_tweets
        WHERE observed_at >= NOW() - INTERVAL '7 days'
        GROUP BY date_trunc('day', observed_at)::date
        ORDER BY day
      `);

      const weeklyReplies = await db.query(`
        SELECT
          date_trunc('day', posted_at)::date as day,
          COUNT(*) as replies
        FROM posted_replies
        WHERE user_id = $1 AND posted_at >= NOW() - INTERVAL '7 days'
        GROUP BY date_trunc('day', posted_at)::date
        ORDER BY day
      `, [userId]);

      // Build chart data with day names
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = dayNames[d.getDay()];
        const scanned = weeklyResult.rows.find(r => r.day === dateStr)?.scanned || 0;
        const replies = weeklyReplies.rows.find(r => r.day === dateStr)?.replies || 0;
        chartData.push({ day: dayName, scanned: parseInt(scanned), replies: parseInt(replies) });
      }

      res.json({
        stats: {
          tweets_scanned: parseInt(tweetsResult.rows[0].total),
          opportunities_found: parseInt(oppsResult.rows[0].total),
          drafts_pending: parseInt(draftsResult.rows[0].pending),
          replies_posted: parseInt(postedResult.rows[0].total),
        },
        chart: chartData,
      });
    } catch (err) {
      console.error('[Stats] Dashboard error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/stats/topic-breakdown/:userId — topic distribution for AI Composition
  app.get('/api/stats/topic-breakdown/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);

      // Get voice profile topics
      const vpResult = await db.query(
        'SELECT profile_json FROM voice_profiles WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
        [userId]
      );

      if (vpResult.rows.length === 0) {
        return res.json({ topics: [] });
      }

      const profile = vpResult.rows[0].profile_json;
      const primaryTopics = profile.primary_topics || [];

      // Count opportunities per topic (from suggested_tone which contains topic match)
      const topicCounts = [];
      let totalMatched = 0;

      for (const topic of primaryTopics) {
        const countResult = await db.query(
          `SELECT COUNT(*) as cnt FROM opportunities
           WHERE user_id = $1 AND (suggested_angle ILIKE $2 OR suggested_tone ILIKE $2)`,
          [userId, `%${topic}%`]
        );
        const count = parseInt(countResult.rows[0].cnt);
        topicCounts.push({ topic, count });
        totalMatched += count;
      }

      // Calculate percentages
      const topics = topicCounts
        .sort((a, b) => b.count - a.count)
        .map(t => ({
          topic: t.topic,
          percentage: totalMatched > 0 ? Math.round((t.count / totalMatched) * 100) : 0,
        }));

      // Add "Other" if percentages don't sum to 100
      const sum = topics.reduce((acc, t) => acc + t.percentage, 0);
      if (sum < 100 && sum > 0) {
        topics.push({ topic: 'Other', percentage: 100 - sum });
      }

      res.json({ topics });
    } catch (err) {
      console.error('[Stats] Topic breakdown error:', err);
      res.status(500).json({ error: err.message });
    }
  });
}

module.exports = { registerStatsRoutes };
