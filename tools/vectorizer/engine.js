/**
 * SVGmotion Vectorizer Engine
 * Modulo local de vectorizacion PNG/JPG/WEBP a SVG optimizado
 * con soporte para vtracer (color y capas) y potrace (silueta monocromo).
 */

const vtracer = require('@visioncortex/vtracer');
const potrace = require('potrace');

/**
 * Sanitiza y prepara un SVG para compatibilidad total con SVG Motion Studio Pro:
 * - Asegura viewBox limpio
 * - Asigna identificadores legibles correlativos (id="layer-color-X")
 * - Extrae estadisticas de capas y paleta unica
 * - Limpia cabeceras XML y comentarios residuales
 */
function sanitizeSvg(rawSvg, options = {}) {
  const prefix = options.idPrefix || 'layer-color';
  let clean = rawSvg
    .replace(/<\?xml.*?\?>/gi, '')
    .replace(/<!DOCTYPE.*?>/gi, '')
    .replace(/<!--[\s\S]*?-->/gi, '')
    .trim();

  // Extraer dimensiones
  let width = 0;
  let height = 0;

  const wMatch = clean.match(/width=["']([\d.]+)["']/i);
  const hMatch = clean.match(/height=["']([\d.]+)["']/i);
  const vbMatch = clean.match(/viewBox=["']\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*["']/i);

  if (vbMatch) {
    width = parseFloat(vbMatch[3]);
    height = parseFloat(vbMatch[4]);
  } else if (wMatch && hMatch) {
    width = parseFloat(wMatch[1]);
    height = parseFloat(hMatch[1]);
  }

  // Garantizar viewBox
  if (!/viewBox=/i.test(clean) && width > 0 && height > 0) {
    clean = clean.replace(/<svg\b([^>]*)>/i, (m, attrs) => {
      return `<svg${attrs} viewBox="0 0 ${width} ${height}">`;
    });
  }

  // Asignar IDs correlativos a paths y elementos graficos que no tengan ID
  let layerIdx = 1;
  const palette = new Set();

  clean = clean.replace(/<(path|polygon|rect|circle|g)\b([^>]*)>/gi, (match, tag, attrs) => {
    // Extraer fill para estadisticas de paleta
    const fillMatch = attrs.match(/fill=["']([^"']+)["']/i);
    if (fillMatch && !['none', 'transparent', 'currentColor'].includes(fillMatch[1].toLowerCase())) {
      palette.add(fillMatch[1].toUpperCase());
    }

    if (/id=["'][^"']+["']/i.test(attrs)) {
      return match;
    }
    const newId = `${prefix}-${layerIdx++}`;
    return `<${tag} id="${newId}"${attrs}>`;
  });

  return {
    svg: clean,
    width,
    height,
    layersCount: layerIdx - 1,
    palette: Array.from(palette),
    sizeBytes: Buffer.byteLength(clean, 'utf8')
  };
}

/**
 * Vectoriza un buffer de imagen con vtracer (Modo Color y Capas)
 */
async function vectorizeVtracer(buffer, options = {}) {
  const vtracerOpts = {
    preset: options.preset || 'poster',
    clustering: options.clustering || 'color-cluster',
    hierarchical: options.hierarchical || 'stacked',
    mode: options.mode || 'spline', // 'spline' o 'polygon'
    maxColors: Number(options.maxColors) || 8,
    filterSpeckle: Number(options.filterSpeckle) || 4,
    cornerThreshold: Number(options.cornerThreshold) || 60,
    simplify: options.simplify !== undefined ? Number(options.simplify) : 1.0,
    optimize: options.optimize !== undefined ? Number(options.optimize) : 1
  };

  if (options.palette && Array.isArray(options.palette) && options.palette.length > 0) {
    vtracerOpts.palette = options.palette;
  }

  const uint8 = new Uint8Array(buffer);
  const rawSvg = vtracer.convertBuffer(uint8, vtracerOpts);
  return sanitizeSvg(rawSvg, { idPrefix: 'layer-color' });
}

/**
 * Vectoriza un buffer de imagen con potrace (Modo Silueta / Monocromo)
 */
function vectorizePotrace(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const potraceOpts = {
      color: options.color || '#0f172a',
      threshold: options.threshold !== undefined ? Number(options.threshold) : potrace.Potrace.THRESHOLD_AUTO,
      turdSize: Number(options.filterSpeckle) || 2,
      optCurve: options.mode !== 'polygon',
      optTolerance: options.optTolerance ? Number(options.optTolerance) : 0.2
    };

    if (options.posterize) {
      potrace.posterize(buffer, { steps: Number(options.maxColors) || 4, ...potraceOpts }, (err, rawSvg) => {
        if (err) return reject(err);
        resolve(sanitizeSvg(rawSvg, { idPrefix: 'layer-silhouette' }));
      });
    } else {
      potrace.trace(buffer, potraceOpts, (err, rawSvg) => {
        if (err) return reject(err);
        resolve(sanitizeSvg(rawSvg, { idPrefix: 'layer-silhouette' }));
      });
    }
  });
}

/**
 * Funcion de vectorizacion unificada
 */
async function vectorize(buffer, options = {}) {
  const engine = options.engine || 'vtracer';
  if (engine === 'potrace') {
    return vectorizePotrace(buffer, options);
  }
  return vectorizeVtracer(buffer, options);
}

module.exports = {
  vectorize,
  vectorizeVtracer,
  vectorizePotrace,
  sanitizeSvg
};
