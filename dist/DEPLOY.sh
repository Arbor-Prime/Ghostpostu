#!/bin/bash
set -e

# Backend fixes
cd /opt/ghostpost

# Kill orphaned chromium
pkill -f chromium 2>/dev/null; echo "Chromium: cleaned"

# Deploy frontend
cd client/build
rm -f assets/index-*.js
curl -sL -o app.html "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/app.html"
curl -sL -o assets/index-DHYYl9Xo.js "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-DHYYl9Xo.js"
curl -sL -o assets/index-CTbPw1Tf.css "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-CTbPw1Tf.css"
echo "JS: $(wc -c < assets/index-DHYYl9Xo.js) bytes"

# Fresh PM2 restart
cd /opt/ghostpost
npx pm2 kill 2>/dev/null; killall -9 node 2>/dev/null; sleep 2
npx pm2 start src/server.js --name ghostpost
sleep 3
curl -s http://localhost:3000/api/health | python3 -c "import json,sys; print('Health:', json.load(sys.stdin).get('status','FAIL'))" 2>/dev/null
echo "DONE"
