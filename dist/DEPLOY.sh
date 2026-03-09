#!/bin/bash
set -e
cd /opt/ghostpost/client/build
rm -f assets/index-*.js assets/index-*.css
curl -sL -o app.html "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/app.html"
curl -sL -o assets/index-V9y1tXa2.js "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-V9y1tXa2.js"
curl -sL -o assets/index-CpuizkpF.css "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-CpuizkpF.css"
echo "JS: $(wc -c < assets/index-V9y1tXa2.js) bytes"
echo "CSS: $(wc -c < assets/index-CpuizkpF.css) bytes"
echo "DONE — do NOT restart PM2, frontend only"
