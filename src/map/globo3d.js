// Globo 3D con Three.js. La textura se dibuja con d3 en un <canvas>
// (proyección equirectangular) y se pega sobre una esfera. Un casquete un
// poquito más grande, que cubre solo Sudamérica, muestra los resaltados (país
// elegido, acierto, error) sin tener que redibujar ni volver a subir el mapa
// base a la tarjeta gráfica.
//
// Para que vaya fluido en equipos modestos:
// - Solo se dibuja un cuadro cuando algo cambió (giro, zoom, resaltado...).
// - Si el equipo no tiene tarjeta gráfica (dibujo por software) o mide pocos
//   cuadros por segundo, baja la resolución y deja de girar solo.
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
// Zona que cubre el casquete de resaltados (incluye Galápagos y Rapa Nui)
const ZONA = { oeste: -110, este: -26, norte: 15, sur: -58 };
const facil = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const angulo = (a) => ((a + 540) % 360) - 180; // normaliza a [-180, 180)
const AREAS = new Map(featuresSudamerica.map((f) => [f.id, geoArea(f)]));

// Solo revisa que el navegador conozca WebGL; el contexto se crea recién al
// tocar "3D" (si falla, se avisa y se sigue con el mapa 2D).
export const webglDisponible = () => typeof window !== 'undefined' && 'WebGLRenderingContext' in window;

// ¿El navegador dibuja WebGL sin tarjeta gráfica? (muy lento en equipos escolares)
function dibujoPorSoftware(gl) {
  try {
    let r = String(gl.getParameter(gl.RENDERER) ?? '');
    if (/webkit|mozilla/i.test(r)) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) r = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? '');
    }
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(r);
  } catch {
    return false;
  }
}

export class Globo3D {
  constructor(contenedor, { alSeleccionar, alLento, alPerder, margenAbajo } = {}) {
    this.cont = contenedor;
    this.margenAbajo = margenAbajo ?? (() => 0);
    this.alSeleccionar = alSeleccionar ?? (() => {});
    this.alLento = alLento ?? (() => {});
    this.alPerder = alPerder ?? (() => {});
    this.activo = false;
    this.centro = { ...CENTRO_SA };
    this.distancia = null; // se calcula al conocer el tamaño
    this.seleccionado = null;
    this.juego = null;
    this.opciones = { nombres: true };
    this.visitados = new Set();
    this.resaltes = new Map(); // id -> 'sel' | 'bien' | 'error' | 'pulsa'
    this.tResalte = {};
    this.ultimaInteraccion = 0;
    this.autoGiro = true;
    this.sucio = true;
    this.raf = 0;

    this.#crear();
  }

  #crear() {
    this.cont.innerHTML = '<canvas class="globo-canvas" tabindex="0" aria-label="Globo terráqueo. Arrastra para girarlo; con el teclado usa las flechas."></canvas><div class="globo-rotulos" aria-hidden="true"></div>';
    this.canvas = this.cont.querySelector('canvas');
    this.capaRotulos = this.cont.querySelector('.globo-rotulos');

    this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.software = dibujoPorSoftware(this.renderer.getContext());
    this.pixeles = this.software ? 1 : Math.min(2, window.devicePixelRatio || 1);
    this.renderer.setPixelRatio(this.pixeles);
    if (this.software) this.autoGiroPermitido = false;
    this.escena = new Scene();
    this.camara = new PerspectiveCamera(FOV, 1, 0.1, 50);
    this.escena.add(new AmbientLight(0xffffff, 2.1));
    const sol = new DirectionalLight(0xffffff, 1.3);
    sol.position.set(-3, 2, 4);
    this.escena.add(sol);

    const max = this.renderer.capabilities.maxTextureSize;
    this.ancho = max >= 4096 && !this.software ? 4096 : 2048;
    this.texBase = new CanvasTexture(this.#dibujarBase());
    this.texBase.colorSpace = SRGBColorSpace;
    this.texBase.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());

    // Lienzo de resaltados: solo la zona de Sudamérica, con más detalle que el
    // mapa base y muchísimo más liviano de actualizar.
    this.pxGrado = this.ancho === 4096 ? 14 : 9;
    this.lienzoResalte = document.createElement('canvas');
    this.lienzoResalte.width = Math.round((ZONA.este - ZONA.oeste) * this.pxGrado);
    this.lienzoResalte.height = Math.round((ZONA.norte - ZONA.sur) * this.pxGrado);
    this.texResalte = new CanvasTexture(this.lienzoResalte);
    this.texResalte.colorSpace = SRGBColorSpace;

    this.grupo = new Group();
    this.esfera = new Mesh(new SphereGeometry(1, 128, 96), new MeshLambertMaterial({ map: this.texBase }));
    this.matResalte = new MeshBasicMaterial({ map: this.texResalte, transparent: true, depthWrite: false });
    // Casquete: phi = longitud + 180°, theta = 90° - latitud (convención de three.js)
    this.capaResalte = new Mesh(new SphereGeometry(
      1.008, 48, 48,
      (ZONA.oeste + 180) * RAD, (ZONA.este - ZONA.oeste) * RAD,
      (90 - ZONA.norte) * RAD, (ZONA.norte - ZONA.sur) * RAD,
    ), this.matResalte);
    this.grupo.add(this.esfera, this.capaResalte);
    this.escena.add(this.grupo);

    this.raycaster = new Raycaster();
    this.#crearRotulos();
    this.#interaccion();
    this.#dibujarResaltes();
    new ResizeObserver(() => { if (this.activo) this.redimensionar(); }).observe(this.cont);

    // Si el sistema le quita la tarjeta gráfica a la página (pasa en celulares),
    // volvemos al mapa 2D y, si la devuelve, se vuelven a subir las texturas.
    this.canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.perdido = true;
      this.alPerder();
    });
    this.canvas.addEventListener('webglcontextrestored', () => {
      this.perdido = false;
      this.texBase.needsUpdate = true;
      this.texResalte.needsUpdate = true;
      this.sucio = true;
    });
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
    // Equirectangular recortada a la ZONA: (oeste, norte) queda en (0, 0)
    const s = this.pxGrado / RAD;
    const proy = geoEquirectangular().scale(s).translate([-ZONA.oeste * RAD * s, ZONA.norte * RAD * s]).precision(0.1);
    const path = geoPath(proy, ctx);
    const k = this.pxGrado / (2048 / 360); // mismo grosor de línea que el mapa base de 2048
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
    this.sucio = true;
  }

  #resaltar(id, tipo, ms = 0) {
    if (!id) return;
    clearTimeout(this.tResalte[id]);
    this.resaltes.set(id, tipo);
    this.#dibujarResaltes();
    if (ms) {
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
      return { id: p.id, el, lon, lat, area: AREAS.get(p.id) ?? 0, clave: '', w: 0, h: 0 };
    });
  }

  #puntoEsfera(lon, lat, r = 1.01) {
    const l = lon * RAD, f = lat * RAD;
    return new Vector3(r * Math.cos(f) * Math.cos(l), r * Math.sin(f), -r * Math.cos(f) * Math.sin(l));
  }

  #ubicarRotulos() {
    const w = this.cont.clientWidth, h = this.cont.clientHeight;
    const camPos = this.camara.position;
    const candidatos = [];
    for (const r of this.rotulos) {
      const visibleNombre = this.juego?.nombres ? this.juego.nombres(r.id) : (this.opciones.nombres || this.visitados.has(r.id));
      const v = this.#puntoEsfera(r.lon, r.lat).applyMatrix4(this.grupo.matrixWorld);
      const frente = v.clone().normalize().dot(camPos.clone().sub(v).normalize());
      if (!visibleNombre || frente < 0.25) { r.el.style.opacity = '0'; continue; }
      const activo = r.id === this.seleccionado, visitado = this.visitados.has(r.id);
      const clave = `${activo}|${visitado}`;
      if (clave !== r.clave) {
        r.el.classList.toggle('visitado', visitado);
        r.el.classList.toggle('activo', activo);
        r.clave = clave;
        r.w = r.el.offsetWidth;
        r.h = r.el.offsetHeight;
      }
      v.project(this.camara);
      candidatos.push({ r, x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, frente, activo });
    }
    // Si dos nombres se enciman, gana el país elegido y después el más grande
    candidatos.sort((a, b) => (b.activo - a.activo) || (b.r.area - a.r.area));
    const puestos = [];
    for (const c of candidatos) {
      // La caja del texto tiene aire arriba y abajo (interlineado): se usa un 70 % del alto
      const caja = { x0: c.x - c.r.w / 2, x1: c.x + c.r.w / 2, y0: c.y - c.r.h * 0.35, y1: c.y + c.r.h * 0.35 };
      const choca = puestos.some((o) => caja.x0 < o.x1 && caja.x1 > o.x0 && caja.y0 < o.y1 && caja.y1 > o.y0);
      if (choca) { c.r.el.style.opacity = '0'; continue; }
      puestos.push(caja);
      c.r.el.style.opacity = String(Math.min(1, (c.frente - 0.25) * 4));
      c.r.el.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px) translate(-50%, -50%)`;
    }
  }

  // ───────── Interacción ─────────
  #interaccion() {
    const punteros = new Map();
    let toque = null, pellizco = null;
    const c = this.canvas;
    const tocado = () => { this.ultimaInteraccion = performance.now(); this.sucio = true; };

    c.addEventListener('pointerdown', (e) => {
      try { c.setPointerCapture(e.pointerId); } catch { /* nada */ }
      punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      tocado();
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
      tocado();
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
      if (!punteros.delete(e.pointerId)) return;
      if (punteros.size < 2) pellizco = null;
      if (toque && !toque.movido && performance.now() - toque.t < 600 && e.type === 'pointerup') this.#tocar(e.clientX, e.clientY);
      toque = null;
    };
    c.addEventListener('pointerup', fin);
    c.addEventListener('pointercancel', fin);
    c.addEventListener('lostpointercapture', fin);
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      tocado();
      this.#fijarDistancia(this.distancia * (1 + Math.sign(e.deltaY) * 0.12));
    }, { passive: false });
    c.addEventListener('keydown', (e) => {
      const paso = 6;
      const mov = { ArrowLeft: [-paso, 0], ArrowRight: [paso, 0], ArrowUp: [0, paso], ArrowDown: [0, -paso] }[e.key];
      if (mov) {
        e.preventDefault();
        tocado();
        this.animacion = null;
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
    this.sucio = true;
  }

  acercar(factor) {
    this.ultimaInteraccion = performance.now();
    this.animacion = null;
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
    this.sucio = true;
  }

  /** Gira (y acerca) el globo hasta un punto con animación suave. */
  #irA(lon, lat, distancia) {
    const desde = { ...this.centro, d: this.distancia };
    const hasta = { lon, lat, d: distancia ?? this.distancia };
    const dLon = angulo(hasta.lon - desde.lon);
    if (reduceMovimiento() || !this.activo) {
      this.animacion = null;
      this.centro = { lon, lat };
      this.#fijarDistancia(hasta.d);
      return;
    }
    this.animacion = { t0: performance.now(), dur: 1100, desde, dLon, hasta };
  }

  // ───────── Ciclo de dibujo ─────────
  #cuadro = (t) => {
    this.raf = 0;
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
    } else if (this.autoGiro && this.autoGiroPermitido !== false && !this.seleccionado && !reduceMovimiento() && t - this.ultimaInteraccion > 4000) {
      this.centro.lon = angulo(this.centro.lon + 5 * dt); // gira despacito
      this.sucio = true;
    }

    // El país que late para mostrar la respuesta
    const late = [...this.resaltes.values()].includes('pulsa');
    if (late) this.sucio = true;

    const dibujar = this.sucio && this.distancia && !this.perdido;
    if (dibujar) {
      this.sucio = false;
      this.matResalte.opacity = late ? 0.65 + 0.35 * Math.sin(t / 160) : 1;
      this.grupo.rotation.set(this.centro.lat * RAD, -Math.PI / 2 - this.centro.lon * RAD, 0, 'XYZ');
      this.camara.position.set(0, 0, this.distancia);
      this.camara.lookAt(0, 0, 0);
      this.grupo.updateMatrixWorld();
      this.renderer.render(this.escena, this.camara);
      this.#ubicarRotulos();
    }
    this.#medirFps(t, dibujar);
    this.raf = requestAnimationFrame(this.#cuadro);
  };

  // Mide los cuadros dibujados seguidos. Si van a menos de 24 por segundo,
  // primero baja la resolución; si sigue lento, deja de girar solo y avisa.
  #medirFps(t, dibujado) {
    const m = this.medicion;
    if (!m || m.listo) return;
    if (dibujado && m.tPrev != null) { m.suma += t - m.tPrev; m.n += 1; }
    m.tPrev = dibujado ? t : null;
    if (m.n < 40) return;
    m.listo = true;
    const fps = (1000 * m.n) / m.suma;
    this.fps = fps;
    if (fps >= 24) return;
    if (this.pixeles > 1) {
      this.pixeles = 1;
      this.renderer.setPixelRatio(1);
      this.redimensionar();
      this.medicion = { suma: 0, n: 0, tPrev: null };
      return;
    }
    this.autoGiroPermitido = false;
    this.alLento(fps);
  }

  activar() {
    if (this.activo) { // ya está andando: solo se reacomoda
      this.redimensionar();
      return;
    }
    this.activo = true;
    this.cont.hidden = false;
    this.redimensionar();
    if (!this.medicion?.listo) this.medicion = { suma: 0, n: 0, tPrev: null };
    this.tAnterior = null;
    this.ultimaInteraccion = performance.now() - 3000;
    this.sucio = true;
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.#cuadro);
  }

  desactivar() {
    this.activo = false;
    this.animacion = null;
    this.cont.hidden = true;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  // ───────── Misma interfaz que el mapa 2D (la usan los modos de juego) ─────────
  sincronizar({ seleccionado, juego, visitados, opciones }) {
    this.juego = juego;
    this.visitados = new Set(visitados);
    this.opciones = { ...opciones };
    for (const t of Object.values(this.tResalte)) clearTimeout(t);
    this.resaltes.clear();
    this.seleccionar(seleccionado);
  }

  seleccionar(id, { zoom = true } = {}) {
    if (this.seleccionado && this.resaltes.get(this.seleccionado) === 'sel') this.resaltes.delete(this.seleccionado);
    for (const [k, v] of this.resaltes) if (v === 'pulsa') this.resaltes.delete(k);
    this.seleccionado = id ?? null;
    if (id) this.resaltes.set(id, 'sel');
    this.#dibujarResaltes();
    if (id && zoom) {
      const p = PAISES_POR_ID[id] ?? GUAYANA_FRANCESA;
      const grande = (AREAS.get(id) ?? 0) > 0.05; // Brasil, Argentina
      this.#irA(p.etiqueta.lon, p.etiqueta.lat, this.#distanciaBase() * (grande ? 0.66 : 0.5));
    }
  }

  animarAcierto(id) { this.#resaltar(id, 'bien', 900); }
  animarError(id) { this.#resaltar(id, 'error', 1000); }
  mostrarRespuesta(id) {
    if (this.seleccionado && this.seleccionado !== id && this.resaltes.get(this.seleccionado) === 'sel') this.resaltes.delete(this.seleccionado);
    this.seleccionado = id;
    this.#resaltar(id, 'pulsa');
    const p = PAISES_POR_ID[id];
    if (p) this.#irA(p.etiqueta.lon, p.etiqueta.lat);
  }
  setJuego(cfg) { this.juego = cfg; this.sucio = true; }
  setVisitados(lista) { this.visitados = new Set(lista); this.sucio = true; }
  setOpciones(o) { Object.assign(this.opciones, o); this.sucio = true; }
  resaltar() {}
  centrar() {
    this.ultimaInteraccion = performance.now();
    this.#irA(CENTRO_SA.lon, CENTRO_SA.lat, this.#distanciaBase());
  }
}
