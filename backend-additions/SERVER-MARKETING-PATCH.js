// PATCH server.js — serve marketing.html at "/" and SPA index.html for app routes
//
// FIND this block (near the bottom of server.js):
//
//   const buildPath = path.join(__dirname, '../client/build');
//   if (fs.existsSync(path.join(buildPath, 'index.html'))) {
//     app.use(express.static(buildPath));
//     app.get('*', (req, res, next) => {
//       if (req.path.startsWith('/api')) return next();
//       res.sendFile(path.join(buildPath, 'index.html'));
//     });
//     console.log('[Server] Serving React build from client/build');
//   }
//
// REPLACE with:
//
//   const buildPath = path.join(__dirname, '../client/build');
//   if (fs.existsSync(path.join(buildPath, 'index.html'))) {
//     app.use(express.static(buildPath));
//
//     // Serve marketing page at exact root
//     app.get('/', (req, res) => {
//       const marketingPath = path.join(buildPath, 'marketing.html');
//       if (fs.existsSync(marketingPath)) {
//         res.sendFile(marketingPath);
//       } else {
//         res.sendFile(path.join(buildPath, 'index.html'));
//       }
//     });
//
//     // Serve React SPA for all app routes
//     app.get('*', (req, res, next) => {
//       if (req.path.startsWith('/api')) return next();
//       if (req.path.startsWith('/socket.io')) return next();
//       res.sendFile(path.join(buildPath, 'index.html'));
//     });
//     console.log('[Server] Marketing at /, SPA for app routes');
//   }
