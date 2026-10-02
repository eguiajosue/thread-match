# 0.5.0

- Auditoría de los 160 colores: códigos, nombres, regiones, ICC, reproducción exacta y comparación independiente con Poppler.
- Selector Carta PDF / Montaje: conserva los originales y añade blancos ajustados visualmente para 5801, 5802 y 5803.
- Coincidencias, búsqueda, etiquetas y rellenos usan la misma referencia.
- Muestras ajustadas separadas para conservar trabajos anteriores.
- Informe, CSV de 160 hilos y política reproducible incluidos en el repositorio.

# 0.4.0

- Pestaña Buscar: catálogo completo de 160 hilos por código o nombre, con paginación sin scroll.
- Selección manual para aplicar o crear etiquetas, incluso fuera de las coincidencias.
- La elección manual se conserva al sincronizar la selección.

# ThreadMatch v0.3.0

- Panel compacto con dos pestañas, cinco hilos visibles y controles inferiores.
- Matching automático al cambiar de selección, documento o relleno; se comprueba cada 900 ms con el panel visible y se conserva el ranking si no cambió.
- Doble clic o Enter en un hilo para crear una etiqueta editable.
- Etiquetas con jerarquía tipográfica, código destacado, colección discreta y separación de tarjetas anteriores.
- Instaladores por usuario para Windows y macOS, con respaldo y restauración opcional de ajustes CEP.
- Paquetes por plataforma y SHA-256; build, pruebas y publicación de versiones mediante GitHub Actions.

Los 160 colores proceden de la carta digital proporcionada; no son mediciones físicas oficiales. La instalación CEP y el funcionamiento en Illustrator real necesitan validación en cada equipo. Este paquete no es un ZXP firmado. La publicación automática de Releases no actualiza los plugins instalados: reinstala el paquete nuevo con Illustrator cerrado.
