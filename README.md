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
| 3 | Globo 3D (Three.js), ciclo + nivel, pasaporte, estrellas, pantalla final, modo docente | pendiente |
| 4 | Build final, pruebas en móvil y escritorio, peso final | pendiente |
