# Pecera - Fish Tank Simulator

## Running the App

Open `index.html` for the landing page with interactive 3D hero.
Open `app.html` in any browser for the simulator. No build or server required.

## Project Structure

- `index.html` - Landing page with Three.js 3D neon tetra hero, features, screenshots, splash preloader
- `app.html` - Simulator with scenario tabs, controls, canvas, and JSXGraph container
- `js/script.js` - Main logic: `Pez`, `Burbuja`, `Pecera`, `Grafica`, `ParticulaAgua`, and Three.js 3D scene classes
- `js/landing.js` - Three.js interactive neon tetra for landing page (aurora particles, glow, mouse follow)
- `js/splash.js` - Splash preloader: Three.js tank outline, BoxGeometry water fill, neon tetra fish, particles, bubbles, GSAP timeline
- `js/three.min.js` - Three.js library for 3D fish tank (Escenario 6), landing page, and splash
- `js/OrbitControls.js` - Camera controls for 3D scene
- `css/style.css` - Styling for simulator
- `css/landing.css` - Neon theme, glassmorphism, bento grid for landing page
- `img/` - Fish, tank, solar panel, pump images, and phone screenshots (species skins: `pez-neon-todos.png`, `pez-neon-todos-mx.png`, `pez-neon-todos-br.png`)

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
- Positioned fixed at `top: 16px; right: 16px`
- Auto-dismiss with slide-out animation (default 4000ms)
- Container: `<div id="toastContainer">` at bottom of `app.html`

### Species System (v1.14.0)
- `ESPECIES` array (`script.js:38-42`) with 3 species: `default` (Alternativo, `pez-neon-todos.png`), `mx` (Selección Mexicana, `pez-neon-todos-mx.png`), `br` (Selección Brasileña, `pez-neon-todos-br.png`)
- `Pez(t, especieId)` constructor accepts `especieId` as second param; fallback to `'default'` if falsy
- `generarPeces(n, t, especies)` replaces `generar()` for fish:
  - **Array** of IDs: distributes evenly (e.g., `['mx','br']` with n=4 → `['mx','mx','br','br']`)
  - **Object** `{id: count}`: exact counts per species
  - **Falsy/omitted**: all `'default'`
- Old `generar(obj, n, param)` still used for `Burbuja` only
- `this.image.src` loaded from `especie.skin` per fish instance
- 3D fish (`crearPez3D`) do NOT use species system — hardcoded neon vertex colors

### Scenario Lifecycle (`alEntrar` / `alSalir`)
Each scenario in `ESCENARIOS` (`script.js:1585-1774`) can define:
- `alEntrar()` — called when entering the scenario. Sets up UI, graphs, fish, 3D scene
- `alSalir()` — cleanup when leaving. Resets transient state variables to prevent cross-scenario leaks (e.g., `particulasEsc2`, `sunWaveProgress`, `pumpBroken`, `esc3CanvasUI`, `nivelAguaLine`)

### Key Functions
| Function | Location | Purpose |
|----------|----------|---------|
| `cambiarEscenario(n)` | `:1807` | Central switch: calls `prevCfg.alSalir()`, `limpiarGrafica()`, toggles UI visibility, canvas/graph CSS classes, cleans Three.js, resets zoom, calls `cfg.alEntrar()` |
| `navegar(dir)` | `:2545` | Navigate forward/backward in `getOrden()`; shows code modal if destination locked |
| `navegarA(destino)` | `:2579` | Navigate directly to a scenario number (tab click); same unlock check |
| `getOrden()` | `:2525` | Returns `[1, 3, 6, 7, 2, 4, 5]` — canonical navigation order |
| `getSiguiente(n)` / `getAnterior(n)` | `:2529-2537` | Next/previous in `getOrden()` |
| `desbloquearTab(n)` | `:1798` | Removes `scenario-tab--locked` class, enables button, clears badge |
| `normalizarCodigo(str)` | `:2539` | Case/accent/punctuation-insensitive normalization (NFD decomposition) |
| `obtenerCodigos()` | `:2569` | Builds `"from→to"` → `"code"` map from `ESCENARIOS` for code validation |
| `actualizar()` | `:570` | Main `requestAnimationFrame` loop: clears canvas, applies zoom/pan transforms, dispatches per-scenario render |
| `restablecerZoom()` | `:2645` | Resets `zoomScale=1`, `panX=0`, `panY=0`, touch/mouse state |
| `screenToBuffer(clientX, clientY)` | `:2625` | Converts screen coords to buffer coords accounting for zoom/pan |
| `alerta()` | `:553` | Kills all fish (`vivir=false`), shows warning toast |
| `enfermar()` | `:560` | Sets all living fish to `salud='enfermo'` |
| `resucitarPez()` | `:495` | Revives all dead fish, randomizes direction |
| `toggleTempPlay()` | `:833` | Toggles auto temperature ramp (→50°C, +1/500ms) |
| `makeEditable(spanId, computeValue, slider, min, max)` | `:1855` | Inline editable V/I values in escenarios 2/4/5 |
| `mostrarToast(mensaje, tipo, duracion)` | `:538` | Toast notification system (types: success, error, warning, info) |

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
- Extension of Pecera that integrates **canvas-drawn controls** alongside JSXGraph
- On enter, hides HTML temperature/SO controls and shows `esc3CanvasUI = true`
- **Canvas temperature slider** — horizontal, top area, blue gradient track, range 10–50°C, white circular thumb with floating `XX°C` label
- **Canvas water level slider** — vertical, right edge, 0–100%, blue track, `XX L` floating label (liters = level × 2)
- **Water overlay** — semi-transparent blue fill `rgba(52,152,219,0.3)` drawn at water level height
- **Fish behavior**: if water level < fish height and LN > L, fish show `sinAgua` sprite; death on critically low water
- Drag support: mouse (mousedown/mousemove/mouseup) and touch (touchstart/touchmove/touchend, 1 finger)
- LA formula: `LA = npeces × tpeces × 3` (liters of water needed per fish)
- Checkbox "Visualizar nivel del agua" shows horizontal reference line at `y = nivelAgua × 2` on graph
- JSXGraph plots LA curve (linear, orange) alongside SO curve
- "graficar punto LA" button to mark data points on LA curve
- `alSalir`: sets `esc3CanvasUI = false`, resets `muertePorAgua`, restores HTML controls visibility

### Estanque Sustentable (Escenario 2)
- Voltage slider (0–12V) controls current (I = 0.3V, pendiente fija)
- **Valores V/I editables inline**: al hacer clic/touch en `V = X.XX` o `I = X.XX`, se reemplaza el texto con un `<input type="number" class="inline-edit-value">` (borderless, transparente, sin spin buttons). Editar V mueve el slider; editar I invierte la fórmula para calcular V
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
- Curve: `I = 0.3V` (pendiente fija), red line
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
- **Dimensiones variables collapse:** table with tabs (Ancho/Alto/Largo), rows with input + capacity (L), wrapped in `.table-responsive`, checkbox per row shows semi-transparent highlight volume in tank, different color per row (yellow/cyan/green/pink/purple/orange), dashed edges
- **Capacidad Dinámica collapse:** accordion-locked with Dimensiones variables, two-column comparison table (Valor₁/Valor₂), capacity in liters, difference equation (▲/▼), checkbox per row shows paired highlight volumes in tank, wrapped in `.table-responsive`
- **Collapse UI design:** Material-style accordion with `.collapse-group-wrap` (border, radius), `.collapse-toggle` (flex, `border-left: 3px solid var(--md-primary)`, background `var(--md-primary-surface)`), animated chevron SVG that rotates 180° on expand, hint text below toggle on desktop (`d-none d-md-block`), smooth transitions
- **Scrollbar visibility:** Custom `::-webkit-scrollbar` styles on desktop (`min-width: 768px`) for `.table-responsive` — 8px thumb with `var(--md-border)` color, visible independent of macOS scrollbar settings
- **Chevron pulse animation:** `.collapse-chevron--pulse` with `@keyframes pulse-chevron` (scale 1→1.25→1→1.15→1, 2 cycles) triggered via JS on entering escenario 6
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

## Splash Preloader (index.html)

- Triggered on click of any "Abrir Simulador" / "Comenzar Simulación" link (all `href="app.html"`)
- 5-second duration: overlay fade-in (0.4s), water fill to 95% (4.5s, `power2.inOut`), blackout at 4.2s (1.5s, `power3.inOut`), redirect on complete
- **Tank:** 60% of viewport size, square, 2D outline with Three.js lines at Z=0
- **Water:** BoxGeometry with Y-scale driven by GSAP fillProgress, waves on top-face vertices only (vertical Y displacement, amplitude 0.025+0.015, clamped to +0.03)
- **Fish:** Custom geometry (body + tail), two-tone neon vertex colors (cyan + red), scale = TANK_W * 0.1, swim range adjusts with water level
- **Particles:** 200 bioluminescent points, spawn range X: TANK_W * 0.85, Z: TANK_W * 0.06, clamped to ±TANK_W*0.45 (X) / ±TANK_W*0.06 (Z), reset at both TANK_H/2 and -TANK_H/2
- **Bubbles:** 80 translucent spheres, spawn range X: TANK_W * 0.55, Z: TANK_W * 0.04, clamped to ±TANK_W*0.3 (X) / ±TANK_W*0.04 (Z), rise speed scales with size
- **Text:** "Preparando acuario" with animated dots cycling every 400ms via `setInterval`
- **Decoupling:** GSAP tweens a `state.progress` object; Three.js render loop reads `fillProgress` each frame
- **Z-index:** `#splash-overlay` at 9999 covers hero scene during preloader

## PWA

### Manifest
- Static `manifest.json` referenced directly via `<link rel="manifest" href="./manifest.json">` on both `index.html` and `app.html`
- Relative URLs resolve correctly against the manifest location (same directory)
- Icons: 144x144, 192x192 (standard), 512x512 (maskable)

### Service Worker
- **Registered on both pages**: `index.html` (inline script) and `app.html` (via `js/script.js:3361-3366`)
- **Dynamic scope**: uses `PECERA_BASE` from `window.location.pathname.replace()` for subdirectory support
- **Fetch filter**: only intercepts HTTP(S) requests via `event.request.url.startsWith('http')` to avoid `chrome-extension://` errors
- Caches HTML, CSS, JS, images on install; stale-while-revalidate on fetch

### iOS Support
- `<meta name="apple-mobile-web-app-capable" content="yes">` — full-screen mode on iOS
- `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- `<meta name="mobile-web-app-capable" content="yes">` — Android/Chrome compatibility
- `<link rel="apple-touch-icon" href="./img/icon-192.png">`

### Install Prompt
- `beforeinstallprompt` event listener on both pages captures the install prompt
- "Instalar App" button (hidden by default) appears in nav (`index.html`) and bottom bar (`app.html`) when the browser fires the event
- Chrome on Android requires: HTTPS, valid manifest, active service worker on the current page, and user engagement

## Hotfixes

### Current formula consistency in Estanque scenarios (2026-06-12)

**Problem:** `getCorriente()` used `V / R` (R=5Ω, i.e. I=0.2V) for escenarios 2 and 4, but the JSXGraph curve in escenario 4 plotted `I = 0.3V`. The display showed `V/5` while the graph showed `0.3V` — inconsistent.

Additionally, state variables (`particulasEsc2`, `sunWaveProgress`, `cometProgress`, `cometCooldown`, `bubbleFrameCounter`, `pumpBroken`) leaked across scenario switches since escenarios 2/4/5 had no `alSalir` cleanup.

**Fix** (`js/script.js:1033-1039`):
- Changed `getCorriente()` to return `0.3 * V` instead of `V / R` for escenarios 2 and 4 (escenario 5 still uses `m * V`)
- Added `alSalir` handlers to escenarios 2, 4, and 5 resetting all transient state

### Esc7 graph width on mobile (2026-05-29)

**Problem:** JSXGraph's `resizeContainer()` sets an inline `style.width` (px) on `#box7`, overriding the CSS `width: 100%`. On mobile, if `box7.clientWidth` is read before the flex layout settles, the graph renders at an incorrect narrow width.

**Fix** (`js/script.js:961-962`):
- Clear `box7.style.width` before reading `clientWidth` so the value reflects CSS `width: 100%`
- Pass third argument `true` to `board7.resizeContainer()` so JSXGraph doesn't re-set the inline width

**Mobile height** (`css/style.css:816-817`):
- Increased `#box7` mobile `max-height` from 180px → 282px, `min-height` from 100px → 150px for a taller graph

### Inline editable V/I values (2026-06-12)

**Problem:** Users had to drag the voltage slider to change V or I values precisely — no direct numeric input was available for V or I in escenarios 2, 4, and 5.

**Fix** (`js/script.js:1821-1862`, `css/style.css:879-897`):
- Added reusable `makeEditable(spanId, computeVoltage)` function that replaces a `<span>` with an inline `<input type="number">` on click/touch
- Added `makeEditable('voltVal', ...)` — clamps value to [0, 12] and updates the voltage slider
- Added `makeEditable('corrVal', ...)` — reverse-computes voltage from current: `V = I / 0.3` for esc2/4, `V = I / m` for esc5 (escenario 5 uses `mSlider.value` for the slope)
- Added `.inline-edit-value` CSS class: borderless, transparent background, no spin buttons, inherits parent font/color/size to appear seamless with surrounding text
- Created input is removed on blur, Enter (confirms), or Escape (discards)

## feature/mundial — Versión Mundialista

Rama temporal (`feature/mundial`) con temática futbolera. **No está en `main`** — conservada para actualizaciones futuras.
Tag de referencia: `mundial-2026`.

### Assets (img/)
| Archivo | Descripción |
|---------|-------------|
| `pez-neon-todos-kr.png` | Skin Corea |
| `soccer-ball.png` | Balón de fútbol |
| `soccer-goal.png` | Portería |
| `soccer-stadium.png` | Silueta de estadio |

### Soccer Ball
- Flota en la superficie del estanque (oscilación senoidal en Y)
- Los peces MX empujan el balón hacia la derecha; los KR hacia la izquierda
- Gol en portería izquierda (x < 7% ancho): anota KR
- Gol en portería derecha (x > 60% ancho): anota MX
- Al marcar gol: `golPausa = 300` (~5s), 32 fuegos artificiales, reubicación de peces y balón

### Fireworks
- 32 fuegos artificiales simultáneos por gol
- Tipos: classic, dual, crackle, willow, ring
- Visibles tanto de día como de noche (render fuera del bloque `if (V === 0)`)

### Scoreboard
- Formato `"MX X - X KR"` en esquina superior derecha del canvas
- Sin acumulación de puntos (siempre 0-0)

### Branches
- `feature/mundial` — rama activa para desarrollo mundialista
- Tag `mundial-2026` — punto de referencia permanente
