# Pecera - Fish Tank Simulator

## Running the App

Open `landing.html` for the landing page with interactive 3D hero.
Open `index.html` in any browser. No build or server required.

## Project Structure

- `index.html` - Entry point with scenario tabs, controls, canvas, and JSXGraph container
- `landing.html` - Landing page with Three.js 3D neon tetra hero, features, screenshots
- `js/script.js` - Main logic: `Pez`, `Burbuja`, `Pecera`, `Grafica`, `ParticulaAgua`, and Three.js 3D scene classes
- `js/landing.js` - Three.js interactive neon tetra for landing page (aurora particles, glow, mouse follow)
- `js/three.min.js` - Three.js library for 3D fish tank (Escenario 6) and landing page
- `js/OrbitControls.js` - Camera controls for 3D scene
- `css/style.css` - Styling for simulator
- `css/landing.css` - Neon theme, glassmorphism, bento grid for landing page
- `img/` - Fish, tank, solar panel, pump images, and phone screenshots

## UI/UX Design (v1.11.0)

### Material Design Refresh
- CSS custom properties (`--md-*`) for consistent theming
- `.card-control` — elevated cards wrapping each scenario's controls with rounded corners and shadow
- Custom range sliders with colored track (`--md-primary` → `--md-secondary` gradient), 20px thumb
- Buttons: `.btn-primary`, `.btn-success`, `.btn-info`, `.btn-secondary` with Material shadows and hover states
- Ripple effect via JS-injected `.ripple` spans with CSS animation

### Scenario Tabs
- Custom `.scenario-tab` buttons (replacing Bootstrap `.btn-group .btn`)
- States: `.scenario-tab--active` (Material blue, white underline), `.scenario-tab--locked` (dimmed, lock badge, `cursor: not-allowed`)
- Short/long labels via `<span class="d-sm-none">` / `<span class="d-none d-sm-inline">`
- `.tab-badge` showing lock icon for locked scenarios
- Horizontal scroll on mobile with `overflow-x: auto`

### Toast Notifications
- `mostrarToast(mensaje, tipo, duracion)` replaces all `alert()` calls
- Types: `success`, `error`, `warning`, `info` — each with colored left border and background
- Positioned fixed at `bottom: 80px; right: 16px`
- Auto-dismiss with slide-out animation (default 4000ms)
- Container: `<div id="toastContainer">` at bottom of `index.html`

### Navigation Bar (bottom sticky)
- `#navWrap` — fixed at bottom with `backdrop-filter: blur(12px)`, glass effect
- Shows "Siguiente Escenario" button to advance through navigation order
- Centered, responsive padding on mobile

### Tooltips
- `[data-tooltip]` attribute on inputs/buttons shows a native-style tooltip above the element on hover
- Dark background, white text, animated fade/scale

### Modals (secret code)
- Material-styled modal with `.modal-header` colored background
- `.input--error` class on code input triggers shake animation on wrong code
- `#codigoError` message shown on failed attempt

## Key Behavior

### Pecera (Escenario 1)
- Temperature input controls oxygen saturation calculation (cubic function)
- Fish die above 28°C, get sick below 22°C
- Breathing animation via `requestAnimationFrame` loop at end of `script.js`
- JSXGraph plots SO curve in separate container

### Pecera + Litros (Escenario 3)
- Extension of Pecera that adds a "Litros de agua necesaria" checkbox toggle
- Checkbox switches between Oxygen Saturation (SO) and Liters of Water (LA) views
- LA formula: `LA = npeces × tpeces × 3` (liters of water needed per fish)
- JSXGraph plots LA curve (linear, orange) alongside SO controls
- "graficar punto LA" button to mark data points on LA curve

### Estanque Sustentable (Escenario 2)
- Voltage slider (0–12V) controls current (I = V/R, R = 5Ω fixed)
- Solar panel image (`img/panel_solar.png`) and pump image (`img/bomba_agua.png`)
- Water level at 50% of canvas height; shore starts at `w * 0.6`
- Sun brightness, bubble size/speed vary with voltage
- **Cielo dinámico** — Gradiente interpolado con `lerpC()` entre 3 zonas: noche (0V, azul oscuro + 40 estrellas), amanecer/atardecer (4–6V, tonos cálidos), día (12V, azul brillante). Sol con efecto de recorte sobre el fondo
- **Burbujas** — `ParticulaAgua` spawn rate controlado por `bubbleFrameCounter` independiente del frame loop, radio 8–16
- **Pump states:**
  - `V < 4V`: Low current, weak bubbles (1 per frame)
  - `4V ≤ V ≤ 6V`: Optimal range, green status
  - `V > 6V`: Red pulsing glow + pump vibration
  - `V > 10V`: Pump broken — shows `img/bomba_agua_issue.png`, no bubbles, no glow, no vibration
  - En esc5: también se rompe si `I >= 4` (independientemente del voltaje)
- Red glow: radial gradient with pulsing alpha (0.45±0.2), radius `pumpW * 0.35`
- Vibration: ±3px sinusoidal offset on pump image position
- **Bubbles** (`ParticulaAgua`): spawned from pump location, size/speed scale with voltage, fewer in low current
- Canvas buffer: fixed 1600×800, CSS `width: 100%` for retina sharpness
- Estanque canvas uses class `canvas--estanque` → aspect-ratio `3 / 2` (vs `2 / 1` for Pecera)
- Fish flee pump when `V > 6` (`velMax=3`)
- Fish flee cursor/touch within 200px radius (`velMax=4`)
- Fish padding: `paddingIzq` reducido a `canvas.width * 0.07` (peces nadan más cerca del borde izquierdo)

### Estanque + Gráfica (Escenario 4)
- Same as Estanque Sustentable with added JSXGraph plotting I vs V curve
- Curve: `I = V / 5` (R = 5Ω fixed), red line
- Green draggable glider on the curve, label shows `U (5.00, 1.50)` with 2 decimals
- Dragging the glider updates the voltage slider in real time
- Custom axes with ticks every 2 units and grid overlay
- Zoom via mouse wheel or +/- buttons (0.5x–5x)

### Estanque + Pendiente Variable (Escenario 5)
- Same as Estanque Sustentable with adjustable slope curve
- Slope `m` slider (0–5.0, step 0.01) controls `I = m × V`
- `getCorriente()` checks `escenarioActual === 5` and computes `I = m × V` (overrides fixed R=5) 
- Green draggable glider, label shows `U (5.00, 1.50)` with 2 decimals
- Custom axes with ticks every 2 units and grid overlay
- Zoom via mouse wheel or +/- buttons (0.5x–5x)
- **Franjas de colores** (optional, unlocked via secret code `"franjas"`):
  - Azul: 2–4V, Verde: 4–6V, Amarillo: 6–8V, Rojo: 8–10V
  - Verde fuerte horizontal: rango óptimo (y=1–2)
  - Checkbox in HTML controls, code prompted once via modal
  - Implemented as `curve` with `closedCurve: true` (no vertices, no touch interference)
- **Fish flee**: `V > 6` **or** `I > 2` (`velMax=3`) — since current depends on slope m, fish flee when I exceeds 2 regardless of voltage
- **Pump broken**: `V > 10` **or** `I >= 4` (whichever comes first)

### Incremento de Capacidad (Escenario 7)
- Fixed dimensions: L=19, A=18, H=21 (cm/units)
- Three tabs: Ancho, Alto, Largo — each uses the other two fixed dimensions as the capacity factor
- **Capacity factor** = product of the two fixed dimensions / 1000:
  - Ancho: L×H/1000 = 19×21/1000 = **0.399**
  - Alto: L×A/1000 = 19×18/1000 = **0.342**
  - Largo: A×H/1000 = 18×21/1000 = **0.378**
- **Cap₁ = Val₁ × factor**, **Cap₂ = Val₂ × factor** (displayed with 3 decimals)
- **Vertical table** (label | value) with 6 rows: Val₁, Val₂, Cap₁, Cap₂, Δ Ancho, Δ Cap
- All inputs start blank; inputs are borderless and fill 100% of cell width
- **Validación**: user types answers in Δ inputs, clicks "Validar" button per input
  - Each button validates only its corresponding Δ (ΔVal or ΔCap)
  - Tolerance: ±0.01
  - On correct: shows Bootstrap modal + JSXGraph label with the value (`Δ {dim} = X.XX` or `Δ Capacidad = X.XX`)
- **Reiniciar** button clears all inputs, resets graph

#### JSXGraph elements
- **Reference line**: through (V₁, Cap₁) and (V₂, Cap₂) — dynamic slope, gray, strokeWidth 2
- **Horizontal segment**: (V₁, Cap₁) → (V₂, Cap₁), blue, strokeWidth 3
- **Vertical segment**: (V₂, Cap₁) → (V₂, Cap₂), red, strokeWidth 2.5
- **Three red dots**: at (V₁, Cap₁), (V₂, Cap₁), (V₂, Cap₂) — size 3, no labels
- **No grid** on the graph
- Axes with ticks every 2 units
- Zoom via mouse wheel or navigation (no min/max limits)

#### Fish inclusion (optional)
- Checkbox "Incluir peces" enables Cantidad and Tamaño (cm) inputs
- **LA = cantidad × tamaño × 3**
- **Orange point** on graph at `(x, LA)` where `x` is on the reference line
  - `x = V₁ + (LA - Cap₁) / pendiente`
- Point label shows `(x, LA)` with 3 decimals
- **Blue dashed infinite line** at `y = LA` (horizontal reference, extends infinitely)

### Dimensiones 3D (Escenario 6)
- 3D fish tank using Three.js with real-time dimension controls
- Sliders: Largo (1–19, default 19), Ancho (1–18, default 18), Alto (1–21, default 21)
- Semi-transparent glass walls with wireframe edges
- Water volume with animated wave surface (sine/cosine vertex animation)
- 3D fish with custom geometry (body + tail), two-tone neon vertex colors (cyan stripe + red belly), swimming within the tank
- Free camera via OrbitControls (rotate, zoom, pan — touch compatible)
- Local libraries: `js/three.min.js`, `js/OrbitControls.js`
- Collapses (Dimensiones variables / Capacidad Dinámica) appear in a right-side column on PC (`col-md-5`), stacked on mobile
- **Dimensiones variables collapse:** table with tabs (Ancho/Alto/Largo), rows with input + capacity (L), checkbox per row shows semi-transparent highlight volume in tank, different color per row (yellow/cyan/green/pink/purple/orange), dashed edges
- **Capacidad Dinámica collapse:** accordion-locked with Dimensiones variables, two-column comparison table (Valor₁/Valor₂), capacity in liters, difference equation (▲/▼), checkbox per row shows paired highlight volumes in tank
- Slider locking: when either collapse is open, only the slider matching the active tab is enabled; the other two are set to maximum and disabled
- "Reiniciar" button resets both tables to default rows

## Navigation & Secret Codes

Navigation order: Pecera (1) → Pecera + Litros (3) → Dimensiones 3D (6) → Incremento de Capacidad (7) → Estanque Sustentable (2) → Estanque + Gráfica (4) → Estanque + Pendiente Variable (5) → back to Pecera

| From | To | Code (from ESCENARIOS) |
|------|----|------------------------|
| 1 (Pecera) | 3 (Pecera + Litros) | `litros` |
| 3 (Pecera + Litros) | 6 (Dim. 3D) | `capacidad` |
| 6 (Dim. 3D) | 7 (Inc. Capacidad) | `incremento` |
| 7 (Inc. Capacidad) | 2 (Estanque) | `estanque` |
| 2 (Estanque) | 4 (Estanque + Gráfica) | `grafica` |
| 4 (E. + Gráfica) | 5 (E. + Pendiente) | `pendiente` |
| 5 (E. + Pendiente) | 1 (Pecera, bypassed) | `incremento` |
| Escenario 5 (franjas) | Unlock colored bands | `franjas` |

- Every scenario requires its code the **first time** it is visited, regardless of direction (forward, backward, or direct button click)
- Once unlocked, a scenario is freely accessible for the rest of the session
- Codes are case-insensitive and ignore accents and punctuation (e.g., `"Dimensiónes!"` matches `"dimensiones"`)
- The `"franjas"` code is for the checkbox in escenario 5 (one-time per session modal)
- The starting scenario (Escenario 1) is unlocked by default
- Navigation order is defined by `getOrden()` — see script.js for current order

## Mobile Behavior
- **Tabs**: buttons show abbreviated text on `<576px` (Pecera, P+L, 3D, Estanque, E+G, E+P, Inc.Cap) via `d-none/d-sm-none` spans

## Canvas Zoom & Pan (Escenarios 1–5)

- **Mouse wheel:** zoom towards cursor position (range 0.3x–5x)
- **Click & drag:** pan the canvas (hold left button and move)
- **Touch pinch (2 fingers):** zoom towards the midpoint of the touch points
- **Touch drag (2 fingers):** pan the canvas horizontally and vertically
- **Reset:** clicking "Reiniciar" or switching scenarios restores zoom to 1x
- **Fish cursor:** cursor position is correctly mapped to the zoomed/panned canvas so fish flee behavior works at any zoom level
- Implemented via `ctx.save()/translate()/scale()/restore()` in the `actualizar()` render loop, with no changes to existing drawing code
