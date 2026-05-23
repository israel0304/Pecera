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
Simula un sistema de bombeo de agua con energía solar. El estanque se renderiza como un **prisma 3D isométrico** con paredes, base y cara frontal de agua semitransparente. Un panel solar alimenta una bomba; el voltaje controla el brillo del sol, el tamaño/velocidad de las burbujas y el estado del sistema.

**Controles:** voltaje (0–12 V, slider), resistencia fija R = 5 Ω (I = V / R)

**Renderizado del estanque (prisma 3D):**

| Elemento | Forma | Líneas |
|----------|-------|--------|
| Base del estanque | Trapecio café | 1136–1147 |
| Pared izquierda | Romboide café | 1149–1160 |
| Pared derecha | Romboide café | 1162–1173 |
| Pared trasera | Rectángulo café | 1175–1186 |
| Agua frontal | Rectángulo azul semitransparente | 1189–1200 |
| Superficie/reflejo superior | Trapecio azul | 1202–1213 |

**Comportamiento:**

| Condición | Estado | Efecto visual |
|-----------|--------|---------------|
| V ≤ 3.9 | Corriente baja — baja oxigenación | Texto rojo, burbujas pequeñas |
| 4 ≤ V ≤ 6.5 | Rango óptimo — funcionando correctamente | Texto verde, burbujas normales |
| 6.5 < V ≤ 10 | Corriente alta — sobrecalentamiento | Brillo rojo pulsante + bomba vibra |
| V > 10 | Bomba descompuesta | Imagen `bomba_agua_issue.png`, sin burbujas, sin brillo |

- Las burbujas desaparecen al alcanzar `y = h * 0.6`
- El sol se ubica en la esquina superior izquierda; su brillo y tamaño escalan con `V / 12`
- Cable blanco discontinuo conecta panel solar con bomba
- El escenario inicia por defecto al cargar la página

### Estanque + Gráfica (Escenario 4)
Estanque Sustentable con una gráfica JSXGraph que muestra la curva I vs V (recta con pendiente 1/R). Incluye un **glider** arrastrable sobre la curva que sincroniza el slider de voltaje.

- Glider siempre visible (etiqueta permanente `(V, I)`)
- Curva: `I = V / 5` (R = 5 Ω fijo)
- Botón "graficar punto" para marcar puntos en la curva

### Estanque + Pendiente Variable (Escenario 5)
Estanque Sustentable con una gráfica JSXGraph donde la **pendiente m** de la recta `I = m × V` es ajustable mediante un slider (0–5.0). Incluye un glider arrastrable.

- Slider de pendiente `m` con paso 0.1
- Glider siempre visible con etiqueta permanente
- La recta se redibuja al cambiar m o al arrastrar el glider

## Navegación

La navegación entre escenarios se hace con los botones "← Atrás" y "Continuar →".
Avanzar requiere ingresar un código secreto; retroceder no.
El escenario inicial al cargar la página es **Estanque Sustentable**.

| Desde | Hacia | Código |
|-------|-------|--------|
| Pecera | Pecera + Litros | `litros` |
| Pecera + Litros | Estanque Sustentable | `estanque` |
| Estanque Sustentable | Estanque + Gráfica | `grafica` |
| Estanque + Gráfica | Estanque + Pendiente Variable | `pendiente` |

> Retroceder nunca requiere código. El orden de navegación es: Pecera → Pecera + Litros → Estanque Sustentable → Estanque + Gráfica → Estanque + Pendiente Variable.

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
- **JSXGraph** — gráficos de saturación de oxígeno, curvas I vs V
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
