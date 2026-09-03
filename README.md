# ⚡ Cyberpunk Comic Reader — Visor Interactivo de Cómics

Un lector web moderno, ultra-rápido y con estética Cyberpunk optimizado tanto para lectura en formato **Libro Físico** (spread doble con efecto de profundidad) como en formato **Webtoon** (scroll vertical continuo con zoom infinito y libre).

![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-purple?style=flat-square&logo=vite)
![Design](https://img.shields.io/badge/UI-Cyberpunk%20OLED-00f0ff?style=flat-square)

---

## ✨ Características Principales

### 📜 Modo Webtoon (Scroll Vertical con Zoom Infinito)
- **Carga continua de todo el cómic**: Las páginas fluyen verticalmente sin cortes ni ventanas modales aisladas.
- **Barra flotante Cyberpunk Zoom HUD**:
  - Controles de zoom `+` y `-` en tiempo real.
  - Slider interactivo continuo de **50% a 350%**.
  - Presets instantáneos: *Ajustar al Ancho*, *Lectura Cómoda (850px)*, *100% Real (1600px nativo)* y *Super Zoom (250%)*.
- **Zoom por gestos y atajos**:
  - `Ctrl` / `Cmd` + Rueda del ratón o pellizco en trackpad (*pinch-to-zoom*).
  - Doble clic en cualquier viñeta para ampliar a 175% en ese punto exacto.
  - Atajos de teclado: `+`, `-`, `0`.
- **Desplazamiento bidireccional (Drag-to-pan)**: Al ampliar más allá de la pantalla, arrastra libremente con el ratón o trackpad sin perder la fluidez del scroll vertical.
- **Rendimiento extremo a 60-120 FPS**: Acelerado por hardware con `content-visibility: auto` y decodificación asíncrona de imágenes.

### 📖 Modo Libro Físico
- Spread de doble página realista con lomo central, sombras dinámicas y texturas de papel en ambientación cyberpunk.
- Portada individual y páginas pares/impares perfectamente alineadas.
- Navegación táctil, con botones en pantalla y teclado.

### 🎛️ Herramientas de Interfaz
- **Cajón de miniaturas (Thumbnail Drawer)**: Navegación visual rápida por las páginas con barra de búsqueda y salto instantáneo.
- **Sincronización de progreso**: Guarda automáticamente tu última página leída en `localStorage`.
- **Modo Pantalla Completa**: Pulsa `F` para una inmersión completa.

---

## ⌨️ Atajos de Teclado

| Tecla | Acción |
| :--- | :--- |
| `→` / `D` / `PageDown` / `Espacio` | Página siguiente |
| `←` / `A` / `PageUp` / `Shift + Espacio` | Página anterior |
| `+` o `=` | Acercar zoom (Modo Webtoon) |
| `-` | Alejar zoom (Modo Webtoon) |
| `0` | Ajustar zoom al ancho de pantalla |
| `M` | Alternar entre Modo Libro y Modo Webtoon |
| `T` | Abrir / Cerrar cajón de miniaturas |
| `F` | Pantalla completa |
| `Esc` | Cerrar paneles / modales |

---

## 🚀 Instalación y Uso Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/facundorsabia/Comic-Reader.git
   cd Comic-Reader
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 🛠️ Procesamiento y Conversión de Cómics

Para agregar tus propios cómics a partir de archivos PDF:

1. Coloca tus páginas en formato PDF dentro de la carpeta `raw_pdfs/`.
2. Ejecuta el script de conversión automática:
   ```bash
   npm run convert
   ```
   *El script generará imágenes JPEG web optimizadas (1600px) y miniaturas en `public/comics/`, creando automáticamente el archivo `manifest.json`.*

---

## 🎨 Tecnologías Utilizadas

- **React 19**
- **TypeScript**
- **Vite**
- **Lucide React** (iconografía)
- **Vanilla CSS3** con variables personalizadas y glassmorphism
- **Swift / PDFKit** (script local de procesamiento de PDFs)
