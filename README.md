# Pecera — Simulador de Acuario y Estanque Sustentable

Simulador interactivo de pecera y sistema de bombeo solar con visualización en canvas (1600×800 fijo), gráficos JSXGraph, y tanque 3D con Three.js.
Incluye una **landing page** (`index.html`) con un pez neon tetra 3D interactivo como héroe y un **splash preloader** con Three.js + GSAP al abrir el simulador.

## Cómo ejecutar

Abrir `index.html` para la página de presentación, o `app.html` para el simulador directamente. No requiere servidor ni build.

## Escenarios

### Pecera
Simula una pecera con peces que nadan libremente. La temperatura controla la saturación de oxígeno (SO) mediante una función cúbica. Los peces se enferman por debajo de 22 °C y mueren por encima de 28 °C.

**Controles:** temperatura (0–50 °C), número de peces (0–20), tamaño de pez (1–7 cm)

### Pecera + Litros
Extensión de Pecera que integra controles **dibujados directamente en el canvas** además de la gráfica JSXGraph. Al activar este escenario, los controles HTML de temperatura y saturación se ocultan y aparecen sliders visuales en el canvas.

**Canvas UI:**
- **Slider horizontal de temperatura** (parte superior del canvas, 10–50°C) con track degradado azul y thumb circular con label flotante `XX°C`
- **Slider vertical de nivel de agua** (borde derecho, 0–100%) con track azul y label `XX L` (litros = nivel × 2)
- **Overlay de agua semitransparente** (relleno azul `rgba(52,152,219,0.3)`) que sube/baja con el nivel
- **Comportamiento de peces**: si el nivel de agua es menor que el alto del pez y LN > L, los peces muestran animación `sinAgua` (sprite de fuera del agua). Si el nivel baja demasiado, los peces mueren por falta de agua
- Arrastre por mouse y táctil (1 dedo) en ambos sliders

**Gráfica JSXGraph:**
- **Fórmula LA:** `LA = cantidad_peces × tamaño_peces × 3`
- Curva LA lineal (color naranja) en JSXGraph
- Checkbox "Visualizar nivel del agua" muestra una línea horizontal de referencia en `y = nivelAgua × 2`
- Botón "graficar punto LA" para marcar puntos en la curva
- Requiere código secreto `"litros"` para navegar entre escenarios

**Controles:** temperatura (canvas slider), número de peces (0–20), tamaño de pez (1–7 cm), checkbox LA, botón punto LA

### Estanque Sustentable
Simula un sistema de bombeo de agua con energía solar. El estanque se renderiza como un **prisma 3D isométrico** con paredes, base y cara frontal de agua semitransparente. Un panel solar alimenta una bomba; el voltaje controla el brillo del sol, el tamaño/velocidad de las burbujas y el estado del sistema.

**Controles:** voltaje (0–12 V, slider), corriente I = 0.3V (pendiente fija)

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
- **Cielo dinámico** — Gradiente día/noche según voltaje: noche (0V, azul oscuro + estrellas), amanecer (4–6V, tonos cálidos), día (12V, azul brillante)
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
- Curva: `I = 0.3V` (pendiente fija)
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
| `Pez` | Pez con posición, velocidad, aceleración, natación, rebote, salud (sano/enfermo/muerto). Acepta `especieId` en constructor para seleccionar skin del array `ESPECIES` |
| `Burbuja` | Burbujas con posición aleatoria, movimiento ascendente y deriva sinusoidal |
| `Pecera` | Renderizado del fondo y cálculo de saturación de oxígeno (función cúbica) |
| `Grafica` | Wrapper de JSXGraph para graficar la curva SO y puntos de datos |
| `ParticulaAgua` | Partículas de agua (burbujas) para la fuente del estanque sustentable |

## Sistema de Especies

El array `ESPECIES` (`script.js:38-42`) define las skins disponibles para los peces 2D:

| id | nombre | skin |
|----|--------|------|
| `'default'` | Alternativo | `./img/pez-neon-todos.png` |
| `'mx'` | Selección Mexicana | `./img/pez-neon-todos-mx.png` |
| `'br'` | Selección Brasileña | `./img/pez-neon-todos-br.png` |

- **`Pez(t, especieId)`** — El constructor recibe `especieId` como segundo parámetro; si es `undefined`/`null`, usa `'default'`
- **`generarPeces(n, t, especies)`** — Crea `n` peces de tamaño `t`. El parámetro `especies` puede ser:
  - **Array** → distribuye equitativamente (ej: `['mx','br']` con n=4 da `['mx','mx','br','br']`)
  - **Objeto** → `{id: count}` crea exactamente esa cantidad (ej: `{mx:3, br:2}`)
  - **Falsy/omitido** → todos los peces usan `'default'`
- Por defecto, todos los escenarios crean peces con `'default'` (Alternativo)
- La propiedad `this.image.src` de cada `Pez` se carga desde `especie.skin` al instanciarse
- Los peces 3D (Three.js) no usan el sistema de especies; usan colores neón por vértices

## Tecnologías

- **HTML5 Canvas** — renderizado de escenarios (buffer fijo 1600×800)
- **JSXGraph** — gráficos de saturación de oxígeno, curvas I vs V
- **Bootstrap** — interfaz de usuario responsive
- **Three.js** — renderizado 3D del tanque interactivo y splash preloader
- **GSAP** — animaciones y micro-interacciones en la landing page (hero entrance, scroll-triggered reveals)
- **JavaScript vanilla** — sin frameworks ni librerías externas

## Estructura del proyecto

```
Pecera/
├── index.html         # Landing page con Three.js 3D neon tetra interactivo
├── app.html           # Simulador principal (escenarios, controles, canvas, gráficos)
├── js/
│   ├── script.js      # Lógica principal (clases, animación, eventos, escenario 3D)
│   ├── landing.js     # Three.js interactive neon tetra para landing page
│   ├── splash.js      # Splash preloader con Three.js + GSAP (tanque, agua, pez, partículas)
│   ├── three.min.js   # Three.js para escenario Dimensiones 3D, landing y splash
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
│   ├── pez-neon-todos.png
│   ├── pez-neon-todos-mx.png
│   ├── pez-neon-todos-br.png
│   ├── pecera.png
│   ├── panel_solar.png
│   ├── bomba_agua.png
│   ├── bomba_agua_issue.png
│   ├── icon-144.png
│   ├── icon-192.png
│   └── icon-512.png
├── AGENTS.md          # Instrucciones para opencode
├── CHANGELOG.md       # Historial de cambios
├── manifest.json      # PWA manifest
├── sw.js              # Service Worker
└── README.md
```

## Créditos

**Diseño y autoría:** Helen Mariel Pérez Martínez (CINVESTAV)
**Desarrollo técnico:** Israel Emmanuel Hernández González

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
| v1.12.0 | PWA dinámico (base path automático, manifest Blob URL con origin, SW con scope dinámico), meta tags iOS, filtro SW para chrome-extension, iconos actualizados, rename landing→index / index→app |
| v1.14.0 | Sistema de especies: `ESPECIES` array, `generarPeces()`, `Pez.especieId`, 3 skins (Alternativo, MX, BR) |

## Versión Mundialista (feature/mundial)

Rama temporal con temática futbolera para el Mundial. **No está en `main`**.
- **Balón de fútbol** que flota en el estanque y los peces lo empujan
- **Dos equipos**: MX empuja derecha, KR empuja izquierda
- **Porterías** en ambos extremos con mecánica de goles
- **32 fuegos artificiales** al anotar gol
- **Estadio** y **marcador** MX-KR

Acceso: `git checkout feature/mundial` o `git checkout mundial-2026` (tag permanente)

## Historial de cambios

Ver [`CHANGELOG.md`](CHANGELOG.md) para el registro completo de versiones.
