# Interfaz 0.3.0

Se usan pestañas compactas y densidad reducida para que la vista previa no empuje fuera de pantalla las coincidencias. Cinco filas y acciones permanecen visibles desde 300×420 px; el manifiesto exige ese mínimo. En dimensiones inferiores a las admitidas no se garantiza el diseño sin scroll.

La información principal es código/nombre y diferencia de color. La descripción relativa ocupa una segunda línea; el nombre completo está disponible en el tooltip si debe truncarse. El pie y el estado son compactos; los detalles largos se pueden leer en el tooltip del estado.

Un clic selecciona. Doble clic crea una etiqueta; Enter ofrece alternativa por teclado. Crear etiqueta y Aplicar hilo permanecen como acciones explícitas. La pestaña Etiqueta muestra una previsualización HTML aproximada; la tarjeta final es vectorial en Illustrator y depende de métricas de fuente del host.

La selección automática usa sondeo a 900 ms mientras el panel está visible. Adobe ofrece eventos de selección mediante AIHostAdapter, que requiere un plugin nativo adicional; se elige el sondeo para una instalación consistente sin binarios C++ para Windows, Intel y Apple Silicon. La comparación de identidad, colores y destinatarios conserva el resultado cuando nada cambia. Las llamadas al host se serializan para evitar solapamientos; las acciones validan el snapshot antes de mutar.

Referencias primarias:
- [Adobe Spectrum: pestañas compactas y teclado](https://spectrum.adobe.com/page/tabs/).
- [Adobe CEP: eventos y adaptadores](https://github.com/Adobe-CEP/CEP-Resources/tree/master/CEP_11.x/AIHostAdapter).
- [Adobe Spectrum: densidad y espaciado](https://spectrum.adobe.com/foundations/layout-and-structure/spacing/component-spacing).
