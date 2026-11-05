# SVG Motion Studio Pro v4.0 🎨⚡

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version: v4.0 Studio Suite](https://img.shields.io/badge/Version-v4.0%20Studio%20Suite-38bdf8.svg)](#)
[![Live Demo](https://img.shields.io/badge/App-GitHub%20Pages-brightgreen.svg)](https://bofersilo.github.io/SVGmotion/)
[![Docs: Manual Técnico](https://img.shields.io/badge/Docs-Manual%20T%C3%A9cnico-d49b5b.svg)](https://bofersilo.github.io/SVGmotion/docs.html)
[![CI/CD: GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF.svg)](.github/workflows/deploy.yml)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success.svg)](#)
[![VEXP Ready](https://img.shields.io/badge/VEXP-Integrated-blueviolet.svg)](#)

> 🌐 **App en vivo:** [https://bofersilo.github.io/SVGmotion/](https://bofersilo.github.io/SVGmotion/)  
> 📚 **Manual Técnico & Recetas:** [https://bofersilo.github.io/SVGmotion/docs.html](https://bofersilo.github.io/SVGmotion/docs.html)

**SVG Motion Studio Pro v4.0** es una suite profesional de herramientas para diseñar, optimizar, secuenciar y exportar gráficos vectoriales SVG con animaciones CSS puras (`@keyframes`). Totalmente autocontenida, sin dependencias externas de ejecución (Vanilla JS + CSS moderno) y con pipeline automatizado de despliegue continuo en GitHub Pages.

---

## 🌟 Novedades de la Versión v4.0 Studio Suite

### 1. 🌊 Secuenciación en Cascada Multicapa (Stagger Engine)
- Orquesta composiciones donde los elementos del vector se animan secuencialmente.
- Control deslizante de retardo entre capas (*Stagger Delay*) de `20ms` a `400ms`.
- Aplica dinámicamente `animation-delay: calc(var(--stagger-idx) * delay)` respetando el orden del árbol DOM.
- El código exportado inyecta las variables CSS para mantener la coreografía idéntica en cualquier navegador.

### 2. 🎨 Gestor de Color y Paleta Reactiva (Color Tokens & Swapper)
- Escaneo automático de atributos `fill`, `stroke` y estilos inline en el vector activo.
- Panel interactivo con selectores de color `<input type="color">` para reemplazar tonos en tiempo real.
- Opción para compilar el SVG exportado con **Variables CSS** (`:root { --color-token-*: ... }`), facilitando el cambio de temas claro/oscuro desde la aplicación anfitriona.

### 3. 🧹 Limpiador y Optimizador SVG Integrado (Client-side Cleaner)
- Optimización con un solo clic directamente en el navegador:
  - Purga de metadatos de autor (`<metadata>`, comentarios XML, atributos de Illustrator, Inkscape, Figma).
  - Redondeo y simplificación de coordenadas en `path` (a 2 decimales).
  - Normalización y cálculo de `viewBox` para prevenir recortes al escalar.
  - Medición instantánea con badge visual del porcentaje de peso ahorrado.

### 4. 📦 Suite de Exportación Universal (8 Formatos Nativos)
Exporta con un solo clic en cualquiera de los siguientes formatos:
1. **SVG Standalone (`.svg`)**: Archivo SVG 100% autónomo con `@keyframes` y estilos embebidos.
2. **Sprite Symbol (`.svg`)**: Bloque `<symbol>` reutilizable mediante `<use href="#id"/>`.
3. **Componente React (`.jsx`)**: Componente funcional con props y soporte de `IntersectionObserver` para Scroll Reveal.
4. **Componente Vue 3 SFC (`.vue`)**: Plantilla `<template>` y bloque `<style scoped>` listo para Vite/Nuxt.
5. **Componente Svelte 5 (`.svelte`)**: Componente reactivo con paso de propiedades limpias (`$props`).
6. **Web Component Nativo (`.js`)**: Clase que extiende de `HTMLElement` con Shadow DOM, compatible con WordPress o HTML clásico sin compilador.
7. **Componente Astro (`.astro`)**: Componente para Astro con script de cliente para revelado progresivo.
8. **Snippet CSS Puro (`.css`)**: Hoja de estilos con la regla `@keyframes` y los selectores objetivo.

### 5. 💾 Portabilidad y Respaldo de Presets (JSON Backup)
- **Exportar JSON**: Descarga una copia de seguridad con todas tus animaciones personalizadas guardadas.
- **Importar JSON**: Restaura y combina presets locales con validación automática de estructura.

### 6. 📚 Manual Técnico Exhaustivo (`docs.html`)
- Página de documentación independiente con diseño profesional oscuro.
- Incluye guías paso a paso, arquitectura cero dependencias, recetas de integración por framework y tutoriales para crear nuevos keyframes.

### 7. 💎 Isotipo Vectorial de Prueba (Isometric Tech Core)
- Vector geométrico moderno integrado (`💎 Isotipo Isometric Core`) compuesto por 9 facetas poligonales independientes (`#facet-top`, `#facet-left`, `#facet-right`, `#facet-inner-glow`, `#core-diamond`, `#core-sphere`, `#accent-wing-top`, `#accent-wing-left`, `#accent-wing-right`) en tonos cian (`#38bdf8`), índigo (`#6366f1`) y dorado (`#f59e0b`).
- Diseñado para probar de forma inmediata la **Secuenciación en Cascada (Stagger)**, el **Intercambiador de Color (Swapper)** y la selección de **Capas Individuales**.

---

## ⚡ Modos de Disparo (Animation Triggers)

- **🔄 Bucle Infinito (Loop)**: Ejecución cíclica continua (`infinite`).
- **👆 Al hacer Hover (:hover)**: Pausado en reposo, se activa al colocar el cursor sobre el elemento.
- **▶️ Entrada Única (Once / Forwards)**: Se ejecuta una vez al cargar (`1 normal forwards`) manteniendo el estado final, con botón `↺ Repetir` para pruebas.
- **📜 Scroll Reveal (In-View)**: Se activa cuando el elemento entra en el viewport del usuario mediante `IntersectionObserver`.

---

## 🎭 Catálogo de Efectos Nativos

| Categoría | Efecto | Descripción |
| :--- | :--- | :--- |
| **Sutiles & Trazado** | `breathe` | Respiración suave con escalado y sombra reactiva |
| | `heartbeat` | Pulso cardíaco rítmico en doble fase |
| | `float` | Flotación vertical suave con ligera inclinación |
| | `glow` | Resplandor pulsante neón de alta intensidad |
| | `strokeDraw` | Trazado progresivo de líneas con cálculo dinámico `getTotalLength()` |
| **Llamadas a la Acción (CTA)** | `rubberBand` | Efecto elástico de goma estirable |
| | `tada` | Celebración festiva con rotación y escala |
| | `jello` | Movimiento de gelatina tambaleante |
| | `swing` | Péndulo oscilante |
| | `wobble` | Desplazamiento lateral elástico |
| | `popIn` | Entrada elástica con rebote |
| **Espaciales & 3D** | `rotate3d` | Giro completo 360° en perspectiva 3D (estilo moneda) |
| | `tilt3d` | Inclinación isométrica tipo Parallax |
| **Custom** | `custom_*` | Animaciones CSS personalizadas con persistencia y respaldo JSON |

---

## 🚀 Inicio Rápido

### Uso en Línea
Accede a la suite directamente en:  
👉 **[https://bofersilo.github.io/SVGmotion/](https://bofersilo.github.io/SVGmotion/)**

### Uso Local
```bash
git clone https://github.com/bofersilo/SVGmotion.git
cd SVGmotion

# Windows
start index.html

# Mac / Linux
open index.html # o xdg-open index.html
```

---

## 🌐 Despliegue en GitHub Pages & Configuración

El proyecto incluye integración continua automatizada mediante GitHub Actions en [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### Pasos para Activar el Despliegue en GitHub:
1. **Visibilidad del Repositorio**:
   - En GitHub, dirígete a **Settings** > **General** > **Danger Zone** > **Change repository visibility**.
   - Asegúrate de que el repositorio sea **Public** (GitHub Pages con GitHub Actions es gratuito en repositorios públicos; si es privado requiere plan GitHub Pro / Enterprise).
2. **Origen de Despliegue en GitHub Pages**:
   - Ve a **Settings** > **Pages**.
   - En la sección **Build and deployment**:
     - En **Source**, selecciona **`GitHub Actions`** (no *Deploy from a branch*).
3. **Despliegue Continuo con Cada Push**:
   - Con cada `git push` a la rama `main`, la GitHub Action ejecutará automáticamente el flujo de trabajo:
     - Permisos explícitos: `contents: read`, `pages: write`, `id-token: write`.
     - Empaquetado y subida del artefacto web.
     - Publicación inmediata en `https://<tu-usuario>.github.io/SVGmotion/`.

---

## 🦊 Compatibilidad Multi-Navegador

La aplicación ha sido auditada y optimizada para garantizar compatibilidad completa en navegadores modernos:
- **Mozilla Firefox (Gecko)**: Inicialización protegida en `DOMContentLoaded`, aislamiento estricto de tags de scripts dentro de generadores de plantillas (`<\/script>`), gestión precisa de `pointer-events` (impidiendo que capas decorativas intercepten clics), y delegación de eventos (`e.target.closest`) en selectores, presets y pestañas.
- **Google Chrome / Microsoft Edge / Brave (Chromium)**: Fluidez a 60-120 FPS con aceleración de GPU (`will-change: transform`).
- **Apple Safari (WebKit)**: Soporte completo para transformaciones SVG con `transform-box: fill-box; transform-origin: center center;`.
- **Portapapeles Seguro**: Doble capa de copiado con `navigator.clipboard.writeText()` y fallback transparente mediante elemento `textarea` y `document.execCommand('copy')`.

---

## 🧠 Integración con VEXP

Este repositorio cuenta con soporte de primer nivel para **VEXP** (Graph-RAG de contexto para agentes de IA):

- [`.vexp/`](.vexp/): Índice de símbolos, cobertura y hooks de ciclo de vida del repositorio.
- [`AGENTS.md`](AGENTS.md): Instrucciones operativas y directrices para agentes inteligentes.
- [`.claude/`](.claude/) y [`.codex/`](.codex/): Hooks para asistencia contextual guiada.

Para verificar y reindexar con VEXP:
```bash
vexp index
vexp doctor
```

---

## 📁 Estructura del Proyecto

```text
SVGmotion/
├── .github/
│   └── workflows/
│       └── deploy.yml         # CI/CD: Despliegue automático a GitHub Pages
├── .claude/                   # Hooks e instrucciones para Claude Code
├── .codex/                    # Hooks e instrucciones para Codex
├── .vexp/                     # Configuración de indexación Graph-RAG VEXP
├── index.html                 # Aplicación principal v4.0 Studio Suite
├── docs.html                  # Manual técnico & guía de referencia
├── svg-motion-studio-pro.html # Copia sincronizada del estudio
├── AGENTS.md                  # Directrices para agentes inteligentes
├── LICENSE                    # Licencia MIT
├── README.md                  # Documentación v4.0 Studio Suite
└── .gitignore                 # Configuración de exclusiones Git
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia [MIT](LICENSE). Libre para uso personal y comercial.
