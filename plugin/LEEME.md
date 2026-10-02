# ThreadMatch 0.3.0: instalación Windows/macOS

Extrae el ZIP completo. Cierra Illustrator antes de instalar, actualizar o desinstalar. Preparado para Illustrator 29.x/30.x (2025/2026), CEP 11/12.

| Sistema | Instalación | Ruta por usuario |
|---|---|---|
| Windows | `Instalar-ThreadMatch.bat` | `%APPDATA%\Adobe\CEP\extensions\com.threadmatch.illustrator` |
| macOS | `Instalar-ThreadMatch.command`, o `bash Instalar-ThreadMatch.command` en Terminal | `~/Library/Application Support/Adobe/CEP/extensions/com.threadmatch.illustrator` |

Después abre **Ventana > Extensiones > ThreadMatch**. El panel puede acoplarse y guardarse en tu espacio de trabajo. No requiere administrador ni internet al usarlo.

## Ajustes locales

Extensión CEP interna sin firma, no ZXP firmado ni Marketplace. Los instaladores habilitan `PlayerDebugMode=1` para CEP 11/12. Windows modifica `HKCU\Software\Adobe\CSXS.11` y `.12`, conservando los valores originales en `%APPDATA%\ThreadMatch\cep-install-state.json`. macOS usa `defaults write com.adobe.CSXS.11/12 PlayerDebugMode -string 1` y conserva sus preferencias originales en `~/Library/Application Support/ThreadMatch/original-preferences`.

El ajuste admite todas las extensiones locales sin firma para ese runtime. PowerShell usa Bypass solo en el proceso del instalador, sin cambiar su política permanente. Los instaladores no desactivan Gatekeeper ni eliminan atributos de cuarentena en macOS.

Si el script descargado no se abre en Finder, abre Terminal, entra en la carpeta extraída y ejecuta `bash Instalar-ThreadMatch.command`. Los espacios en rutas están soportados. Se recomienda usar una ubicación sin `#`, que CEP trata como delimitador.

## Desinstalar

- Windows: `Desinstalar-ThreadMatch.bat`.
- macOS: `Desinstalar-ThreadMatch.command`, o `bash Desinstalar-ThreadMatch.command`.

Estos quitan el panel y conservan los ajustes CEP para otras extensiones.

Para restaurar los ajustes previos ejecuta `Desinstalar-y-restaurar-ajustes.bat` (Windows) o `Desinstalar-y-restaurar-ajustes.command` (macOS). La restauración solo cambia valores que siguen en 1; respeta otros cambios posteriores. Puede impedir cargar otras extensiones locales sin firma instaladas después de ThreadMatch.

## Uso

Auto está activo por defecto. Selecciona un objeto y espera aproximadamente un segundo: aparecen sus colores y cinco sugerencias. Cambiar el color del desplegable es inmediato. Un clic elige, doble clic crea etiqueta; Enter también crea la etiqueta del hilo enfocado. Usa Aplicar hilo para recolorear. El panel rechaza acciones de un análisis desactualizado.

Las cinco filas se mantienen visibles desde 300 × 420 px. La vista previa está en la pestaña Etiqueta. Las tarjetas incluyen fondo blanco, muestra de color, nombre, código y colección; son grupos editables y se separan de tarjetas anteriores.

## Fallos de carga

Reinicia Illustrator después de instalar. Revisa el mensaje del instalador, versión exacta 29.x/30.x, carpeta CEP y permisos de tu organización. La carga del panel, perfiles CMYK y Undo se deben probar en Illustrator real.

Fuentes oficiales: [Adobe CEP Cookbook](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_12.x/Documentation/CEP%2012%20HTML%20Extension%20Cookbook.md) y [transición CEP/UXP](https://blog.developer.adobe.com/en/publish/2026/09/investing-in-the-future-of-creative-cloud-extensibility-uxp-comes-to-our-flagship-applications). Adobe sitúa la beta de plugins UXP para Illustrator en primavera de 2027 y el retiro de CEP al final de 2029. El motor está separado para facilitar una migración futura.

## Referencia de color

El desplegable superior permite elegir Carta PDF o Montaje. Carta PDF conserva la fotografía original; Montaje aclara tres blancos para el diseño. El resto de los 157 tonos mantiene los valores del PDF. No es calibración física. Las muestras ajustadas terminan en `· montaje` para coexistir con las originales.

## Nuevas opciones · piloto 0.7.0

Hilos > Diseño prepara toda la paleta. Revisa cada asignación antes de Aplicar, Leyenda o ambas. Más (⚙) ofrece alcances, paletas, disponibilidad, JSON, CSV/SVG y recuperación. Más > Versión consulta manualmente Releases; el trabajo diario no requiere conexión.

El instalador verifica `INTEGRITY.sha256` y conserva una versión anterior. Con Illustrator cerrado ejecuta `Restaurar-version-anterior.bat` (Windows) o `bash Restaurar-version-anterior.command` (macOS) para intercambiarlas; conserva opciones y favoritos. Los hashes detectan corrupción, no sustituyen una firma certificada. La validación nativa sigue pendiente.

## Tipos de etiqueta · 0.8.0

En Etiqueta selecciona Clásica o Icono de hilo. La vista Icono usa el SVG original con nombre y código al lado, sin fondo; su blanco toma el color del hilo y sus detalles negros/grises se conservan. El tipo elegido se recuerda y funciona también con doble clic y Enter.

## Corrección de aislamiento y refresco · 0.8.1

Al crear una etiqueta o leyenda desde un objeto aislado, ThreadMatch sale del modo de aislamiento y conserva los objetos seleccionados para colocar la salida en la capa de producción. Si la versión de Illustrator impide esa salida por script, pulsa Esc hasta salir del aislamiento y vuelve a crear la etiqueta. La consulta automática conserva los controles y el foco cuando no cambia la selección; un clic durante esa consulta espera su respuesta.
