/**
 * SVGmotion Vectorizer - Watcher Service (Modalidad A)
 * Supervisa la carpeta input/ y convierte cualquier imagen depositada
 * en un SVG sanitizado listo para SVG Motion Studio en output/
 */

const fs = require('fs');
const path = require('path');
const engine = require('./engine.js');

const INPUT_DIR = path.join(__dirname, 'input');
const OUTPUT_DIR = path.join(__dirname, 'output');
const SUPPORTED_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.bmp']);

// Evitar procesamiento multiple por eventos duplicados de fs.watch
const processingFiles = new Set();
const debounceTimers = new Map();

function log(msg) {
  const time = new Date().toLocaleTimeString();
  console.log(`\x1b[36m[${time}] [SVGmotion Watcher]\x1b[0m ${msg}`);
}

async function processFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (!SUPPORTED_EXTS.has(ext)) return;

  const inputPath = path.join(INPUT_DIR, filename);
  if (!fs.existsSync(inputPath)) return;

  const baseName = path.basename(filename, ext);
  const outputPath = path.join(OUTPUT_DIR, `${baseName}.svg`);

  if (processingFiles.has(filename)) return;
  processingFiles.add(filename);

  try {
    log(`Procesando archivo entrante: \x1b[33m${filename}\x1b[0m...`);
    const buffer = fs.readFileSync(inputPath);
    if (buffer.length === 0) {
      processingFiles.delete(filename);
      return;
    }

    const t0 = Date.now();
    const result = await engine.vectorize(buffer, {
      engine: 'vtracer',
      mode: 'spline',
      maxColors: 8,
      filterSpeckle: 4,
      cornerThreshold: 60
    });
    const elapsed = Date.now() - t0;

    fs.writeFileSync(outputPath, result.svg, 'utf8');
    log(`\x1b[32m✔ Completado con éxito en ${elapsed}ms:\x1b[0m`);
    log(`  └─ Destino: \x1b[35moutput/${baseName}.svg\x1b[0m`);
    log(`  └─ Dimensiones: ${result.width}x${result.height}px | Capas: ${result.layersCount}`);
    log(`  └─ Paleta: ${result.palette.join(', ') || 'N/A'}`);
    log(`  └─ Tamaño: ${(result.sizeBytes / 1024).toFixed(1)} KB`);
  } catch (err) {
    console.error(`\x1b[31m[Error procesando ${filename}]:\x1b[0m`, err.message);
  } finally {
    setTimeout(() => processingFiles.delete(filename), 1000);
  }
}

function startWatcher() {
  if (!fs.existsSync(INPUT_DIR)) fs.mkdirSync(INPUT_DIR, { recursive: true });
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('\x1b[34m=====================================================\x1b[0m');
  console.log('\x1b[36m  ⚡ SVGmotion Vectorizer - Watcher Activo (Modalidad A)\x1b[0m');
  console.log('\x1b[34m=====================================================\x1b[0m');
  console.log(`📁 Supervisando: \x1b[33m${INPUT_DIR}\x1b[0m`);
  console.log(`📁 Guardando en: \x1b[32m${OUTPUT_DIR}\x1b[0m`);
  console.log('Formatos admitidos: .png, .jpg, .jpeg, .webp, .bmp');
  console.log('Arrastra una imagen a la carpeta input/ para vectorizarla al instante.');
  console.log('Presiona Ctrl+C para detener el servicio.\n');

  // Procesar archivos existentes en input/
  const existingFiles = fs.readdirSync(INPUT_DIR);
  existingFiles.forEach(file => {
    if (file !== '.gitkeep' && SUPPORTED_EXTS.has(path.extname(file).toLowerCase())) {
      processFile(file);
    }
  });

  fs.watch(INPUT_DIR, (eventType, filename) => {
    if (!filename || filename === '.gitkeep') return;
    if (debounceTimers.has(filename)) {
      clearTimeout(debounceTimers.get(filename));
    }
    debounceTimers.set(
      filename,
      setTimeout(() => {
        debounceTimers.delete(filename);
        processFile(filename);
      }, 300)
    );
  });
}

if (require.main === module) {
  startWatcher();
}

module.exports = { startWatcher, processFile };
