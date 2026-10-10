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

Los datos que no se pudieron verificar con fuente oficial están marcados con
`// REVISAR` en `src/data/paises.js`.

## Plan por fases

| Fase | Contenido | Estado |
|---|---|---|
| 1 | Mapa 2D, modo Explorar, datos completos de los 12 países, banderas SVG | ✅ |
| 2 | Modos Encuentra el país, Avión viajero y Arrastra la bandera; Kusi; sonidos y voz | ✅ |
| 3 | Globo 3D (Three.js), ciclo + nivel, pasaporte, estrellas, pantalla final, modo docente | ✅ |
| 4 | Build final, pruebas en móvil y escritorio, peso final | pendiente |

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
