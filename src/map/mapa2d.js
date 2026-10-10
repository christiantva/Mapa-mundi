// Mapa 2D con D3: proyección ortográfica centrada en Sudamérica y recortada en
// un círculo (efecto de globo de atlas). El zoom/desplazamiento usa
// transformaciones (no reproyecta), así las animaciones van a 60 FPS.
import { geoOrthographic, geoPath, geoGraticule, geoBounds, geoArea, geoCentroid } from 'd3-geo';
import { select } from 'd3-selection';
import { zoom as d3zoom, zoomIdentity } from 'd3-zoom';
import 'd3-transition';
import { featuresSudamerica, featuresContexto, fronteras } from '../data/geo.js';
import { PAISES, PAISES_POR_ID, GUAYANA_FRANCESA, COLORES_ATLAS } from '../data/paises.js';
import { reduceMovimiento } from '../core/estado.js';

const NS = 'http://www.w3.org/2000/svg';
const CENTRO = [-64, -18];
const RADIO_GRADOS = 52;
const ZOOM_MAX = 14;

const ROTULOS_FIJOS = [
  { texto: 'Océano Pacífico', lon: -95, lat: -20, clase: 'rotulo-oceano', giro: -80 },
  { texto: 'Océano Atlántico', lon: -29, lat: -22, clase: 'rotulo-oceano', giro: 78 },
  { texto: 'Mar Caribe', lon: -75, lat: 14.6, clase: 'rotulo-mar' },
  { texto: 'Centroamérica', lon: -86.5, lat: 13.8, clase: 'rotulo-contexto', giro: -38 },
  { texto: 'Islas Malvinas', lon: -59.3, lat: -50.3, clase: 'rotulo-contexto rotulo-pequeno', zoomMin: 2.2 },
];

// Paralelos de referencia.
const lineaLatitud = (lat) => ({
  type: 'LineString',
  coordinates: Array.from({ length: 361 }, (_, i) => [-180 + i, lat]),
});

export class Mapa2D {
  constructor(contenedor, { alSeleccionar, alTocarFondo, margenes } = {}) {
    this.cont = contenedor;
    this.alSeleccionar = alSeleccionar ?? (() => {});
    this.alTocarFondo = alTocarFondo ?? (() => {});
    this.margenes = margenes ?? (() => ({ top: 0, right: 0, bottom: 0, left: 0 }));
    this.seleccionado = null;
    this.transform = zoomIdentity;
    this.opciones = { nombres: true, capitales: true, ecuador: false, tropico: false };
    this.visitados = new Set();
    this.rotulos = []; // elementos en la capa sin escala: { el, lon, lat, zoomMin }
    this.alZoom = new Set(); // funciones que se llaman en cada cuadro de zoom
    this.alRedimensionar = new Set();
    this.juego = null; // { nombres: (id) => bool, capitales: bool } durante un juego

    this.#crearSvg();
    this.#crearZoom();
    this.#crearInteraccion();
    this.redimensionar();

    this.observador = new ResizeObserver(() => this.redimensionar());
    this.observador.observe(this.cont);
  }

  #crearSvg() {
    this.cont.innerHTML = `
      <svg class="mapa" role="application" aria-label="Mapa de Sudamérica. Usa Tab para recorrer los países y Enter para elegir uno.">
        <defs>
          <radialGradient id="grad-oceano" cx="45%" cy="40%" r="65%">
            <stop offset="0%" stop-color="#d4e3f1"/>
            <stop offset="70%" stop-color="#bfd3e6"/>
            <stop offset="100%" stop-color="#a6c0da"/>
          </radialGradient>
          <filter id="sombra-pais" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#23302a" flood-opacity="0.38"/>
          </filter>
          <filter id="sombra-globo" x="-10%" y="-10%" width="120%" height="125%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#23302a" flood-opacity="0.18"/>
          </filter>
          <pattern id="rayas-francia" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#d9dde6"/>
            <rect width="2.2" height="6" fill="#b8bfcd"/>
          </pattern>
        </defs>
        <g class="capa-zoom">
          <path class="globo-fondo" filter="url(#sombra-globo)"/>
          <path class="oceano"/>
          <path class="graticula"/>
          <g class="contexto"></g>
          <g class="paises"></g>
          <path class="fronteras"/>
          <path class="linea-ref linea-ecuador"/>
          <path class="linea-ref linea-tropico"/>
          <g class="elevado"></g>
          <g class="capa-efectos"></g>
          <g class="capa-rutas"></g>
          <path class="borde-globo"/>
        </g>
        <g class="capa-rotulos" aria-hidden="true"></g>
        <g class="capa-superior" aria-hidden="true"></g>
      </svg>`;
    this.svg = this.cont.querySelector('svg');
    this.sel = select(this.svg);
    this.gZoom = this.svg.querySelector('.capa-zoom');
    this.gRotulos = this.svg.querySelector('.capa-rotulos');
    this.gElevado = this.svg.querySelector('.elevado');
    this.gEfectos = this.svg.querySelector('.capa-efectos');
    this.gRutas = this.svg.querySelector('.capa-rutas');
    this.gSuperior = this.svg.querySelector('.capa-superior');

    this.proyeccion = geoOrthographic().rotate([-CENTRO[0], -CENTRO[1]]).clipAngle(RADIO_GRADOS).precision(0.3);
    this.path = geoPath(this.proyeccion);

    // Países de contexto (gris)
    const gCtx = this.svg.querySelector('.contexto');
    this.pathsContexto = featuresContexto.map((f) => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('class', 'pais-contexto');
      gCtx.append(p);
      return { f, p };
    });

    // Países de Sudamérica + Guayana Francesa
    const gPaises = this.svg.querySelector('.paises');
    this.pathsPais = new Map();
    for (const f of featuresSudamerica) {
      const id = f.id;
      const datos = PAISES_POR_ID[id] ?? GUAYANA_FRANCESA;
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('class', datos.esTerritorio ? 'pais territorio' : 'pais');
      p.dataset.id = id;
      p.setAttribute('tabindex', '0');
      p.setAttribute('role', 'button');
      p.setAttribute('aria-label', datos.esTerritorio ? `${datos.nombre}, territorio de Francia` : datos.nombre);
      p.style.fill = datos.esTerritorio ? 'url(#rayas-francia)' : COLORES_ATLAS[datos.color];
      gPaises.append(p);
      this.pathsPais.set(id, { f, p, datos, principal: this.#poligonosPrincipales(f) });
    }
    // Orden de tabulación de norte a sur, de oeste a este.
    const orden = [...this.pathsPais.values()].sort((a, b) => {
      const [ax, ay] = geoCentroid(a.principal), [bx, by] = geoCentroid(b.principal);
      return by - ay || ax - bx;
    });
    orden.forEach(({ p }) => gPaises.append(p));

    this.#crearRotulos();
  }

  // Para el zoom ignoramos islas lejanas (Galápagos, Isla de Pascua...).
  #poligonosPrincipales(f) {
    if (f.geometry.type !== 'MultiPolygon') return f;
    const polis = f.geometry.coordinates.map((c) => ({ c, a: geoArea({ type: 'Polygon', coordinates: c }) }));
    const max = Math.max(...polis.map((p) => p.a));
    return { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: polis.filter((p) => p.a > max * 0.08).map((p) => p.c) } };
  }

  #crearRotulos() {
    const g = this.gRotulos;
    const agregar = (el, lon, lat, extra = {}) => {
      g.append(el);
      this.rotulos.push({ el, lon, lat, ...extra });
      return el;
    };

    for (const r of ROTULOS_FIJOS) {
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('class', r.clase);
      t.textContent = r.texto;
      agregar(t, r.lon, r.lat, { giro: r.giro ?? 0, zoomMin: r.zoomMin ?? 0 });
    }
    this.rotuloEcuador = this.#texto('Línea ecuatorial', 'rotulo-linea');
    agregar(this.rotuloEcuador, -96, 1.2, { tipo: 'ecuador' });
    this.rotuloTropico = this.#texto('Trópico de Capricornio', 'rotulo-linea');
    agregar(this.rotuloTropico, -100, -22.2, { tipo: 'tropico' });

    // Capitales: punto (estrella para la capital principal) + nombre
    this.rotulosCapital = [];
    const todos = [...PAISES, GUAYANA_FRANCESA];
    for (const pais of todos) {
      pais.capitales.forEach((cap, i) => {
        const grupo = document.createElementNS(NS, 'g');
        grupo.setAttribute('class', `capital${pais.esTerritorio ? ' capital-territorio' : ''}`);
        grupo.dataset.pais = pais.id;
        grupo.innerHTML = i === 0
          ? '<circle r="5.5" class="capital-punto"/><circle r="2" class="capital-centro"/>'
          : '<rect x="-4" y="-4" width="8" height="8" class="capital-punto capital-sede"/>';
        const nombre = this.#texto(cap.rol ? `${cap.nombre} (${cap.rol === 'sede de gobierno' ? 'sede de gobierno' : 'capital'})` : cap.nombre, 'capital-nombre');
        const pos = { izq: [-8, 4, 'end'], arr: [0, -10, 'middle'], abj: [0, 18, 'middle'] }[cap.rotulo] ?? [8, 4, 'start'];
        nombre.setAttribute('x', pos[0]);
        nombre.setAttribute('y', pos[1]);
        nombre.setAttribute('text-anchor', pos[2]);
        grupo.append(nombre);
        agregar(grupo, cap.lon, cap.lat, { tipo: 'capital', pais: pais.id });
        this.rotulosCapital.push({ grupo, pais: pais.id, nombre });
      });
    }

    // Nombres de países
    this.rotulosPais = new Map();
    for (const pais of todos) {
      const grupo = document.createElementNS(NS, 'g');
      grupo.setAttribute('class', `rotulo-pais${pais.esTerritorio ? ' rotulo-territorio' : ''}`);
      const t = this.#texto(pais.esTerritorio ? 'Guayana Fr.' : pais.nombre, 'nombre-pais');
      grupo.append(t);
      // Sello de visitado (no depende solo del color: lleva un ✓ dibujado)
      const sello = document.createElementNS(NS, 'g');
      sello.setAttribute('class', 'sello-visitado');
      sello.innerHTML = '<circle r="9"/><path d="M-4 0.5l2.6 2.6L4.4-3"/>';
      grupo.append(sello);
      const { lon, lat, giro = 0 } = pais.etiqueta;
      agregar(grupo, lon, lat, { giro, tipo: 'pais', pais: pais.id, zoomMin: pais.esTerritorio ? 1.6 : 0 });
      this.rotulosPais.set(pais.id, { grupo, texto: t, sello });
    }
  }

  #texto(contenido, clase) {
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('class', clase);
    t.textContent = contenido;
    return t;
  }

  #crearZoom() {
    this.zoom = d3zoom()
      .scaleExtent([1, ZOOM_MAX])
      .filter((e) => (!e.ctrlKey || e.type === 'wheel') && !e.button)
      .on('zoom', (e) => {
        this.transform = e.transform;
        this.gZoom.setAttribute('transform', e.transform.toString());
        this.#ubicarRotulos();
        this.alZoom.forEach((f) => f(e.transform));
      });
    this.sel.call(this.zoom).on('dblclick.zoom', null);
  }

  // Toque/clic con Pointer Events: distinguimos un toque de un arrastre.
  #crearInteraccion() {
    let inicio = null;
    this.svg.addEventListener('pointerdown', (e) => {
      if (!e.isPrimary) { inicio = null; return; }
      inicio = { x: e.clientX, y: e.clientY, t: performance.now() };
    });
    this.svg.addEventListener('pointerup', (e) => {
      if (!inicio || !e.isPrimary) return;
      const dx = e.clientX - inicio.x, dy = e.clientY - inicio.y;
      const rapido = performance.now() - inicio.t < 600;
      inicio = null;
      if (dx * dx + dy * dy > 100 || !rapido) return;
      const objetivo = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('[data-id]');
      if (objetivo && this.svg.contains(objetivo)) this.alSeleccionar(objetivo.dataset.id, { origen: 'toque' });
      else this.alTocarFondo();
    });
    this.svg.addEventListener('pointercancel', () => { inicio = null; });
    this.svg.addEventListener('keydown', (e) => {
      const id = e.target?.dataset?.id;
      if (id && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        this.alSeleccionar(id, { origen: 'teclado' });
      }
    });
    this.svg.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const id = e.target?.dataset?.id ?? null;
      if (id !== this.hover) {
        this.hover = id;
        this.svg.classList.toggle('con-hover', !!id);
      }
    });
  }

  redimensionar() {
    const { width: w, height: h } = this.cont.getBoundingClientRect();
    if (!w || !h) return;
    this.ancho = w;
    this.alto = h;
    this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const radioDisco = Math.min(w, h) / 2 - Math.max(8, Math.min(w, h) * 0.025);
    const escala = radioDisco / Math.sin((RADIO_GRADOS * Math.PI) / 180);
    this.proyeccion.scale(escala).translate([w / 2, h / 2]);
    this.radioDisco = radioDisco;
    this.zoom.extent([[0, 0], [w, h]]).translateExtent([[-w * 0.3, -h * 0.3], [w * 1.3, h * 1.3]]);
    this.#dibujar();
    if (this.seleccionado) this.#elevar(this.seleccionado);
    this.alRedimensionar.forEach((f) => f());
  }

  #dibujar() {
    const esfera = { type: 'Sphere' };
    const d = (sel, obj) => this.svg.querySelector(sel).setAttribute('d', this.path(obj) ?? '');
    d('.globo-fondo', esfera);
    d('.oceano', esfera);
    d('.borde-globo', esfera);
    d('.graticula', geoGraticule().step([10, 10])());
    d('.fronteras', fronteras);
    d('.linea-ecuador', lineaLatitud(0));
    d('.linea-tropico', lineaLatitud(-23.44));
    for (const { f, p } of this.pathsContexto) p.setAttribute('d', this.path(f) ?? '');
    for (const { f, p } of this.pathsPais.values()) p.setAttribute('d', this.path(f) ?? '');
    for (const r of this.rotulos) r.xy = this.proyeccion([r.lon, r.lat]);
    this.#aplicarOpciones();
    this.#ubicarRotulos();
  }

  #ubicarRotulos() {
    const t = this.transform;
    const k = t.k;
    for (const r of this.rotulos) {
      if (!r.xy) continue;
      const x = t.applyX(r.xy[0]), y = t.applyY(r.xy[1]);
      r.el.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})${r.giro ? ` rotate(${r.giro})` : ''}`);
      const oculto = (r.zoomMin && k < r.zoomMin) || this.#ocultoPorOpcion(r, k);
      r.el.classList.toggle('oculto', !!oculto);
    }
  }

  #ocultoPorOpcion(r, k) {
    const o = this.opciones;
    if (r.tipo === 'ecuador') return !o.ecuador;
    if (r.tipo === 'tropico') return !o.tropico;
    if (r.tipo === 'pais') {
      if (this.juego?.nombres) return !this.juego.nombres(r.pais);
      return !o.nombres && !this.visitados.has(r.pais);
    }
    if (r.tipo === 'capital') {
      if (this.juego && !this.juego.capitales) return true;
      if (!o.capitales) return r.pais !== this.seleccionado;
      return false;
    }
    return false;
  }

  #aplicarOpciones() {
    const o = this.opciones;
    this.svg.classList.toggle('sin-nombres', !o.nombres && !this.juego?.nombres);
    this.svg.classList.toggle('con-ecuador', o.ecuador);
    this.svg.classList.toggle('con-tropico', o.tropico);
    // Nombres de capitales: solo con zoom o en el país elegido
    this.svg.classList.toggle('zoom-cerca', this.transform.k >= 2.4);
  }

  setOpciones(opciones) {
    Object.assign(this.opciones, opciones);
    this.#aplicarOpciones();
    this.#ubicarRotulos();
  }

  setVisitados(lista) {
    this.visitados = new Set(lista);
    for (const [id, { grupo }] of this.rotulosPais) grupo.classList.toggle('visitado', this.visitados.has(id));
    this.#ubicarRotulos();
  }

  /** Zoom animado hasta un país y lo eleva con sombra. */
  seleccionar(id, { zoom = true } = {}) {
    this.seleccionado = id;
    for (const [pid, { p }] of this.pathsPais) p.classList.toggle('seleccionado', pid === id);
    for (const c of this.rotulosCapital) c.grupo.classList.toggle('activa', c.pais === id);
    for (const [pid, { grupo }] of this.rotulosPais) grupo.classList.toggle('activo', pid === id);
    this.#elevar(id);
    if (zoom && id) this.enfocar(id);
    this.#ubicarRotulos();
  }

  #elevar(id) {
    this.gElevado.replaceChildren();
    const item = id && this.pathsPais.get(id);
    if (!item) return;
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', item.p.getAttribute('d'));
    p.setAttribute('class', 'pais-elevado');
    p.dataset.id = id;
    p.style.fill = item.p.style.fill;
    p.setAttribute('filter', 'url(#sombra-pais)');
    this.gElevado.append(p);
    if (!reduceMovimiento()) p.animate(
      [{ transform: 'translate(0,0)', opacity: 0.6 }, { transform: 'translate(0,-3px)', opacity: 1 }],
      { duration: 420, easing: 'cubic-bezier(.2,1.4,.4,1)', fill: 'forwards' },
    );
  }

  enfocar(id) {
    const item = this.pathsPais.get(id);
    if (!item) return;
    const [[x0, y0], [x1, y1]] = this.path.bounds(item.principal);
    this.#irA(x0, y0, x1, y1, id === 'brasil' || id === 'argentina' ? 0.8 : 0.62);
  }

  #irA(x0, y0, x1, y1, relleno = 0.65) {
    const m = this.margenes();
    const anchoUtil = this.ancho - m.left - m.right;
    const altoUtil = this.alto - m.top - m.bottom;
    const k = Math.min(ZOOM_MAX, Math.max(1, relleno / Math.max((x1 - x0) / anchoUtil, (y1 - y0) / altoUtil)));
    const cx = m.left + anchoUtil / 2, cy = m.top + altoUtil / 2;
    const destino = zoomIdentity.translate(cx, cy).scale(k).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    this.sel.interrupt().transition().duration(reduceMovimiento() ? 0 : 950).call(this.zoom.transform, destino);
  }

  /** Vuelve a la vista completa de Sudamérica. */
  centrar() {
    const m = this.margenes();
    // Encuadre de Sudamérica continental
    const sa = { type: 'Feature', geometry: { type: 'MultiPoint', coordinates: [[-81.5, 12.5], [-34.8, -7], [-68, -55.9], [-73, -50]] } };
    const [[x0, y0], [x1, y1]] = this.path.bounds(sa);
    if (m.hoja) this.#irA(x0, y0, x1, y1, 0.92);
    else this.sel.interrupt().transition().duration(reduceMovimiento() ? 0 : 800).call(this.zoom.transform, zoomIdentity);
  }

  acercar(factor) {
    this.sel.interrupt().transition().duration(reduceMovimiento() ? 0 : 300).call(this.zoom.scaleBy, factor);
  }

  /** Configura qué se muestra durante un juego (null = modo explorar). */
  setJuego(cfg) {
    this.juego = cfg;
    this.#aplicarOpciones();
    this.#ubicarRotulos();
  }

  refrescarRotulos() {
    this.#ubicarRotulos();
  }

  /** Agrega un elemento a la capa de rótulos que sigue al mapa sin escalarse. */
  agregarRotulo(el, lon, lat, { capa = 'superior', giro = 0 } = {}) {
    (capa === 'superior' ? this.gSuperior : this.gRotulos).append(el);
    const r = { el, lon, lat, giro, xy: this.proyeccion([lon, lat]) };
    this.rotulos.push(r);
    this.#ubicarRotulos();
    return r;
  }

  quitarRotulo(el) {
    this.rotulos = this.rotulos.filter((r) => r.el !== el);
    el.remove();
  }

  /** Punto donde va el nombre del país (sirve para marcadores). */
  puntoDe(id) {
    const d = PAISES_POR_ID[id] ?? (id === GUAYANA_FRANCESA.id ? GUAYANA_FRANCESA : null);
    return d ? [d.etiqueta.lon, d.etiqueta.lat] : null;
  }

  /** Globo amarillo con "?" que apunta a un país (o null para quitarlo). */
  marcador(id) {
    if (this.elMarcador) this.quitarRotulo(this.elMarcador);
    this.elMarcador = null;
    if (!id) return;
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'marcador-pregunta');
    g.innerHTML = `<g class="marcador-flota">
      <path d="M0 0 C-4 -10 -18 -20 -18 -34 A18 18 0 1 1 18 -34 C18 -20 4 -10 0 0Z" fill="#F2C230" stroke="#23302A" stroke-width="2.5"/>
      <text x="0" y="-26" text-anchor="middle" font-size="24" font-weight="900" fill="#23302A">?</text></g>`;
    const [lon, lat] = this.puntoDe(id);
    this.elMarcador = g;
    this.agregarRotulo(g, lon, lat);
  }

  #clon(id, clase) {
    const item = this.pathsPais.get(id);
    if (!item) return null;
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', item.p.getAttribute('d'));
    p.setAttribute('class', clase);
    p.dataset.id = id;
    const [[x0, y0], [x1, y1]] = this.path.bounds(item.principal);
    p.style.transformOrigin = `${(x0 + x1) / 2}px ${(y0 + y1) / 2}px`;
    return { p, item };
  }

  /** El país salta (acierto). */
  animarAcierto(id) {
    const c = this.#clon(id, 'pais-salta');
    if (!c) return;
    c.p.style.fill = c.item.p.style.fill;
    c.p.setAttribute('filter', 'url(#sombra-pais)');
    this.gEfectos.append(c.p);
    const k = this.transform.k;
    if (reduceMovimiento()) { setTimeout(() => c.p.remove(), 900); return; }
    c.p.animate([
      { transform: 'translate(0,0) scale(1)' },
      { transform: `translate(0,${-14 / k}px) scale(1.12)`, offset: 0.35 },
      { transform: 'translate(0,0) scale(0.97)', offset: 0.65 },
      { transform: `translate(0,${-5 / k}px) scale(1.04)`, offset: 0.82 },
      { transform: 'translate(0,0) scale(1)' },
    ], { duration: 850, easing: 'ease-out' }).onfinish = () => c.p.remove();
  }

  /** El país tocado tiembla en rojo con una ✗ (no depende solo del color). */
  animarError(id) {
    const c = this.#clon(id, 'pais-error');
    if (!c) return;
    this.gEfectos.append(c.p);
    const pt = this.puntoDe(id);
    const x = document.createElementNS(NS, 'g');
    x.setAttribute('class', 'marca-error');
    x.innerHTML = '<circle r="14"/><path d="M-5.5 -5.5 5.5 5.5M5.5 -5.5 -5.5 5.5"/>';
    if (pt) this.agregarRotulo(x, pt[0], pt[1]);
    const k = this.transform.k;
    const fin = () => { c.p.remove(); if (pt) this.quitarRotulo(x); };
    if (reduceMovimiento()) { setTimeout(fin, 1000); return; }
    const d = 6 / k;
    c.p.animate([
      { transform: 'translateX(0)' }, { transform: `translateX(${-d}px)` }, { transform: `translateX(${d}px)` },
      { transform: `translateX(${-d}px)` }, { transform: `translateX(${d * 0.6}px)` }, { transform: 'translateX(0)' },
    ], { duration: 520, easing: 'ease-in-out' });
    c.p.animate([{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], { duration: 1100 }).onfinish = fin;
  }

  /** Resalta el país bajo una bandera que se arrastra. */
  resaltar(id) {
    for (const [pid, { p }] of this.pathsPais) p.classList.toggle('objetivo', pid === id);
  }

  /** Muestra la respuesta: el país late con un borde grueso. */
  mostrarRespuesta(id) {
    this.seleccionar(id, { zoom: false });
    this.gElevado.firstChild?.classList.add('pulsa');
  }

  /** Proyección [lon, lat] → coordenadas del mapa sin zoom. */
  proyectar(lon, lat) {
    return this.proyeccion([lon, lat]);
  }

  /** Proyección [lon, lat] → coordenadas de pantalla dentro del contenedor. */
  aPantalla(lon, lat) {
    const xy = this.proyeccion([lon, lat]);
    return xy && [this.transform.applyX(xy[0]), this.transform.applyY(xy[1])];
  }

  limitesDe(id) {
    const item = this.pathsPais.get(id);
    return item ? geoBounds(item.principal) : null;
  }
}
