#!/bin/bash
set -e
cd /opt/ghostpost/client/build
rm -f assets/index-*.js assets/index-*.css
curl -sL -o app.html "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/app.html"
curl -sL -o assets/index-BknnfpRN.js "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-BknnfpRN.js"
curl -sL -o assets/index-CpuizkpF.css "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-CpuizkpF.css"
echo "JS: $(wc -c < assets/index-BknnfpRN.js) bytes"
echo "CSS: $(wc -c < assets/index-CpuizkpF.css) bytes"
echo "DONE — frontend only"
