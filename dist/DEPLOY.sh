#!/bin/bash
set -e
cd /opt/ghostpost/client/build
rm -f assets/index-*.js assets/index-*.css
curl -sL -o app.html "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/app.html"
curl -sL -o assets/index-C080aqvw.js "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-C080aqvw.js"
curl -sL -o "assets/index-B--BhAhH.css" "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-B--BhAhH.css"
echo "JS: $(wc -c < assets/index-C080aqvw.js) bytes"
echo "CSS: $(wc -c < 'assets/index-B--BhAhH.css') bytes"
echo "DONE — frontend only"
