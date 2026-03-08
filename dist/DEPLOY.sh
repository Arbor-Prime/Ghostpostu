#!/bin/bash
set -e
cd /opt/ghostpost/client/build
rm -f assets/index-*.js
curl -sL -o app.html "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/app.html"
curl -sL -o assets/index-CbZC3UFr.js "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-CbZC3UFr.js"
curl -sL -o assets/index-DVngyUYh.css "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-DVngyUYh.css"
echo "JS: $(wc -c < assets/index-CbZC3UFr.js) bytes"
echo "CSS: $(wc -c < assets/index-DVngyUYh.css) bytes"
cd /opt/ghostpost && npx pm2 restart ghostpost
echo "Done"
