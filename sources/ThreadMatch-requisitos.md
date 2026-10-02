# PROYECTO: MADEIRA POLYSTITCH COLOR MATCHER PARA ADOBE ILLUSTRATOR

Actúa como un ingeniero de software senior especializado en:

- Adobe Illustrator
- automatización de flujos de diseño gráfico
- ExtendScript / JSX
- ScriptUI
- JavaScript
- teoría del color
- conversiones RGB / CMYK / XYZ / CIELAB
- algoritmos Delta E
- diseño de interfaces orientadas a productividad

Quiero desarrollar una herramienta profesional para Adobe Illustrator cuyo objetivo sea
encontrar automáticamente el hilo Madeira Polystitch más parecido a cualquier color
utilizado dentro de un diseño.

La herramienta será utilizada en un entorno real de producción de bordados.

No quiero simplemente un script experimental.

Quiero crear una herramienta estable, rápida, mantenible y suficientemente modular
como para que posteriormente pueda evolucionar hacia un panel completo para Illustrator.


==================================================
1. CONTEXTO DEL PROBLEMA
==================================================

Actualmente, al preparar montajes para bordado en Adobe Illustrator, existe un proceso
manual y repetitivo:

1. Identificar visualmente el color utilizado en el diseño.
2. Abrir la carta de colores Madeira Polystitch.
3. Buscar manualmente un hilo similar.
4. Comparar visualmente colores.
5. Utilizar el cuentagotas sobre la carta digital.
6. Escribir manualmente el código del hilo.
7. Escribir manualmente el nombre del hilo.
8. Aplicar el color al montaje.
9. Repetir el proceso para cada color del diseño.

Ejemplo:

Color del diseño
↓
buscar visualmente en catálogo
↓
encontrar:
5924
Lemon
↓
usar cuentagotas
↓
escribir:
"5924 - Lemon"

El objetivo del proyecto es eliminar prácticamente todo este procedimiento manual.


==================================================
2. OBJETIVO PRINCIPAL
==================================================

Crear una herramienta para Adobe Illustrator llamada provisionalmente:

MADEIRA POLYSTITCH COLOR MATCHER

La herramienta deberá permitir:

Seleccionar uno o varios objetos dentro de Illustrator.

El sistema detectará automáticamente el color utilizado por los objetos seleccionados.

Después comparará ese color contra una base de datos digital de colores de:

Madeira Polystitch No. 40

Finalmente mostrará los hilos Madeira cuyo color sea perceptualmente más cercano.


Ejemplo:

COLOR DETECTADO

RGB
22 / 87 / 171

HEX
#1657AB

LAB
L: 39.8
a: 13.6
b: -49.2


RESULTADOS

1. 5767 · Royal Blue
   ΔE 2.84

2. 5975 · Imperial Blue
   ΔE 4.17

3. 5566 · Sapphire
   ΔE 6.02


El usuario podrá seleccionar cualquiera de estas alternativas.


==================================================
3. FUENTE DE DATOS
==================================================

La herramienta se desarrollará utilizando como referencia inicial la carta:

MADEIRA POLYSTITCH
Carta de Colores 2025

El PDF original será proporcionado al proyecto.

IMPORTANTE:

La carta contiene:

- muestra visual del hilo
- código numérico
- nombre del color

Ejemplos:

5924 · Lemon
5980 · Sunflower
5965 · Pumpkin
5678 · Orange

5977 · Turquoise
5934 · Blue Topaz
5842 · Ocean Blue
5843 · Blue Nautica

5802 · Snow White
5800 · Black

5976 · Deep Sea
5966 · Dark Indigo
5676 · Persian Blue
5797 · Blueberry

etc.

Debe construirse una base de datos estructurada con TODOS los colores disponibles
en la carta proporcionada.

No inventar colores.

No inventar códigos.

No modificar nombres arbitrariamente.

El código y nombre oficiales del catálogo serán los identificadores principales.


==================================================
4. LIMITACIÓN IMPORTANTE DEL CATÁLOGO
==================================================

La propia carta digital advierte que:

Los colores mostrados digitalmente pueden variar respecto al tono exacto del hilo real.

Por esta razón:

LOS VALORES RGB, HEX Y LAB OBTENIDOS DEL PDF NO DEBEN CONSIDERARSE
VALORES COLORIMÉTRICOS OFICIALES DE MADEIRA.

Serán únicamente una representación digital de referencia.

La aplicación deberá dejar preparada su arquitectura para que en el futuro podamos
sustituir los valores de color obtenidos del PDF por valores medidos físicamente mediante:

- espectrofotómetro
- colorímetro
- carta física calibrada
- información colorimétrica oficial de Madeira

SIN tener que modificar el algoritmo principal del programa.


==================================================
5. BASE DE DATOS DE COLORES
==================================================

Crear un archivo independiente, preferentemente:

madeira-polystitch.json

Ejemplo conceptual:

{
    "code": "5924",
    "name": "Lemon",

    "rgb": {
        "r": 218,
        "g": 199,
        "b": 0
    },

    "hex": "#DAC700",

    "lab": {
        "l": 78.4,
        "a": -9.1,
        "b": 78.2
    },

    "collection": "Polystitch",
    "weight": "40"
}

Los valores anteriores son únicamente un ejemplo estructural.

NO utilizarlos como valores reales.

Los valores reales deben extraerse/calcularse a partir de la fuente de datos utilizada.


==================================================
6. EXTRACCIÓN DE LOS COLORES DEL CATÁLOGO
==================================================

Crear un proceso reproducible para obtener el color digital de cada muestra.

Evitar tomar muestras:

- sobre texto
- sobre zonas blancas
- sobre separadores
- sobre sombras
- sobre reflejos extremos
- sobre bordes

Idealmente analizar una región central de cada muestra.

Como el hilo fotografiado posee textura y múltiples píxeles diferentes,
NO utilizar simplemente un único píxel.

Utilizar una estrategia más robusta.

Por ejemplo:

1. recortar la región correspondiente al hilo;
2. ignorar valores extremos;
3. calcular color representativo mediante:
   - mediana RGB,
   - promedio filtrado,
   - clustering,
   o alguna estrategia equivalente;
4. almacenar el resultado obtenido.

Documentar claramente el método utilizado.


==================================================
7. ESPACIO DE COLOR PARA EL MATCHING
==================================================

NO realizar el matching utilizando simplemente:

distancia RGB.

RGB no representa correctamente la percepción humana de diferencias de color.

El flujo deberá ser aproximadamente:

Color Illustrator
↓
sRGB
↓
XYZ
↓
CIELAB
↓
comparación Delta E
↓
ranking de hilos Madeira


==================================================
8. ALGORITMO DELTA E
==================================================

Implementar preferentemente:

CIEDE2000
Delta E 2000
ΔE00

Utilizarlo como algoritmo principal para determinar qué colores son perceptualmente
más cercanos.

Arquitectura:

Input Color
↓
Convertir a LAB
↓
comparar contra cada hilo del catálogo
↓
calcular Delta E 2000
↓
ordenar ascendentemente
↓
mostrar mejores coincidencias

Menor Delta E = color más parecido.


==================================================
9. RESULTADOS DEL MATCHING
==================================================

Por defecto mostrar:

TOP 5 COLORES MÁS CERCANOS

Ejemplo:

──────────────────────────────────

COLOR SELECCIONADO

■ #164BA8

TOP MATCHES

■ 5767
  Royal Blue
  ΔE 2.8

■ 5975
  Imperial Blue
  ΔE 4.1

■ 5566
  Sapphire
  ΔE 5.9

■ 5676
  Persian Blue
  ΔE 7.3

■ 5843
  Blue Nautica
  ΔE 9.2

──────────────────────────────────


Nunca decir:

"Este es exactamente el hilo correcto."

La UI debe comunicar:

"Mejor coincidencia"

"Colores cercanos"

"Coincidencias sugeridas"

porque la carta digital no representa necesariamente el color físico exacto.


==================================================
10. DETECCIÓN DEL COLOR EN ILLUSTRATOR
==================================================

La herramienta deberá detectar el color del objeto seleccionado.

Debe contemplar inicialmente:

SOLID FILLS

Ejemplos:

RGBColor
CMYKColor
GrayColor

Convertir todos internamente a un formato normalizado.


Posteriormente podrá añadirse soporte para:

SpotColor
Global Colors
PatternColor
GradientColor


Para la primera versión:

priorizar objetos con Fill sólido.


==================================================
11. OBJETOS SOPORTADOS
==================================================

Primera versión:

PathItem
CompoundPathItem
TextFrame


Posteriormente considerar:

GroupItem
PlacedItem
RasterItem
Gradient
Mesh


Si se selecciona un grupo:

la arquitectura deberá permitir analizar todos sus colores posteriormente.


==================================================
12. INTERFAZ PRINCIPAL
==================================================

Crear una UI compacta y profesional.

Ejemplo conceptual:


╭──────────────────────────────────╮
│ MADEIRA POLYSTITCH MATCHER       │
├──────────────────────────────────┤
│                                  │
│ COLOR SELECCIONADO               │
│                                  │
│ ████████  #164BA8                │
│ RGB 22 · 75 · 168                │
│                                  │
├──────────────────────────────────┤
│ MEJORES COINCIDENCIAS            │
│                                  │
│ ■ 5767 · Royal Blue              │
│   ΔE 2.84                        │
│                                  │
│ ■ 5975 · Imperial Blue           │
│   ΔE 4.17                        │
│                                  │
│ ■ 5566 · Sapphire                │
│   ΔE 6.02                        │
│                                  │
│ ■ 5676 · Persian Blue            │
│   ΔE 7.31                        │
│                                  │
│ ■ 5843 · Blue Nautica            │
│   ΔE 9.16                        │
│                                  │
├──────────────────────────────────┤
│ [ Aplicar hilo ]                 │
│                                  │
│ [ Crear etiqueta ]               │
╰──────────────────────────────────╯


==================================================
13. INTERACCIÓN
==================================================

Workflow deseado:

1. Diseñador selecciona un objeto.

2. Ejecuta Madeira Polystitch Matcher.

3. El programa obtiene el Fill del objeto.

4. Convierte el color a LAB.

5. Ejecuta Delta E 2000 contra el catálogo.

6. Muestra los mejores resultados.

7. El diseñador selecciona un hilo.

8. Presiona:

APLICAR HILO


Illustrator deberá entonces:

- aplicar el color digital correspondiente;
- preferentemente crear/utilizar una muestra global;
- nombrar la muestra:

"5767 · Royal Blue"


==================================================
14. CREACIÓN AUTOMÁTICA DE SWATCH
==================================================

Al elegir un hilo:

buscar primero si existe una muestra con ese código.

Ejemplo:

"5767 · Royal Blue"

Si existe:

reutilizarla.

Si no existe:

crear una nueva muestra.

Evitar:

duplicados.

Por ejemplo NO permitir:

5767 · Royal Blue
5767 · Royal Blue
5767 · Royal Blue


==================================================
15. GENERACIÓN DE ETIQUETA
==================================================

Añadir un botón:

CREAR ETIQUETA

Al utilizarlo deberá generar automáticamente un texto en Illustrator.

Formato inicial:

5767 · ROYAL BLUE


Opcionalmente permitir posteriormente formatos como:

MADEIRA POLYSTITCH
5767
ROYAL BLUE


o:

HILO
5767 · ROYAL BLUE


La primera versión puede usar:

5767 · Royal Blue


==================================================
16. SELECCIÓN DE VARIOS OBJETOS
==================================================

La arquitectura deberá prepararse para un modo:

ANALIZAR DISEÑO

Ejemplo:

un logo contiene:

rojo
azul
amarillo
negro

La herramienta deberá ser capaz posteriormente de detectar:

4 colores únicos

y devolver:

ROJO
→ Madeira XXXX

AZUL
→ Madeira XXXX

AMARILLO
→ Madeira XXXX

NEGRO
→ Madeira XXXX


Esto permitiría convertir prácticamente todo un montaje a colores Madeira
automáticamente.


==================================================
17. TOLERANCIA / INTERPRETACIÓN DE DELTA E
==================================================

Mostrar Delta E como información técnica.

No convertir automáticamente Delta E en afirmaciones absolutas del tipo:

"idéntico"

porque la fuente digital no está calibrada contra los hilos físicos.

Podemos utilizar indicadores visuales relativos como:

Muy cercano
Cercano
Alternativa

pero los límites deberán estar configurados desde constantes independientes.

Ejemplo:

MATCH_THRESHOLDS = {
    excellent: X,
    good: X,
    acceptable: X
}

No hardcodear estos valores por toda la aplicación.


==================================================
18. ARQUITECTURA
==================================================

Separar responsabilidades.

Ejemplo:

/madeira-matcher

    /data
        madeira-polystitch.json

    /color
        rgb.js
        xyz.js
        lab.js
        deltaE2000.js

    /illustrator
        selection.js
        swatches.js
        labels.js

    /matching
        matcher.js

    /ui
        matcherDialog.js

    main.jsx


Si las limitaciones de ExtendScript obligan a empaquetar finalmente los módulos
en un solo JSX, mantener el código fuente modular y crear un proceso de build
que genere el archivo final.


==================================================
19. COMPATIBILIDAD
==================================================

Entorno prioritario:

Adobe Illustrator 2025 o superior.

Windows.

Antes de desarrollar la interfaz definitiva:

investigar qué arquitectura es más conveniente para este caso:

A. ExtendScript + ScriptUI
B. CEP Extension
C. UXP, si Illustrator ofrece las APIs necesarias para esta funcionalidad

Evaluar:

- compatibilidad
- instalación
- mantenimiento
- velocidad
- facilidad de distribución interna
- posibilidad de crear panel acoplable
- acceso a selección
- acceso a colores
- creación de swatches
- compatibilidad Illustrator 2025+

Para un MVP interno, priorizar simplicidad y estabilidad.

No introducir una arquitectura compleja sin una ventaja real.


==================================================
20. MOTOR DE MATCHING INDEPENDIENTE
==================================================

MUY IMPORTANTE.

El algoritmo de matching no debe depender directamente de Illustrator.

Debe existir conceptualmente algo como:

findClosestMadeiraColors(inputColor, limit)

Ejemplo:

findClosestMadeiraColors(
    {
        r: 20,
        g: 75,
        b: 170
    },
    5
)

Resultado:

[
    {
        code: "5767",
        name: "Royal Blue",
        deltaE: 2.84
    },
    ...
]


Esto permitirá reutilizar el motor posteriormente en:

- Illustrator
- aplicación web
- sistema interno
- herramienta para producción
- Tajima
- Wilcom
- APIs internas


==================================================
21. PERFORMANCE
==================================================

El catálogo contiene una cantidad relativamente pequeña de colores.

No es necesario implementar optimizaciones prematuras complejas.

Comparar un color contra toda la carta mediante Delta E debería ser prácticamente
instantáneo.

Sin embargo:

evitar conversiones repetitivas innecesarias.

Al cargar la base:

los valores LAB de los hilos deberían estar precalculados.


==================================================
22. PRECISIÓN NUMÉRICA
==================================================

Implementar correctamente:

sRGB → Linear RGB
Linear RGB → XYZ
XYZ → LAB
Delta E 2000

Utilizar:

D65

cuando corresponda a la conversión sRGB.

Documentar:

white point
gamma correction
rangos utilizados


==================================================
23. TESTING
==================================================

Crear pruebas unitarias para:

RGB → XYZ
XYZ → LAB
RGB → LAB
Delta E 2000
sorting de resultados
búsqueda de coincidencias

Utilizar datasets conocidos para verificar la implementación de CIEDE2000.

También comprobar:

un color comparado consigo mismo
→ Delta E ≈ 0

La lista de resultados siempre debe estar:

ordenada desde menor Delta E hasta mayor.


==================================================
24. CASOS DE ERROR
==================================================

La herramienta deberá manejar correctamente:

- ningún documento abierto;
- ningún objeto seleccionado;
- objeto sin Fill;
- varios objetos seleccionados;
- color no soportado;
- catálogo no cargado;
- JSON corrupto;
- resultado vacío.

Mostrar mensajes comprensibles.

Ejemplo:

"No se encontró un color sólido en la selección."


No mostrar errores técnicos crudos al diseñador.


==================================================
25. EXPERIENCIA DE USUARIO
==================================================

La herramienta debe reducir pasos.

El flujo ideal completo debe tomar aproximadamente:

SELECCIONAR
↓
MATCH
↓
ELEGIR
↓
APLICAR


Evitar ventanas innecesarias.

Evitar confirmaciones para acciones reversibles.

Permitir Ctrl+Z después de aplicar cambios.


==================================================
26. DISEÑO DE LA INTERFAZ
==================================================

Estética:

profesional
minimalista
compacta
orientada a productividad

Inspiración:

paneles nativos de Adobe Illustrator.

Evitar:

interfaces enormes
decoración innecesaria
gradientes decorativos
animaciones
elementos visuales que resten espacio a los resultados


==================================================
27. ROADMAP
==================================================

FASE 1
Dataset Madeira Polystitch

- extraer códigos
- extraer nombres
- extraer colores representativos
- construir JSON
- calcular LAB


FASE 2
Motor colorimétrico

- RGB
- XYZ
- LAB
- CIEDE2000
- ranking


FASE 3
Integración Illustrator

- leer selección
- detectar Fill
- ejecutar matching


FASE 4
UI

- mostrar input
- mostrar Top 5
- seleccionar hilo


FASE 5
Aplicar Madeira

- crear/reutilizar swatch
- aplicar Fill


FASE 6
Etiquetas

- código
- nombre
- color


FASE 7
Analizar diseño completo

- detectar múltiples colores
- eliminar duplicados
- match masivo


FASE 8
Funciones avanzadas

- favoritos
- recientes
- filtros
- historial
- reemplazo masivo
- perfiles personalizados
- calibración física


==================================================
28. FUTURA CALIBRACIÓN
==================================================

Diseñar el dataset para poder almacenar posteriormente:

digitalReferenceRGB
measuredLAB
officialLAB

Ejemplo conceptual:

{
    "code": "5924",

    "digital": {
        ...
    },

    "measured": {
        ...
    }
}

El motor podrá tener posteriormente:

SOURCE_MODE = DIGITAL
SOURCE_MODE = MEASURED

Esto permitirá evolucionar el producto sin rehacerlo.


==================================================
29. NO HACER TODAVÍA
==================================================

En el MVP no implementar innecesariamente:

- inteligencia artificial;
- machine learning;
- servicios cloud;
- bases de datos remotas;
- cuentas de usuario;
- login;
- APIs externas;
- sincronización;
- telemetría.

Todo debe funcionar:

LOCALMENTE.

La funcionalidad principal es completamente determinista y no necesita IA.


==================================================
30. ENTREGABLES DEL PROYECTO
==================================================

Quiero obtener:

1. Dataset completo Madeira Polystitch.

2. JSON limpio con:
   - código
   - nombre
   - RGB
   - HEX
   - LAB

3. Motor de conversiones de color.

4. Implementación CIEDE2000.

5. Motor de matching.

6. Tests.

7. Integración con Adobe Illustrator.

8. Interfaz gráfica.

9. Creación automática de Swatches.

10. Aplicación del hilo seleccionado.

11. Generación automática de etiqueta.

12. README técnico.

13. instrucciones de instalación.

14. documentación para mantener/actualizar el catálogo.


==================================================
31. CRITERIOS DE ACEPTACIÓN DEL MVP
==================================================

El MVP se considerará funcional cuando pueda realizar:

CASO:

Existe un objeto seleccionado en Illustrator.

Tiene un Fill sólido.

↓

Ejecutar Madeira Matcher.

↓

El programa detecta correctamente su color.

↓

Lo convierte a LAB.

↓

Compara el color mediante CIEDE2000 contra toda la base Madeira.

↓

Presenta los 5 colores más cercanos.

↓

Cada resultado muestra:

muestra visual
código
nombre
Delta E

↓

Selecciono una opción.

↓

Presiono:

APLICAR HILO

↓

Illustrator:

crea/reutiliza la muestra Madeira correspondiente

y

aplica el color al objeto.


Todo sin tener que:

abrir manualmente el PDF;
usar cuentagotas;
escribir código;
escribir nombre.


==================================================
32. FORMA DE TRABAJAR
==================================================

No comiences escribiendo todo el proyecto de una vez.

Primero:

1. analiza los requisitos;
2. analiza las capacidades actuales de Illustrator;
3. recomienda la arquitectura técnica;
4. define estructura del proyecto;
5. define estructura del dataset;
6. explica cómo extraeremos correctamente los colores del PDF;
7. define el algoritmo de matching;
8. identifica riesgos;
9. propone plan de implementación.

Después implementar por fases pequeñas.

En cada fase:

- explicar qué se va a construir;
- implementar;
- probar;
- verificar;
- corregir errores;
- continuar únicamente cuando la fase anterior sea estable.

Priorizar:

precisión;
mantenibilidad;
simplicidad;
velocidad de uso;
compatibilidad real con Illustrator.