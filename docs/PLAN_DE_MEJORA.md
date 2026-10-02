# ThreadMatch: propuesta de mejora para eficiencia y eficacia

**Fecha:** 2 de octubre de 2026
**Versión evaluada:** 0.6.0
**Repositorio:** https://github.com/eguiajosue/thread-match
**Estado:** propuesta de producto e implementación, con metas pendientes de medición.

## 1. Recomendación ejecutiva

La siguiente evolución debe reducir el trabajo por diseño, además de acelerar el panel. Propongo convertir ThreadMatch en un asistente que permita revisar toda la paleta, asignar los hilos y generar una leyenda editable en un mismo flujo.

La prioridad es validar el comportamiento en Illustrator real, medir dónde se consume tiempo y construir el procesamiento por diseño. Después, mejorar la confianza de las decisiones de color, la reutilización de paletas y la distribución. La migración a UXP requiere preparación desde ahora y ejecución cuando las APIs de Illustrator cubran el flujo.

**Eficiencia:** menos clics, menos recorridos innecesarios del documento y menos trabajo repetido.
**Eficacia:** elegir el hilo apropiado, aplicar la decisión al objeto correcto y entregar instrucciones claras para producción.

## 2. Diagnóstico del estado actual

La revisión se basó en el código local de la versión 0.6.0: panel, puente CEP, selección, aplicación y etiquetas, junto con README y las validaciones realizadas durante el proyecto.

| Área | Lo que ya funciona | Oportunidad concreta |
|---|---|---|
| Coincidencias | 160 hilos, Lab D65 y CIEDE2000, cinco alternativas por color | Mostrar el origen de los datos y distinguir similitud digital de aprobación física |
| Selección automática | Sondeo aproximadamente cada 900 ms; evita recalcular el ranking si nada cambió | El puente sigue recorriendo la selección antes de decidir que no cambió; medir especialmente grupos y textos grandes |
| Flujo | Buscar, Favoritos, aplicar y crear etiquetas por hilo | Resolver varios colores en una revisión y una operación por diseño |
| Interfaz | Cuatro pestañas, páginas de cinco elementos y navegación por teclado | Mostrar siempre qué color del diseño recibirá el hilo, incluso en Buscar y Favoritos |
| Referencias | Carta PDF y Montaje, con tres blancos ajustados | Identificar la referencia en la salida y admitir datos medidos cuando existan |
| Etiquetas | Grupo editable, nombres, códigos y muestras | Leyenda única, medidas configurables y contorno para muestras blancas |
| Favoritos | Persistencia local por código | Paletas por cliente/trabajo, recientes y exportación/importación |
| Distribución | Releases e instaladores Windows/macOS | Aviso de nuevas versiones, actualización con recuperación y validación de paquetes firmados |
| Pruebas | 70 pruebas, interfaz con puente simulado e instaladores | Matriz de pruebas en Illustrator real: carga, Undo, fuentes y gestión de color |

No se ha medido todavía el rendimiento de Illustrator real. Las metas de tiempo de este documento son criterios propuestos, no resultados actuales. Tampoco se puede deducir fidelidad física del hilo a partir del éxito de las pruebas de software.

## 3. Prioridades y alcance

| Prioridad | Iniciativa | Beneficio | Esfuerzo relativo |
|---|---|---|---|
| P0 | Validación nativa, medición y protección de operaciones | Evitar errores y establecer una base confiable | Medio |
| P1 | Modo Diseño: mapa de colores a hilos y acciones por lote | Principal ahorro operativo | Alto |
| P1 | Contexto visible y etiquetas de producción | Reducir equivocaciones y mejorar entrega | Medio |
| P1 | Optimización según las mediciones | Panel más ágil en archivos grandes | Medio |
| P2 | Paletas guardadas, recientes y disponibilidad | Reutilización entre trabajos | Medio |
| P2 | Actualización y distribución | Reducir soporte y facilitar adopción | Medio/alto |
| P3 | Datos físicos y migración UXP | Mayor precisión y continuidad futura | Alto; depende de terceros/APIs |

P0 debe cerrarse antes de publicar operaciones masivas. P3 se investiga en paralelo, pero no debe bloquear mejoras operativas que CEP pueda entregar hoy.

## 4. Iniciativas propuestas

### A. Medir y estabilizar el comportamiento real

Crear una matriz con documentos RGB sRGB y CMYK; selección simple, grupos anidados, trazados compuestos, textos, objetos bloqueados y capas ocultas. Incluir cambio de documento durante el análisis, conflicto con muestras existentes, fallos a mitad de una aplicación y reapertura del panel.

Medir separadamente: lectura del documento, agrupación de colores, ranking, comunicación con el panel y actualización visual. Registrar localmente tiempos y cantidades de objetos/colores; no se necesita un servicio de telemetría para este MVP.

Preparar casos pequeños, medianos y grandes, por ejemplo 100, 1,000 y 10,000 objetos simples, más textos largos. Esos conteos son una propuesta para el banco de pruebas; la complejidad del documento también importa.

**Criterios de aceptación:** ninguna escritura sobre un análisis obsoleto; ningún cambio en objetos fuera del alcance; los casos de recuperación y Undo quedan verificados en Illustrator. Si el host no permite un único Undo para toda la operación, documentar el comportamiento real y ofrecer recuperación sin prometer una transacción que todavía no se ha demostrado.

### B. Optimizar donde se encuentre el coste

Priorizar la lectura del DOM de Illustrator antes de optimizar el cálculo sobre un catálogo de solo 160 hilos.

Cambios propuestos:

- Sondeo adaptativo: frecuencia mayor durante interacción y menor en reposo. Mantener la pausa cuando el panel esté oculto y comprobar su comportamiento al acoplarlo en Illustrator.
- Usar eventos de selección/documento si las APIs disponibles los ofrecen de manera fiable; mantener un sondeo de respaldo. No asumir que CEP expone todos los cambios de relleno.
- Caché acotada del ranking por RGB, referencia y revisión del catálogo, para reutilizar resultados aunque cambien los objetos seleccionados.
- Comprobar objetos ya visitados y evitar recorridos duplicados; agrupar los rangos de texto cuando sea posible sin perder sus diferencias de relleno.
- Unificar la creación de filas de Hilos, Buscar y Favoritos. Actualizar únicamente los elementos cuyo estado cambió para conservar foco y selección.
- Añadir estado de comunicación y recuperación si el puente tarda demasiado. Un timeout debe bloquear escrituras nuevas hasta comprobar el estado del host: no convierte una operación incierta en una cancelación confirmada.

**Criterios de aceptación:** reducir al menos 50 % el tiempo de lectura repetida en el caso que resulte problemático, respecto a su baseline; navegación y búsqueda locales con p95 menor de 100 ms en los equipos de prueba. La respuesta completa del host se fijará después de medirla; no se promete un límite universal para cualquier archivo.

### C. Modo Diseño: resolver toda la paleta

Añadir dentro de Hilos un cambio de vista **Color / Diseño**, conservando la distribución compacta del panel. El modo Diseño presenta una tabla paginada con el color original, el hilo elegido, la diferencia digital y el estado de revisión.

Flujo propuesto:

1. Seleccionar el diseño y analizar sus colores únicos.
2. Revisar la sugerencia para cada color o elegir otro hilo mediante búsqueda/favoritos.
3. Fijar asignaciones que deban conservarse, por ejemplo el color de una marca.
4. Revisar una vista previa del mapa original → hilo y los objetos afectados.
5. Ejecutar **Aplicar paleta**, **Crear leyenda** o ambas acciones.

Por defecto se trabaja con la selección. Ampliar a mesa de trabajo o documento debe ser una elección explícita de alcance. Objetos bloqueados y rellenos no soportados se contabilizan con un motivo visible; no desaparecen del resultado sin explicación.

La operación debe revalidar documento, selección, rellenos y referencia antes de escribir, conservar los originales y comunicar cualquier fallo parcial. También debe proteger contra la creación duplicada de una leyenda por varios clics.

Como segunda iteración, ofrecer **Reducir a N hilos**: una propuesta de agrupación que conserve asignaciones fijadas y muestre qué colores se fusionarían y cuánto cambia su similitud digital. El usuario revisa ese mapa antes de aplicarlo. No usar simplemente el número de caracteres u objetos como sustituto de importancia visual.

**Criterios de aceptación:** todos los colores quedan asignados o excluidos explícitamente; las decisiones se mantienen durante la revisión; se genera una entrada de leyenda por hilo final, sin duplicados. Meta de producto: reducir al menos 50 % el tiempo para preparar un diseño de ocho colores frente al flujo actual, medido con el mismo archivo y operador.

### D. Mejorar el contexto y la confianza del color

Mantener visible un indicador compacto del destino: por ejemplo **Color del diseño #E92178 · 12 rellenos**, también en Buscar y Favoritos. Así se puede elegir un hilo manual sin perder de vista dónde se aplicará.

Mostrar por hilo, bajo demanda, RGB/HEX, referencia y origen del dato. Identificar **Elección manual** cuando el hilo no se eligió por ranking. Los indicadores de ΔE deben describirse como similitud digital; no como una garantía de que el bordado físico se verá igual.

Detectar el modo de color y el perfil del documento hasta donde las APIs lo permitan. Si el perfil no puede identificarse de forma fiable, indicarlo y evitar presentar una conversión como verificada. Mantener el catálogo original intacto; cualquier override necesita origen y revisión separados.

La mejora física requiere valores Lab oficiales o medidos, con iluminante, observador y método documentados. Importarlos primero como un catálogo validado; no reemplazar silenciosamente la referencia fotografiada ni tratar el ajuste de Montaje como una medición. Los colores fluorescentes seguirán necesitando verificación física.

**Criterios de aceptación:** coincidencias, búsqueda, favoritos, vista previa y aplicación usan la misma referencia; las exportaciones identifican esa referencia; el cambio de perfil/catálogo invalida los resultados antiguos.

### E. Etiquetas y leyendas listas para producción

Proponer dos formatos: **Etiqueta individual** y **Leyenda de diseño**. La leyenda agrupa una muestra, código y nombre por hilo y puede llevar nombre del trabajo y referencia utilizada.

Mejoras concretas:

- Contorno neutro fino alrededor de la muestra: el blanco del hilo debe distinguirse del fondo blanco de la tarjeta sin modificar su RGB.
- Dimensiones en mm, tamaño de letra y separación mediante presets compactos, con valores editables.
- Posición basada en los límites del diseño completo y opciones de colocación en una mesa de trabajo elegida.
- Distribución en filas/columnas para evitar una cadena de etiquetas que se extienda fuera de la mesa.
- Capa dedicada y grupos identificados. Una leyenda existente puede actualizarse mediante una acción explícita, conservando la opción de crear una copia.
- Exportación de códigos/nombres/referencia a CSV para producción. Añadir SVG/PDF de leyenda después de validar el documento generado.

**Criterios de aceptación:** textos largos legibles, muestras blancas visibles, tamaños reproducibles y ninguna edición de una etiqueta ajena o de otro trabajo.

### F. Reutilizar decisiones y disponibilidad

Añadir recientes y **paletas por trabajo o cliente**, con título, códigos y referencia. Guardar también las asignaciones cuando se requiera repetir un diseño; un favorito por sí solo no conserva el mapa de colores del original.

Permitir exportar/importar preferencias y paletas en JSON versionado, con validación de códigos y una elección de combinar o sustituir. Esto facilita pasar del equipo Windows al Mac sin exigir cuentas o un backend para el primer alcance.

Añadir una lista manual de **hilos disponibles** y un filtro opcional para sugerir solo esos códigos. La disponibilidad manual no equivale a un inventario actualizado ni permite estimar automáticamente consumo de hilo.

**Criterios de aceptación:** favoritos y paletas sobreviven a una actualización; importar datos inválidos no destruye los existentes; el filtro de disponibilidad se muestra claramente y puede desactivarse.

### G. Distribución y continuidad

Primero, mostrar versión instalada y ofrecer **Buscar actualizaciones**, con enlace a la Release estable y sus cambios. La función principal seguirá disponible sin internet.

En una segunda etapa, usar un instalador/actualizador que compruebe compatibilidad, paquete e integridad, conserve preferencias y permita volver a la versión anterior. El reemplazo de archivos debe realizarse con Illustrator cerrado. Diferenciar ese flujo de una actualización en caliente del panel.

Evaluar empaquetado ZXP firmado y su instalación real en ambos sistemas. Adobe documenta ZXPSignCmd para firmar y empaquetar CEP, pero firmar un ZXP no demuestra por sí solo que un instalador Windows o macOS esté validado para todas las versiones del sistema. Evaluar firma de instaladores y requisitos de macOS por separado antes de ampliar la distribución.

Separar lógica de catálogo/ranking, preferencias y operaciones de documento de la interfaz y del adaptador CEP. Esto reduce el coste de la migración futura. La separación en módulos legibles y contratos probados aporta más ahora que cambiar de framework sin una necesidad concreta.

Adobe anunció beta pública de plugins UXP para Illustrator en primavera de 2027, CEP deshabilitado por defecto en Illustrator en diciembre de 2028 y retirada de CEP de nuevas versiones desde diciembre de 2029. Mantener CEP para las instalaciones compatibles actuales y preparar una prueba UXP cuando exista acceso real a las APIs necesarias. No tratar el anuncio de beta como garantía de cobertura funcional de ThreadMatch.

## 5. Secuencia de entrega

Las duraciones son estimaciones de planificación para una persona con acceso a equipos de prueba y archivos representativos. No incluyen espera por datos de color, certificados o APIs nuevas.

| Iteración | Entregable | Estimación orientativa | Dependencia / cierre |
|---|---|---|---|
| 1 | Baseline nativo, diagnóstico del host, contexto del color y contorno de blancos | 3–5 días de desarrollo | Matriz de Illustrator y métricas registradas |
| 2 | Modo Diseño, asignaciones y leyenda por lote | 5–8 días | Revalidación y recuperación verificadas en la iteración 1 |
| 3 | Optimización demostrada, presets, recientes y paletas importables | 4–6 días | Comparación con baseline y pruebas de persistencia |
| 4 | Aviso de versiones y piloto de distribución con recuperación | 3–5 días | Pruebas de instalación/actualización nativas y política de paquetes |
| Investigación continua | Datos Lab e integración UXP | Sin plazo cerrado | Disponibilidad de datos y APIs reales |

La optimización que resulte necesaria para que el modo Diseño funcione bien puede adelantarse a la iteración 2. Publicar por incremento validado; no esperar a terminar todo el roadmap.

## 6. KPIs y validación

| Indicador | Cómo medirlo | Meta propuesta |
|---|---|---|
| Tiempo por diseño de ocho colores | Tres repeticiones antes/después, mismo operador y archivo | Reducción ≥50 % |
| Interacción local de búsqueda/navegación | Tiempo de entrada a actualización de la UI, p95 | <100 ms en equipos de prueba |
| Coste de lectura de una selección grande | Tiempo del recorrido del DOM y frecuencia de recorridos | Reducir ≥50 % el caso problemático si se confirma ese cuello de botella |
| Aplicación correcta | Casos de selección, cambio de documento y fallo parcial | Ningún cambio fuera del alcance en la matriz |
| Salida de producción | Conteo de hilos únicos y revisión de leyenda | Sin duplicados involuntarios; códigos/nombres/referencia completos |
| Persistencia | Reapertura, importación y actualización | Conservar favoritos y paletas válidas |
| Precisión física | Comparación con carta/hilo o datos medidos documentados | Establecer tolerancias con datos reales; no prometer un umbral todavía |

Usar los equipos y versiones de Illustrator que realmente se utilizan en el trabajo. Ampliar la matriz a otras versiones del sistema solo cuando se vaya a declarar soporte para ellas. Mantener pruebas automáticas para regresiones y pruebas nativas para DOM, Undo, tipografías, perfiles y carga de la extensión.

## 7. Alcance recomendado para el siguiente incremento

Empezaría por **contexto visible del color + validación nativa + leyenda de diseño**, seguido del mapa de asignaciones por lote. Es el conjunto con mayor impacto sobre la tarea diaria de buscar, aplicar y documentar varios hilos.

Dejaría inventario conectado, sincronización cloud, otras marcas y reconocimiento de imágenes para una fase posterior. El catálogo de 160 hilos y el motor actual permiten obtener mejoras importantes antes de añadir infraestructura o funciones que todavía no tienen una necesidad operativa demostrada.

## 8. Fuentes y evidencia

**Base del proyecto:** código local 0.6.0 y [README](https://github.com/eguiajosue/thread-match), [auditoría de 160 colores](https://github.com/eguiajosue/thread-match/blob/main/docs/COLOR_AUDIT.md). Las 70 pruebas y verificaciones de UI/instaladores corresponden a esta versión; no sustituyen la validación en Illustrator real.

**Documentación oficial consultada el 2 de octubre de 2026:**

- [Adobe: transición CEP → UXP y fechas por aplicación](https://blog.developer.adobe.com/en/publish/2026/09/investing-in-the-future-of-creative-cloud-extensibility-uxp-comes-to-our-flagship-applications).
- [Adobe: efecto de la retirada de CEP en las versiones de Creative Cloud](https://helpx.adobe.com/creative-cloud/apps/integration-with-other-apps/manage-plugins/cep-uxp-plugin-transition.html).
- [Adobe: empaquetado y firma CEP/MXI con ZXPSignCmd](https://developer.adobe.com/developer-distribution/creative-cloud/docs/guides/submission/overview).

El orden, los esfuerzos y los KPIs son una propuesta basada en el flujo de trabajo y el código revisado. Los anuncios y herramientas oficiales se citan como dependencias técnicas, no como una validación ya completada de la futura implementación.
