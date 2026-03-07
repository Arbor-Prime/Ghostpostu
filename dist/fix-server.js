// Run this ON THE SERVER: node /tmp/fix-server.js
const fs = require('fs');
const file = '/opt/ghostpost/src/server.js';
let code = fs.readFileSync(file, 'utf8');

// Find and replace the entire static serving block
// Look for the buildPath section and replace it completely
const startMarker = "// Serve React build";
const endMarker = "console.log('[Server]";

const startIdx = code.indexOf(startMarker);
if (startIdx === -1) {
  // Try alternate
  const alt = code.indexOf("const buildPath");
  if (alt === -1) { console.log("ERROR: Cannot find buildPath section"); process.exit(1); }
}

// Find from buildPath to the console.log
const bpIdx = code.indexOf("const buildPath = path.join");
const logIdx = code.indexOf("console.log('[Server]", bpIdx);
const endIdx = logIdx ? code.indexOf('\n', logIdx) + 1 : -1;

if (bpIdx === -1 || endIdx === -1) {
  console.log("ERROR: Cannot find section boundaries");
  console.log("buildPath at:", bpIdx, "log at:", logIdx);
  process.exit(1);
}

// Find the start of the block (include any comment before buildPath)
let blockStart = bpIdx;
const linesBefore = code.substring(Math.max(0, bpIdx - 200), bpIdx);
const commentIdx = linesBefore.lastIndexOf('//');
if (commentIdx !== -1) {
  blockStart = bpIdx - (linesBefore.length - commentIdx);
}

const replacement = `// Serve static files
const buildPath = path.join(__dirname, '../client/build');
if (fs.existsSync(path.join(buildPath, 'index.html'))) {
  // Marketing page is index.html, SPA is app.html
  app.use(express.static(buildPath));
  
  // All non-API, non-static routes get the SPA
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    if (req.path.startsWith('/socket.io')) return next();
    res.sendFile(path.join(buildPath, 'app.html'));
  });
  console.log('[Server] Marketing=index.html, SPA=app.html');
}
`;

code = code.substring(0, blockStart) + replacement + code.substring(endIdx);
fs.writeFileSync(file, code);
console.log("PATCHED OK");
console.log("Now run: pm2 restart ghostpost");
