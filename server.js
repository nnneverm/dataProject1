#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3030;
const DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  try {
    urlPath = decodeURIComponent(urlPath);
  } catch (_) {
    res.writeHead(400);
    res.end('Bad Request: invalid URL encoding');
    return;
  }

  if (urlPath === '/') {
    urlPath = '/asset-management.html';
  }

  const filePath = path.join(DIR, urlPath);

  // 安全检查：防止路径穿越
  if (!filePath.startsWith(DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${urlPath}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  数据资产管理系统 - 原型预览服务');
  console.log('  ─────────────────────────────────');
  console.log(`  本地地址：http://localhost:${PORT}`);
  console.log('');
  console.log('  按 Ctrl+C 停止服务');
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用，请用 PORT=其他端口 node server.js 重试`);
  } else {
    console.error('服务器错误：', err.message);
  }
  process.exit(1);
});
