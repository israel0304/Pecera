# Pecera - Fish Tank Simulator

## Running the App

Open `index.html` in any browser. No build or server required.

## Project Structure

- `index.html` - Entry point with input forms and JSXGraph container
- `js/script.js` - Main logic: `Pez`, `Burbuja`, `Pecera`, `Grafica` classes
- `css/style.css` - Styling
- `img/` - Fish and tank images (loaded by canvas)

## Key Behavior

- Temperature input controls oxygen saturation calculation
- Fish die above 28°C, get sick below 22°C
- Breathing animation via `requestAnimationFrame` loop at end of `script.js`
- JSXGraph plots SO curve (cubic function) in separate container