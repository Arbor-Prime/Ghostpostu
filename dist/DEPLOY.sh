#!/bin/bash
set -e
cd /opt/ghostpost
sed -i "s/secure: process.env.NODE_ENV === 'production'/secure: true/g" src/routes/user-auth.js 2>/dev/null
grep -q "NODE_ENV" .env 2>/dev/null || echo "NODE_ENV=production" >> .env
cd client/build
rm -f assets/index-*.js
curl -sL -o app.html "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/app.html"
curl -sL -o assets/index-llu6_FmP.js "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-llu6_FmP.js"
curl -sL -o assets/index-CIhr9K7J.css "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-CIhr9K7J.css"
echo "JS: $(wc -c < assets/index-llu6_FmP.js) bytes"
echo "CSS: $(wc -c < assets/index-CIhr9K7J.css) bytes"
cd /opt/ghostpost && npx pm2 restart ghostpost
echo "Done — test at https://ghostpostu.app/"
