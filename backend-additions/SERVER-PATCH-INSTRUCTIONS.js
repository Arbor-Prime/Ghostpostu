// SERVER.JS ADDITIONS — Sprint 20
// Apply these changes to /opt/ghostpost/src/server.js

// ============================================================
// 1. ADD IMPORTS (after the existing require statements at top)
// ============================================================

const cookieParser = require('cookie-parser');
const { registerUserAuthRoutes } = require('./routes/user-auth');
const { registerStatsRoutes } = require('./routes/stats');

// ============================================================
// 2. ADD COOKIE PARSER (after app.use(express.json()))
// ============================================================

app.use(cookieParser());

// ============================================================
// 3. ADD NEW ROUTE REGISTRATIONS (after existing route registrations)
// ============================================================

// User auth routes (Sprint 20 — login/signup/me)
registerUserAuthRoutes(app);

// Dashboard stats routes (Sprint 20)
registerStatsRoutes(app);

// ============================================================
// 4. ADD TO .env FILE
// ============================================================

// JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

// ============================================================
// 5. NPM INSTALL
// ============================================================

// cd /opt/ghostpost && npm install bcryptjs jsonwebtoken cookie-parser

// ============================================================
// 6. RUN DB MIGRATION
// ============================================================

// psql -U ghostpost -d ghostpost -f /opt/ghostpost/src/db/migrations/020-user-auth.sql
