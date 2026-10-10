# Viajeros de Sudamérica

Juego educativo sobre los 12 países de Sudamérica, sus capitales, banderas y mapas.
Para primaria (Perú, área de Personal Social, CNEB). El resultado es **un solo
`dist/index.html`** que funciona sin internet.

## Cómo usarlo

```bash
npm install
npm run dev     # reconstruye al guardar y sirve en http://localhost:5173
npm run build   # genera dist/index.html (todo incrustado)
```

Para jugar sin instalar nada, basta con abrir `dist/index.html` en el navegador.
Para abrir un juego directamente: `index.html#modo=encuentra` (también
`explorar`, `avion` o `arrastra`).

## Estructura

```
scripts/
  build-geo.mjs     extrae Sudamérica + contexto de world-atlas (Natural Earth)
  build.mjs         esbuild → un solo index.html con JS, CSS, fuente y mapa
src/
  index.html        plantilla
  main.js           arma la interfaz y conecta todo
  core/             estado del juego y guardado (localStorage con try/catch)
  data/
    paises.js       ← TODOS los datos de los países (único archivo a editar)
    geo.js          geometrías TopoJSON → GeoJSON
  map/mapa2d.js     mapa D3 (proyección ortográfica, zoom, rótulos)
  map/avion.js      avioncito con ruta punteada
  map/globo3d.js    globo 3D con Three.js (textura dibujada con d3)
  core/config.js    ciclos, niveles y cálculo de estrellas
  modos/preguntas.js  preguntas de "Encuentra el país" por ciclo
  modos/            explorar, encuentra, avion, arrastra (+ comun.js)
  core/sonido.js    efectos y música andina con Web Audio (sin archivos)
  core/voz.js       lectura en voz alta (speechSynthesis, es-PE / es-419)
  ui/               Kusi, ficha, banderas SVG, inicio, confeti, hoja deslizable
  styles/main.css   estilos (paleta de cuaderno de viaje, Nunito incrustada)
```

Todos los datos de los países fueron verificados con fuentes reales (Fase 5):
institutos de estadística, constituciones, listas de la UNESCO, CIA World Factbook
y enciclopedias. Las fuentes por dato están en `src/data/fuentes.js`, se ven en el
juego al final de cada ficha, y el informe completo está en
[`docs/investigacion-datos.md`](docs/investigacion-datos.md).

## Plan por fases

| Fase | Contenido | Estado |
|---|---|---|
| 1 | Mapa 2D, modo Explorar, datos completos de los 12 países, banderas SVG | ✅ |
| 2 | Modos Encuentra el país, Avión viajero y Arrastra la bandera; Kusi; sonidos y voz | ✅ |
| 3 | Globo 3D (Three.js), ciclo + nivel, pasaporte, estrellas, pantalla final, modo docente | ✅ |
| 4 | Build final, pruebas en móvil y escritorio, peso final | ✅ |
| 5 | Investigación y verificación de todos los datos con fuentes reales | ✅ |
| 6 | Revisión completa del código y corrección de errores (voz, globo 3D y más) | ✅ |

## Ciclo y nivel

| | Qué se pregunta |
|---|---|
| III ciclo (1.° y 2.°) | Ubicar países y reconocer banderas. Textos cortos y voz activada. En el avión se elige el nombre del país. |
| IV ciclo (3.° y 4.°) | Además capitales y el reto de los 5 vecinos del Perú. |
| V ciclo (5.° y 6.°) | Además moneda, idioma, lugares famosos y preguntas combinadas. |

| | Tiempo | Opciones | Pistas | Nombres en el mapa | Orden |
|---|---|---|---|---|---|
| Fácil | sin límite | 3 | automáticas | sí | fijo (norte a sur) |
| Medio | 30 s por pregunta | 4 | al pedirlas o tras 2 errores | no | fijo |
| Difícil | 15 s por pregunta | 4 | ninguna | no | al azar |

**Estrellas:** 3 si acierta al primer intento 9 de cada 10 preguntas, 2 si acierta
6 de cada 10 y 1 en otro caso. Se pierde una estrella (mínimo 1) si el promedio por
pregunta pasa 25 s (fácil), 18 s (medio) o 10 s (difícil).

**Modo docente:** mantener presionado el logo 3 segundos (o Enter sostenido).
Muestra los resultados de la sesión, permite copiarlos y reiniciar todo el progreso.

## Archivo final

`dist/index.html` es el juego completo en un solo archivo: **1125 KB** (1,10 MB;
unos 375 KB comprimido con gzip). Funciona abriéndolo con doble clic, sin internet.
Al inicio del archivo van los avisos de licencia de las bibliotecas incluidas
(three.js, d3, topojson, world-atlas y la fuente Nunito), como piden sus licencias.

| Parte | Peso aprox. |
|---|---|
| Three.js (globo 3D) | 524 KB |
| Código del juego (JS) | 138 KB |
| Mapa de Sudamérica (Natural Earth 1:50m) | 103 KB |
| Mapa mundial para el globo (1:110m) | 100 KB |
| D3 + TopoJSON | 77 KB |
| Estilos + fuente Nunito incrustada | ~140 KB |

## Fase 6: errores corregidos

- **Voz de Kusi que se cortaba a media frase.** Antes, cada mensaje nuevo
  cancelaba al anterior. Ahora:
  - Se lee por oraciones.
  - Un mensaje nuevo espera a que termine la oración en curso.
  - Al cambiar un ajuste ya no se corta la lectura.
  - Se evita el corte de Chrome en lecturas largas (unos 15 s).
- **Del globo 3D no se podía volver al 2D en equipos lentos.** El globo se
  dibujaba 60 veces por segundo y el primer armado tardaba sin avisar, así que un
  segundo toque lo deshacía. Ahora:
  - Solo se dibuja cuando algo cambia.
  - El botón muestra "…" mientras se arma y se ignoran los toques dobles.
  - Sin tarjeta gráfica, baja la resolución y no gira solo.
  - Si se pierde el contexto gráfico, vuelve al 2D.
- **Arrastra la bandera.** Una bandera podía colocarse dos veces (doble puntaje y
  fin de juego antes de tiempo).
- **Sonido y voz en tablets.** No sonaban porque el permiso de audio se pedía al
  apoyar el dedo y no al levantarlo.
- **Práctica.** Una ronda de práctica ya no reemplaza el récord del juego completo.
- **Tiempo.** El tiempo de la partida es el del cronómetro (se pausa con los
  diálogos abiertos).
- **Inicio y pantalla final.** Con estas pantallas encima, el mapa y el panel ya no
  reciben toques ni el foco del teclado. Un doble toque en una tarjeta ya no
  responde una pregunta.
- **Girar el celular o la tablet.** El mapa se vuelve a encuadrar. En el celular
  horizontal el panel va al costado (la hoja tapaba el mapa).
- **Toques en el mapa.** Un dedo apoyado en otro lado de la pantalla ya no bloquea
  los toques, y el clic derecho no cuenta como respuesta.
- **Otros arreglos:**
  - El confeti de la pantalla final no aparecía.
  - Al tocar el borde interior de un diálogo, este se cerraba.
  - Nombres encimados en el globo.
  - Martinica y Guadalupe faltaban en el mapa.
  - Datos guardados dañados podían bloquear el juego.
  - Navegadores antiguos (sin `dvh`, `.at()` ni `<dialog>`).
  - Zonas seguras del celular con muesca.
  - Build en Windows o en carpetas con espacios.
- **Concordancia:**
  - "¿En qué país están las islas Galápagos?"
  - "Falta 1"
  - "Esa es la Guayana Francesa"
  - "Te queda 1 segundo"
  - "1 estrella"

## Pruebas realizadas (Fase 4)

- Celular vertical (Pixel 7) y horizontal (iPhone 12), tablet vertical y horizontal
  (iPad), PC 1366×768 y pizarra 1920×1080: sin errores en consola, sin desborde
  horizontal y con botones de al menos 44 px (los principales, 56 px).
- Sin red: se bloquearon todos los pedidos externos y el juego funcionó igual.
- Accesibilidad con axe-core (contraste, nombres, estructura), recorrido con teclado
  y modo "reducir movimiento".
- Fluidez: el vuelo del avión va a 60 FPS; el zoom del mapa, a ~55 FPS incluso
  sin tarjeta de video.
