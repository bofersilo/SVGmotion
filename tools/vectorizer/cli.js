#!/usr/bin/env node
/**
 * SVGmotion Vectorizer - Interfaz de Linea de Comandos (CLI)
 * Uso:
 *   node cli.js -i imagen.png -o salida.svg [opciones]
 *
 * Opciones:
 *   -i, --input <ruta>        Ruta del archivo raster de entrada (PNG, JPG, WEBP)
 *   -o, --output <ruta>       Ruta del archivo SVG de salida (opcional, default: output/<name>.svg)
 *   -e, --engine <nombre>     Motor de vectorizacion: 'vtracer' (defecto) o 'potrace'
 *   -c, --colors <num>        Numero maximo de colores cuantizados (2-16, defecto: 8)
 *   -m, --mode <modo>         Modo de trazado: 'spline' (suave) o 'polygon' (geometrico)
 *   -s, --speckle <num>       Filtro de ruido en pixeles (defecto: 4)
 *   -t, --corner <num>        Umbral de esquinas (defecto: 60)
 *   -h, --help                Muestra esta ayuda
 */

const fs = require('fs');
const path = require('path');
const engine = require('./engine.js');

function parseArgs(args) {
  const options = {
    engine: 'vtracer',
    maxColors: 8,
    mode: 'spline',
    filterSpeckle: 4,
    cornerThreshold: 60
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-i' || arg === '--input') {
      options.input = args[++i];
    } else if (arg === '-o' || arg === '--output') {
      options.output = args[++i];
    } else if (arg === '-e' || arg === '--engine') {
      options.engine = args[++i];
    } else if (arg === '-c' || arg === '--colors') {
      options.maxColors = parseInt(args[++i], 10);
    } else if (arg === '-m' || arg === '--mode') {
      options.mode = args[++i];
    } else if (arg === '-s' || arg === '--speckle') {
      options.filterSpeckle = parseInt(args[++i], 10);
    } else if (arg === '-t' || arg === '--corner') {
      options.cornerThreshold = parseInt(args[++i], 10);
    } else if (arg === '-h' || arg === '--help') {
      options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
\x1b[36m=====================================================\x1b[0m
\x1b[34m  ⚡ SVGmotion Vectorizer CLI\x1b[0m
\x1b[36m=====================================================\x1b[0m
Uso:
  node cli.js -i <imagen.png> [-o <salida.svg>] [opciones]

Argumentos principales:
  -i, --input <ruta>        Archivo rasterizado de entrada (.png, .jpg, .webp) [Obligatorio]
  -o, --output <ruta>       Destino del SVG resultante (opcional)

Opciones de ajuste fino:
  -e, --engine <nombre>     'vtracer' (color/multicapa) o 'potrace' (silueta 1 tinta) (default: vtracer)
  -c, --colors <num>        Numero de colores cuantizados (2-16, default: 8)
  -m, --mode <modo>         'spline' (curvas suaves Bézier) o 'polygon' (lineas rectas)
  -s, --speckle <num>       Filtro de ruido/manchas pequeñas en px (default: 4)
  -t, --corner <num>        Umbral de suavizado de esquinas (default: 60)
  -h, --help                Muestra esta guia
`);
}

async function run() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help || !options.input) {
    showHelp();
    if (!options.help && !options.input) {
      console.error('\x1b[31mError: Debes especificar el archivo de entrada con -i o --input\x1b[0m');
      process.exit(1);
    }
    process.exit(0);
  }

  const inputPath = path.resolve(options.input);
  if (!fs.existsSync(inputPath)) {
    console.error(`\x1b[31mError: No existe el archivo "${inputPath}"\x1b[0m`);
    process.exit(1);
  }

  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = options.output
    ? path.resolve(options.output)
    : path.join(__dirname, 'output', `${baseName}.svg`);

  console.log(`\x1b[34m[Vectorizando]\x1b[0m ${inputPath}`);
  console.log(` Motor: \x1b[36m${options.engine}\x1b[0m | Colores: \x1b[33m${options.maxColors}\x1b[0m | Modo: \x1b[35m${options.mode}\x1b[0m`);

  try {
    const buffer = fs.readFileSync(inputPath);
    const t0 = Date.now();
    const result = await engine.vectorize(buffer, options);
    const elapsed = Date.now() - t0;

    // Asegurar directorio destino
    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(outputPath, result.svg, 'utf8');

    console.log(`\x1b[32m✔ SVG generado con exito en ${elapsed}ms!\x1b[0m`);
    console.log(`  └─ Archivo: \x1b[32m${outputPath}\x1b[0m`);
    console.log(`  └─ Dimensiones: ${result.width}x${result.height}px`);
    console.log(`  └─ Capas detectadas: ${result.layersCount}`);
    console.log(`  └─ Paleta extraida: ${result.palette.join(', ') || 'N/A'}`);
    console.log(`  └─ Peso resultante: ${(result.sizeBytes / 1024).toFixed(1)} KB`);
  } catch (err) {
    console.error(`\x1b[31mError en la vectorizacion:\x1b[0m`, err);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };
