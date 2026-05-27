# Pecera — Simulador de Acuario y Estanque Sustentable

Simulador interactivo de pecera y sistema de bombeo solar con visualización en canvas (1600×800 fijo), gráficos JSXGraph, y tanque 3D con Three.js.
Incluye una **landing page** (`landing.html`) con un pez neon tetra 3D interactivo como héroe.

## Cómo ejecutar

Abrir `landing.html` para la página de presentación, o `index.html` para el simulador directamente. No requiere servidor ni build.

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
| V < 4 V | Corriente baja — baja oxigenación | Texto rojo, 1 burbuja por frame |
| 4 V ≤ V ≤ 6 V | Rango óptimo — funcionando correctamente | Texto verde |
| V > 6 V | Sobrecalentamiento | Brillo rojo pulsante + bomba vibra |
| V > 10 V | Bomba descompuesta | Imagen `bomba_agua_issue.png`, sin burbujas, sin brillo, sin vibración |

- Las burbujas desaparecen al alcanzar `y = h * 0.6`
- El sol se ubica en la esquina superior izquierda; su brillo y tamaño escalan con `V / 12`
- Cable blanco discontinuo conecta panel solar con bomba

### Zoom y Paneo (Escenarios 1–5)

Los escenarios de canvas (Pecera, Litros, Estanques) soportan zoom y paneo interactivo:

- **Zoom con scroll** — rueda del mouse para acercar/alejar (0.3x–5x), centrado en la posición del cursor
- **Paneo con clic sostenido** — arrastrar con el botón izquierdo para desplazar la vista
- **Zoom táctil** — pellizco con dos dedos
- **Paneo táctil** — arrastrar con dos dedos en cualquier dirección
- **Reinicio** — clicking "Reiniciar" o cambiando de escenario restaura el zoom a 1x
- Los peces huyen correctamente del cursor/pinch a cualquier nivel de zoom (coordenadas mapeadas via `screenToBuffer()`)

### Estanque + Gráfica (Escenario 4)
Estanque Sustentable con una gráfica JSXGraph que muestra la curva I vs V (recta con pendiente 1/R). Incluye un **glider** arrastrable sobre la curva que sincroniza el slider de voltaje.

- Glider siempre visible con etiqueta permanente `U (5.00, 1.50)` con 2 decimales
- Arrastrar el glider actualiza el slider de voltaje en tiempo real
- Curva: `I = V / 5` (R = 5 Ω fijo)
- Ejes personalizados con ticks cada 2 unidades y cuadrícula de fondo
- Zoom con rueda del mouse o botones +/- (rango 0.5x–5x)

### Estanque + Pendiente Variable (Escenario 5)
Estanque Sustentable con una gráfica JSXGraph donde la **pendiente m** de la recta `I = m × V` es ajustable mediante un slider (0–5.0). Incluye un glider arrastrable.

- Slider de pendiente `m` con paso 0.01
- Glider siempre visible con etiqueta permanente `U (5.00, 1.50)` con 2 decimales
- Ejes personalizados con ticks cada 2 unidades y cuadrícula de fondo
- Zoom con rueda del mouse o botones +/- (rango 0.5x–5x)
- Franjas de colores (activables con código secreto `"franjas"`) que muestran zonas de voltaje: azul (2–4V), verde (4–6V), amarillo (6–8V), rojo (8–10V) y banda verde horizontal de rango óptimo
- La recta se redibuja al cambiar m o al arrastrar el glider

### Dimensiones 3D
Pecera 3D interactiva usando Three.js con controles de largo, ancho y alto en tiempo real. Incluye volumen de agua, superficie animada (ondas) y peces tridimensionales nadando dentro del tanque.

- **Sliders:** Largo (1–19), Ancho (1–18), Alto (1–21), paso 1
- Tanque con paredes semitransparentes y bordes visibles
- Volumen de agua + superficie con ondas animadas (seno/coseno)
- Peces 3D con geometría personalizada (cuerpo + cola), coloración neón en dos tonos
- Cámara libre con OrbitControls (rotar, zoom, pan — compatible táctil)
- Los collapses (Dimensiones variables / Capacidad Dinámica) aparecen en una columna derecha en PC (`col-md-5`), apilados en mobile
- **Dimensiones variables:** tabla con tabs (Ancho/Alto/Largo), checkbox por fila muestra volumen highlight en el tanque (colores distintos, bordes punteados)
- **Capacidad Dinámica:** colapso tipo acordeón con tabla comparativa (Valor₁/Valor₂), capacidades en litros, ecuación de diferencia (▲/▼), checkbox para highlights por pares
- Bloqueo de sliders: al abrir cualquiera de los dos collapses, solo el slider del tab activo está habilitado; los otros dos se fijan al máximo
- Botón "Reiniciar" restaura sliders y limpia ambas tablas

**Controles:** sliders de largo, ancho, alto, botón reiniciar, collapses de tablas dimensionales

### Incremento de Capacidad (Escenario 7)

Herramienta educativa que relaciona dimensiones fijas (L=19, A=18, H=21) con la capacidad del estanque. Tres tabs (Ancho, Alto, Largo) determinan qué dimensión es variable y cuáles son fijas como factor de capacidad.

- **Factor de capacidad** = producto de las dos dimensiones fijas / 1000 (Ancho: 0.399, Alto: 0.342, Largo: 0.378)
- **Capacidad₁ = Valor₁ × factor**, **Capacidad₂ = Valor₂ × factor** (3 decimales)
- **Tabla vertical** con 6 filas: Val₁, Val₂, Cap₁, Cap₂, Δ dimensión, Δ capacidad
- **Validación** por botón individual (ΔVal y ΔCap), tolerancia ±0.01, muestra modal Bootstrap al acertar
- **Gráfica JSXGraph** con línea de referencia dinámica, segmento horizontal (azul), vertical (rojo), tres puntos rojos, zoom sin límites
- **Modo peces opcional** — checkbox "Incluir peces" para calcular LA = cantidad × tamaño × 3, punto naranja y línea azul discontinua en la gráfica

**Controles:** tabs Ancho/Alto/Largo, inputs Val₁/Val₂, botones Validar, checkbox peces, Reiniciar

## Navegación

La navegación entre escenarios se hace con el botón "Siguiente Escenario" en la barra inferior, o haciendo clic directo en los tabs superiores.
Cada escenario requiere su código secreto la **primera vez** que se visita, sin importar la dirección (adelante, atrás o clic directo).
Una vez ingresado, el escenario queda desbloqueado por el resto de la sesión.
Los códigos no distinguen mayúsculas, acentos ni signos de puntuación (ej: `"Dimensiónes!"` funciona como `"dimensiones"`).
El escenario inicial (Pecera) está desbloqueado por defecto.

| Desde | Hacia | Código |
|-------|-------|--------|
| 1 (Pecera) | 3 (Pecera + Litros) | `litros` |
| 3 (Pecera + Litros) | 6 (Dimensiones 3D) | `capacidad` |
| 6 (Dimensiones 3D) | 7 (Inc. Capacidad) | `incremento` |
| 7 (Inc. Capacidad) | 2 (Estanque) | `estanque` |
| 2 (Estanque) | 4 (Estanque + Gráfica) | `grafica` |
| 4 (E. + Gráfica) | 5 (E. + Pendiente) | `pendiente` |
| 5 (E. + Pendiente) | 1 (Pecera, bypassed) | `incremento` |
| Escenario 5 | Franjas de colores | `franjas` |

> El orden de navegación es: Pecera → Pecera + Litros → Dimensiones 3D → Incremento de Capacidad → Estanque Sustentable → Estanque + Gráfica → Estanque + Pendiente Variable → (vuelve a Pecera).
>
> El código `"franjas"` activa el checkbox "Mostrar franjas" en el Escenario 5 (solo una vez por sesión).
> Los códigos entre escenarios se obtienen del escenario **anterior** en el orden de navegación.

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
- **Three.js** — renderizado 3D del tanque interactivo
- **JavaScript vanilla** — sin frameworks ni librerías externas

## Estructura del proyecto

```
Pecera/
├── index.html         # Simulador principal (escenarios, controles, canvas, gráficos)
├── landing.html       # Landing page con Three.js 3D neon tetra interactivo
├── js/
│   ├── script.js      # Lógica principal (clases, animación, eventos, escenario 3D)
│   ├── landing.js     # Three.js interactive neon tetra para landing page
│   ├── three.min.js   # Three.js para escenario Dimensiones 3D y landing
│   └── OrbitControls.js # Controles de cámara 3D
├── css/
│   ├── style.css      # Estilos del simulador (Material Design)
│   ├── landing.css    # Tema neón, glassmorphism, bento grid para landing page
│   ├── bootstrap.min.css
│   └── jsxgraph.css
├── img/               # Sprites y screenshots
│   ├── screenshot-pecera.jpg
│   ├── screenshot-estanque.jpg
│   ├── screenshot-grafica.jpg
│   ├── screenshot-3d.jpg
│   ├── incremento.jpg
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
| v1.5.0 | Estanque + Gráfica/Pendiente — ejes custom, grid, zoom, franjas, glider |
| v1.6.0 | Ajustes de precisión — sliders step 0.01, rango óptimo 4–6V, glider con 2 decimales, menos burbujas en baja corriente |
| v1.7.0 | Dimensiones 3D — Three.js, tanque 3D interactivo, ondas en agua, peces 3D |
| v1.8.0 | Capacidad Dinámica — tabla comparativa acordeón, highlights por pares, bloqueo de sliders, checkboxes, capacidad en litros, cola de pez ajustada |
| v1.9.0 | Códigos insensibles a acentos/puntuación, navegación hacia atrás protegida, collapses en columna derecha, `dimensiones` movido a escenario 5 |
| v1.10.0 | Zoom y paneo en canvas 2D (scroll + clic sostenido, pinch + arrastre táctil 2 dedos), coordenadas de cursor corregidas con zoom |
| v1.11.0 | Landing page con Three.js 3D, Escenario 7 (Incremento de Capacidad), toast notifications, rediseño UI Material Design, tooltips, nav bar inferior, burbujas más grandes, `getCorriente()` para esc5, navegación reordenada |

## Historial de cambios

Ver [`CHANGELOG.md`](CHANGELOG.md) para el registro completo de versiones.
