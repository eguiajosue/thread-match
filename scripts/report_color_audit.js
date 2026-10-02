const fs=require('fs'),path=require('path'),T=require('../dist/threadmatch-core.js');
const root=path.resolve(__dirname,'..'),audit=JSON.parse(fs.readFileSync(path.join(root,'data/color-audit.json'),'utf8'));
const adjusted=T.catalogForReference(T.catalog,'montage'),byCode=Object.fromEntries(adjusted.colors.map(c=>[c.code,c]));
const delta=(a,b)=>T.deltaE2000(T.rgbToLab(a),T.rgbToLab(b));
const round=x=>Number(x.toFixed(4));
for(const c of audit.colors){c.hex=T.rgbToHex(c.catalogRGB);c.montageHex=byCode[c.code].hex;c.rendererDeltaE00=round(delta(c.catalogRGB,c.popplerRGB));c.maximumSpatialDeltaE00=round(Math.max(...c.spatialRGB.map(rgb=>delta(c.catalogRGB,rgb))));c.montageDeltaE00=round(delta(c.catalogRGB,byCode[c.code].rgb));}
const sorted=audit.colors.slice().sort((a,b)=>b.rendererDeltaE00-a.rendererDeltaE00);
const median=values=>{const s=values.slice().sort((a,b)=>a-b);return (s[79]+s[80])/2;};
audit.summary={maximumRendererDeltaE00:sorted[0].rendererDeltaE00,medianRendererDeltaE00:round(median(audit.colors.map(c=>c.rendererDeltaE00))),maximumSpatialDeltaE00:Math.max(...audit.colors.map(c=>c.maximumSpatialDeltaE00)),montageChangedCodes:audit.colors.filter(c=>c.hex!==c.montageHex).map(c=>c.code)};
fs.writeFileSync(path.join(root,'data/color-audit.json'),JSON.stringify(audit,null,2)+'\n');
fs.writeFileSync(path.join(root,'docs/color-audit.csv'),'code,name,page,pdf_hex,montage_hex,renderer_deltaE00,max_spatial_deltaE00,montage_deltaE00,exact_reproduction\n'+audit.colors.map(c=>[c.code,c.name,c.page,c.hex,c.montageHex,c.rendererDeltaE00,c.maximumSpatialDeltaE00,c.montageDeltaE00,c.exactReproduction].join(',')).join('\n')+'\n');
const whites=audit.colors.filter(c=>audit.summary.montageChangedCodes.includes(c.code));
const notes=`# Auditoría de color - ThreadMatch 0.5.0

## Resultado

Se verificaron los 160 códigos, nombres, páginas y regiones contra el PDF suministrado. Se reprodujeron exactamente los **160/160 RGB** del catálogo 0.4.0. No se encontró una asociación errónea que explique los blancos grisáceos: esos tonos ya están en las fotografías de la carta. No se sustituyeron los otros 157 colores por valores inventados.

Fuente SHA-256: \`${audit.sourceSHA256}\`. Cuatro páginas; 64 + 64 + 32 hilos en las páginas 2, 3 y 4. Perfil ICC de las imágenes: **${audit.iccProfiles.map(p=>p.description).join(', ')}**. El PDF no suministra mediciones espectrofotométricas de cada hilo.

## Comprobaciones independientes

- Extracción reproducible: mediana por canal, dentro del ROI de 47 × 18 pt, a 216 dpi; exclusión de extremos de luminosidad 10–90 %.
- Segundo renderizador: Poppler a 216 dpi, misma región y método, contrastado con PyMuPDF ${audit.pymupdfVersion}.
- Diferencia máxima entre renderizadores: **ΔE00 ${audit.summary.maximumRendererDeltaE00}**; mediana **${audit.summary.medianRendererDeltaE00}**. Son diferencias entre dos representaciones digitales del mismo PDF, no error frente al hilo físico.
- Nueve subregiones por muestra: diferencia máxima dentro de una fotografía **ΔE00 ${audit.summary.maximumSpatialDeltaE00}**. Describe sombras, trama y reflejos; no es una tolerancia de producción.
- Revisión visual de las tres páginas del catálogo y de la hoja de 160 muestras. Los blancos fotografiados están lejos del blanco sRGB; las regiones de extracción revisadas no incluyen texto ni separadores.

## Dos referencias

**Carta PDF** es el modo predeterminado. Conserva todos los RGB/HEX originales para comparar con la carta digital, incluidos los blancos grisáceos y las variaciones de iluminación. No se afirma que una mediana reproduzca todos los píxeles o la textura del hilo.

**Montaje** modifica únicamente 5801, 5802 y 5803. Se decodifica sRGB a luz lineal, se divide cada canal por el correspondiente canal de 5801 (el más luminoso de estos tres blancos), se limita a 0–1 y se vuelve a codificar en sRGB de 8 bits. Este modo supone que 5801 debería verse neutro y usa su muestra como ancla de blanco. Es un ajuste visual explícito, **no calibración física ni color oficial de Madeira**. La fluorescencia no se reproduce con un RGB plano. Cream e Ivory conservan sus valores fotografiados: no se conoce el blanco real bajo su iluminación y no se neutralizan por el nombre.

| Hilo | Carta PDF | Montaje | ΔE00 del ajuste |
|---|---|---|---|
${whites.map(c=>'| '+c.code+' '+c.name+' | '+c.hex+' | '+c.montageHex+' | '+c.montageDeltaE00+' |').join('\n')}

El selector afecta a las coincidencias, al catálogo de búsqueda, a la vista previa, a las etiquetas y a los rellenos aplicados. Cambiar la referencia invalida el análisis anterior. Las muestras de blancos para montaje llevan el sufijo \`· montaje\` para coexistir con las de Carta PDF sin recolorear trabajos anteriores. El JSX autónomo sigue usando Carta PDF; el selector de referencias pertenece al panel CEP.

## Límites y mejora futura

La carta incluye fotografías con sombra, brillo y textura y advierte que los tonos digitales pueden variar del hilo real. Mejorar la fidelidad física requiere datos Lab medidos u oficiales con iluminante/observador documentados; no basta con hacer más brillantes los 160 tonos. Para contrastar el panel con Illustrator, usar un documento con perfil sRGB; el proyecto no implementa gestión ICC completa de perfiles de trabajo alternativos ni de toda la cadena monitor/impresión.

Fuentes técnicas: [PyMuPDF Page.get_pixmap](https://pymupdf.readthedocs.io/en/latest/page.html), [Adobe: imprimir con gestión de color](https://helpx.adobe.com/illustrator/using/printing-color-management.html).

## Evidencia y reproducción

- [160 filas con resultados](color-audit.csv).
- [Comparación de blancos](white-reference-comparison.svg).
- [Diagnósticos por región](../data/color-audit.json).
- [Política separada del catálogo](../data/reference-policy.json).

\`\`\`sh
pdftoppm -f 2 -l 4 -r 216 -png /ruta/carta.pdf /ruta/tmp/poppler
python scripts/audit_catalog.py /ruta/carta.pdf --poppler-dir /ruta/tmp
npm run build
node scripts/report_color_audit.js
npm test
\`\`\`

El PDF y los renders completos se mantienen fuera del repositorio. La regeneración mediante \`extract_catalog.py\` conserva la política de referencias. El informe debe regenerarse al cambiar el PDF o los RGB base.
`;
fs.writeFileSync(path.join(root,'docs/COLOR_AUDIT.md'),notes);
function escape(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;');}
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="760" height="360" viewBox="0 0 760 360"><rect width="760" height="360" fill="#20242b"/><g font-family="Arial,sans-serif" fill="#edf0f4"><text x="28" y="36" font-size="21" font-weight="bold">ThreadMatch · dos referencias de blanco</text><text x="28" y="61" font-size="12" fill="#b9c2ce">Carta PDF conserva la fotografía. Montaje es un ajuste visual.</text><text x="340" y="95" font-size="13">Carta PDF</text><text x="550" y="95" font-size="13">Montaje</text>';
whites.forEach((c,i)=>{const y=112+i*73;svg+='<text x="28" y="'+(y+22)+'" font-size="15">'+escape(c.code+' · '+c.name)+'</text>';[c.hex,c.montageHex].forEach((hex,j)=>{const x=340+j*210;svg+='<rect x="'+x+'" y="'+y+'" width="155" height="35" rx="4" fill="'+hex+'" stroke="#7c8796"/><text x="'+x+'" y="'+(y+55)+'" font-size="12" fill="#b9c2ce">'+hex+'</text>';});});
svg+='</g></svg>';fs.writeFileSync(path.join(root,'docs/white-reference-comparison.svg'),svg);
console.log(JSON.stringify(audit.summary));
