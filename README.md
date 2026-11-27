# WOOD-X // 100% Zero-Waste Parametric Furniture & Architectural Studio

**Live Web App (GitHub Pages):** [https://nachomonereo.github.io/zero-waste-woodx/](https://nachomonereo.github.io/zero-waste-woodx/)  
**Languages:** English (`EN`) · Español (`ES`) · Nederlands (`NL`)

WOOD-X es un estudio paramétrico web donde cualquier cliente puede configurar un mueble **100% Zero-Waste** sobre tableros estándar (**122 × 244 cm / `2440 × 1220 mm`**), previsualizar el corte compartido en 2D y el ensamblaje 3D en tiempo real, y enviar el pedido de fabricación (**archivo `.DXF` 1:1 en milímetros + planos interactivos `.HTML` / `.PDF` + especificaciones de material**) directamente a la fábrica (**HERO**).

---

## 1. ¿Dónde cambiar el correo electrónico de la fábrica (HERO)?

El correo de destino de la fábrica está centralizado en **la parte superior de [`app.js`](./app.js) (líneas 7–19)** dentro del objeto `WOODX_CONFIG`:

```javascript
// ============================================================================
// WOOD-X // EDITABLE FACTORY & STUDIO CONFIGURATION (CAMBIA EL CORREO AQUÍ)
// ============================================================================
export const WOODX_CONFIG = {
  // 1. CORREO DE LA FÁBRICA (HERO) — Edita esta línea cuando tengas el email definitivo:
  factoryEmail: 'nacho.monereo@iaac.net',
  factoryName: 'HERO FACTORY',

  // 2. OPCIONES FIJAS DE BROCA / FRESA CNC (en mm) Y ESPESOR POR DEFECTO:
  defaultBitMm: 6,
  allowedBitsMm: [6, 10, 12],
  defaultThicknessMm: 24,

  // 3. TABLERO ESTÁNDAR (122 x 244 cm = 2440 x 1220 mm):
  standardBoard: { L: 2440, W: 1220 }
};
```

Solo tienes que sustituir `'nacho.monereo@iaac.net'` por el nuevo correo en `WOODX_CONFIG.factoryEmail` y hacer `git commit` + `git push`.

---

## 2. Flujo de Industria / Fábrica: ¿Qué pasa si la fábrica corta con otra broca (`6 mm`, `10 mm`, `12 mm`) o cambia el espesor?

Cuando el cliente diseña un mueble y pulsa **SEND TO FACTORY (HERO)**:

1. **Las dimensiones generales del cliente (`W × D × H`) quedan guardadas** en el enlace y en el plano interactivo `.HTML`.
2. **¿Qué ocurre si el cliente dejó la broca en `6 mm`, pero la fábrica decide cortar con fresa de `10 mm` o `12 mm`?**
   - Al cambiar la broca de `6 mm` a `10 mm` o `12 mm`, el motor geométrico de WOOD-X aplica automáticamente:
     - **Offset relativo en cada línea de corte interior compartida (`-K/2` por lado)**: `-3 mm` (broca 6), `-5 mm` (broca 10) o `-6 mm` (broca 12), mientras que el perímetro exterior del tablero (`00_STOCK_BOARD`) mantiene offset `0 mm`.
     - **Pre-compensación de cajas/muescas (`fitCompMode: 'auto_tighten'`)**: los huecos y ranuras interiores se ajustan al espesor real `T` y al offset de la broca para que las espigas entren sin holguras ni colisiones.
     - **Auto-ajuste de juntas 3D**: las piezas ensambladas se reajustan automáticamente para que el mueble encaje al milímetro sin huecos.
3. **¿Cómo puede la fábrica cambiar la broca o editar parámetros al recibir el email?**
   - **Opción A — Desde el archivo `.HTML` interactivo (`wood-x-shop-drawing-...html`)**:
     - Este archivo `.HTML` funciona a la vez como **PDF imprimible de montaje/planos** y como **consola CNC de fábrica**.
     - En su barra superior negra incluye los botones **`BIT 6mm` | `BIT 10mm` | `BIT 12mm`** y **`DOWNLOAD 1:1 CNC .DXF`**.
     - El archivo `.HTML` lleva **incrustados los 3 archivos `.DXF` 1:1 (`6 mm`, `10 mm`, `12 mm`)**, por lo que el operario de fábrica puede cambiar la broca en un clic, ver cómo se actualizan las medidas de ejecución en la tabla y descargar al instante el `.DXF` exacto para su máquina CNC (sin siquiera necesitar conexión a internet).
   - **Opción B — Desde los enlaces directos del Email**:
     - El correo que recibe la fábrica incluye enlaces directos de 1 clic para abrir el proyecto con **Bit 6 mm**, **Bit 10 mm**, **Bit 12 mm**, o abrirlo en el **Estudio 3D/2D completo** (donde la fábrica también puede ajustar el espesor real del tablero `T` si el lote de madera mide, por ejemplo, `18 mm` o `25 mm` en vez de `24 mm`, y descargar el nuevo `.DXF`).

---

## 3. Framework para crear una Nueva Línea de Diseño Zero-Waste (A Mano o con IA)

Toda línea de diseño en WOOD-X sigue una arquitectura matemática muy limpia en [`app.js`](./app.js).  
Para añadir un nuevo mueble (por ejemplo, `desk`, `bench`, `bed`, etc.) solo intervienen **4 puntos en `app.js`** y **1 botón en `index.html`**:

### Arquitectura de una Tipología Zero-Waste en `app.js`

Cada mueble es una función generadora `build<Nombre>Pieces(L, W, T)` que devuelve:
1. **`pieces`**: Array de piezas que **particionan exactamente el rectángulo del tablero `[-L/2, +L/2] × [-W/2, +W/2]` sin desperdicio (100% Zero-Waste)** mediante líneas de corte compartidas.
2. **`summaryDims`**: Dimensiones exteriores ensambladas `{ width, depth, height, primaryHeight }`.

Cada objeto `piece` dentro del array `pieces` tiene esta estructura estándar:

```javascript
{
  id: 'part_01',
  name: 'Tabletop Panel',
  role: 'Primary horizontal surface',
  color: SWISS_PALETTE[0],

  // 1. GEOMETRÍA 2D EN EL TABLERO (Coordenadas en mm, origen [0,0] en el centro del tablero [-L/2..+L/2, -W/2..+W/2])
  points2D: [
    [-L / 2, -W / 2],
    [ L / 2, -W / 2],
    [ L / 2,  W / 2],
    [-L / 2,  W / 2]
  ],
  holes2D: [], // Opcional: array de polígonos cerrados [[x,y], ...] para cajas/mortajas pasantes

  // 2. TRANSFORMACIÓN 3D ENSAMBLADA (Coordenadas en mm, suelo Y = 0)
  assembled: {
    pivot2D: [0, 0],         // Punto [x, y] de la pieza en el tablero 2D que actúa como pivote local
    pos3D: [0, 740, 0],      // Posición [X, Y, Z] de ese pivote en el mueble 3D ensamblado (Y es vertical, suelo Y=0)
    uAxis: [1, 0, 0],        // Vector unitario 3D hacia donde apunta el eje +X local del tablero 2D
    vAxis: [0, 0, 1]         // Vector unitario 3D hacia donde apunta el eje +Y local del tablero 2D
    // (El eje del espesor T se calcula automáticamente como wAxis = uAxis × vAxis)
  }
}
```

> **Nota importante sobre el CNC y los planos:**  
> No tienes que programar manualmente el offset de la fresa CNC, ni la exportación `.DXF`, ni las 4 plantas arquitectónicas (`02.1` a `02.4`), ni las 2 secciones verticales (`D-D` y `E-E`). El motor de WOOD-X los calcula **automáticamente** a partir de `points2D` y `assembled: { pivot2D, pos3D, uAxis, vAxis }`.

---

### Los 4 pasos para registrar una nueva línea de diseño

1. **Parámetros por defecto (`state.params.<nuevaTipologia>` en `app.js`)**:
   Define los valores iniciales en milímetros (preferiblemente múltiplos compatibles con el tablero estándar `2440 × 1220 mm`).
2. **Metadatos y Sliders (`TYPOLOGY_CONFIG.<nuevaTipologia>` en `app.js`)**:
   Define el título y los sliders (`key`, `label`, `min`, `max`, `step`, `unit`) más la función `computeBoardSize(p, T)` que devuelve `{ L, W }`.
3. **Función Generadora (`build<NuevaTipologia>Pieces(L, W, T)` en `app.js`)**:
   Crea las piezas `points2D` que rellenan el tablero `L × W` y sus vectores `assembled` (`pivot2D`, `pos3D`, `uAxis`, `vAxis`).
4. **Selector (`buildActiveTypologyPieces` en `app.js` y pestaña `<button class="type-btn" data-type="<nuevaTipologia>">` en `index.html`)**:
   Añade el `case '<nuevaTipologia>':` en `buildActiveTypologyPieces` y su traducción en `I18N` (`en`, `es`, `nl`).

---

## 4. Plantilla de Prompt para generar Nuevas Líneas de Diseño con IA

Si quieres pedirle a una IA (Antigravity, Gemini, Claude, ChatGPT, etc.) que diseñe e implemente una nueva línea de muebles en este repositorio, copia y pega este prompt:

```markdown
Quiero añadir una nueva línea de diseño 100% Zero-Waste al repositorio WOOD-X (`index.html` y `app.js`).

### Descripción del nuevo mueble:
- Nombre / Tipología: [EJ: Escritorio con caballetes encastrados / Banco modular / Cama tatami]
- Tablero base: Estándar 2440 × 1220 mm (o submúltiplo exacto 1220 × 1220 mm)
- Sliders de diseño para el usuario (máximo 3 o 4, nombres cortos): [EJ: Width, Depth, Height]
- Idea de partición Zero-Waste del tablero: [EJ: El sobre sale de la franja central y las 4 patas trapezoidales salen de las 4 esquinas compartiendo línea de corte diagonal]

### Reglas técnicas de WOOD-X que debes respetar:
1. El tablero 2D está centrado en `[0, 0]` y abarca `x ∈ [-L/2, +L/2]` e `y ∈ [-W/2, +W/2]`.
2. Las piezas (`points2D`) deben particionar el rectángulo `L × W` al 100% mediante líneas de corte interiores compartidas (0% desperdicio; toda línea interior divide dos piezas contiguas).
3. En 3D (`assembled`), el plano del suelo es `Y = 0` (`+Y` hacia arriba, `+X` ancho izquierda-derecha, `+Z` fondo atrás-adelante).
4. Cada pieza define:
   - `id`, `name`, `role`, `color: SWISS_PALETTE[i % SWISS_PALETTE.length]`
   - `points2D`: array de vértices `[x, y]` en sentido antihorario (puedes usar `rectPoly(x0, y0, x1, y1)` o `roundPolygonCorners(pts, radius, 5)`).
   - `holes2D`: opcional para muescas cerradas.
   - `assembled`: `{ pivot2D: [cx, cy], pos3D: [X, Y, Z], uAxis: [ux, uy, uz], vAxis: [vx, vy, vz] }` donde `uAxis` y `vAxis` son vectores unitarios ortogonales.
5. Registra la nueva tipología en:
   - `state.params.<id>`
   - `I18N.en.tabs`, `I18N.es.tabs`, `I18N.nl.tabs` y `I18N.<lang>.sliders`
   - `TYPOLOGY_CONFIG.<id>`
   - `buildActiveTypologyPieces(L, W, T)`
   - Añade el botón `<button class="type-btn" data-type="<id>">` en `#typologyTabs` dentro de `index.html`.
```
