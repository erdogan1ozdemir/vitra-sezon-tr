// Simple static server for VitrA Dashboard (Railway deploy)
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
// Railway container networking `0.0.0.0` host'una bind gerektiriyor;
// default IPv6 localhost bind'i healthcheck'i düşürür.
const HOST = process.env.HOST || '0.0.0.0';

// Serve all project files as static
app.use(express.static(__dirname, {
  extensions: ['html'],
  setHeaders: (res, filePath) => {
    // Allow JSX / binary assets
    if (filePath.endsWith('.jsx')) res.setHeader('Content-Type', 'text/babel; charset=utf-8');
    if (filePath.endsWith('.svg')) res.setHeader('Content-Type', 'image/svg+xml');
  }
}));

// Root → dashboard (index.html served automatically by express.static)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Healthcheck for Railway
app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, HOST, () => {
  console.log(`[VitrA Dashboard] serving on ${HOST}:${PORT}`);
});
