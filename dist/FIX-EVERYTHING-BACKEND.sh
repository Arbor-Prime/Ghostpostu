#!/bin/bash
set -e
echo "=== GhostPost Backend Fix Script ==="
echo "Run this ON THE SERVER: bash /tmp/FIX-EVERYTHING-BACKEND.sh"
echo ""

cd /opt/ghostpost

# ============================================================
# FIX 1: Cookie settings — secure:true always on .app domain
# The cookie was only secure when NODE_ENV=production
# .app TLD REQUIRES https, so secure must always be true
# ============================================================
echo "[Fix 1] Fixing cookie settings in user-auth.js..."

if [ -f src/routes/user-auth.js ]; then
  sed -i "s/secure: process.env.NODE_ENV === 'production'/secure: true/g" src/routes/user-auth.js
  echo "  ✓ Cookie secure flag set to true"
else
  echo "  ✗ user-auth.js not found!"
fi

# ============================================================
# FIX 2: Voice profile — check if processing actually works
# The voice upload needs to trigger profile building
# ============================================================
echo "[Fix 2] Checking voice route..."

if [ -f src/routes/voice.js ]; then
  # Check if buildVoiceProfile is imported and called
  if grep -q "buildVoiceProfile" src/routes/voice.js; then
    echo "  ✓ buildVoiceProfile is referenced in voice.js"
  else
    echo "  ✗ buildVoiceProfile NOT found — voice processing won't work!"
  fi
  
  # Check if Whisper is accessible
  echo "  Testing Whisper..."
  if command -v whisper &>/dev/null || [ -f /usr/local/bin/whisper ]; then
    echo "  ✓ Whisper binary found"
  else
    pip install openai-whisper --break-system-packages 2>/dev/null && echo "  ✓ Whisper installed" || echo "  ⚠ Whisper install failed — voice transcription won't work"
  fi
  
  # Check if ffmpeg is available (needed by Whisper)
  if command -v ffmpeg &>/dev/null; then
    echo "  ✓ ffmpeg found"
  else
    apt-get install -y ffmpeg 2>/dev/null && echo "  ✓ ffmpeg installed" || echo "  ⚠ ffmpeg not found"
  fi
else
  echo "  ✗ voice.js not found!"
fi

# ============================================================
# FIX 3: Account isolation on dashboard stats
# The tweets_scanned count is global — needs user filter
# ============================================================
echo "[Fix 3] Fixing stats route for account isolation..."

if [ -f src/routes/stats.js ]; then
  # The tweets query counts ALL tweets — it should count per-user tracked profiles
  # Replace global tweet count with user-specific
  python3 << 'PYEOF'
import re

with open('src/routes/stats.js', 'r') as f:
    code = f.read()

# Fix: tweets_scanned should count tweets from user's tracked profiles only
old_query = "const tweetsResult = await db.query('SELECT COUNT(*) as total FROM observed_tweets');"
new_query = """const tweetsResult = await db.query(
        'SELECT COUNT(*) as total FROM observed_tweets ot JOIN tracked_profiles tp ON ot.profile_id = tp.id WHERE tp.user_id = $1',
        [userId]
      );"""

if old_query in code:
    code = code.replace(old_query, new_query)
    print("  ✓ Fixed tweets_scanned to filter by user")
else:
    # Try alternate — the query might reference different column
    if "FROM observed_tweets'" in code and "user_id" not in code.split("FROM observed_tweets'")[0].split('\n')[-3:][0]:
        print("  ⚠ tweets query found but format different — manual check needed")
    else:
        print("  ○ tweets query already filtered or not found")

with open('src/routes/stats.js', 'w') as f:
    f.write(code)
PYEOF
else
  echo "  ✗ stats.js not found!"
fi

# ============================================================  
# FIX 4: Ensure NODE_ENV is set
# ============================================================
echo "[Fix 4] Setting NODE_ENV..."

if ! grep -q "NODE_ENV" .env; then
  echo "NODE_ENV=production" >> .env
  echo "  ✓ NODE_ENV=production added to .env"
else
  echo "  ○ NODE_ENV already in .env"
fi

# ============================================================
# FIX 5: Check voice transcriber — what happens after upload
# ============================================================
echo "[Fix 5] Checking voice pipeline..."

echo "  Voice routes registered:"
grep "app\.\(get\|post\)" src/routes/voice.js 2>/dev/null | head -10

echo ""
echo "  Upload handler:"
grep -A5 "upload" src/routes/voice.js 2>/dev/null | head -10

# ============================================================
# FIX 6: Restart
# ============================================================
echo ""
echo "[Fix 6] Restarting PM2..."
npx pm2 restart ghostpost
sleep 2

echo ""
echo "=== Verification ==="

# Test cookie
echo "Testing signup with cookie..."
RESULT=$(curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"FixTest","email":"fixtest@test.com","password":"testpass123"}' \
  -c /tmp/fix-cookies.txt 2>&1)
echo "Signup: $(echo $RESULT | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("user",{}).get("id","FAIL"))' 2>/dev/null || echo 'FAIL')"

# Test cookie persists
echo "Testing auth/me with cookie..."
ME=$(curl -s http://localhost:3000/api/auth/me -b /tmp/fix-cookies.txt 2>&1)
echo "Me: $(echo $ME | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("user",{}).get("name","FAIL"))' 2>/dev/null || echo 'FAIL')"

# Check cookie attributes
echo "Cookie details:"
cat /tmp/fix-cookies.txt 2>/dev/null | grep token | awk '{print "  Domain:", $1, "Secure:", $4, "Path:", $3}'

# Cleanup
curl -s -X POST http://localhost:3000/api/auth/logout -b /tmp/fix-cookies.txt >/dev/null
psql -U ghostpost -d ghostpost -c "DELETE FROM users WHERE email = 'fixtest@test.com'" 2>/dev/null

# Check voice pipeline logs
echo ""
echo "Recent voice-related logs:"
npx pm2 logs ghostpost --lines 50 --nostream 2>/dev/null | grep -i "voice\|whisper\|transcri\|profile.*build" | tail -10

echo ""
echo "=== Done ==="
echo "Now deploy the frontend: see DEPLOY-FRONTEND.sh"
