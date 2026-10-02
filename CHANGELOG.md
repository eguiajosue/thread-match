# 0.8.1 · piloto

- Etiquetas y leyendas salen del modo de aislamiento antes de crear la capa de producción, conservando los objetos seleccionados; contempla aislamiento anidado y el error de capa sintética.
- Si Illustrator no admite salir del aislamiento por script, indica pulsar Esc y reintentar, sin crear una etiqueta parcial.
- Las consultas automáticas sin cambios dejan intactos los controles y las filas; elimina la atenuación periódica y conserva el foco.
- Los clics durante una consulta automática esperan su respuesta y se ejecutan una sola vez; las escrituras siguen bloqueadas durante operaciones explícitas.
- Una selección vacía persistente no reconstruye el panel cada vez. Pruebas de regresión de aislamiento, parpadeo y acciones en espera. Validación nativa en Illustrator pendiente.

# 0.8.0 · piloto

- Selector de etiqueta Clásica / Icono de hilo con vista previa y preferencia persistente.
- Usa el THREAD.svg proporcionado como vector editable, con nombre y código a la derecha y fondo transparente.
- Cambia únicamente el blanco del icono al color del hilo; conserva negro, gris, curvas y perforaciones del original.
- La elección se aplica a todos los botones de etiqueta, doble clic y Enter; los respaldos anteriores conservan Clásica.
- Verifica los 36 contornos vectoriales y ambos formatos en el panel compacto. La validación de carga nativa en Illustrator continúa pendiente.

# 0.7.3 · piloto

- Los botones de importación/exportación esperan la respuesta del puente CEP, evitando perder acciones durante una lectura automática.

# 0.7.2 · piloto

- Mantiene bloqueadas las nuevas escrituras si una recuperación manual termina parcialmente, hasta completar los pasos pendientes.
- El banco nativo registra la versión real del host cargado.
- La publicación omite commits sustituidos por otros cambios en main.

# 0.7.1 · piloto

- Recuperación conserva muestras globales que se hayan reutilizado fuera de los objetos originales. No elimina una muestra cuyo uso no pueda comprobarse.
- Añade una prueba de reutilización posterior y muestra el número de muestras conservadas.

# 0.7.0 · piloto

- Modo Diseño: asignaciones revisadas, fijadas/excluidas, reducción a N hilos, aplicación por lote y leyenda de producción.
- Alcances selección/mesa/documento, revalidación, idempotencia de lotes y recuperación explícita ante cambios/fallos.
- Caché LRU, deduplicación, sondeo adaptativo, renderizado compartido, timeout y reconexión.
- Origen visible en todas las pestañas; contexto del documento y referencia de color.
- Formatos de salida en mm/pt, capa de producción, borde para blancos, copia/actualización explícita de leyenda.
- Recientes, paletas por cliente, disponibilidad manual, respaldos JSON, tabla CSV y leyenda SVG.
- Importación de Lab con procedencia; conserva PDF/Montaje sin inventar mediciones físicas.
- Consulta manual de versiones estables, integridad de archivos e instaladores con restauración de la extensión anterior.
- Banco nativo de pruebas preparado; validación dentro de Illustrator, PDF directo, firma certificada y UXP siguen pendientes según las dependencias del plan.

# 0.6.0

- Pestaña Favoritos con persistencia local por código y páginas de cinco hilos sin scroll.
- Estrellas para añadir y quitar desde coincidencias, búsqueda y favoritos.
- Aplicar y crear etiquetas desde favoritos con la referencia PDF o Montaje activa.
- Las estrellas no seleccionan el hilo ni crean etiquetas al hacer doble clic.

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
