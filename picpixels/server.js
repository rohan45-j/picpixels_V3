const http = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

const dir = path.resolve(__dirname);
const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || '0.0.0.0';

console.log('Starting Next.js from:', dir);
console.log('Port:', port);
console.log('Hostname:', hostname);

const app = next({ dir, dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log('Next.js app prepared, starting server...');
  
  http.createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, (err) => {
    if (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error('Failed to prepare Next.js:', err);
  process.exit(1);
});