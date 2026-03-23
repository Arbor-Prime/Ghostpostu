#!/bin/bash
set -e
cd /opt/ghostpost/client/build
rm -f assets/index-*.js assets/index-*.css
curl -sL -o app.html "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/app.html"
curl -sL -o assets/index-O4Z6UCCZ.js "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-O4Z6UCCZ.js"
curl -sL -o "assets/index-BSnc-Yaw.css" "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-BSnc-Yaw.css"
echo "JS: $(wc -c < assets/index-O4Z6UCCZ.js) bytes"
echo "CSS: $(wc -c < 'assets/index-BSnc-Yaw.css') bytes"
echo "DONE — frontend only"
