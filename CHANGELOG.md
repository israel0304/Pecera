# Changelog

## 1.9.0 (no publicado)

### Features
- **Códigos indistintos** — ahora ignoran acentos, signos de puntuación y mayúsculas/minúsculas (función `normalizarCodigo` con descomposición NFD)
- **Navegación hacia atrás protegida** — cada escenario requiere su código la primera vez, incluso retrocediendo con "← Atrás" o clic directo en botones anteriores
- **Botones del btn-group protegidos** — hacer clic en cualquier escenario pide el código si no está desbloqueado
- `dimensiones` movido de escenario 6 a escenario 5 — ahora protege la transición 5→6 como estaba documentado
- Collapses de escenario 6 movidos a columna derecha (`contenedorCollapses`, `col-md-5`) usando Bootstrap grid, apilados en mobile

### Internal
- Reemplazado `codigosIngresados` (basado en transiciones) por `escenariosDesbloqueados` (basado en destinos, `Set`)
- `navegarA(destino)` ahora verifica si el destino está desbloqueado; si no, obtiene el código de `getAnterior(destino)`

### Documentation
- Actualización de README.md, AGENTS.md y CHANGELOG.md

## 1.8.0 (no publicado)

### Features
- **Capacidad Dinámica collapse** — tabla comparativa con dos valores por fila, cálculo de capacidad en litros, ecuación de diferencia con ▲/▼
- Acordeón entre "Dimensiones variables" y "Capacidad Dinámica" mediante `data-bs-parent`
- Checkbox en primera columna de ambas tablas para activar/desactivar highlights en el tanque 3D
- Highlights por pares de colores en Capacidad Dinámica (un color por valor, distintos por fila)
- Bloqueo de sliders al abrir cualquier collapse y al cambiar de tab (solo el slider del tab activo queda habilitado; los otros se fijan al máximo)
- Al escribir en Valor₁ de Capacidad Dinámica se actualiza el slider con el valor máximo de todas las filas
- Botón Reiniciar limpia ambas tablas (restaura 3 filas en Dimensiones variables, 2 en Capacidad Dinámica)
- Capacidad mostrada en litros con 3 decimales (tanto en badge como en tablas)
- Superficie del agua más visible (color 0x3399ff, opacity 0.85) + volumen de agua restaurado
- Cola de pez 3D reposicionada más cerca del cuerpo (x: -1.2 → -0.7)

### Fix
- Error CSS huérfano: selector faltante en `#esc6-tabla-section .form-control`
- Scope de `bloquearSlidersPorTab` movida a nivel global para que ambos collapses puedan usarla

### Documentation
- Actualización de README.md, AGENTS.md y CHANGELOG.md

## 1.7.0 (no publicado)

### Features
- Escenario Dimensiones 3D: pecera 3D interactiva con Three.js
- Sliders de largo (0–19), ancho (0–18) y alto (0–21) modifican el tanque en tiempo real
- Agua con superficie animada (ondas seno/coseno en vértices)
- Peces 3D nadando dentro del tanque (geometría personalizada, colores variados)
- Cámara libre con OrbitControls (rotar, zoom, pan — compatible táctil)
- Librerías Three.js y OrbitControls descargadas localmente (`js/three.min.js`, `js/OrbitControls.js`)
- Código secreto `"dimensiones"` para navegación

### Documentation
- Actualización de README.md, AGENTS.md y CHANGELOG.md

## 1.6.0 (no publicado)

### Features
- Sliders de temperatura, voltaje y pendiente con step `0.01` (2 decimales)
- Glider en escenarios 4 y 5 actualiza voltaje con 2 decimales (`toFixed(2)`)
- Rango óptimo ajustado a V ≥ 4 y V ≤ 6, sobrecalentamiento desde V > 6
- Parámetros de animación de bomba (glow rojo, vibración) sincronizados con nuevo rango
- Menos burbujas en corriente baja (1 en vez de 2 por frame cuando V < 4)

### Fix
- Botón "graficar punto" se ocuestra/muestra correctamente al togglear checkbox LA
- Espaciado reducido entre controles del escenario 5 (mb-1, pb-1, mb-0 en labels)

## 1.5.0 (no publicado)

### Features
- Ejes personalizados con `ticksDistance: 2` y cuadrícula (`grid`) en escenarios 4 y 5
- Zoom con rueda del mouse y botones +/- en gráficas JSXGraph (límites 0.5x–5x)
- Franjas de colores en escenario 5: azul (2–4V), verde (4–6V), amarillo (6–8V), rojo (8–10V) y banda verde horizontal de rango óptimo
- Código secreto `"franjas"` para activar las franjas (modal, una sola vez por sesión)
- Checkbox "Mostrar franjas" movido de JSXGraph a controles HTML nativos
- Etiqueta del glider con formato `U (5.00, 1.50)` y 2 decimales (`toFixed(2)`)
- Banda roja adicional para el rango 8 < x ≤ 10

### Fix
- Polígonos reemplazados por `curve` con `closedCurve: true` para evitar que intercepten eventos táctiles
- Eventos desactivados en bandas para permitir pan/zoom táctil

### Documentation
- Actualización de `README.md` con código secreto `"franjas"` y descripción de las franjas de voltaje

## 1.4.0 (no publicado)

### Features
- Escenario Pecera + Litros: cálculo de litros de agua necesarios (LA = npeces × tpeces × 3)
- Checkbox "Litros de agua necesaria" para alternar entre vista SO y LA
- Curva LA lineal (naranja) en JSXGraph
- Botón "graficar punto LA" para marcar puntos en la curva LA
- Código secreto `"litros"` para navegación entre escenarios
- Navegación con botones atrás/continuar y modal de código secreto

## 1.3.0 (no publicado)

### Features
- Escenario 2: sistema estanque sustentable completo
- Panel solar con imagen (`img/panel_solar.png`)
- Control de voltaje (0–50 V), R = 5Ω fijo, I = V / R
- Brillo rojo pulsante en bomba cuando I > 8 A
- Vibración (±3px) de bomba cuando I > 8 A
- Bomba se rompe a V ≥ 50 V (imagen `img/bomba_agua_issue.png`, sin burbujas, sin brillo, sin vibración)
- Canvas fijo 1600×800 para nitidez en pantallas retina
- Partículas de agua (burbujas) escalan con voltaje
- Info box blanco con V, I, R y estado del sistema
- Cable eléctrico del panel a la bomba
- Cielo, sol, orilla y estanque renderizados en canvas

### Fix
- Scroll horizontal eliminado en layout responsive

### Documentation
- Actualización de `README.md` con tabla de estados y nueva estructura
- Actualización de `AGENTS.md` con comportamiento detallado de Escenario 2

---

## 1.2.0 (no publicado)

### Refactor
- Mejora en la legibilidad y mantenibilidad del código (`js/script.js`)
- Ajuste de posición de la bomba y estilo del cableado
- Lógica de renderizado del canvas optimizada

### Documentación
- Actualización de `AGENTS.md` con clases, escenarios y comportamientos
- Creación de `README.md` con documentación completa del proyecto

---

## 1.1.1

### Fix
- Corrección en mensaje de advertencia de peces

---

## 1.1.0

### Features
- Controles de tamaño de pecera (ancho/alto dinámico)
- Botón "Reiniciar"
- Mensaje al ingresar número de peces menor a 0

---

## 1.0.0

### Features
- **Clases:** `Vector`, `Pez`, `Burbuja`, `Pecera`, `Grafica`
- Canvas renderiza pecera, peces con natación y burbujas
- Control de temperatura con cálculo de saturación de oxígeno
- Peces se enferman (< 22 °C) y mueren (> 28 °C)
- Burbujas dinámicas según saturación de oxígeno
- Animación con `requestAnimationFrame`
- Gráfica JSXGraph con curva SO (función cúbica)
- Checkbox para mostrar/ocultar gráfica
- Botón para graficar puntos (clic o tecla Enter)
- Botón "Play" que auto-incrementa temperatura

### Fixes
- Escalado de peces enfermos corregido
- Burbujas iniciales corregidas
- Función `morir` y botones depurados
- Radio de burbujas ajustado

---

## 0.x — Desarrollo inicial

- Primer commit con estructura base del proyecto
- Implementación gradual de clases y controles
- Integración de JSXGraph y Bootstrap
