/**
 * SVGmotion Vectorizer - Servidor Local Micro-UI & Watcher (Modalidad B)
 * Servidor HTTP nativo en Node.js (cero dependencias externas para el servidor)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const engine = require('./engine.js');
const { startWatcher } = require('./watcher.js');

const PORT = process.env.PORT || 3333;
const PUBLIC_DIR = path.join(__dirname, 'public');
const INPUT_DIR = path.join(__dirname, 'input');
const OUTPUT_DIR = path.join(__dirname, 'output');
const REPO_ROOT = path.resolve(__dirname, '..', '..');

// Asegurar directorios
if (!fs.existsSync(INPUT_DIR)) fs.mkdirSync(INPUT_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Limite 50MB para imagenes grandes
      if (body.length > 50 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload demasiado grande (limite 50MB)'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // 1. API: Vectorizar Imagen
  if (url.pathname === '/api/vectorize' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      if (!data.image) {
        return sendJson(res, 400, { error: 'Falta el campo "image" con datos en Base64' });
      }

      // Decodificar Base64
      let base64Data = data.image;
      if (base64Data.includes('base64,')) {
        base64Data = base64Data.split('base64,')[1];
      }
      const buffer = Buffer.from(base64Data, 'base64');

      const options = {
        engine: data.engine || 'vtracer',
        maxColors: data.maxColors ? parseInt(data.maxColors, 10) : 8,
        mode: data.mode || 'spline',
        filterSpeckle: data.filterSpeckle !== undefined ? parseInt(data.filterSpeckle, 10) : 4,
        cornerThreshold: data.cornerThreshold !== undefined ? parseInt(data.cornerThreshold, 10) : 60,
        color: data.color || '#0f172a',
        posterize: !!data.posterize
      };

      const t0 = Date.now();
      const result = await engine.vectorize(buffer, options);
      const elapsed = Date.now() - t0;

      return sendJson(res, 200, {
        success: true,
        elapsedMs: elapsed,
        svg: result.svg,
        width: result.width,
        height: result.height,
        layersCount: result.layersCount,
        palette: result.palette,
        sizeBytes: result.sizeBytes
      });
    } catch (err) {
      console.error('[API /api/vectorize Error]:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 2. API: Guardar SVG en output/
  if (url.pathname === '/api/save' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      if (!data.svg) return sendJson(res, 400, { error: 'Falta el campo "svg"' });

      const name = (data.name || `vector-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${name}.svg`;
      const filePath = path.join(OUTPUT_DIR, filename);

      fs.writeFileSync(filePath, data.svg, 'utf8');
      return sendJson(res, 200, { success: true, filename, path: `output/${filename}` });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 3. API: Estado general
  if (url.pathname === '/api/status' && req.method === 'GET') {
    const inputFiles = fs.readdirSync(INPUT_DIR).filter(f => f !== '.gitkeep');
    const outputFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f !== '.gitkeep');
    return sendJson(res, 200, {
      status: 'active',
      engines: ['vtracer', 'potrace'],
      inputFilesCount: inputFiles.length,
      outputFilesCount: outputFiles.length
    });
  }

  // 4. Enlace directo a la app principal SVG Motion Studio (/studio)
  if (url.pathname === '/studio' || url.pathname === '/studio/') {
    const studioHtml = fs.readFileSync(path.join(REPO_ROOT, 'index.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(studioHtml);
  }

  // 5. Servir la Micro-UI Local (/ o /index.html)
  let filePath = path.join(PUBLIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.json': 'application/json'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log('\x1b[34m=====================================================\x1b[0m');
  console.log('\x1b[36m  ⚡ SVGmotion Vectorizer Studio (Local Dev Tool)\x1b[0m');
  console.log('\x1b[34m=====================================================\x1b[0m');
  console.log(`🚀 Servidor Micro-UI: \x1b[32mhttp://localhost:${PORT}\x1b[0m`);
  console.log(`🎨 Enlace a Studio:   \x1b[35mhttp://localhost:${PORT}/studio\x1b[0m`);
  console.log(`📁 Carpeta Entrada:   \x1b[33m${INPUT_DIR}\x1b[0m`);
  console.log(`📁 Carpeta Salida:    \x1b[33m${OUTPUT_DIR}\x1b[0m`);
  console.log('\nIniciando watcher de carpeta en segundo plano...');
  startWatcher();
});
