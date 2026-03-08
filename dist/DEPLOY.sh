#!/bin/bash
set -e
cd /opt/ghostpost

# Backend fixes
sed -i "s/secure: process.env.NODE_ENV === 'production'/secure: true/g" src/routes/user-auth.js 2>/dev/null
grep -q "NODE_ENV" .env 2>/dev/null || echo "NODE_ENV=production" >> .env

# Frontend
cd client/build
rm -f assets/index-CHLvVG9o.js assets/index-DI5-37eD.js assets/index-DCcs2rh2.js assets/index-CBbCx7Yz.js assets/index-CS3-p5kB.js assets/index-DSe4BR6a.js
curl -sL -o app.html "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/app.html"
curl -sL -o assets/index-BHWKzpFn.js "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-BHWKzpFn.js"
curl -sL -o assets/index-CIhr9K7J.css "https://raw.githubusercontent.com/Arbor-Prime/Ghostpostu/main/dist/assets/index-CIhr9K7J.css"

echo "JS: $(wc -c < assets/index-BHWKzpFn.js) bytes"
echo "CSS: $(wc -c < assets/index-CIhr9K7J.css) bytes"

cd /opt/ghostpost
npx pm2 restart ghostpost
echo "Done"
