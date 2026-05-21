# Changelog

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
