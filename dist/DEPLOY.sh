#!/bin/bash
set -e
# Frontend
cd /opt/ghostpost/client/build
rm -f assets/index-*.js
curl -sL -o app.html "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/app.html"
curl -sL -o assets/index-BW2CwSeI.js "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-BW2CwSeI.js"
curl -sL -o assets/index-hRFNxbhG.css "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-hRFNxbhG.css"
echo "JS: $(wc -c < assets/index-BW2CwSeI.js) bytes"
# Backend - pull Instagram nav fix
cd /opt/ghostpost
git fetch origin sprint-20-frontend-merge 2>/dev/null
git checkout origin/sprint-20-frontend-merge -- src/services/browser-session/socket-handler.js 2>/dev/null && echo "Socket handler updated" || echo "Git pull skipped"
# Restart fresh
npx pm2 kill 2>/dev/null; killall -9 node 2>/dev/null; sleep 2
npx pm2 start src/server.js --name ghostpost
sleep 3
curl -s http://localhost:3000/api/health | python3 -c "import json,sys; print('Health:', json.load(sys.stdin).get('status','FAIL'))" 2>/dev/null
echo "DONE"
