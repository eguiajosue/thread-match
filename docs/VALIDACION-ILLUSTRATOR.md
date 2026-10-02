# Validación nativa pendiente

Prueba en una copia de un montaje. Registra versión exacta de Illustrator, Windows, modo RGB/CMYK y perfil. Esta lista no se ha ejecutado dentro de Illustrator en el entorno de desarrollo.

| Caso | Resultado esperado |
|---|---|
| Sin documento | Mensaje para abrir un documento |
| Documento sin selección | Mensaje para seleccionar objetos |
| Trazado RGB sólido | HEX/RGB y cinco sugerencias ordenadas |
| Relleno RGB igual a un hilo del JSON | El hilo aparece con ΔE00 aproximadamente cero |
| Documento CMYK | Conversión razonable con los perfiles del documento; comparar muestra creada |
| Gris 0 / 50 / 100 | Negro / gris medio / blanco digital |
| Trazado sin relleno / degradado / imagen / patrón | Se omite; aviso o mensaje si toda la selección es incompatible |
| Grupo con rojo y azul | Dos colores; cambiar uno no modifica el otro |
| Trazado compuesto | Conserva geometría y agujeros; recolorea el compuesto |
| Marco de texto uniforme | Recolorea caracteres sin alterar contenido ni tipografía |
| Marco de texto multicolor | Recolorea solamente caracteres del color elegido |
| Aplicar el mismo hilo dos veces | Una única muestra global de proceso |
| Reejecutar después de aplicar | Lee la muestra global creada |
| Muestra existente con código y distinto color/tipo | Explica conflicto sin sobrescribir |
| Crear etiqueta | Grupo editable: fondo blanco, muestra arriba, nombre negro/negrita y código # debajo; posición bajo el objeto |
| Capa activa bloqueada al etiquetar | Mensaje comprensible y sin etiqueta incompleta |
| Cerrar ventana | No modifica el documento |
| Aplicar, Ctrl+Z, Ctrl+Shift+Z | Rellenos y muestra se deshacen/rehacen; registrar granularidad del Undo |
| Etiqueta, Ctrl+Z | Desaparece el texto creado |
| Tamaño de interfaz / escalado de pantalla | Cinco filas legibles y botones visibles |

Pruebas automáticas: 51 aprobadas. Incluyen 34 pares publicados de Sharma (tolerancia 0.00005), conversiones conocidas, 160 autocoincidencias y orden de ranking, datos inválidos, selección con mocks, reutilización/conflictos de muestras, restauración ante fallos, etiquetas e inicialización de interfaz simulada. El motor usa los mismos módulos que el JSX generado.

Reporta los fallos con el paso concreto, captura de ventana y un documento mínimo reproducible. No se garantiza un único paso de Undo ni compatibilidad de UI hasta verificarlo en el host real.
