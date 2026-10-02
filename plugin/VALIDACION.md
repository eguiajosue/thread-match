# Validación

## Automatizada

`npm test` verifica motor, conversiones, los 34 pares Sharma, 160 autocoincidencias, selección, muestras, restauración ante fallos, etiquetas, puente CEP y sondeo de cambios.

GitHub Actions prueba instalación, reinstalación y desinstalación en runners Windows/macOS sin Illustrator; la prueba de interfaz usa Chromium y un puente CEP simulado, verifica los tamaños 300×420 y 340×480, doble clic, cambio de color y sondeo automático. Consulta los resultados y capturas del workflow; un script incluido no equivale a una prueba ejecutada.

## Pendiente en Illustrator real

Carga CEP, acoplamiento, perfiles CMYK, selección en grupos/texto real, fuente Arial en ambos sistemas, formato final de etiquetas, Ctrl+Z/rehacer, comportamiento al cerrar documentos y selección cambiada durante una acción. Las capturas del navegador no representan una prueba dentro de Illustrator.

## Piloto 0.7.0

Incluye modo Diseño, reducción, recuperación y preferencias. El banco y matriz de validación nativa están en el repositorio: `scripts/validate-illustrator.jsx` y `docs/validation/MATRIZ_NATIVA.md`. La entrega permanece piloto hasta ejecutar esa matriz. Los objetivos de tiempo del plan no se presentan como mediciones reales.
