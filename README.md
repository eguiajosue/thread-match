# ThreadMatch

Panel acoplable para Adobe Illustrator 2025/2026 que encuentra los hilos Madeira Polystitch No. 40 más cercanos a los colores de un diseño.

## Descargar e instalar

Descarga el paquete de tu sistema en [GitHub Releases](https://github.com/eguiajosue/thread-match/releases/latest).

### Windows

Extrae el ZIP, cierra Illustrator y ejecuta `Instalar-ThreadMatch.bat`. No requiere administrador.

### macOS

Extrae el ZIP, cierra Illustrator y abre `Instalar-ThreadMatch.command`. Si Finder no permite abrir el script descargado, puedes ejecutarlo desde Terminal:

```sh
cd "/ruta/a/la/carpeta/extraida"
bash Instalar-ThreadMatch.command
```

No requiere administrador. No desactives Gatekeeper. La extensión HTML/JS no incluye binarios dependientes de Intel o Apple Silicon; la compatibilidad efectiva depende del runtime CEP de tu instalación de Illustrator.

### Abrir

**Ventana > Extensiones > ThreadMatch**; en algunas versiones, **Extensions (Legacy)**. Acopla el panel y guarda tu espacio de trabajo.

Es una extensión CEP interna sin firma Adobe. Los instaladores habilitan `PlayerDebugMode=1` para CEP 11 y 12 en tu usuario y conservan los valores anteriores. Este ajuste permite otras extensiones locales sin firma. Consulta `plugin/LEEME.md` para instalación, restauración y desinstalación.

## Flujo de trabajo

1. Selecciona un trazado, texto completo o grupo con relleno sólido.
2. El panel sincroniza la selección automáticamente (aproximadamente cada 900 ms).
3. Si hay varios colores, elige uno en el desplegable: sus cinco coincidencias aparecen inmediatamente.
4. Un clic elige un hilo; **doble clic crea su etiqueta**. También puedes usar Enter con el hilo enfocado.
5. **Aplicar hilo** crea/reutiliza una muestra global de proceso y recolorea los rellenos correspondientes.

El panel permanece abierto. Desactiva Auto para trabajar con actualización manual mediante ↻. La vigilancia se pausa cuando el documento HTML del panel está oculto y evita recalcular el ranking cuando la selección permanece igual. La lectura del host es por sondeo: no requiere instalar un plugin C++ adicional.

## Interfaz y etiquetas

- Cinco resultados visibles, sin scroll, a partir de 300 × 420 px.
- Dos pestañas compactas: Hilos y Etiqueta; vista previa fuera de la lista de resultados.
- Botones inferiores accesibles, navegación por teclado y mensajes con detalles en su tooltip.
- Tarjeta vectorial editable: muestra amplia, nombre negro en negrita, código `#5990` y colección en gris.
- Las etiquetas nuevas se desplazan a la derecha si se cruzan con tarjetas ThreadMatch existentes. No se reutilizan ni borran etiquetas anteriores.

## Precisión y soporte

160 hilos extraídos del PDF proporcionado, con códigos/nombres conservados y ligaduras tipográficas normalizadas. Los valores RGB, HEX y Lab son referencias digitales, **no mediciones oficiales del hilo físico**. Verifica con la carta física antes de producir; especialmente fluorescentes, blancos y texturas.

El motor usa sRGB, Lab D65 y CIEDE2000. Trabaja en sRGB para esta versión. CMYK se convierte con Illustrator y depende de sus perfiles; gris se normaliza a RGB. Se soportan rellenos sólidos de trazados, compuestos, grupos, textos completos y muestras globales de proceso. No se analizan imágenes, degradados, patrones, mallas, trazos ni efectos de apariencia.

## Desarrollar

Node >=18; Python 3 para empaquetar. No hay dependencias npm para el motor, build o pruebas unitarias.

```sh
npm run build
npm test
npm run package
```

`release/` contiene ZIPs Windows/macOS y sus SHA-256. El JSX autónomo sigue disponible en `dist/ThreadMatch.jsx` tras compilar.

La extracción opcional del catálogo necesita `scripts/requirements.txt` y el PDF original, que se mantiene fuera del repositorio:

```sh
python scripts/extract_catalog.py /ruta/a/Madeira-Polystitch-Carta-Colores-2025.pdf
npm run build
```

Este proceso sustituye el dataset digital; conserva una copia de datos calibrados antes de ejecutarlo. El JSON guarda la huella y las regiones muestreadas; consulta `docs/ARQUITECTURA.md`.

## Versiones y distribución

GitHub Actions valida el código, comprueba los instaladores en runners Windows/macOS y genera los paquetes. Una versión nueva en `package.json`, tras aprobar el workflow de verificación en `main`, se publica automáticamente en Releases. Una versión ya publicada permanece intacta: incrementa la versión para publicar nuevos cambios.

Esto automatiza la publicación, **no la instalación automática dentro de los equipos**. Para actualizar hoy, descarga la nueva Release y ejecuta su instalador con Illustrator cerrado. No hay credenciales GitHub embebidas ni descargas remotas dentro del panel.

## Validación

Pruebas colorimétricas con los 34 pares de referencia Sharma; pruebas de selección, swatches, etiquetas, análisis automático y rechazo de acciones sobre selección/documento antiguos. Los workflows comprueban los instaladores y la interfaz HTML con un puente simulado. Estas pruebas no sustituyen la validación en Illustrator real de carga CEP, fuentes, gestión de color y Ctrl+Z.

Uso interno. No es un producto oficial de Adobe o Madeira. El catálogo y las marcas pertenecen a sus titulares; el repositorio no concede una licencia sobre ellos.
