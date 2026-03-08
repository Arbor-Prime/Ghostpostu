#!/bin/bash
set -e
cd /opt/ghostpost/client/build
rm -f assets/index-*.js
curl -sL -o app.html "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/app.html"
curl -sL -o assets/index-wc46Qwy3.js "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-wc46Qwy3.js"
curl -sL -o assets/index-CTbPw1Tf.css "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-CTbPw1Tf.css"
echo "JS: $(wc -c < assets/index-wc46Qwy3.js) bytes"
cd /opt/ghostpost && npx pm2 restart ghostpost && echo DONE
