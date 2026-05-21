# Pecera - Fish Tank Simulator

## Running the App

Open `index.html` in any browser. No build or server required.

## Project Structure

- `index.html` - Entry point with scenario tabs, controls, canvas, and JSXGraph container
- `js/script.js` - Main logic: `Pez`, `Burbuja`, `Pecera`, `Grafica`, `ParticulaAgua` classes
- `css/style.css` - Styling
- `img/` - Fish, tank, solar panel, and pump images

## Key Behavior

### Escenario 1: Pecera
- Temperature input controls oxygen saturation calculation (cubic function)
- Fish die above 28°C, get sick below 22°C
- Breathing animation via `requestAnimationFrame` loop at end of `script.js`
- JSXGraph plots SO curve in separate container

### Escenario 2: Estanque Sustentable
- Voltage slider (0–50V) controls current (I = V/R, R = 5Ω fixed)
- Solar panel image (`img/panel_solar.png`) and pump image (`img/bomba_agua.png`)
- Water level at 50% of canvas height; shore starts at `w * 0.6`
- Sun brightness, bubble size/speed vary with voltage
- **Pump states:**
  - `I < 2A`: Low current, weak bubbles
  - `2A ≤ I ≤ 8A`: Optimal range, green status
  - `I > 8A`: Red pulsing glow + pump vibration
  - `V ≥ 50V`: Pump broken — shows `img/bomba_agua_issue.png`, no bubbles, no glow, no vibration
- Red glow: radial gradient with pulsing alpha (0.45±0.2), radius `pumpW * 0.35`
- Vibration: ±3px sinusoidal offset on pump image position
- Bubbles (`ParticulaAgua`): spawned in pairs from pump location, size/speed scale with voltage
- Canvas buffer: fixed 1600×800, CSS `width: 100%` for retina sharpness