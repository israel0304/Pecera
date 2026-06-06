# Escenario 3 — Pecera + Nivel (Rediseño)

## Resumen

Rediseño completo del Escenario 3 (Pecera + Litros). Se eliminan las curvas SO/LA del JSXGraph y se reemplazan por una experiencia más visual e interactiva: controles de temperatura y nivel de agua dibujados directamente en el canvas, colores de puntos según tamaño de pez, y línea de nivel de agua en el JSXGraph.

## Layout

```
┌── Canvas ──────────────────────────┐  ┌── JSXGraph ──────────────────┐
│ [═══ 23°C ═══●═══]  SO = 7.23    │  │  LA (L)                      │
│                                   ┃│  │ 200 ─ ─ ─ ─ ● ─ ─ ─ (nivel)│
│                                   ┃│  │          •                  │
│     ~~~~ water surface ~~~~~      ┃│  │ 100   •     •               │
│                                   ┃│  │      •                      │
│       agua azul                   ┃│  │  0 ───────────────────      │
│       🐟🐟🐟  🫧🫧               ┃│  │    0    10    20   N° peces │
│                                   ┃│  └────────────────────────────┘
│                                   ┃│
└───────────────────────────────────┘│
┌── HTML ────────────────────────────┘
│ [n° peces ●═══] [tamaño ●═══]
│ LA = 120 L    [graficar punto LA]
│ [graficar punto]  [Reiniciar]
│ ☐ Visualizar nivel del agua
└────────────────────────────────────
```

## Cambios en `app.html`

- Agregar `id="esc1-temp-col"` al `<div class="col-md">` de temperatura
- Agregar `id="esc1-so-col"` al `<div class="col-md">` de SO
- Eliminar checkbox "Litros de agua necesaria" (`#checkLA` y su label)
- Agregar checkbox "Visualizar nivel del agua" con `id="checkNivelAgua"`
- El JSXGraph `#box` se mantiene, sin cambios estructurales

## Variables nuevas en `js/script.js`

```js
let nivelAgua = 100;              // 0-100%
const aguaCapacidadMax = 200;     // litros
let arrastrandoNivel = false;     // drag water slider
let arrastrandoTemp = false;      // drag temp slider
let mostrarNivelAgua = false;     // checkbox
let esc3CanvasUI = false;         // flag: modo canvas UI activo
```

## Canvas — Controles dibujados (solo escenario 3)

### Slider de temperatura
- Track horizontal, 200px de ancho, centrado en la parte superior del canvas
- Rango: 0–50°C, thumb circular de 14px
- Gradiente de track: azul (0°C) → rojo (50°C)
- Botón play ▶ al lado derecho (dibujado como icono)
- Al arrastrar, actualiza `cajaTemperatura.value` (input HTML oculto) para mantener sincronía con el modelo `Pecera`

### Label de saturación de oxígeno
- Texto `"SO = X.XX"` en bold, junto al slider de temperatura
- Color blanco con sombra para legibilidad sobre el canvas

### Slider de nivel de agua (vertical)
- Track vertical, 180px de alto, 12px desde el borde derecho del canvas
- Rango: 0–100%, thumb circular de 14px
- Fondo translúcido del track con opacidad 0.3
- Valor mostrado como tooltip `"nivel: XX%"` cerca del thumb
- Al arrastrar, actualiza `nivelAgua` y redibuja overlays

### Agua
- Overlay azul semitransparente `rgba(50, 150, 255, 0.35)` desde el fondo del canvas hasta la altura del nivel de agua
- Línea de superficie horizontal en el límite superior del agua, con onda sinusoidal: `Math.sin(x * 0.02 + time * 0.03) * 3`

### Peces y burbujas
- `paddingArr` dinámico = `canvas.height * (100 - nivelAgua) / 100 + offset`
- Si `nivelAgua < 10`: peces no se dibujan, burbujas no se generan
- Si `nivelAgua < 10`: mensaje "Nivel de agua demasiado bajo" centrado en canvas

### Eventos de mouse en canvas
- `mousedown`: detectar si el clic está en el área del temp slider (rect 200×30px, top) o water slider (rect 24×180px, right)
- `mousemove`: si arrastrando, actualizar valor correspondiente
- `mouseup`: soltar arrastre
- `touch` events: análogos para soporte móvil

## JSXGraph (solo escenario 3)

### Ejes
- Eje X: N° de peces (0–30, ticks cada 2)
- Eje Y: LA en litros (0–220, ticks cada 20)
- Grid visible
- Sin límite de zoom

### Puntos
- Color según tamaño del pez actual (variable `cajaSize.value`)
- Misma lógica que hoy: botón "graficar punto" y "graficar punto LA" crean puntos en el board
- Punto SO: `(npeces, saturacion)` — pero ahora eje X es N° peces, no temperatura
- Punto LA: `(npeces, LA)` — mismo que hoy

**Ajuste:** Actualmente el punto SO se grafica como `(temperatura, saturacion)`. Con ejes N° peces vs LA, el punto SO no tiene sentido en este espacio. Propongo que el botón "graficar punto" grafique solo el punto LA `(npeces, LA)`, o que se elimine el botón "graficar punto" y solo quede "graficar punto LA". ¿Validar con el usuario?

### Línea punteada de nivel de agua
- Se muestra/oculta con checkbox `#checkNivelAgua`
- Línea horizontal discontinua en Y = `nivelAgua * 2` (porque 100% × 200L / 100 = 200L, entonces nivel% × 2 = litros)
- Color azul `#3498db`, strokeWidth 2, dash 2
- Label izquierdo `"nivel: X%"`

### Sin curvas SO/LA
- `grafica.curvaSO` no se crea ni se muestra
- `grafica.curvaLA` no se crea ni se muestra

## Colores de puntos (tamaño de pez)

| Tamaño | Color | Hex |
|--------|-------|-----|
| 1 cm | Rojo | `#e74c3c` |
| 2 cm | Naranja | `#e67e22` |
| 3 cm | Amarillo | `#f1c40f` |
| 4 cm | Verde | `#2ecc71` |
| 5 cm | Azul | `#3498db` |
| 6 cm | Púrpura | `#9b59b6` |
| 7 cm | Turquesa | `#1abc9c` |

## Comportamiento al navegar

| Acción | Efecto |
|--------|--------|
| Entrar a escenario 3 | `esc3CanvasUI = true`. DOM: temp y SO se mueven antes del canvas. HTML temp/SO ocultos. Checkbox agua visible |
| Salir de escenario 3 | `esc3CanvasUI = false`. DOM restaurado. HTML temp/SO visibles. Checkbox agua oculto |
| Entrar a escenario 1 | `esc3CanvasUI = false`. DOM restaurado. Sliders peces ocultos (como hoy) |
| Reiniciar esc3 | `nivelAgua = 100`. Temp = 23. Peces = 10, size = 4. Puntos eliminados. Línea de nivel actualizada |

## Archivos afectados

| Archivo | Tipo de cambio |
|---------|---------------|
| `app.html` | IDs en columnas, checkbox nuevo, checkbox LA eliminado |
| `js/script.js` | ~10 bloques: variables, funciones canvas UI, DOM relocation, eventos mouse, render condicional, colores puntos, JSXGraph sin curvas, línea nivel |
| `css/style.css` | Mínimo o ninguno |

## Por validar con el usuario

- Botón "graficar punto" (SO): con ejes N° peces vs LA, este punto no tiene espacio. ¿Eliminarlo y dejar solo "graficar punto LA"?
