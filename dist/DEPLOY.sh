#!/bin/bash
set -e
echo "=== GhostPost Full Deploy ==="
echo ""

# Fix backend
echo "--- Backend Fixes ---"

cd /opt/ghostpost

# Fix 1: Cookie secure flag
if [ -f src/routes/user-auth.js ]; then
  sed -i "s/secure: process.env.NODE_ENV === 'production'/secure: true/g" src/routes/user-auth.js
  echo "✓ Cookie secure:true"
fi

# Fix 2: NODE_ENV
if ! grep -q "NODE_ENV" .env 2>/dev/null; then
  echo "NODE_ENV=production" >> .env
  echo "✓ NODE_ENV=production"
fi

# Fix 3: Stats account isolation
if [ -f src/routes/stats.js ]; then
  python3 -c "
with open('src/routes/stats.js', 'r') as f:
    code = f.read()
old = \"const tweetsResult = await db.query('SELECT COUNT(*) as total FROM observed_tweets');\"
new = '''const tweetsResult = await db.query(
        'SELECT COUNT(*) as total FROM observed_tweets ot JOIN tracked_profiles tp ON ot.profile_id = tp.id WHERE tp.user_id = \$1',
        [userId]
      );'''
if old in code:
    code = code.replace(old, new)
    with open('src/routes/stats.js', 'w') as f:
        f.write(code)
    print('✓ Stats filtered by user')
else:
    print('○ Stats query already changed or different format')
" 2>/dev/null || echo "⚠ Stats fix skipped"
fi

# Deploy frontend
echo ""
echo "--- Frontend Deploy ---"

cd /opt/ghostpost/client/build

# Clean old JS files
rm -f assets/index-DI5-37eD.js assets/index-DCcs2rh2.js assets/index-CBbCx7Yz.js assets/index-CS3-p5kB.js assets/index-DSe4BR6a.js

# Download new files
curl -sL -o app.html "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/app.html"
curl -sL -o assets/index-CHLvVG9o.js "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-CHLvVG9o.js"
curl -sL -o assets/index-CaGX01MT.css "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-CaGX01MT.css"

# Verify
JS_SIZE=$(wc -c < assets/index-CHLvVG9o.js)
CSS_SIZE=$(wc -c < assets/index-CaGX01MT.css)

if [ "$JS_SIZE" -gt 700000 ]; then
  echo "✓ JS: ${JS_SIZE} bytes"
else
  echo "✗ JS download failed: ${JS_SIZE} bytes"
  exit 1
fi

if [ "$CSS_SIZE" -gt 90000 ]; then
  echo "✓ CSS: ${CSS_SIZE} bytes"
else
  echo "✗ CSS download failed: ${CSS_SIZE} bytes"
  exit 1
fi

# Restart
echo ""
echo "--- Restart ---"
cd /opt/ghostpost
npx pm2 restart ghostpost
sleep 2

# Quick verify
echo ""
echo "--- Verify ---"
HEALTH=$(curl -s http://localhost:3000/api/health)
echo "Health: $(echo $HEALTH | python3 -c 'import json,sys; print(json.load(sys.stdin).get("status","FAIL"))' 2>/dev/null)"

# Test signup cookie
SIGNUP=$(curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"DeployTest","email":"deploytest@test.com","password":"testpass123"}' \
  -c /tmp/deploy-cookies.txt 2>&1)
echo "Signup: $(echo $SIGNUP | python3 -c 'import json,sys; d=json.load(sys.stdin); print("User " + str(d.get("user",{}).get("id","FAIL")))' 2>/dev/null)"

ME=$(curl -s http://localhost:3000/api/auth/me -b /tmp/deploy-cookies.txt 2>&1)
echo "Auth: $(echo $ME | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("user",{}).get("name","FAIL"))' 2>/dev/null)"

# Cleanup
curl -s -X POST http://localhost:3000/api/auth/logout -b /tmp/deploy-cookies.txt >/dev/null
psql -U ghostpost -d ghostpost -c "DELETE FROM users WHERE email = 'deploytest@test.com'" 2>/dev/null

echo ""
echo "=== Deploy Complete ==="
echo "Test at: https://ghostpostu.app/"
