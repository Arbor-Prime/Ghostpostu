/**
 * DM Engine routes (v2) — external API-key authenticated service.
 *
 * Auth: every request must include the header:
 *   x-api-key: <GHOSTPOST_API_KEY env var>
 *
 * This is intentionally separate from the GhostPost user JWT auth so
 * external callers (e.g. ReeveOS) can integrate without a user session.
 */

const { v4: uuidv4 } = require('uuid');          // npm install uuid
const db              = require('../config/database');
const { enqueueDmJob } = require('../services/dm/dm-queue');
const { encryptCookies } = require('../services/dm/instagram-sender');

// ─── API-key middleware ───────────────────────────────────────────────────────

const API_KEY = process.env.GHOSTPOST_API_KEY;

function requireApiKey(req, res, next) {
  if (!API_KEY) {
    console.error('[DM] GHOSTPOST_API_KEY env var is not set');
    return res.status(500).json({ error: 'Server misconfiguration: API key not configured' });
  }
  const provided = req.headers['x-api-key'];
  if (!provided || provided !== API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing x-api-key header' });
  }
  next();
}

// ─── Route registrations ──────────────────────────────────────────────────────

function registerDmRoutes(app) {

  // ── POST /api/dm/send ──────────────────────────────────────────────────────
  // Queue a DM. Returns immediately with a job_id; use GET /api/dm/jobs/:id
  // to poll status or supply a webhook_url for push notification.
  app.post('/api/dm/send', requireApiKey, async (req, res) => {
    try {
      const {
        instagram_handle,
        message,
        campaign_id,
        lead_id,
        webhook_url,
        from_account,       // optional — pin to a specific registered account
      } = req.body;

      if (!instagram_handle || !message) {
        return res.status(400).json({ error: 'instagram_handle and message are required' });
      }

      const handle = instagram_handle.replace('@', '').trim().toLowerCase();

      if (!handle) {
        return res.status(400).json({ error: 'instagram_handle is invalid' });
      }

      if (message.length > 1000) {
        return res.status(400).json({ error: 'message must be 1000 characters or fewer' });
      }

      // Validate webhook URL if provided
      if (webhook_url) {
        try { new URL(webhook_url); } catch {
          return res.status(400).json({ error: 'webhook_url is not a valid URL' });
        }
      }

      // Verify the requested account exists and is active (fail-fast before queuing)
      if (from_account) {
        const acctCheck = await db.query(
          "SELECT status, sent_today, daily_limit FROM instagram_accounts WHERE username = $1",
          [from_account]
        );
        if (acctCheck.rows.length === 0) {
          return res.status(404).json({ error: `Account @${from_account} is not registered` });
        }
        const acct = acctCheck.rows[0];
        if (acct.status !== 'active') {
          return res.status(422).json({ error: `Account @${from_account} status is "${acct.status}"` });
        }
        if (acct.sent_today >= acct.daily_limit) {
          return res.status(429).json({
            error: `Account @${from_account} has reached its daily limit (${acct.daily_limit})`,
            sent_today: acct.sent_today,
          });
        }
      }

      const jobId = uuidv4();

      // Persist the job record first so it's queryable immediately
      await db.query(`
        INSERT INTO dm_jobs
          (job_id, from_account, to_handle, message, campaign_id, lead_id, webhook_url, queued_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `, [jobId, from_account || null, handle, message, campaign_id || null, lead_id || null, webhook_url || null]);

      // Enqueue with a 45–180 s random delay for human-like pacing
      await enqueueDmJob({
        jobId,
        toHandle:     handle,
        message,
        fromUsername: from_account || null,
        webhookUrl:   webhook_url || null,
      });

      console.log(`[DM] Queued job ${jobId} → @${handle}${campaign_id ? ` (campaign: ${campaign_id})` : ''}`);

      res.status(202).json({
        job_id:          jobId,
        status:          'queued',
        estimated_send:  'within 2 minutes',
      });
    } catch (err) {
      console.error('[DM] Send error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/dm/instagram ────────────────────────────────────────────────
  // Cleaner alias of /api/dm/send for ReeveOS and other external callers.
  // Body: { instagram_handle, message, campaign_id, lead_id?, webhook_url?, from_account? }
  // Response: { job_id, status: "queued" }
  app.post('/api/dm/instagram', requireApiKey, async (req, res) => {
    try {
      const {
        instagram_handle,
        message,
        campaign_id,
        lead_id,
        webhook_url,
        from_account,
      } = req.body;

      if (!instagram_handle || !message) {
        return res.status(400).json({ error: 'instagram_handle and message are required' });
      }

      const handle = instagram_handle.replace('@', '').trim().toLowerCase();
      if (!handle) return res.status(400).json({ error: 'instagram_handle is invalid' });
      if (message.length > 1000) return res.status(400).json({ error: 'message must be 1000 characters or fewer' });

      if (webhook_url) {
        try { new URL(webhook_url); } catch {
          return res.status(400).json({ error: 'webhook_url is not a valid URL' });
        }
      }

      if (from_account) {
        const acctCheck = await db.query(
          "SELECT status, sent_today, daily_limit FROM instagram_accounts WHERE username = $1",
          [from_account]
        );
        if (acctCheck.rows.length === 0) {
          return res.status(404).json({ error: `Account @${from_account} is not registered` });
        }
        const acct = acctCheck.rows[0];
        if (acct.status !== 'active') {
          return res.status(422).json({ error: `Account @${from_account} status is "${acct.status}"` });
        }
        if (acct.sent_today >= acct.daily_limit) {
          return res.status(429).json({
            error: `Account @${from_account} has reached its daily limit (${acct.daily_limit})`,
            sent_today: acct.sent_today,
          });
        }
      }

      const jobId = uuidv4();

      await db.query(`
        INSERT INTO dm_jobs (job_id, from_account, to_handle, message, campaign_id, lead_id, webhook_url, queued_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `, [jobId, from_account || null, handle, message, campaign_id || null, lead_id || null, webhook_url || null]);

      await enqueueDmJob({
        jobId,
        toHandle:     handle,
        message,
        fromUsername: from_account || null,
        webhookUrl:   webhook_url || null,
      });

      console.log(`[DM] /instagram queued job ${jobId} → @${handle}${campaign_id ? ` (campaign: ${campaign_id})` : ''}`);

      res.status(202).json({ job_id: jobId, status: 'queued' });
    } catch (err) {
      console.error('[DM] /instagram error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/dm/jobs/:job_id ───────────────────────────────────────────────
  app.get('/api/dm/jobs/:job_id', requireApiKey, async (req, res) => {
    try {
      const { job_id } = req.params;

      const result = await db.query(
        `SELECT job_id, from_account, to_handle, status, sent_at, error,
                campaign_id, lead_id, queued_at, webhook_delivered, duration_ms
         FROM dm_jobs WHERE job_id = $1`,
        [job_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('[DM] Get job error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/dm/jobs ───────────────────────────────────────────────────────
  // Query jobs with optional filters: ?status=sent&campaign_id=X&limit=50&skip=0
  app.get('/api/dm/jobs', requireApiKey, async (req, res) => {
    try {
      const { status, campaign_id, limit = '50', skip = '0' } = req.query;

      const limitN = Math.min(Math.max(parseInt(limit) || 50, 1), 200);
      const skipN  = Math.max(parseInt(skip) || 0, 0);

      const conditions = [];
      const values     = [];
      let   idx        = 1;

      if (status) {
        const allowed = ['queued', 'sending', 'sent', 'failed', 'rate_limited'];
        if (!allowed.includes(status)) {
          return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
        }
        conditions.push(`status = $${idx++}`);
        values.push(status);
      }

      if (campaign_id) {
        conditions.push(`campaign_id = $${idx++}`);
        values.push(campaign_id);
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      values.push(limitN, skipN);
      const result = await db.query(`
        SELECT job_id, from_account, to_handle, status, sent_at, error,
               campaign_id, lead_id, queued_at, webhook_delivered, duration_ms
        FROM dm_jobs
        ${where}
        ORDER BY queued_at DESC
        LIMIT $${idx++} OFFSET $${idx++}
      `, values);

      // Also return a total count for pagination
      const countResult = await db.query(
        `SELECT COUNT(*) AS total FROM dm_jobs ${where}`,
        values.slice(0, -2)   // remove limit/skip
      );

      res.json({
        total: parseInt(countResult.rows[0].total),
        jobs: result.rows,
      });
    } catch (err) {
      console.error('[DM] List jobs error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/dm/accounts ──────────────────────────────────────────────────
  // List all registered Instagram accounts (safe subset — no cookies).
  app.get('/api/dm/accounts', requireApiKey, async (req, res) => {
    try {
      const result = await db.query(`
        SELECT username, display_name, status, daily_limit, sent_today, last_reset, created_at
        FROM instagram_accounts
        ORDER BY created_at DESC
      `);
      res.json(result.rows);
    } catch (err) {
      console.error('[DM] List accounts error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/dm/accounts ─────────────────────────────────────────────────
  // Register a new Instagram account or update cookies on an existing one.
  // Body: { username, cookies: [...Playwright cookie objects...], display_name?, daily_limit? }
  app.post('/api/dm/accounts', requireApiKey, async (req, res) => {
    try {
      const { username, cookies, display_name, daily_limit } = req.body;

      if (!username) {
        return res.status(400).json({ error: 'username is required' });
      }

      if (!cookies || !Array.isArray(cookies) || cookies.length === 0) {
        return res.status(400).json({ error: 'cookies must be a non-empty array of Playwright cookie objects' });
      }

      // Encrypt the cookie array before storing
      let encryptedCookies;
      try {
        encryptedCookies = encryptCookies(JSON.stringify(cookies));
      } catch (e) {
        return res.status(500).json({ error: `Cookie encryption failed: ${e.message}` });
      }

      const cleanUsername = username.replace('@', '').trim().toLowerCase();

      const result = await db.query(`
        INSERT INTO instagram_accounts (username, display_name, cookies, daily_limit, status, created_at, last_reset)
        VALUES ($1, $2, $3, $4, 'active', NOW(), NOW())
        ON CONFLICT (username) DO UPDATE
          SET cookies      = EXCLUDED.cookies,
              display_name = COALESCE(EXCLUDED.display_name, instagram_accounts.display_name),
              daily_limit  = COALESCE(EXCLUDED.daily_limit,  instagram_accounts.daily_limit),
              status       = 'active'
        RETURNING username, display_name, status, daily_limit, sent_today, created_at
      `, [cleanUsername, display_name || null, encryptedCookies, daily_limit || 50]);

      const isNew = result.rows[0].created_at > new Date(Date.now() - 2000);
      console.log(`[DM] Account @${cleanUsername} ${isNew ? 'registered' : 'updated'}`);

      res.status(isNew ? 201 : 200).json(result.rows[0]);
    } catch (err) {
      console.error('[DM] Register account error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── PATCH /api/dm/accounts/:username ──────────────────────────────────────
  // Update account status, daily_limit, or display_name.
  app.patch('/api/dm/accounts/:username', requireApiKey, async (req, res) => {
    try {
      const username = req.params.username.replace('@', '').trim().toLowerCase();
      const { status, daily_limit, display_name } = req.body;

      const allowedStatuses = ['active', 'suspended', 'needs_reauth'];
      if (status && !allowedStatuses.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${allowedStatuses.join(', ')}` });
      }

      const updates = [];
      const values  = [];
      let idx = 1;

      if (status)       { updates.push(`status = $${idx++}`);       values.push(status); }
      if (daily_limit)  { updates.push(`daily_limit = $${idx++}`);  values.push(daily_limit); }
      if (display_name) { updates.push(`display_name = $${idx++}`); values.push(display_name); }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'Nothing to update' });
      }

      values.push(username);
      const result = await db.query(`
        UPDATE instagram_accounts SET ${updates.join(', ')}
        WHERE username = $${idx}
        RETURNING username, display_name, status, daily_limit, sent_today
      `, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: `Account @${username} not found` });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('[DM] Update account error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── DELETE /api/dm/accounts/:username ────────────────────────────────────
  app.delete('/api/dm/accounts/:username', requireApiKey, async (req, res) => {
    try {
      const username = req.params.username.replace('@', '').trim().toLowerCase();

      const result = await db.query(
        'DELETE FROM instagram_accounts WHERE username = $1 RETURNING username',
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: `Account @${username} not found` });
      }

      res.json({ ok: true, deleted: username });
    } catch (err) {
      console.error('[DM] Delete account error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/dm/stats ─────────────────────────────────────────────────────
  // Aggregate send statistics across all jobs and accounts.
  app.get('/api/dm/stats', requireApiKey, async (req, res) => {
    try {
      const jobStats = await db.query(`
        SELECT
          COUNT(*)                                        AS total_jobs,
          COUNT(*) FILTER (WHERE status = 'sent')         AS sent,
          COUNT(*) FILTER (WHERE status = 'failed')       AS failed,
          COUNT(*) FILTER (WHERE status = 'queued')       AS queued,
          COUNT(*) FILTER (WHERE status = 'sending')      AS sending,
          COUNT(*) FILTER (WHERE status = 'rate_limited') AS rate_limited
        FROM dm_jobs
      `);

      const accountStats = await db.query(`
        SELECT
          COUNT(*)                                         AS total_accounts,
          COUNT(*) FILTER (WHERE status = 'active')        AS active,
          COUNT(*) FILTER (WHERE status = 'suspended')     AS suspended,
          COUNT(*) FILTER (WHERE status = 'needs_reauth')  AS needs_reauth,
          COALESCE(SUM(sent_today), 0)                     AS total_sent_today
        FROM instagram_accounts
      `);

      const recentJobs = await db.query(`
        SELECT job_id, to_handle, from_account, status, sent_at, error, campaign_id, queued_at
        FROM dm_jobs
        ORDER BY queued_at DESC
        LIMIT 20
      `);

      res.json({
        jobs:         jobStats.rows[0],
        accounts:     accountStats.rows[0],
        recent_jobs:  recentJobs.rows,
      });
    } catch (err) {
      console.error('[DM] Stats error:', err);
      res.status(500).json({ error: err.message });
    }
  });
}

module.exports = { registerDmRoutes };
