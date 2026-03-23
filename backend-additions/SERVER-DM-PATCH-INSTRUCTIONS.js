// SERVER.JS ADDITIONS — Sprint 21 v2: DM Engine (external API service)
// Apply these changes to /opt/ghostpost/src/server.js

// ============================================================
// 1. COPY FILES TO THE SERVER
// ============================================================

// mkdir -p /opt/ghostpost/src/services/dm
//
// scp backend-additions/routes/dm.js                        ubuntu@<server>:/opt/ghostpost/src/routes/dm.js
// scp backend-additions/services/dm/instagram-sender.js     ubuntu@<server>:/opt/ghostpost/src/services/dm/instagram-sender.js
// scp backend-additions/services/dm/dm-queue.js             ubuntu@<server>:/opt/ghostpost/src/services/dm/dm-queue.js
// scp backend-additions/db/migrations/015-dm-engine.sql     ubuntu@<server>:/opt/ghostpost/src/db/migrations/015-dm-engine.sql

// ============================================================
// 2. ADD IMPORT (after the existing require statements at top of server.js)
// ============================================================

const { registerDmRoutes } = require('./routes/dm');

// ============================================================
// 3. ADD ROUTE REGISTRATION (after registerStatsRoutes(app))
// ============================================================

// DM Engine routes (Sprint 21 v2 — external API key auth)
registerDmRoutes(app);

// ============================================================
// 4. NPM INSTALL (on the server)
// ============================================================

// cd /opt/ghostpost
// npm install bullmq playwright uuid node-fetch@2
// npx playwright install chromium --with-deps

// ============================================================
// 5. RUN DB MIGRATION
// ============================================================

// psql -U ghostpost -d ghostpost -f /opt/ghostpost/src/db/migrations/015-dm-engine.sql

// ============================================================
// 6. ADD TO .env FILE
// ============================================================

// # 32-byte hex key — generate with:
// #   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// COOKIE_ENCRYPTION_KEY=<64-char hex string>
//
// # Secret shared with external callers (ReeveOS, etc.)
// # Generate with: node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
// GHOSTPOST_API_KEY=<your-secret-api-key>
//
// # Redis (required by BullMQ)
// REDIS_URL=redis://127.0.0.1:6379
//
// # Set to "false" only for local debugging
// PLAYWRIGHT_HEADLESS=true

// ============================================================
// 7. REGISTER INSTAGRAM ACCOUNTS
// ============================================================

// Accounts are registered via the API — no manual file setup needed.
// Use a Playwright script to extract cookies from a logged-in browser session,
// then POST them to /api/dm/accounts:
//
//   curl -X POST https://yourserver.com/api/dm/accounts \
//     -H "x-api-key: <GHOSTPOST_API_KEY>" \
//     -H "Content-Type: application/json" \
//     -d '{
//       "username": "your_instagram_handle",
//       "display_name": "Display Name",
//       "daily_limit": 40,
//       "cookies": [ ...Playwright cookie objects... ]
//     }'
//
// To extract cookies from a live browser session:
//
//   node -e "
//     const { chromium } = require('playwright');
//     (async () => {
//       const browser = await chromium.launch({ headless: false });
//       const ctx = await browser.newContext();
//       const page = await ctx.newPage();
//       await page.goto('https://www.instagram.com/accounts/login/');
//       console.log('Log in, then press Enter here...');
//       await new Promise(r => process.stdin.once('data', r));
//       const cookies = await ctx.cookies('https://www.instagram.com');
//       console.log(JSON.stringify(cookies, null, 2));
//       await browser.close();
//     })();
//   "

// ============================================================
// 8. ENSURE REDIS IS RUNNING
// ============================================================

// sudo apt install redis-server -y
// sudo systemctl enable --now redis-server
// redis-cli ping   # should return PONG

// ============================================================
// 9. (OPTIONAL) pg_cron — reset sent_today at UTC midnight
// ============================================================

// If pg_cron is installed on your Postgres instance:
//
//   SELECT cron.schedule(
//     'reset-ig-daily-counts',
//     '0 0 * * *',
//     $$UPDATE instagram_accounts SET sent_today = 0, last_reset = NOW()$$
//   );
//
// Otherwise the Node worker resets counts automatically on first job of the day.

// ============================================================
// 10. RESTART THE SERVER
// ============================================================

// pm2 restart ghostpost  OR  sudo systemctl restart ghostpost

// ============================================================
// QUICK SMOKE TEST (replace values with your own)
// ============================================================

// # Queue a DM
// curl -X POST https://yourserver.com/api/dm/send \
//   -H "x-api-key: <GHOSTPOST_API_KEY>" \
//   -H "Content-Type: application/json" \
//   -d '{
//     "instagram_handle": "coffeeshoplayla",
//     "message": "Hey Layla, loved your recent posts!",
//     "campaign_id": "test-campaign-1",
//     "lead_id": "lead-001",
//     "webhook_url": "https://yourwebhook.site/test"
//   }'
//
// # Check job status
// curl https://yourserver.com/api/dm/jobs/<job_id_from_above> \
//   -H "x-api-key: <GHOSTPOST_API_KEY>"
//
// # View all accounts
// curl https://yourserver.com/api/dm/accounts \
//   -H "x-api-key: <GHOSTPOST_API_KEY>"
//
// # View stats
// curl https://yourserver.com/api/dm/stats \
//   -H "x-api-key: <GHOSTPOST_API_KEY>"
