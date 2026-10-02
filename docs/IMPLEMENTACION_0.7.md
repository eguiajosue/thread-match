# Implementación del plan · 0.7.0 piloto

Esta entrega aplica los incrementos A–G que pueden implementarse sin Illustrator nativo, mediciones físicas ni certificados. La versión estable 0.6.0 permanece disponible. La condición P0 del plan («validación nativa antes de publicar operaciones masivas») sigue abierta: 0.7.0 se distribuye exclusivamente como piloto, sin declararla lista para producción.

| Iniciativa | Implementado | Validación pendiente |
|---|---|---|
| A · Medir | Lectura, ranking, puente, UI, caché, omisiones; diagnóstico local exportable; banco JSX 100/1.000/10.000 objetos RGB y CMYK | Ejecutar en Illustrator Windows/macOS; textos largos, cierres, fallos parciales y baseline |
| B · Eficiencia | Caché LRU 128, deduplicación, pausa por visibilidad, sondeo adaptativo, filas compartidas que conservan foco, timeout y reconexión antes de nuevas escrituras | Medir p95 local y reducción del coste frente a 0.6; los objetivos del MD no son resultados medidos |
| C · Diseño | Mapa por color, revisión/fijado/exclusión, paginación, elección manual, reducción a N hilos, aplicar/leyenda/ambas, alcances explícitos, revalidación, idempotencia de lote y recuperación | Calidad de la propuesta por diseño y comportamiento real del DOM/Deshacer |
| D · Color | Origen visible en todas las pestañas, referencia/HEX, elección manual y disponibilidad, modo del documento, perfil «No expuesto» cuando no se obtiene; importación Lab con procedencia | Obtener mediciones físicas fiables; metadatos declarados por quien importa no certifican su autenticidad |
| E · Producción | Ancho mm, texto pt, separación mm, columnas, mesa activa o límites completos; bordes de blancos; capa de producción; copia o actualización explícita de leyenda; CSV y SVG | Validar fuentes, CMYK y documento SVG en Illustrator. PDF directo se pospone hasta validar exportación nativa; puede guardarse desde Illustrator abriendo SVG |
| F · Reutilización | Recientes, paletas por cliente y referencia, disponibilidad manual, respaldo JSON versionado, combinación/reemplazo y recuperación ante fallo de guardado | Probar migraciones con almacenamiento CEP real |
| G · Distribución | Consulta manual de estable, instalación con Illustrator cerrado, hashes por archivo y del ZIP, respaldo/restauración de versión anterior, canal piloto | Firma ZXP, firma/notarización de instaladores y pruebas reales requieren herramientas/certificados/plataformas; UXP depende de APIs disponibles |

## Uso

1. Selecciona el diseño; en **Hilos**, cambia de Color a **Diseño**.
2. Haz clic en una fila para elegir otro hilo en Buscar o Favoritos. Marca ✓ para revisar, ⌖ para fijar y − para excluir. «Revisar todas» confirma la tabla visible y las otras páginas.
3. «Reducir paleta» propone como máximo N códigos mediante una selección voraz que minimiza la suma de ΔE00 por color único. No usa cantidad de objetos como área visual ni garantiza el óptimo global. Respeta fijados/excluidos y deja propuestas nuevas sin revisar.
4. Aplica, genera leyenda o ambas. **Más > Trabajo y alcance** elige selección, mesa o documento; selección es el valor inicial. Una mesa incluye objetos cuyo rectángulo geométrico la cruza, sin recortar sus rellenos.
5. **Más** guarda paletas, disponibilidad, respaldos y salidas. Una paleta solo carga HEX exactos dentro de la misma referencia y exige revisión.
6. **Diagnóstico > Recuperar** restaura la última operación de rellenos/leyenda en esta sesión. Revisa primero que no hayas cambiado esos objetos. Las etiquetas individuales se eliminan con las herramientas normales de Illustrator.

## Operaciones y recuperación

Se vuelven a leer documento, raíces, rellenos, compuestos, límites y mesa activa antes de modificar. Se preparan muestras antes de las escrituras. Un fallo intenta restaurar en orden inverso; si quedan pasos pendientes, se conserva la recuperación y se bloquean nuevas escrituras. Las escrituras no son una transacción nativa ni se promete un único Ctrl+Z. Un timeout no cancela Illustrator: obliga a obtener respuesta de `health` y releer el documento.

La recuperación se guarda solo en memoria del host; no persiste después de cerrar Illustrator o recargar la extensión. Las muestras creadas se conservan si siguen usadas en otros objetos, trazos o texto, o si su uso no puede verificarse. Se detiene ante cambios de relleno posteriores o cambios detectados en la salida. La comparación de salida cubre geometría, texto y rellenos directos; no constituye una detección exhaustiva de toda apariencia/efecto posible. La actualización de leyenda oculta la anterior y conserva una copia en el documento para restauración; evita crear versiones ocultas indefinidamente en trabajos largos.

## Referencia Lab importable

Se exige catálogo completo para impedir mezclas silenciosas de referencias. `colors` contiene exactamente los 160 códigos conocidos, `lab` usa `l`, `a`, `b`, y `rgb` es la representación sRGB de pantalla suministrada por quien mide. No se inventa una conversión de Lab a RGB ni una calibración a partir del PDF.

```json
{
  "schemaVersion": 1,
  "whitePoint": "D65",
  "observer": "2deg",
  "source": {
    "calibrated": true,
    "instrument": "Nombre real del instrumento",
    "method": "Método y condiciones de medición",
    "date": "2026-10-02",
    "author": "Responsable de la medición"
  },
  "colors": [
    {"code": "5801", "lab": {"l": 95, "a": 0, "b": 1}, "rgb": {"r": 245, "g": 245, "b": 243}}
  ]
}
```

El ejemplo ilustra la estructura; no es una medición válida ni un archivo importable completo. PDF y Montaje se conservan intactos. «Medido» usa Lab importado para ranking y RGB importado para pantalla/muestra; las muestras tienen sufijo propio y un conflicto de valor requiere renombrar, no recolorear muestras existentes.

## Instalación y firma

El panel abre la página de la última versión estable al solicitarlo. La publicación por Actions es automática tras la verificación; la instalación es guiada y requiere Illustrator cerrado. No instala código remoto durante una sesión. `INTEGRITY.sha256` detecta corrupción del contenido; no equivale a una firma de autenticidad. Cada instalador conserva una versión anterior; los scripts `Restaurar-version-anterior` intercambian ambas versiones sin borrar preferencias.

Para evaluar firma CEP: obtener ZXPSignCmd desde Adobe, un certificado válido y contraseña fuera del repositorio; firmar el directorio de extensión, verificar con la herramienta y probar instalación/desinstalación en ambos sistemas. No se publica un ZXP falso o autofirmado como distribución certificada. Firmar/notarizar los instaladores es una evaluación separada.

## Preparación UXP

El motor `src/color`, `src/matching` y `src/design` no depende de CEP. El adaptador `src/illustrator` expone lectura, contexto, muestras, salidas y recuperación. `plugin/bridge.jsx` aporta el protocolo scan/watch/act/batch/reduce/recover/health; el panel conserva preferencias y renderizado aparte. Una futura implementación UXP debe sustituir el adaptador y transporte, mantener las validaciones y superar la misma matriz nativa. No se incluye un manifiesto UXP instalable sin APIs de Illustrator verificadas.
