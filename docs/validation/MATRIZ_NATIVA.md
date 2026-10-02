# Matriz nativa · pendiente de ejecución

La CI usa un puente simulado. Registrar sistema, arquitectura, versión exacta de Illustrator, CEP, perfil, tamaño del panel y commit. Ejecutar en Windows y macOS (Intel/Apple Silicon según los equipos objetivo). Nunca cambiar «pendiente» por «aprobado» sin informe real.

| Caso | Comprobación | Estado |
|---|---|---|
| Carga CEP y reinstalación | Abrir/acoplar; favoritos/paletas sobreviven; volver a versión anterior | Pendiente |
| 100 / 1.000 / 10.000 objetos RGB y CMYK | Ejecutar `scripts/validate-illustrator.jsx`; exportar CSV; separar lectura/ranking/puente/UI | Pendiente |
| Grupo y descendiente seleccionados | Sin doble escritura ni recuento duplicado | Pendiente |
| Texto largo y texto multicolor | Rellenos por carácter, sin duplicados; conservar tamaño/fuente/posición | Pendiente |
| Compuestos | Todas las partes restauradas después de fallo | Pendiente |
| Bloqueados, ocultos y máscaras | Motivos de omisión; sin cambios fuera del alcance | Pendiente |
| Alcances | Selección inicial; documento; intersección geométrica de mesa; cambio de mesa invalida acción | Pendiente |
| Cambio de documento/relleno/posición | Rechazo de token anterior antes de escritura | Pendiente |
| Lote y reintento | 8 colores; revisión/fijado/exclusión; mismo ID no repite la salida | Pendiente |
| Fallo de escritura y restauración | Recuperación completa o error parcial explícito; bloquear escrituras pendientes | Pendiente |
| Timeout y cierre | Reconectar confirma host, relee estado; ninguna cancelación supuesta | Pendiente |
| Etiqueta/leyenda | Blancos con borde; Arial; ancho/fuentes; mesa y límites completos; fuentes largas | Pendiente |
| Actualizar leyenda | Solo ID propio explícito; conservar anterior; recuperar; detectar edición posterior | Pendiente |
| Deshacer/rehacer | Documentar cuántos pasos son necesarios y resultado; no prometer uno | Pendiente |
| JSON y SVG/CSV | Importar datos válidos/corruptos; abrir SVG, fuentes y nombres; guardar PDF desde Illustrator | Pendiente |
| Lab | Catálogo físico real con procedencia; mismo código en todas las referencias; sin alterar muestras previas | Pendiente |
| Sin conexión | Búsqueda, favoritos, paletas, matching y archivos funcionan; versiones reporta error útil | Pendiente |

El banco crea y cierra sus propios documentos temporales. Puede tardar varios minutos. El CSV mide el host; tiempo de puente/UI se obtiene en Más > Diagnóstico del panel. Para baseline instalar 0.6.0 y medir los mismos fixtures/equipo, usando temporizador externo para el flujo completo si la versión anterior no expone métricas. No afirmar mejora del 50 %, p95 <100 ms o ahorro de producción hasta comparar muestras suficientes.

Salida recomendada: CSV del banco + JSON de diagnóstico + esta tabla con fecha, resultado, anomalías y capturas. Cerrar P0 requiere esta evidencia y una revisión del diseño de 8 colores, además de las comprobaciones de código/CI.
