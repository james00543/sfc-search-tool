const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'dist');
const API_TARGET = 'http://10.16.137.111';

const getContentType = (filePath) => {
    const extname = path.extname(filePath);
    switch (extname) {
        case '.js': return 'text/javascript';
        case '.css': return 'text/css';
        case '.json': return 'application/json';
        case '.png': return 'image/png';
        case '.jpg': return 'image/jpg';
        case '.svg': return 'image/svg+xml';
        case '.html': return 'text/html';
        default: return 'application/octet-stream';
    }
};

const server = http.createServer((req, res) => {
    // PROXY HANDLER
    if (req.url.startsWith('/SFCAPI')) {
        const options = {
            hostname: '10.16.137.111',
            port: 80,
            path: req.url,
            method: req.method,
            headers: req.headers
        };

        // Remove host header to avoid confusing the target server
        delete options.headers.host;

        const proxyReq = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        proxyReq.on('error', (e) => {
            console.error(`Proxy error: ${e.message}`);
            res.writeHead(500);
            res.end('Proxy Error');
        });

        req.pipe(proxyReq, { end: true });
        return;
    }

    // STATIC FILE HANDLER
    let safePath = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/') safePath = '/index.html';

    let filePath = path.join(PUBLIC_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            if (path.extname(safePath) === '') {
                fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err, content) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Error loading index.html');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content);
                    }
                });
            } else {
                res.writeHead(404);
                res.end('Not found');
            }
        } else {
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Server Error');
                } else {
                    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
                    res.end(content);
                }
            });
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Proxying /SFCAPI to ${API_TARGET}`);
});
