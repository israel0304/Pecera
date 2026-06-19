# UX/UI Redesign — Pecera Simulator

**Date:** 2026-05-26
**Approach:** B — Material Design + Componentes
**Phase:** 1 (UI/UX), Phase 2 (modularization) deferred

## Scope

Redesign the visual appearance and user experience of the Pecera fish tank simulator while keeping the existing HTML structure and JavaScript logic intact. This is a **CSS + markup + UX enhancement only** — no JS logic changes, no modularization.

## Color Palette (Material Acuática)

| Token | Value | Usage |
|-------|-------|-------|
| `--md-primary` | `#0d47a1` | Tabs activos, botones primarios, headers |
| `--md-primary-light` | `#1565c0` | Hovers, focus states |
| `--md-secondary` | `#00bfa5` | Badges, success states, gráficas |
| `--md-accent` | `#ff8f00` | Advertencias, estado "óptimo" |
| `--md-error` | `#d32f2f` | Errores, peces muertos, sobrecalentamiento |
| `--md-surface` | `#ffffff` | Cards, fondos de panel |
| `--md-surface-variant` | `#f5f7fa` | Fondo de página |
| `--md-on-surface` | `#1a1a2e` | Texto principal |
| `--md-on-surface-muted` | `#5f6368` | Texto secundario |
| `--md-shadow` | `rgba(0,0,0,0.08)` | Sombras |

## Layout

### Desktop (>768px)

```
┌──────────────────────────────────────────────────────┐
│  [Pecera] [P+L] [3D] [Inc.Cap] [Estanque] ...  ← Tabs│
├───────────────────────────┬──────────────────────────┤
│                           │                          │
│      CANVAS / 3D          │      JSXGraph            │
│      (border-radius:      │      (rounded, shadow)   │
│       12px, shadow)       │                          │
│                           │                          │
├───────────────────────────┤                          │
│  Controles en tarjetas    │                          │
│  (elevación sutil)        │                          │
└───────────────────────────┴──────────────────────────┘
│  [← Atrás]                         [Continuar →]     │
│         Barra inferior sticky                        │
└──────────────────────────────────────────────────────┘
```

### Mobile (<768px)

- Canvas/3D ocupa todo el ancho
- Controles en cards apiladas debajo del canvas
- JSXGraph en fila aparte (o colapsable)
- Tabs en scroll horizontal con texto corto
- Barra inferior sticky con botones compactos

## Componentes

### 1. Tabs de navegación rediseñados

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Pecera  │ │  P+L     │ │  3D 🔒   │ │  Inc.Cap │ ...
│  ─────── │ │          │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

- **Card-tab**: padding 10px 16px, border-radius 8px, transición suave
- **Active**: fondo primary (`#0d47a1`), texto blanco, underline animado (3px, `::after`)
- **Bloqueado**: opacidad 0.45, badge 🔒, cursor not-allowed
- **Disponible**: outline sutil, hover con sombra
- **Mobile**: scroll horizontal con `overflow-x: auto`, texto truncado
- **Transición**: active tab underline se desliza con `transition: all 0.3s`

### 2. Cards de control

Cada sección de controles envuelta en una card:
```css
.card-control {
  background: var(--md-surface);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px var(--md-shadow);
  margin-bottom: 12px;
}
```

Mejoras en sliders:
- Track height: 6px, border-radius: 3px, color: primary gradient
- Thumb: 18px, white, shadow, border
- Tooltip flotante mostrando valor actual (solo CSS con `attr()`)

### 3. Toast notifications

Reemplazo de `alert()` con notificaciones no-bloqueantes.

```html
<div class="toast-container" id="toastContainer">
  <!-- toasts injected here -->
</div>
```

```css
.toast {
  min-width: 280px;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  animation: slideIn 0.3s ease;
  margin-bottom: 8px;
}
.toast--success { background: #e8f5e9; color: #2e7d32; border-left: 4px solid #2e7d32; }
.toast--error   { background: #ffebee; color: #c62828; border-left: 4px solid #c62828; }
.toast--warning { background: #fff8e1; color: #f57f17; border-left: 4px solid #f57f17; }

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
```

Función JS de reemplazo:
```js
function mostrarToast(mensaje, tipo = 'success', duracion = 4000) { ... }
```

Llamar en lugar de `alert()` en todo `script.js`.

### 4. Secret Code Modal rediseñado

- Background overlay con backdrop-filter blur
- Modal con glassmorphism (fondo semi-transparente, blur)
- Input con icono 🔒 a la izquierda
- Feedback de error: shake animation + borde rojo
- Feedback de éxito: fade out suave

### 5. Tooltips en controles

Tooltips sutiles en sliders y botones (hover/focus):
- Temperatura: "Rango óptimo: 22-28°C"
- Voltaje: "4-6V = rango óptimo"
- Pendiente m: "I = m × V"
- Sliders de peces: "Máx. 20 peces"

Implementado con CSS `::after` pseudo-elemento + `attr(data-tooltip)`.

### 6. Dashboard de onboarding

Al cargar la página, si ningún escenario ha sido visitado, mostrar un banner informativo:
```html
<div id="onboardingBanner" class="onboarding">
  <h2>🐟 Bienvenido a Pecera</h2>
  <p>Explora 7 escenarios interactivos...</p>
  <button class="btn btn--primary" onclick="cerrarOnboarding()">Comenzar →</button>
</div>
```

Se cierra al hacer clic en "Comenzar" o al navegar al primer escenario. No vuelve a mostrarse en la sesión.

## Transiciones y Animaciones

- **Cambio de escenario**: fade cross (opacity transition 0.3s) en contenedor canvas/3D
- **Hover en tabs**: elevación + sombra, 0.2s
- **Click en botones**: ripple effect con pseudo-elemento
- **Toast**: slide-in desde derecha, fade-out al dismiss
- **Modal error**: shake horizontal 0.4s
- **Slider thumb**: scale(1.15) en hover

Sin librerías externas — todo con CSS transitions + JS minimal.

## Implementación (Phase 1)

### Archivos a modificar
| Archivo | Cambios |
|---------|---------|
| `css/style.css` | Reescribir completamente con nueva paleta, cards, toasts, tabs, layout |
| `index.html` | Añadir `toast-container`, `onboarding-banner`, data-tooltip attributes, estructura de tabs actualizada |
| `js/script.js` | Reemplazar `alert()` por `mostrarToast()`, cerrar onboarding, ripple effect via JS |

### No se modifica
- `js/script.js` clases y lógica de negocio
- `js/landing.js`
- `css/landing.css`
- `landing.html`
- Imágenes

### Orden de implementación
1. Reescribir `style.css` con nueva paleta y componentes
2. Actualizar `index.html` con nuevos wrappers y atributos
3. Añadir funciones JS: `mostrarToast()`, ripple, onboarding
4. Reemplazar `alert()` calls por `mostrarToast()`
5. Probar cada escenario

## Size Estimates
- CSS: ~600-800 líneas (reemplaza las ~392 actuales)
- HTML: +50-80 líneas (wrappers, data-atributos, toast container, onboarding)
- JS: +30-50 líneas (toast function, ripple, onboarding)

---

## Self-Review

- [x] No placeholders or TODOs
- [x] No contradictions between sections
- [x] Scoped to Phase 1 (UI/UX only, no modularization)
- [x] Requirements are explicit and unambiguous
- [x] Files to modify are clearly listed
