# SVGmotion Vectorizer Studio ⚡🎨
> Herramienta local de vectorización profesional (PNG/JPG/WEBP a SVG) para desarrollo en **SVGmotion**.

---

## 🎯 Propósito y Aislamiento

Esta herramienta está concebida como un **módulo de apoyo interno en local** para transformar activos gráficos rasterizados (bocetos, capturas, logotipos en mapa de bits) en código SVG optimizado, multicapa y listo para animar.

### 🛡️ Aislamiento Total de Producción
- **Cero impacto en producción:** La carpeta `/tools/vectorizer/` cuenta con su propio `package.json` y `node_modules/` independiente.
- **Exclusión en Git:** La carpeta raíz del repositorio y el despliegue estático de GitHub Pages (`index.html`) se mantienen en **0 dependencias externas**.
- Las carpetas temporales `input/` y `output/` están ignoradas en [`.gitignore`](../../.gitignore).

---

## 🧠 Motores de Vectorización Integrados

| Motor | Especialidad | Características clave |
| :--- | :--- | :--- |
| **vtracer** (`@visioncortex/vtracer`) | **Color y Multicapa** | Extrae curvas Bézier / Spline agrupadas por color. Genera trazados independientes con identificación limpia de capas (`id="layer-color-X"`), perfectos para el **Inspector de Capas**, **Stagger** y **Color Swapper**. |
| **potrace** (`potrace`) | **Siluetas / 1 Tinta** | Máxima precisión matemática para logotipos monocromos, firmas e iconos vectoriales puros. |

### 🧹 Saneamiento Automático para SVG Motion Studio
Cada SVG procesado pasa por una rutina de saneamiento nativa (`engine.js`):
1. **Normalización de `viewBox`:** Calcula y garantiza dimensiones escalables sin deformación.
2. **Asignación de IDs:** Inyecta identificadores secuenciales legibles (`id="layer-color-1"`, `id="layer-color-2"`...) en cada nodo `<path>` y `<polygon>`.
3. **Limpieza de Metadatos:** Purga cabeceras XML, `<!DOCTYPE>` y comentarios de generadores.

---

## 🚀 Instalación y Puesta en Marcha

### Requisitos Previos
- **Node.js:** v18 o superior (probado en v22+).
- **npm:** v9 o superior.

### Instalación de Dependencias Locales
```bash
cd tools/vectorizer
npm install
```

---

## 💻 Modos de Uso

### 1. Modalidad B: Micro-UI Web Local (Recomendada)
Inicia un servidor local mínimo con interfaz visual reactiva en modo oscuro:

```bash
npm start
# o también:
npm run ui
```

- Abre en tu navegador: **`http://localhost:3333`**
- **Funcionalidades de la interfaz:**
  - 📥 **Drag & Drop:** Arrastra cualquier archivo `.png`, `.jpg`, `.jpeg` o `.webp`.
  - 🎛️ **Presets:** *Logo Vector Art*, *Icono Monocromo*, *Ilustración Rica* o *Geométrico Poligonal*.
  - 🎚️ **Controles en Vivo:** Número de colores (2-16), modo de trazado (Spline vs. Polígono), filtro de ruido y suavizado de esquinas.
  - 👁️ **Comparativa Triple:** Vista previa vectorial, imagen ráster original y código XML generado.
  - 📋 **Acciones Inmediatas:** Copiar SVG al portapapeles, descargar archivo `.svg` o guardar directamente en `output/`.
  - 🚀 **Abrir en SVG Motion Studio:** Un clic transfiere el SVG vectorizado al estudio principal (`http://localhost:3333/studio` o `index.html`) listo para animar.

> **Nota:** Al ejecutar `npm start`, el servidor también activa el **Watcher en segundo plano** de la carpeta `input/`.

---

### 2. Modalidad A: Carpeta Supervisada (Drop & Watcher)
Si prefieres un flujo basado exclusivamente en carpetas:

```bash
npm run watch
```

1. Arrastra cualquier imagen (`.png`, `.jpg`, `.webp`) a la carpeta:  
   `tools/vectorizer/input/`
2. El watcher detectará el archivo al instante, lo vectorizará y guardará el SVG saneado en:  
   `tools/vectorizer/output/<nombre-archivo>.svg`

---

### 3. Modalidad C: Línea de Comandos (CLI)
Para vectorizaciones puntuales o scripts automatizados:

```bash
# Vectorización básica con motor vtracer a color
node cli.js -i ./input/logo.png -o ./output/logo.svg

# Ajuste fino: 6 colores, curvas spline y filtro de manchas pequeñas
node cli.js -i mi-icono.png -e vtracer -c 6 -m spline -s 5

# Vectorización monocromo con potrace
node cli.js -i firma.png -e potrace -o ./output/firma.svg
```

#### Parámetros Disponibles en CLI:
- `-i, --input <ruta>`: Archivo rasterizado de entrada (*Obligatorio*).
- `-o, --output <ruta>`: Ruta del archivo SVG generado (default: `output/<nombre>.svg`).
- `-e, --engine <nombre>`: `vtracer` (color) o `potrace` (silueta).
- `-c, --colors <num>`: Cuantización de color (2 a 16, default: `8`).
- `-m, --mode <modo>`: `spline` (curvas suaves) o `polygon` (aristas rectas).
- `-s, --speckle <num>`: Filtro de ruido en píxeles (default: `4`).
- `-t, --corner <num>`: Umbral de curvatura en esquinas (default: `60`).

---

## 🎨 Integración con SVG Motion Studio Pro

Los vectores generados son reconocidos inmediatamente por todas las herramientas avanzadas del estudio principal:

1. **Inspector de Capas (`#layerSelect`):** Cada color es un elemento independiente con selector específico.
2. **Cascada Multicapa (`🌊 Stagger`):** Las capas se animan secuencialmente en el orden DOM con desfase en milisegundos.
3. **Gestor de Paleta (`🎨 Color Swapper`):** Detecta los tonos hex cuantizados y permite sustituirlos en caliente o exportarlos como Variables CSS.
4. **Trazado de Líneas (`✍️ Stroke Draw`):** Calcula automáticamente las curvas Bézier para dibujar los contornos progresivamente.

---

## 📁 Estructura del Módulo

```text
tools/vectorizer/
├── input/             # Carpeta de entrada para el watcher (.gitignore)
├── output/            # Carpeta de salida con los SVGs generados (.gitignore)
├── public/            # Interfaz de usuario web local (Micro-UI)
│   └── index.html     # Aplicación cliente dark-mode en Vanilla JS
├── engine.js          # Motor unificado de vectorización y saneamiento
├── server.js          # Servidor HTTP nativo Node.js (Micro-UI + API)
├── watcher.js         # Servicio supervisor de la carpeta input/
├── cli.js             # Herramienta de línea de comandos
├── package.json       # Dependencias y scripts de ejecución
└── README.md          # Esta documentación
```
