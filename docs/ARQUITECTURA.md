# Arquitectura y decisiones

## Evaluación previa

| Alternativa | Evaluación para este proyecto |
|---|---|
| ExtendScript + ScriptUI | Elección del MVP. Acceso al DOM, selección, colores, textos y muestras. JSX autónomo, instalación simple, ES3. Ventana modal; no panel acoplable. |
| CEP | Permite panel HTML acoplable y puente a ExtendScript. Añade manifiesto, instalación y mantenimiento. Adobe anuncia retiro en diciembre de 2029. No conviene iniciar ese coste para el MVP. |
| UXP | Adobe anunció beta pública de plugins para Illustrator para primavera de 2027; no es base disponible para Illustrator 2025 en este alcance. Evaluar APIs reales al migrar. |

Fuentes oficiales consultadas el 2 de octubre de 2026:

- [Adobe: instalar y ejecutar scripts](https://helpx.adobe.com/illustrator/desktop/automate-visualize-data/automate-actions/install-and-run-scripts.html).
- [Adobe: transición CEP/UXP, septiembre 2026](https://blog.developer.adobe.com/en/publish/2026/09/investing-in-the-future-of-creative-cloud-extensibility-uxp-comes-to-our-flagship-applications). La transición no afecta a ExtendScript.
- [Sharma, Wu y Dalal: CIEDE2000, notas y datos de prueba](https://hajim.rochester.edu/ece/sites/gsharma/ciede2000/), Color Research and Application, 30(1), 21–30, 2005.

## Alcance técnico

El catálogo es independiente del código. El motor acepta un RGB sRGB validado, lo convierte a XYZ y CIELAB D65, calcula ΔE00 contra cada hilo y devuelve una lista ordenada. El adaptador de Illustrator obtiene rellenos y conserva referencias a sus destinatarios. ScriptUI únicamente elige una sugerencia y una acción. La mutación ocurre después de cerrar el diálogo para facilitar el Undo del host; la granularidad real de Ctrl+Z debe verificarse en Illustrator.

El fuente usa `var`, funciones y sintaxis compatible con ES3. El build concatena módulos dentro de una función, añade `#target illustrator` y embebe un JSON serializado como literal. No usa `eval` para cargar datos ni requiere un parser JSON dentro del host. Un JSON corrupto detiene el build; un catálogo vacío o incompatible se rechaza en el motor.

## Extracción reproducible

PDF de cuatro páginas, con 64 + 64 + 32 hilos en páginas 2, 3 y 4. Los bloques de texto identifican cada código de cuatro dígitos y su nombre. El código 5899 comparte bloque con el pie de página: el extractor busca la línea del código dentro del bloque, evitando asociar el sitio web al nombre.

Las coordenadas están en puntos PDF (origen superior izquierdo). Si `x1` es el extremo derecho del código y `cy` su centro vertical, el ROI es `[x1+29, cy-9, x1+76, cy+9]`. Son regiones de 47 × 18 puntos dentro de la muestra a la derecha del texto. Este diseño de extracción es específico para este PDF; no es un detector universal de catálogos.

Se renderiza cada ROI a 216 dpi, RGB sin alfa con PyMuPDF. Se calcula la media de los canales por píxel como proxy de luminosidad, se excluyen valores fuera de percentiles 10–90 y se obtiene la mediana por canal de los restantes. Se redondea a RGB 8 bits. No se descartan todos los píxeles blancos porque algunos hilos son claros. La región evita bordes, separadores y texto; la exclusión de extremos reduce reflejos y sombras de la textura. Los tres canales medianos no tienen que corresponder a un único píxel real.

Se almacena página, ROI, método, SHA-256 del PDF, fuente no calibrada y espacio de color. El proceso exige exactamente 160 códigos únicos. La hoja `extraction-review.png` permite comparar cada ROI con su color representativo; fue revisada visualmente. La extracción no convierte un PDF fotografiado en una medición física.

## Colorimetría

- RGB: 0–255, supuesto sRGB.
- Linearización sRGB: `v/12.92` si `v <= 0.04045`; en caso contrario `((v+0.055)/1.055)^2.4`, con v en 0–1.
- Matriz sRGB → XYZ D65 estándar. XYZ normalizado 0–1.
- Blanco D65: Xn=0.95047, Yn=1, Zn=1.08883; observador de 2 grados.
- Lab: umbral 216/24389; pendiente 24389/27.
- ΔE00: kL=kC=kH=1; corrección de croma, ángulo de tono, función de ponderación y rotación implementadas explícitamente.
- Empates: orden por código para resultados deterministas.
- Indicadores relativos configurables: ≤2 muy cercano, ≤5 cercano, ≤10 alternativa, >10 diferencia alta. Son ayudas de comparación digital, no umbrales validados para aprobar un bordado.

## Dataset y calibración futura

Objeto raíz con `schemaVersion: 1`, `colorSpace: "sRGB"`, `whitePoint: "D65"`, fuente y array `colors`. Cada hilo conserva `code`, `name`, `rgb`, `hex`, `lab`, `collection`, `weight` y `source`.

Para valores físicos: conservar código/nombre, registrar instrumento, iluminante, observador y método en `source`, usar `source.calibrated: true`, proporcionar `lab` D65 y RGB sRGB/HEX de previsualización. El build conserva ese Lab calibrado; en referencias digitales recalcula Lab desde RGB. Si la medición es D50 u otro blanco, transformar primero a D65 mediante un proceso documentado; no etiquetar datos D50 como D65. Un catálogo mixto requiere explicar cada fuente. La normalización de mediciones y la adaptación cromática no están implementadas en el MVP.

## Riesgos y medidas

- RGB de trabajo distinto a sRGB: no hay gestión ICC completa. Trabajar en sRGB para esta versión.
- CMYK: conversión del host dependiente de perfiles; probar en documentos reales.
- Fluorescencia, brillo, textura y telas: el ranking digital puede diferir del hilo físico.
- Muestras existentes: reutilizar globales de proceso por código; si hay un conflicto de tipo/color, pedir renombrar o corregir mediante un mensaje sin sobrescribir.
- Aplicación: guardar rellenos; restaurarlos y retirar la muestra recién creada si falla una escritura. La restauración es de mejor esfuerzo si el propio host bloquea un objeto durante la operación.
- Apariencia: el algoritmo no considera opacidad, efectos ni sobreimpresión.
- Compatibilidad: mocks y pruebas Node verifican lógica; no sustituyen el DOM, ScriptUI y Undo reales de Illustrator.

## Fases y estado

| Fase | Resultado |
|---|---|
| 1. Dataset | 160 colores extraídos; revisión visual; extracción reproducible |
| 2. Motor | Conversiones, ΔE00, ranking; 34 pares Sharma aprobados |
| 3. Integración | Adaptadores y errores comunes; probados con mocks |
| 4. UI | Top 5 y selector de color; smoke tests simulados |
| 5. Aplicación | Muestras globales, reutilización y restauración; probadas con mocks |
| 6. Etiquetas | Texto editable y posición; probado con mocks |
| 7. Analizar diseño | Colores únicos de selección/grupos implementados; reemplazo masivo futuro |
| 8. Avanzadas | Favoritos, recientes, historial, filtros, editor de perfiles y panel pendientes |

Siguiente gate: completar validación nativa de la versión 0.1.2 antes de ampliar funciones. Fase posterior: reemplazo masivo con revisión por color; después persistencia de preferencias y calibración, manteniendo el motor portable.

## Referencias y auditoría 0.5.0

`color/references.js` deriva el catálogo de montaje de los RGB originales y de `data/reference-policy.json`, sin mutar el dataset base. Aclara tres blancos mediante normalización de canales en luz lineal respecto a 5801, asumido neutro. El resto de los hilos permanece igual. El puente CEP reconstruye el matcher e invalida el snapshot al cambiar de referencia. El build genera ambos catálogos del panel desde el mismo motor; las muestras de montaje se distinguen por nombre. El JSX autónomo usa Carta PDF.

La [auditoría completa](COLOR_AUDIT.md) registra 160 reproducciones exactas, contraste entre PyMuPDF y Poppler y variación en nueve zonas por muestra. Estos diagnósticos digitales no cuantifican el error frente al hilo físico.
