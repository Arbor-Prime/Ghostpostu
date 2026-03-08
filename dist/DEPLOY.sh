#!/bin/bash
set -e
cd /opt/ghostpost/client/build
rm -f assets/index-*.js
curl -sL -o app.html "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/app.html"
curl -sL -o assets/index-bEaet97Q.js "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-bEaet97Q.js"
curl -sL -o assets/index-DGizP2RO.css "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-DGizP2RO.css"
echo "JS: $(wc -c < assets/index-bEaet97Q.js) bytes"
cd /opt/ghostpost && npx pm2 restart ghostpost && echo DONE
