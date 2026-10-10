// Globo 3D con Three.js. La textura se dibuja con d3 en un <canvas>
// (proyección equirectangular) y se pega sobre una esfera. Una segunda esfera,
// un poquito más grande, muestra los resaltados (país elegido, acierto, error)
// sin tener que redibujar el mapa base.
import {
  WebGLRenderer, Scene, PerspectiveCamera, SphereGeometry, Mesh, Group,
  MeshLambertMaterial, MeshBasicMaterial, CanvasTexture, AmbientLight,
  DirectionalLight, Raycaster, Vector2, Vector3, SRGBColorSpace,
} from 'three';
import { geoEquirectangular, geoPath, geoGraticule, geoContains, geoArea } from 'd3-geo';
import { feature } from 'topojson-client';
import mundo from '../data/geo-mundo.generated.json';
import { featuresSudamerica, featuresContexto } from '../data/geo.js';
import { PAISES, PAISES_POR_ID, GUAYANA_FRANCESA, COLORES_ATLAS } from '../data/paises.js';
import { reduceMovimiento } from '../core/estado.js';

const CENTRO_SA = { lon: -62, lat: -18 };
const RAD = Math.PI / 180;
const FOV = 35;
const facil = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const angulo = (a) => ((a + 540) % 360) - 180; // normaliza a [-180, 180)

// Solo revisa que el navegador conozca WebGL; el contexto se crea recién al
// tocar "3D" (si falla, se avisa y se sigue con el mapa 2D).
export const webglDisponible = () => typeof window !== 'undefined' && 'WebGLRenderingContext' in window;

export class Globo3D {
  constructor(contenedor, { alSeleccionar, alLento, margenAbajo } = {}) {
    this.cont = contenedor;
    this.margenAbajo = margenAbajo ?? (() => 0);
    this.alSeleccionar = alSeleccionar ?? (() => {});
    this.alLento = alLento ?? (() => {});
    this.activo = false;
    this.centro = { ...CENTRO_SA };
    this.distancia = null; // se calcula al conocer el tamaño
    this.seleccionado = null;
    this.juego = null;
    this.opciones = { nombres: true };
    this.visitados = new Set();
    this.resaltes = new Map(); // id -> 'sel' | 'bien' | 'error' | 'pulsa'
    this.ultimaInteraccion = 0;
    this.autoGiro = true;

    this.#crear();
  }

  #crear() {
    this.cont.innerHTML = '<canvas class="globo-canvas" tabindex="0" aria-label="Globo terráqueo. Arrastra para girarlo; con el teclado usa las flechas."></canvas><div class="globo-rotulos" aria-hidden="true"></div>';
    this.canvas = this.cont.querySelector('canvas');
    this.capaRotulos = this.cont.querySelector('.globo-rotulos');

    this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.escena = new Scene();
    this.camara = new PerspectiveCamera(FOV, 1, 0.1, 50);
    this.escena.add(new AmbientLight(0xffffff, 2.1));
    const sol = new DirectionalLight(0xffffff, 1.3);
    sol.position.set(-3, 2, 4);
    this.escena.add(sol);

    const max = this.renderer.capabilities.maxTextureSize;
    this.ancho = max >= 4096 ? 4096 : 2048;
    this.texBase = new CanvasTexture(this.#dibujarBase());
    this.texBase.colorSpace = SRGBColorSpace;
    this.texBase.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());

    this.lienzoResalte = document.createElement('canvas');
    this.lienzoResalte.width = this.ancho;
    this.lienzoResalte.height = this.ancho / 2;
    this.texResalte = new CanvasTexture(this.lienzoResalte);
    this.texResalte.colorSpace = SRGBColorSpace;

    this.grupo = new Group();
    this.esfera = new Mesh(new SphereGeometry(1, 128, 96), new MeshLambertMaterial({ map: this.texBase }));
    this.matResalte = new MeshBasicMaterial({ map: this.texResalte, transparent: true, depthWrite: false });
    this.capaResalte = new Mesh(new SphereGeometry(1.008, 128, 96), this.matResalte);
    this.grupo.add(this.esfera, this.capaResalte);
    this.escena.add(this.grupo);

    this.raycaster = new Raycaster();
    this.#crearRotulos();
    this.#interaccion();
    new ResizeObserver(() => this.redimensionar()).observe(this.cont);
  }

  // ───────── Texturas ─────────
  #dibujarBase() {
    const w = this.ancho, h = w / 2;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    const proy = geoEquirectangular().scale(w / (2 * Math.PI)).translate([w / 2, h / 2]).precision(0.1);
    const path = geoPath(proy, ctx);
    const k = w / 2048;

    ctx.fillStyle = '#BFD3E6';
    ctx.fillRect(0, 0, w, h);
    ctx.beginPath();
    path(geoGraticule().step([10, 10])());
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1 * k;
    ctx.stroke();

    // Resto del mundo (detalle bajo) y contexto cercano (detalle alto)
    const ids = new Set(featuresContexto.map((f) => f.id));
    const resto = feature(mundo, mundo.objects.countries).features.filter((f) => !PAISES_POR_ID[f.id] && !ids.has(f.id));
    ctx.fillStyle = '#DDD8CB';
    ctx.strokeStyle = '#F6F3EA';
    ctx.lineWidth = 0.8 * k;
    for (const f of [...resto, ...featuresContexto]) {
      ctx.beginPath();
      path(f);
      ctx.fill();
      ctx.stroke();
    }

    // Sudamérica con colores de atlas
    const rayas = this.#patronRayas(ctx, k);
    for (const f of featuresSudamerica) {
      const p = PAISES_POR_ID[f.id];
      ctx.beginPath();
      path(f);
      ctx.fillStyle = p ? COLORES_ATLAS[p.color] : rayas;
      ctx.fill();
      ctx.strokeStyle = '#FFFDF6';
      ctx.lineWidth = 1.6 * k;
      ctx.stroke();
    }
    return c;
  }

  #patronRayas(ctx, k) {
    const p = document.createElement('canvas');
    const t = Math.round(6 * k);
    p.width = p.height = t;
    const c = p.getContext('2d');
    c.fillStyle = '#D9DDE6';
    c.fillRect(0, 0, t, t);
    c.strokeStyle = '#B8BFCD';
    c.lineWidth = t / 3;
    c.beginPath();
    c.moveTo(0, t);
    c.lineTo(t, 0);
    c.stroke();
    return ctx.createPattern(p, 'repeat');
  }

  #dibujarResaltes() {
    const c = this.lienzoResalte;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    const proy = geoEquirectangular().scale(c.width / (2 * Math.PI)).translate([c.width / 2, c.height / 2]).precision(0.1);
    const path = geoPath(proy, ctx);
    const k = c.width / 2048;
    for (const [id, tipo] of this.resaltes) {
      const f = featuresSudamerica.find((x) => x.id === id);
      if (!f) continue;
      const p = PAISES_POR_ID[id];
      ctx.beginPath();
      path(f);
      ctx.setLineDash(tipo === 'error' ? [6 * k, 4 * k] : []);
      if (tipo === 'error') ctx.fillStyle = 'rgba(217,71,60,0.85)';
      else if (tipo === 'bien') ctx.fillStyle = 'rgba(91,168,41,0.75)';
      else ctx.fillStyle = p ? COLORES_ATLAS[p.color] : '#D9DDE6';
      ctx.fill();
      ctx.strokeStyle = tipo === 'pulsa' ? '#F2C230' : tipo === 'error' ? '#7D231C' : '#23302A';
      ctx.lineWidth = (tipo === 'pulsa' ? 2.4 : 1.2) * k;
      ctx.stroke();
    }
    this.texResalte.needsUpdate = true;
  }

  #resaltar(id, tipo, ms = 0) {
    if (!id) return;
    this.resaltes.set(id, tipo);
    this.#dibujarResaltes();
    if (ms) {
      clearTimeout(this.tResalte?.[id]);
      this.tResalte = this.tResalte ?? {};
      this.tResalte[id] = setTimeout(() => {
        if (this.resaltes.get(id) !== tipo) return;
        if (id === this.seleccionado) this.resaltes.set(id, 'sel');
        else this.resaltes.delete(id);
        this.#dibujarResaltes();
      }, ms);
    }
  }

  // ───────── Rótulos HTML ─────────
  #crearRotulos() {
    this.rotulos = [...PAISES, GUAYANA_FRANCESA].map((p) => {
      const el = document.createElement('span');
      el.className = `globo-rotulo${p.esTerritorio ? ' globo-rotulo-territorio' : ''}`;
      el.innerHTML = `<span class="globo-check" aria-hidden="true"></span>${p.esTerritorio ? 'Guayana Fr.' : p.nombre}`;
      this.capaRotulos.append(el);
      const { lon, lat } = p.etiqueta;
      // Los países pequeños del norte se rotulan solo al acercarse (si no, se enciman)
      const soloCerca = ['guyana', 'surinam', 'guayana-francesa'].includes(p.id);
      return { id: p.id, el, lon, lat, soloCerca };
    });
  }

  #puntoEsfera(lon, lat, r = 1.01) {
    const l = lon * RAD, f = lat * RAD;
    return new Vector3(r * Math.cos(f) * Math.cos(l), r * Math.sin(f), -r * Math.cos(f) * Math.sin(l));
  }

  #ubicarRotulos() {
    const w = this.cont.clientWidth, h = this.cont.clientHeight;
    const camPos = this.camara.position;
    for (const r of this.rotulos) {
      const visibleNombre = this.juego?.nombres ? this.juego.nombres(r.id) : (this.opciones.nombres || this.visitados.has(r.id));
      const v = this.#puntoEsfera(r.lon, r.lat).applyMatrix4(this.grupo.matrixWorld);
      const normal = v.clone().normalize();
      const haciaCam = camPos.clone().sub(v).normalize();
      const frente = normal.dot(haciaCam);
      const lejos = r.soloCerca && r.id !== this.seleccionado && this.distancia > this.#distanciaBase() * 0.7;
      if (!visibleNombre || frente < 0.25 || lejos) { r.el.style.opacity = '0'; continue; }
      v.project(this.camara);
      const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
      r.el.style.opacity = String(Math.min(1, (frente - 0.25) * 4));
      r.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
      r.el.classList.toggle('visitado', this.visitados.has(r.id));
      r.el.classList.toggle('activo', r.id === this.seleccionado);
    }
  }

  // ───────── Interacción ─────────
  #interaccion() {
    const punteros = new Map();
    let toque = null, pellizco = null;
    const c = this.canvas;

    c.addEventListener('pointerdown', (e) => {
      c.setPointerCapture(e.pointerId);
      punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.ultimaInteraccion = performance.now();
      this.animacion = null;
      if (punteros.size === 1) toque = { x: e.clientX, y: e.clientY, t: performance.now(), movido: false };
      if (punteros.size === 2) {
        const [a, b] = [...punteros.values()];
        pellizco = { d: Math.hypot(a.x - b.x, a.y - b.y), dist: this.distancia };
        toque = null;
      }
    });
    c.addEventListener('pointermove', (e) => {
      const prev = punteros.get(e.pointerId);
      if (!prev) return;
      const actual = { x: e.clientX, y: e.clientY };
      punteros.set(e.pointerId, actual);
      this.ultimaInteraccion = performance.now();
      if (pellizco && punteros.size === 2) {
        const [a, b] = [...punteros.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        this.#fijarDistancia(pellizco.dist * (pellizco.d / Math.max(10, d)));
        return;
      }
      if (toque && Math.hypot(actual.x - toque.x, actual.y - toque.y) > 8) toque.movido = true;
      const radioPx = this.#radioPantalla();
      this.centro.lon = angulo(this.centro.lon - ((actual.x - prev.x) / radioPx) / RAD);
      this.centro.lat = Math.max(-75, Math.min(75, this.centro.lat + ((actual.y - prev.y) / radioPx) / RAD));
    });
    const fin = (e) => {
      punteros.delete(e.pointerId);
      if (punteros.size < 2) pellizco = null;
      if (toque && !toque.movido && performance.now() - toque.t < 600 && e.type === 'pointerup') this.#tocar(e.clientX, e.clientY);
      toque = null;
    };
    c.addEventListener('pointerup', fin);
    c.addEventListener('pointercancel', fin);
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.ultimaInteraccion = performance.now();
      this.#fijarDistancia(this.distancia * (1 + Math.sign(e.deltaY) * 0.12));
    }, { passive: false });
    c.addEventListener('keydown', (e) => {
      const paso = 6;
      const mov = { ArrowLeft: [-paso, 0], ArrowRight: [paso, 0], ArrowUp: [0, paso], ArrowDown: [0, -paso] }[e.key];
      if (mov) {
        e.preventDefault();
        this.ultimaInteraccion = performance.now();
        this.centro.lon = angulo(this.centro.lon + mov[0]);
        this.centro.lat = Math.max(-75, Math.min(75, this.centro.lat + mov[1]));
      }
      if (e.key === '+') this.acercar(1.25);
      if (e.key === '-') this.acercar(0.8);
    });
  }

  #tocar(x, y) {
    const r = this.canvas.getBoundingClientRect();
    const ndc = new Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camara);
    const hit = this.raycaster.intersectObject(this.esfera)[0];
    if (!hit?.uv) return;
    const lon = hit.uv.x * 360 - 180, lat = hit.uv.y * 180 - 90;
    const f = featuresSudamerica.find((ft) => geoContains(ft, [lon, lat]));
    if (f) this.alSeleccionar(f.id);
  }

  #radioPantalla() {
    const h = this.cont.clientHeight || 1;
    // (el desplazamiento de la vista no cambia la escala)
    return (h / 2) / (Math.tan((FOV / 2) * RAD) * Math.sqrt(this.distancia ** 2 - 1));
  }

  #distanciaBase() {
    const w = this.cont.clientWidth || 1, h = this.cont.clientHeight || 1;
    const util = Math.max(120, h - this.margenAbajo());
    const tanV = Math.tan((FOV / 2) * RAD);
    // El globo debe caber en el alto útil (sin la hoja del celular) y en el ancho
    const tan = Math.min(tanV * (util / h), tanV * (w / h));
    return 1 / Math.sin(Math.atan(tan * 0.86));
  }

  #fijarDistancia(d) {
    const base = this.#distanciaBase();
    this.distancia = Math.max(1.18, Math.min(base * 1.3, d));
  }

  acercar(factor) {
    this.ultimaInteraccion = performance.now();
    this.#fijarDistancia(this.distancia / factor);
  }

  redimensionar() {
    const w = this.cont.clientWidth, h = this.cont.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camara.aspect = w / h;
    // Si la hoja del celular tapa la parte de abajo, subimos el centro del globo
    const abajo = Math.min(this.margenAbajo(), h * 0.6);
    if (abajo > 0) this.camara.setViewOffset(w, h, 0, abajo / 2, w, h);
    else this.camara.clearViewOffset();
    this.camara.updateProjectionMatrix();
    if (!this.distancia) this.distancia = this.#distanciaBase();
    else this.#fijarDistancia(this.distancia);
  }

  /** Gira (y acerca) el globo hasta un punto con animación suave. */
  #irA(lon, lat, distancia) {
    const desde = { ...this.centro, d: this.distancia };
    const hasta = { lon, lat, d: distancia ?? this.distancia };
    const dLon = angulo(hasta.lon - desde.lon);
    if (reduceMovimiento()) {
      this.centro = { lon, lat };
      this.#fijarDistancia(hasta.d);
      return;
    }
    this.animacion = { t0: performance.now(), dur: 1100, desde, dLon, hasta };
  }

  // ───────── Ciclo de dibujo ─────────
  #cuadro = (t) => {
    if (!this.activo) return;
    const dt = Math.min(0.1, (t - (this.tAnterior ?? t)) / 1000);
    this.tAnterior = t;

    if (this.animacion) {
      const a = this.animacion;
      const k = facil(Math.min(1, (t - a.t0) / a.dur));
      this.centro.lon = angulo(a.desde.lon + a.dLon * k);
      this.centro.lat = a.desde.lat + (a.hasta.lat - a.desde.lat) * k;
      this.#fijarDistancia(a.desde.d + (a.hasta.d - a.desde.d) * k);
      if (k >= 1) this.animacion = null;
    } else if (this.autoGiro && !this.seleccionado && !reduceMovimiento() && t - this.ultimaInteraccion > 4000) {
      this.centro.lon = angulo(this.centro.lon + 5 * dt); // gira despacito
    }

    // El país que late para mostrar la respuesta
    const late = [...this.resaltes.values()].includes('pulsa');
    this.matResalte.opacity = late ? 0.65 + 0.35 * Math.sin(t / 160) : 1;

    this.grupo.rotation.set(this.centro.lat * RAD, -Math.PI / 2 - this.centro.lon * RAD, 0, 'XYZ');
    this.camara.position.set(0, 0, this.distancia);
    this.camara.lookAt(0, 0, 0);
    this.grupo.updateMatrixWorld();
    this.renderer.render(this.escena, this.camara);
    this.#ubicarRotulos();
    this.#medirFps(t);
    requestAnimationFrame(this.#cuadro);
  };

  // Si el equipo va lento (menos de 24 FPS en los primeros segundos), avisamos.
  #medirFps(t) {
    const m = this.medicion;
    if (!m || m.listo) return;
    if (!m.t0) { m.t0 = t; m.cuadros = 0; return; }
    m.cuadros += 1;
    if (t - m.t0 > 3000) {
      m.listo = true;
      const fps = (m.cuadros * 1000) / (t - m.t0);
      this.fps = fps;
      if (fps < 24) this.alLento(fps);
    }
  }

  activar() {
    this.activo = true;
    this.cont.hidden = false;
    this.redimensionar();
    this.medicion = {};
    this.tAnterior = null;
    this.ultimaInteraccion = performance.now() - 3000;
    requestAnimationFrame(this.#cuadro);
  }

  desactivar() {
    this.activo = false;
    this.cont.hidden = true;
  }

  // ───────── Misma interfaz que el mapa 2D (la usan los modos de juego) ─────────
  sincronizar({ seleccionado, juego, visitados, opciones }) {
    this.juego = juego;
    this.visitados = new Set(visitados);
    this.opciones = { ...opciones };
    this.resaltes.clear();
    this.seleccionar(seleccionado);
  }

  seleccionar(id, { zoom = true } = {}) {
    if (this.seleccionado && this.resaltes.get(this.seleccionado) === 'sel') this.resaltes.delete(this.seleccionado);
    for (const [k, v] of this.resaltes) if (v === 'pulsa') this.resaltes.delete(k);
    this.seleccionado = id;
    if (id) this.resaltes.set(id, 'sel');
    this.#dibujarResaltes();
    if (id && zoom) {
      const p = PAISES_POR_ID[id] ?? GUAYANA_FRANCESA;
      const f = featuresSudamerica.find((x) => x.id === id);
      const grande = f && geoArea(f) > 0.05; // Brasil, Argentina
      this.#irA(p.etiqueta.lon, p.etiqueta.lat, this.#distanciaBase() * (grande ? 0.66 : 0.5));
    }
  }

  animarAcierto(id) { this.#resaltar(id, 'bien', 900); }
  animarError(id) { this.#resaltar(id, 'error', 1000); }
  mostrarRespuesta(id) {
    this.seleccionado = id;
    this.#resaltar(id, 'pulsa');
    const p = PAISES_POR_ID[id];
    if (p) this.#irA(p.etiqueta.lon, p.etiqueta.lat);
  }
  setJuego(cfg) { this.juego = cfg; }
  setVisitados(lista) { this.visitados = new Set(lista); }
  setOpciones(o) { Object.assign(this.opciones, o); }
  resaltar() {}
  centrar() {
    this.ultimaInteraccion = performance.now();
    this.#irA(CENTRO_SA.lon, CENTRO_SA.lat, this.#distanciaBase());
  }
}
