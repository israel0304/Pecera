# Pecera - Fish Tank Simulator

## Running the App

Open `index.html` in any browser. No build or server required.

## Project Structure

- `index.html` - Entry point with scenario tabs, controls, canvas, and JSXGraph container
- `js/script.js` - Main logic: `Pez`, `Burbuja`, `Pecera`, `Grafica`, `ParticulaAgua` classes
- `css/style.css` - Styling
- `img/` - Fish, tank, solar panel, and pump images

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
- **Pump states:**
  - `V < 4V`: Low current, weak bubbles (1 per frame)
  - `4V ≤ V ≤ 6V`: Optimal range, green status
  - `V > 6V`: Red pulsing glow + pump vibration
  - `V > 10V`: Pump broken — shows `img/bomba_agua_issue.png`, no bubbles, no glow, no vibration
- Red glow: radial gradient with pulsing alpha (0.45±0.2), radius `pumpW * 0.35`
- Vibration: ±3px sinusoidal offset on pump image position
- Bubbles (`ParticulaAgua`): spawned from pump location, size/speed scale with voltage, fewer in low current
- Canvas buffer: fixed 1600×800, CSS `width: 100%` for retina sharpness

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
- Green draggable glider, label shows `U (5.00, 1.50)` with 2 decimals
- Custom axes with ticks every 2 units and grid overlay
- Zoom via mouse wheel or +/- buttons (0.5x–5x)
- **Franjas de colores** (optional, unlocked via secret code `"franjas"`):
  - Azul: 2–4V, Verde: 4–6V, Amarillo: 6–8V, Rojo: 8–10V
  - Verde fuerte horizontal: rango óptimo (y=1–2)
  - Checkbox in HTML controls, code prompted once via modal
  - Implemented as `curve` with `closedCurve: true` (no vertices, no touch interference)

## Navigation & Secret Codes

Navigation order: Pecera → Pecera + Litros → Estanque Sustentable → Estanque + Gráfica → Estanque + Pendiente Variable

| From | To | Code |
|------|----|------|
| Pecera | Pecera + Litros | `litros` |
| Pecera + Litros | Estanque Sustentable | `estanque` |
| Estanque Sustentable | Estanque + Gráfica | `grafica` |
| Estanque + Gráfica | Estanque + Pendiente Variable | `pendiente` |
| Escenario 5 (franjas) | Unlock colored bands | `franjas` |

- Going back never requires a code
- The `"franjas"` code is for the checkbox in escenario 5 (one-time per session modal)

## Fish Behavior
- Fish flee cursor/touch within 200px radius (`velMax=4`, `dir.mul(5)`)
- Fish flee pump when `V > 6` (`velMax=3`)
- Random direction change every ~2 seconds
- Position clamped to water front face bounds via `chocar()`