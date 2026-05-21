# Pecera — Simulador de Acuario y Estanque Sustentable

Simulador interactivo de pecera y sistema de bombeo solar con visualización en canvas y gráficos JSXGraph.

## Cómo ejecutar

Abrir `index.html` en cualquier navegador. No requiere servidor ni build.

## Escenarios

### Escenario 1: Pecera
Simula una pecera con peces que nadan libremente. La temperatura controla la saturación de oxígeno (SO) mediante una función cúbica. Los peces se enferman por debajo de 22 °C y mueren por encima de 28 °C.

**Controles:** temperatura (0–50 °C), número de peces (0–20), tamaño de pez (1–7 cm)

### Escenario 2: Estanque Sustentable
Simula un sistema de bombeo de agua con energía solar. El voltaje controla el brillo del sol, la intensidad de la bomba y la cantidad de partículas de agua.

**Controles:** voltaje (0–50 V), resistencia fija de 5 Ω

**Comportamiento:**
| Corriente | Estado |
|---|---|
| I < 2 A | Corriente baja — la bomba no oxigena suficiente |
| 2 A ≤ I ≤ 8 A | Rango óptimo |
| I > 8 A | Sobrecalentamiento (brillo rojo + vibración) |
| V ≥ 50 V | La bomba se rompe |

## Clases

| Clase | Descripción |
|---|---|
| `Vector` | Matemática vectorial 2D (suma, resta, mult., div., magnitud, normalización, límite) |
| `Pez` | Pez con posición, velocidad, aceleración, natación, rebote, salud (sano/enfermo/muerto) |
| `Burbuja` | Burbujas con posición aleatoria, movimiento ascendente y deriva sinusoidal |
| `Pecera` | Renderizado del fondo y cálculo de saturación de oxígeno (función cúbica) |
| `Grafica` | Wrapper de JSXGraph para graficar la curva SO y puntos de datos |
| `ParticulaAgua` | Partículas de agua para la fuente del estanque sustentable |

## Tecnologías

- **HTML5 Canvas** — renderizado de escenarios
- **JSXGraph** — gráficos de saturación de oxígeno
- **Bootstrap** — interfaz de usuario
- **JavaScript vanilla** — sin frameworks ni librerías externas

## Estructura del proyecto

```
Pecera/
├── index.html         # Punto de entrada (tabs, controles, canvas, gráficos)
├── js/script.js       # Lógica principal (clases, animación, eventos)
├── css/
│   ├── style.css      # Estilos
│   ├── bootstrap.min.css
│   └── jsxgraph.css
├── img/               # Sprites (pez-neon_todos, pecera, panel_solar, bomba_agua, bomba_agua_issue)
├── AGENTS.md          # Instrucciones para opencode
├── CHANGELOG.md       # Historial de cambios
└── README.md
```

## Historial de cambios

Ver [`CHANGELOG.md`](CHANGELOG.md) para el registro completo de versiones.
