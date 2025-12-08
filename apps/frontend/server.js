// Disable SSL verification for self-signed certificates in development
// This must be set BEFORE any modules that use TLS are loaded
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { createServer } = require('https');
const { createServer: createHttpServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const https = require('https');

// Also set the global agent to reject unauthorized false for self-signed certs
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
  https.globalAgent.options.rejectUnauthorized = false;
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);
const useHttps = process.env.USE_HTTPS === 'true';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  let server;

  if (useHttps) {
    const sslKeyPath = process.env.SSL_KEY_PATH || './certs/server.key';
    const sslCertPath = process.env.SSL_CERT_PATH || './certs/server.crt';

    if (!fs.existsSync(sslKeyPath) || !fs.existsSync(sslCertPath)) {
      console.error('❌ SSL certificates not found!');
      console.error(`   Key: ${sslKeyPath}`);
      console.error(`   Cert: ${sslCertPath}`);
      console.error('   Run generate-ssl.bat to create self-signed certificates.');
      process.exit(1);
    }

    const httpsOptions = {
      key: fs.readFileSync(sslKeyPath),
      cert: fs.readFileSync(sslCertPath),
    };

    server = createServer(httpsOptions, async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    });

    console.log('🔒 Frontend running in HTTPS mode');
  } else {
    server = createHttpServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    });

    console.log('🔓 Frontend running in HTTP mode');
  }

  server.listen(port, hostname, () => {
    const protocol = useHttps ? 'https' : 'http';
    console.log(`🚀 Frontend ready on ${protocol}://${hostname}:${port}`);
  });
});
