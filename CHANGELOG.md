# Changelog

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
