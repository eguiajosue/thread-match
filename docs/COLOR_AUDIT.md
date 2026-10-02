# Auditoría de color - ThreadMatch 0.5.0

## Resultado

Se verificaron los 160 códigos, nombres, páginas y regiones contra el PDF suministrado. Se reprodujeron exactamente los **160/160 RGB** del catálogo 0.4.0. No se encontró una asociación errónea que explique los blancos grisáceos: esos tonos ya están en las fotografías de la carta. No se sustituyeron los otros 157 colores por valores inventados.

Fuente SHA-256: `7d4244cdd95dd44e34d6e9cebb9635c2f6b675aa1047b170507c0245b677f5e8`. Cuatro páginas; 64 + 64 + 32 hilos en las páginas 2, 3 y 4. Perfil ICC de las imágenes: **sRGB IEC61966-2.1**. El PDF no suministra mediciones espectrofotométricas de cada hilo.

## Comprobaciones independientes

- Extracción reproducible: mediana por canal, dentro del ROI de 47 × 18 pt, a 216 dpi; exclusión de extremos de luminosidad 10–90 %.
- Segundo renderizador: Poppler a 216 dpi, misma región y método, contrastado con PyMuPDF 1.26.6.
- Diferencia máxima entre renderizadores: **ΔE00 1.2032**; mediana **0.293**. Son diferencias entre dos representaciones digitales del mismo PDF, no error frente al hilo físico.
- Nueve subregiones por muestra: diferencia máxima dentro de una fotografía **ΔE00 5.4069**. Describe sombras, trama y reflejos; no es una tolerancia de producción.
- Revisión visual de las tres páginas del catálogo y de la hoja de 160 muestras. Los blancos fotografiados están lejos del blanco sRGB; las regiones de extracción revisadas no incluyen texto ni separadores.

## Dos referencias

**Carta PDF** es el modo predeterminado. Conserva todos los RGB/HEX originales para comparar con la carta digital, incluidos los blancos grisáceos y las variaciones de iluminación. No se afirma que una mediana reproduzca todos los píxeles o la textura del hilo.

**Montaje** modifica únicamente 5801, 5802 y 5803. Se decodifica sRGB a luz lineal, se divide cada canal por el correspondiente canal de 5801 (el más luminoso de estos tres blancos), se limita a 0–1 y se vuelve a codificar en sRGB de 8 bits. Este modo supone que 5801 debería verse neutro y usa su muestra como ancla de blanco. Es un ajuste visual explícito, **no calibración física ni color oficial de Madeira**. La fluorescencia no se reproduce con un RGB plano. Cream e Ivory conservan sus valores fotografiados: no se conoce el blanco real bajo su iluminación y no se neutralizan por el nombre.

| Hilo | Carta PDF | Montaje | ΔE00 del ajuste |
|---|---|---|---|
| 5801 fluorescent white | #C3C2CD | #FFFFFF | 14.5008 |
| 5802 snow white | #BCBCC5 | #F6F7F5 | 14.5634 |
| 5803 eggshell | #BBBABC | #F5F5EA | 15.032 |

El selector afecta a las coincidencias, al catálogo de búsqueda, a la vista previa, a las etiquetas y a los rellenos aplicados. Cambiar la referencia invalida el análisis anterior. Las muestras de blancos para montaje llevan el sufijo `· montaje` para coexistir con las de Carta PDF sin recolorear trabajos anteriores. El JSX autónomo sigue usando Carta PDF; el selector de referencias pertenece al panel CEP.

## Límites y mejora futura

La carta incluye fotografías con sombra, brillo y textura y advierte que los tonos digitales pueden variar del hilo real. Mejorar la fidelidad física requiere datos Lab medidos u oficiales con iluminante/observador documentados; no basta con hacer más brillantes los 160 tonos. Para contrastar el panel con Illustrator, usar un documento con perfil sRGB; el proyecto no implementa gestión ICC completa de perfiles de trabajo alternativos ni de toda la cadena monitor/impresión.

Fuentes técnicas: [PyMuPDF Page.get_pixmap](https://pymupdf.readthedocs.io/en/latest/page.html), [Adobe: imprimir con gestión de color](https://helpx.adobe.com/illustrator/using/printing-color-management.html).

## Evidencia y reproducción

- [160 filas con resultados](color-audit.csv).
- [Comparación de blancos](white-reference-comparison.svg).
- [Diagnósticos por región](../data/color-audit.json).
- [Política separada del catálogo](../data/reference-policy.json).

```sh
pdftoppm -f 2 -l 4 -r 216 -png /ruta/carta.pdf /ruta/tmp/poppler
python scripts/audit_catalog.py /ruta/carta.pdf --poppler-dir /ruta/tmp
npm run build
node scripts/report_color_audit.js
npm test
```

El PDF y los renders completos se mantienen fuera del repositorio. La regeneración mediante `extract_catalog.py` conserva la política de referencias. El informe debe regenerarse al cambiar el PDF o los RGB base.
