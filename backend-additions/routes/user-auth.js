const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { generateToken, JWT_SECRET } = require('../middleware/auth');

function registerUserAuthRoutes(app) {

  // POST /api/auth/signup
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const result = await db.query(
        `INSERT INTO users (name, email, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id, name, email, onboarding_complete`,
        [name, email, passwordHash]
      );

      const user = result.rows[0];
      const token = generateToken(user);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      console.log(`[Auth] New user registered: ${email} (id: ${user.id})`);
      res.status(201).json({ user, token });
    } catch (err) {
      console.error('[Auth] Signup error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // POST /api/auth/login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const result = await db.query(
        'SELECT id, name, email, password_hash, onboarding_complete, x_auth_status, x_username FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = result.rows[0];

      if (!user.password_hash) {
        return res.status(401).json({ error: 'Account not set up for password login. Contact support.' });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken(user);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const { password_hash, ...safeUser } = user;
      console.log(`[Auth] User logged in: ${email} (id: ${user.id})`);
      res.json({ user: safeUser, token });
    } catch (err) {
      console.error('[Auth] Login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ ok: true });
  });

  // GET /api/auth/me
  app.get('/api/auth/me', async (req, res) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      const result = await db.query(
        'SELECT id, name, email, onboarding_complete, x_auth_status, x_username FROM users WHERE id = $1',
        [decoded.id]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }

      res.json({ user: result.rows[0] });
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // PATCH /api/auth/onboarding-complete
  app.patch('/api/auth/onboarding-complete', async (req, res) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      await db.query(
        'UPDATE users SET onboarding_complete = TRUE, updated_at = NOW() WHERE id = $1',
        [decoded.id]
      );

      console.log(`[Auth] Onboarding complete for user ${decoded.id}`);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PATCH /api/auth/profile
  app.patch('/api/auth/profile', async (req, res) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const { name, email } = req.body;

      const updates = [];
      const values = [];
      let idx = 1;

      if (name) { updates.push(`name = $${idx++}`); values.push(name); }
      if (email) { updates.push(`email = $${idx++}`); values.push(email); }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'Nothing to update' });
      }

      updates.push(`updated_at = NOW()`);
      values.push(decoded.id);

      await db.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}`,
        values
      );

      const result = await db.query(
        'SELECT id, name, email, onboarding_complete FROM users WHERE id = $1',
        [decoded.id]
      );

      res.json({ user: result.rows[0] });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Email already in use' });
      }
      res.status(500).json({ error: err.message });
    }
  });
}

module.exports = { registerUserAuthRoutes };
