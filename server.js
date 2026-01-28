// Simple HTTP server to serve the PWA frontend on port 8080
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
    // Parse the URL
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

    // Get the file extension
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Read and serve the file
    fs.readFile(filePath, (err, data) => {
        if (err) {
            // If file not found, serve index.html (for SPA routing)
            if (err.code === 'ENOENT') {
                fs.readFile(path.join(__dirname, 'index.html'), (indexErr, indexData) => {
                    if (indexErr) {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('404: File not found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(indexData);
                    }
                });
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500: Internal Server Error');
            }
        } else {
            // Set cache headers
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
            });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n📱 Production Log PWA Frontend Server`);
    console.log(`🚀 Running on http://localhost:${PORT}`);
    console.log(`\n⚠️  Make sure backend is running on http://localhost:5000`);
    console.log(`\nPress Ctrl+C to stop server\n`);
});
