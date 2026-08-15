const http = require('http');
const httpProxy = require('http-proxy');

// آدرس و پورت سرور اصلی خود را مشخص کنید
const TARGET_HOST = process.env.TARGET_HOST || '84.245.19.88'; // آی‌پی یا دامنه سرور
const TARGET_PORT = process.env.TARGET_PORT || '8080';            // پورت سرور
const TARGET_PROTOCOL = process.env.TARGET_PROTOCOL || 'http';   // پروتکل (http یا https)

const proxy = httpProxy.createProxyServer({
  target: `${TARGET_PROTOCOL}://${TARGET_HOST}:${TARGET_PORT}`,
  ws: true, // فعال‌سازی اجباری پشتیبانی از WebSocket برای VLESS
  changeOrigin: true
});

// مدیریت خطاها برای جلوگیری از کرش کردن برنامه
proxy.on('error', (err, req, res) => {
  console.error('Proxy Error:', err.message);
  if (res && res.writeHead) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy Error: ' + err.message);
  }
});

const server = http.createServer((req, res) => {
  proxy.web(req, res);
});

// هدایت اتصالات WebSocket (بخش اصلی کانفیگ VLESS WS)
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

// Render پورت را به صورت خودکار در متغیر محیطی PORT قرار می‌دهد
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

