# Pecera — Simulador de Acuario y Estanque Sustentable

Simulador interactivo de pecera y sistema de bombeo solar con visualización en canvas (1600×800 fijo) y gráficos JSXGraph.

## Cómo ejecutar

Abrir `index.html` en cualquier navegador. No requiere servidor ni build.

## Escenarios

### Pecera
Simula una pecera con peces que nadan libremente. La temperatura controla la saturación de oxígeno (SO) mediante una función cúbica. Los peces se enferman por debajo de 22 °C y mueren por encima de 28 °C.

**Controles:** temperatura (0–50 °C), número de peces (0–20), tamaño de pez (1–7 cm)

### Pecera + Litros
Extensión de Pecera que agrega un cálculo de litros de agua necesarios. Incluye un checkbox "Litros de agua necesaria" que alterna entre la vista de Saturación de Oxígeno (SO) y la de Litros de Agua (LA).

- **Fórmula LA:** `LA = cantidad_peces × tamaño_peces × 3`
- Curva LA lineal (color naranja) en JSXGraph
- Botón "graficar punto LA" para marcar puntos en la curva
- Requiere código secreto `"litros"` para navegar entre escenarios

**Controles:** temperatura (0–50 °C), número de peces (0–20), tamaño de pez (1–7 cm), checkbox LA, botón punto LA

### Estanque Sustentable
Simula un sistema de bombeo de agua con energía solar. Un panel solar alimenta una bomba sumergida en un estanque; el voltaje controla el brillo del sol, el tamaño/velocidad de las burbujas y el estado del sistema.

**Controles:** voltaje (0–50 V), resistencia fija de 5 Ω, I = V / R

**Comportamiento:**

| Condición | Estado | Efecto visual |
|-----------|--------|---------------|
| I < 2 A | Corriente baja | Burbujas pequeñas y lentas |
| 2 A ≤ I ≤ 8 A | Rango óptimo | Burbujas normales, texto verde |
| I > 8 A | Sobrecalentamiento | Brillo rojo pulsante + bomba vibra |
| V ≥ 50 V | Bomba dañada | Imagen `bomba_agua_issue.png`, sin burbujas, sin brillo |

## Clases

| Clase | Descripción |
|-------|-------------|
| `Vector` | Matemática vectorial 2D (suma, resta, mult., div., magnitud, normalización, límite) |
| `Pez` | Pez con posición, velocidad, aceleración, natación, rebote, salud (sano/enfermo/muerto) |
| `Burbuja` | Burbujas con posición aleatoria, movimiento ascendente y deriva sinusoidal |
| `Pecera` | Renderizado del fondo y cálculo de saturación de oxígeno (función cúbica) |
| `Grafica` | Wrapper de JSXGraph para graficar la curva SO y puntos de datos |
| `ParticulaAgua` | Partículas de agua (burbujas) para la fuente del estanque sustentable |

## Tecnologías

- **HTML5 Canvas** — renderizado de escenarios (buffer fijo 1600×800)
- **JSXGraph** — gráficos de saturación de oxígeno
- **Bootstrap** — interfaz de usuario responsive
- **JavaScript vanilla** — sin frameworks ni librerías externas

## Estructura del proyecto

```
Pecera/
├── index.html         # Punto de entrada (escenarios, controles, canvas, gráficos)
├── js/script.js       # Lógica principal (clases, animación, eventos)
├── css/
│   ├── style.css      # Estilos
│   ├── bootstrap.min.css
│   └── jsxgraph.css
├── img/               # Sprites
│   ├── pez-neon_todos.png
│   ├── pecera.png
│   ├── panel_solar.png
│   ├── bomba_agua.png
│   └── bomba_agua_issue.png
├── AGENTS.md          # Instrucciones para opencode
├── CHANGELOG.md       # Historial de cambios
└── README.md
```

## Versiones

El proyecto usa etiquetas (`tags`) con formato `Pecera_vX.Y.Z` siguiendo [SemVer](https://semver.org/). Las versiones publicadas están disponibles en [GitHub Releases](https://github.com/israel0304/Pecera/releases).

| Versión | Descripción |
|---------|-------------|
| v1.0.0 | Lanzamiento inicial — pecera, peces, burbujas, temperatura, gráfica SO |
| v1.1.0 | Tamaño dinámico de pecera, botón reiniciar, validaciones |
| v1.1.1 | Fix mensaje de advertencia de peces |
| v1.2.0 | Refactor general, ajustes de bomba/cableado, documentación |
| v1.3.0 | Estanque Sustentable — panel solar, bomba, voltaje, partículas de agua |
| v1.4.0 | Pecera + Litros — cálculo LA, toggle SO/LA, curva naranja, código secreto |

## Historial de cambios

Ver [`CHANGELOG.md`](CHANGELOG.md) para el registro completo de versiones.
