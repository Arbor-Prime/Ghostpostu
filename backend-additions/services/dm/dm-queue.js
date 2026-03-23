/**
 * BullMQ queue + processor for the DM engine.
 *
 * Queue name : "dm-sends"
 * Job name   : "send-dm"
 *
 * Design goals matched to spec:
 *  - Concurrency 1 per account  — an account-level mutex prevents two jobs
 *    from running concurrently against the same Instagram session.
 *  - 45–180 s random delay      — every job is enqueued with a BullMQ `delay`
 *    that staggers sends so Instagram sees human-like timing.
 *  - 2 retries on failure       — BullMQ `attempts: 3` (1 try + 2 retries).
 *    The processor only throws for transient errors; permanent failures (bad
 *    handle, session expired) are written to the DB and resolved immediately
 *    so BullMQ does NOT retry them.
 *
 * Each job payload:
 *   { jobId, toHandle, message, fromUsername, webhookUrl }
 *
 * Processor responsibilities:
 *  1. Acquire per-account mutex.
 *  2. Mark dm_jobs.status = 'sending'.
 *  3. Pick the account with most remaining daily capacity.
 *  4. Call instagram-sender with decrypted per-account cookies.
 *  5. Persist outcome to dm_jobs + increment instagram_accounts.sent_today.
 *  6. Fire webhook (with 3-attempt back-off).
 *  7. Reset sent_today counters at UTC midnight.
 */

const { Queue, Worker, QueueEvents } = require('bullmq');
const fetch  = require('node-fetch');            // npm install node-fetch@2
const db     = require('../../config/database');
const { sendInstagramDm } = require('./instagram-sender');

// ─── Redis connection ─────────────────────────────────────────────────────────

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

function redisConnection() {
  try {
    const url = new URL(REDIS_URL);
    return {
      host:     url.hostname,
      port:     parseInt(url.port) || 6379,
      password: url.password || undefined,
      db:       parseInt(url.pathname.slice(1)) || 0,
    };
  } catch {
    return { host: '127.0.0.1', port: 6379 };
  }
}

const connection = redisConnection();

// ─── Delay constants (spec: 45–180 seconds) ───────────────────────────────────

const DELAY_MIN_MS = 45_000;
const DELAY_MAX_MS = 180_000;

function randomDelayMs() {
  return DELAY_MIN_MS + Math.floor(Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS));
}

// ─── Per-account concurrency lock ─────────────────────────────────────────────
// Ensures only one Playwright session is open for a given Instagram account
// at any point in time, even if the Node process has multiple worker threads.
// This is an in-process Set; for multi-process deployments replace with a
// Redis SET NX lock on the account username key.

const accountLocks = new Set();

async function withAccountLock(username, fn) {
  if (accountLocks.has(username)) {
    throw new Error(`TRANSIENT: Account @${username} is busy — will retry`);
  }
  accountLocks.add(username);
  try {
    return await fn();
  } finally {
    accountLocks.delete(username);
  }
}

// ─── Queue instance (used by routes to add jobs) ──────────────────────────────

const dmQueue = new Queue('dm-sends', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 200,
    removeOnFail:     500,
  },
});

/**
 * Enqueue a DM job with the correct staggered delay.
 * `delayOffsetMs` lets the route layer chain multiple jobs with cumulative
 * delays so concurrent campaigns don't all fire at t=0.
 *
 * @param {object} payload   — { jobId, toHandle, message, fromUsername, webhookUrl }
 * @param {number} [delayOffsetMs=0]  — extra ms to add on top of the random delay
 */
async function enqueueDmJob(payload, delayOffsetMs = 0) {
  const delay = randomDelayMs() + delayOffsetMs;

  return dmQueue.add('send-dm', payload, {
    delay,
    attempts:  3,        // 1 initial + 2 retries
    backoff: {
      type:  'fixed',
      delay: 30_000,     // 30 s between retry attempts
    },
  });
}

// ─── QueueEvents ─────────────────────────────────────────────────────────────

const dmQueueEvents = new QueueEvents('dm-sends', { connection });

dmQueueEvents.on('completed', ({ jobId }) =>
  console.log(`[DmQueue] BullMQ job ${jobId} completed`)
);
dmQueueEvents.on('failed', ({ jobId, failedReason }) =>
  console.error(`[DmQueue] BullMQ job ${jobId} failed: ${failedReason}`)
);

// ─── Account picker ───────────────────────────────────────────────────────────

/**
 * Return the best available Instagram account for the next send.
 * "Best" = active + under daily limit + not currently locked.
 * If `preferredUsername` is given, validate that specific account.
 *
 * @param {string|null} preferredUsername
 * @returns {Promise<object|null>}
 */
async function pickAccount(preferredUsername) {
  if (preferredUsername) {
    const r = await db.query(
      `SELECT * FROM instagram_accounts
       WHERE username = $1 AND status = 'active' AND sent_today < daily_limit`,
      [preferredUsername]
    );
    const acct = r.rows[0] || null;
    if (acct && accountLocks.has(acct.username)) return null;  // locked — retry later
    return acct;
  }

  // Round-robin: pick active account with most headroom, skip locked ones
  const r = await db.query(
    `SELECT * FROM instagram_accounts
     WHERE status = 'active' AND sent_today < daily_limit
     ORDER BY (daily_limit - sent_today) DESC`
  );

  for (const acct of r.rows) {
    if (!accountLocks.has(acct.username)) return acct;
  }
  return null;
}

// ─── Webhook delivery ─────────────────────────────────────────────────────────

async function deliverWebhook(webhookUrl, payload, jobId) {
  const MAX = 3;
  for (let attempt = 1; attempt <= MAX; attempt++) {
    try {
      const res = await fetch(webhookUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-GhostPost-Job': jobId },
        body:    JSON.stringify(payload),
        timeout: 8000,
      });

      if (res.ok) {
        await db.query(
          'UPDATE dm_jobs SET webhook_delivered = TRUE, webhook_attempts = $1 WHERE job_id = $2',
          [attempt, jobId]
        );
        console.log(`[DmQueue] Webhook delivered for ${jobId} (attempt ${attempt})`);
        return;
      }

      console.warn(`[DmQueue] Webhook attempt ${attempt} for ${jobId} → HTTP ${res.status}`);
    } catch (err) {
      console.warn(`[DmQueue] Webhook attempt ${attempt} for ${jobId} failed: ${err.message}`);
    }

    if (attempt < MAX) await new Promise(r => setTimeout(r, attempt * 2000));
  }

  await db.query(
    'UPDATE dm_jobs SET webhook_attempts = $1 WHERE job_id = $2',
    [MAX, jobId]
  );
  console.error(`[DmQueue] Webhook permanently failed for ${jobId}`);
}

// ─── Daily reset ──────────────────────────────────────────────────────────────

let lastResetDate = new Date().toISOString().slice(0, 10);

async function maybeResetDailyCounts() {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== lastResetDate) {
    await db.query('UPDATE instagram_accounts SET sent_today = 0, last_reset = NOW()');
    lastResetDate = today;
    console.log('[DmQueue] Daily sent_today counters reset');
  }
}

// ─── Worker / Processor ───────────────────────────────────────────────────────
//
// Retry strategy:
//   - TRANSIENT errors  → throw so BullMQ retries (lock contention, DB blip)
//   - PERMANENT errors  → write to DB, fire webhook, resolve successfully so
//                         BullMQ does NOT retry (wrong handle, session expired,
//                         rate-limited)

const dmWorker = new Worker(
  'dm-sends',
  async (job) => {
    const { jobId, toHandle, message, fromUsername, webhookUrl } = job.data;

    console.log(`[DmQueue] Processing job ${job.id} | db=${jobId} | @${toHandle} | attempt ${job.attemptsMade + 1}`);

    await maybeResetDailyCounts();

    // ── Pick account (may throw TRANSIENT if locked) ──────────────────────────
    const account = await pickAccount(fromUsername || null);

    if (!account) {
      const isTransient = fromUsername
        ? accountLocks.has(fromUsername)   // locked → retry
        : true;                            // all accounts busy/at-limit → retry

      const errMsg = fromUsername
        ? `Account @${fromUsername} is unavailable or at daily limit`
        : 'No active Instagram accounts available — all at daily limit or locked';

      if (isTransient) {
        throw new Error(`TRANSIENT: ${errMsg}`);
      }

      // Permanent: requested account doesn't exist / suspended
      await db.query(
        "UPDATE dm_jobs SET status = 'rate_limited', error = $1 WHERE job_id = $2",
        [errMsg, jobId]
      );
      if (webhookUrl) {
        await deliverWebhook(webhookUrl, { job_id: jobId, status: 'rate_limited', error: errMsg }, jobId);
      }
      return { skipped: true, reason: errMsg };   // resolve — no retry
    }

    // ── Acquire per-account lock + run ────────────────────────────────────────
    return withAccountLock(account.username, async () => {

      // Mark as 'sending'
      await db.query(
        "UPDATE dm_jobs SET status = 'sending', from_account = $1 WHERE job_id = $2",
        [account.username, jobId]
      );

      // ── Send ──────────────────────────────────────────────────────────────
      const result = await sendInstagramDm({
        handle:           toHandle,
        message,
        encryptedCookies: account.cookies,
      });

      const isPermanentFailure =
        !result.success && (
          result.error?.includes('not found in search results') ||
          result.error?.includes('Session expired')
        );

      const newStatus = result.success ? 'sent' : 'failed';

      // ── Persist outcome ────────────────────────────────────────────────────
      await db.query(`
        UPDATE dm_jobs
        SET status       = $1,
            error        = $2,
            sent_at      = CASE WHEN $1 = 'sent' THEN NOW() ELSE NULL END,
            from_account = $3,
            duration_ms  = $4
        WHERE job_id = $5
      `, [newStatus, result.error || null, account.username, result.durationMs, jobId]);

      // ── Update account counters / status ──────────────────────────────────
      if (result.success) {
        await db.query(
          'UPDATE instagram_accounts SET sent_today = sent_today + 1 WHERE username = $1',
          [account.username]
        );
      } else if (result.error?.includes('Session expired')) {
        await db.query(
          "UPDATE instagram_accounts SET status = 'needs_reauth' WHERE username = $1",
          [account.username]
        );
        console.warn(`[DmQueue] Account @${account.username} flagged needs_reauth`);
      }

      // ── Fire webhook ───────────────────────────────────────────────────────
      if (webhookUrl) {
        await deliverWebhook(webhookUrl, {
          job_id:       jobId,
          status:       newStatus,
          to_handle:    toHandle,
          from_account: account.username,
          sent_at:      newStatus === 'sent' ? new Date().toISOString() : null,
          error:        result.error || null,
        }, jobId);
      }

      // ── Decide whether BullMQ should retry ────────────────────────────────
      if (!result.success) {
        if (isPermanentFailure) {
          // Already written to DB — resolve so BullMQ won't retry
          return { jobId, status: 'failed', permanent: true };
        }
        // Transient Playwright error — throw so BullMQ retries
        throw new Error(result.error || 'DM send failed');
      }

      return { jobId, toHandle, status: 'sent', durationMs: result.durationMs };
    });
  },
  {
    connection,
    // Global concurrency: how many jobs run in parallel across all accounts.
    // Per-account exclusivity is enforced by the in-process accountLocks Set.
    // Setting this to the expected number of registered accounts allows
    // different accounts to run simultaneously while each account stays serial.
    concurrency: parseInt(process.env.DM_WORKER_CONCURRENCY || '3'),
    limiter: {
      max:      1,
      duration: 1000,    // at most 1 new job started per second globally
    },
  }
);

dmWorker.on('error', (err) => {
  console.error('[DmQueue] Worker error:', err.message);
});

console.log('[DmQueue] Worker started — listening on queue "dm-sends"');

module.exports = { dmQueue, dmWorker, dmQueueEvents, enqueueDmJob };
