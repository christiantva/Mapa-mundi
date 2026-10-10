// El avioncito viajero: vuela en curva con ruta punteada y da vueltas.
// Las rutas se guardan en lon/lat para redibujarlas si cambia el tamaño.
import { reduceMovimiento } from '../core/estado.js';

const NS = 'http://www.w3.org/2000/svg';
const facil = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export class Avion {
  constructor(mapa, inicio) {
    this.mapa = mapa;
    this.pos = inicio; // [lon, lat]
    this.angulo = -30;
    this.rutas = [];
    this.g = document.createElementNS(NS, 'g');
    this.g.setAttribute('class', 'avion');
    this.g.innerHTML = `
      <ellipse class="avion-sombra" cx="0" cy="0" rx="15" ry="6"/>
      <g class="avion-cuerpo">
        <path d="M2 -3.5 L-6 -21 L-11.5 -21 L-6.5 -3.5Z M2 3.5 L-6 21 L-11.5 21 L-6.5 3.5Z" fill="#F2C230" stroke="#23302A" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M19 0 C19 -3 15 -4.2 10 -4.2 L-13 -3 L-17 -10 L-20.5 -10 L-18 -2.6 L-18 2.6 L-20.5 10 L-17 10 L-13 3 L10 4.2 C15 4.2 19 3 19 0Z" fill="#fff" stroke="#23302A" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M13 -2 C15 -1.5 15 1.5 13 2" stroke="#3F7FBF" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M-8 -1 h12" stroke="#D9473C" stroke-width="2" stroke-linecap="round"/>
      </g>`;
    this.mapa.gSuperior.append(this.g);
    this.escala = 1;
    this.altura = 0;
    this.offsetPantalla = [0, 0];
    this.quitarZoom = () => this.mapa.alZoom.delete(this.#reubicar);
    this.mapa.alZoom.add(this.#reubicar);
    this.mapa.alRedimensionar.add(this.#redibujarRutas);
    this.#reubicar();
  }

  #reubicar = () => {
    if (this.volando) return;
    const xy = this.mapa.proyectar(...this.pos);
    if (xy) this.#pintar(xy, this.angulo);
  };

  #redibujarRutas = () => {
    for (const r of this.rutas) r.el.setAttribute('d', this.#tramo(r, 1));
    this.#reubicar();
  };

  #pintar([x, y], angulo) {
    const t = this.mapa.transform;
    const sx = t.applyX(x) + this.offsetPantalla[0], sy = t.applyY(y) + this.offsetPantalla[1];
    const s = this.escala;
    this.g.setAttribute('transform', `translate(${sx.toFixed(1)},${sy.toFixed(1)})`);
    this.g.firstElementChild.setAttribute('transform', `translate(${(4 + this.altura * 10).toFixed(1)},${(8 + this.altura * 16).toFixed(1)}) rotate(${angulo.toFixed(1)}) scale(${(s * (1 - this.altura * 0.25)).toFixed(3)})`);
    this.g.lastElementChild.setAttribute('transform', `translate(0,${(-this.altura * 6).toFixed(1)}) rotate(${angulo.toFixed(1)}) scale(${(s * (1 + this.altura * 0.3)).toFixed(3)})`);
  }

  // Curva cuadrática entre a y b en coordenadas del mapa sin zoom
  #curva(a, b) {
    const p0 = this.mapa.proyectar(...a), p2 = this.mapa.proyectar(...b);
    const mx = (p0[0] + p2[0]) / 2, my = (p0[1] + p2[1]) / 2;
    const dx = p2[0] - p0[0], dy = p2[1] - p0[1];
    const largo = Math.hypot(dx, dy) || 1;
    let nx = -dy / largo, ny = dx / largo;
    if (ny > 0) { nx = -nx; ny = -ny; } // que la curva se arquee hacia arriba
    const k = largo * 0.28;
    return { p0, p1: [mx + nx * k, my + ny * k], p2, largo };
  }

  #punto({ p0, p1, p2 }, t) {
    const u = 1 - t;
    return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
  }

  #tangente({ p0, p1, p2 }, t) {
    return [2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]), 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1])];
  }

  #tramo(ruta, hasta) {
    const c = this.#curva(ruta.a, ruta.b);
    const n = Math.max(2, Math.ceil(40 * hasta));
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push(this.#punto(c, (hasta * i) / n));
    return `M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}`;
  }

  /** Vuela hasta [lon, lat] dejando una ruta punteada. Devuelve una promesa. */
  volar(destino) {
    // Si está dando una vuelta (respuesta equivocada), primero la termina
    if (this.vuelta) return this.vuelta.then(() => this.volar(destino));
    const ruta = { a: this.pos, b: destino };
    const c = this.#curva(ruta.a, ruta.b);
    const duracion = Math.min(3200, Math.max(1500, c.largo * 5));
    const el = document.createElementNS(NS, 'path');
    el.setAttribute('class', 'ruta');
    this.mapa.gRutas.append(el);
    ruta.el = el;
    this.rutas.push(ruta);
    this.volando = true;

    return new Promise((resolver) => {
      const terminar = () => {
        this.volando = false;
        this.altura = 0;
        this.pos = destino;
        const tg = this.#tangente(c, 1);
        this.angulo = (Math.atan2(tg[1], tg[0]) * 180) / Math.PI;
        el.setAttribute('d', this.#tramo(ruta, 1));
        this.#reubicar();
        resolver(duracion);
      };
      if (reduceMovimiento()) { terminar(); return; }
      const t0 = performance.now();
      const cuadro = (ahora) => {
        if (this.destruido) { resolver(duracion); return; }
        const lineal = Math.min(1, (ahora - t0) / duracion);
        const t = facil(lineal);
        this.altura = Math.sin(lineal * Math.PI);
        const tg = this.#tangente(c, t);
        el.setAttribute('d', this.#tramo(ruta, t));
        this.#pintar(this.#punto(c, t), (Math.atan2(tg[1], tg[0]) * 180) / Math.PI);
        if (lineal < 1) requestAnimationFrame(cuadro);
        else terminar();
      };
      requestAnimationFrame(cuadro);
    }).then((d) => d);
  }

  /** Da una vuelta en el aire (cuando el niño se equivoca). */
  darVuelta() {
    if (this.vuelta) return this.vuelta; // ya está dando una
    const radio = 30, duracion = 1300;
    const xy = this.mapa.proyectar(...this.pos);
    this.vuelta = new Promise((resolver) => {
      if (reduceMovimiento()) { resolver(); return; }
      this.volando = true;
      const t0 = performance.now();
      const cuadro = (ahora) => {
        if (this.destruido) { resolver(); return; }
        const l = Math.min(1, (ahora - t0) / duracion);
        const th = Math.PI / 2 - facil(l) * Math.PI * 2; // empieza abajo y gira
        this.offsetPantalla = [radio * Math.cos(th), radio * Math.sin(th) - radio];
        this.altura = Math.sin(l * Math.PI) * 0.6;
        const ang = (th * 180) / Math.PI - 90;
        this.#pintar(xy, ang);
        if (l < 1) requestAnimationFrame(cuadro);
        else {
          this.offsetPantalla = [0, 0];
          this.altura = 0;
          this.volando = false;
          this.#reubicar();
          resolver();
        }
      };
      requestAnimationFrame(cuadro);
    }).finally(() => { this.vuelta = null; });
    return this.vuelta;
  }

  destruir() {
    this.destruido = true;
    this.quitarZoom();
    this.mapa.alRedimensionar.delete(this.#redibujarRutas);
    this.g.remove();
    this.rutas.forEach((r) => r.el.remove());
  }
}
