// Hoja deslizable desde abajo para celular y tablet vertical.
// Estados: "asomado" (se ve el encabezado de la ficha), "abierto" y "oculto".
import { reduceMovimiento } from '../core/estado.js';

// Celular vertical y tablet vertical. El celular horizontal (pantalla baja)
// usa el panel al costado: una hoja ahí taparía casi todo el mapa.
export const CONSULTA_HOJA = '(max-width: 719px) and (min-height: 521px), (orientation: portrait) and (max-width: 1024px)';
const ASOMADO = 150; // px visibles en estado asomado

export class Hoja {
  constructor(panel, asa, { alCambiar } = {}) {
    this.panel = panel;
    this.asa = asa;
    this.alCambiar = alCambiar ?? (() => {});
    this.mq = window.matchMedia(CONSULTA_HOJA);
    this.estado = 'asomado';
    this.asomado = ASOMADO;
    this.mq.addEventListener('change', () => this.#aplicar());
    this.#arrastre();
    this.#aplicar();
    // Si cambia el alto del panel (al girar el equipo), se reubica y avisa
    new ResizeObserver(() => {
      const antes = this.altoVisible();
      this.#aplicar(false);
      if (this.altoVisible() !== antes) this.alCambiar();
    }).observe(panel);
  }

  get activa() {
    return this.mq.matches;
  }

  /** Alto visible de la hoja (para que el mapa no quede tapado). */
  altoVisible() {
    if (!this.activa) return 0;
    if (this.estado === 'oculto') return 0;
    return this.estado === 'abierto' ? this.panel.offsetHeight : this.#altoAsomado();
  }

  // Nunca más de un 60 % del panel: en pantallas bajas el mapa debe seguir a la vista
  #altoAsomado() {
    const alto = this.panel.offsetHeight;
    return alto ? Math.min(this.asomado, Math.round(alto * 0.6)) : this.asomado;
  }

  /** Alto del estado asomado (null = valor por defecto). */
  fijarAsomado(px) {
    this.asomado = px ?? ASOMADO;
    this.#aplicar();
  }

  poner(estado) {
    this.estado = estado;
    this.#aplicar();
  }

  alternar() {
    this.poner(this.estado === 'abierto' ? 'asomado' : 'abierto');
  }

  #desplazamiento(estado = this.estado) {
    if (estado === 'oculto') return this.panel.offsetHeight + 20;
    return estado === 'abierto' ? 0 : Math.max(0, this.panel.offsetHeight - this.#altoAsomado());
  }

  #aplicar(avisar = true) {
    const p = this.panel;
    if (!this.activa) {
      p.style.transform = '';
      p.dataset.hoja = 'no';
      this.asa.hidden = true;
      if (avisar) this.alCambiar();
      return;
    }
    this.asa.hidden = false;
    p.dataset.hoja = this.estado;
    p.style.transform = `translateY(${this.#desplazamiento()}px)`;
    this.asa.setAttribute('aria-expanded', String(this.estado === 'abierto'));
    this.asa.setAttribute('aria-label', this.estado === 'abierto' ? 'Bajar la ficha' : 'Subir la ficha');
    if (this.estado !== 'abierto') p.querySelector('.panel-contenido')?.scrollTo?.({ top: 0 });
    if (avisar) this.alCambiar();
  }

  #arrastre() {
    let ini = null;
    const asa = this.asa;
    asa.addEventListener('pointerdown', (e) => {
      if (!this.activa) return;
      asa.setPointerCapture(e.pointerId);
      ini = { y: e.clientY, base: this.#desplazamiento(), t: performance.now(), movido: false };
      this.panel.classList.add('arrastrando');
    });
    asa.addEventListener('pointermove', (e) => {
      if (!ini) return;
      const dy = e.clientY - ini.y;
      if (Math.abs(dy) > 6) ini.movido = true;
      const max = this.#desplazamiento('asomado');
      const y = Math.min(max, Math.max(0, ini.base + dy));
      this.panel.style.transform = `translateY(${y}px)`;
    });
    const fin = (e) => {
      if (!ini) return;
      this.panel.classList.remove('arrastrando');
      const dy = e.clientY - ini.y;
      const vel = dy / Math.max(1, performance.now() - ini.t);
      if (!ini.movido) this.alternar();
      else if (vel < -0.4 || (dy < 0 && Math.abs(dy) > 60)) this.poner('abierto');
      else if (vel > 0.4 || dy > 60) this.poner('asomado');
      else this.#aplicar();
      ini = null;
    };
    asa.addEventListener('pointerup', fin);
    asa.addEventListener('pointercancel', fin);
    asa.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.alternar();
      }
    });
    if (reduceMovimiento()) this.panel.classList.add('sin-animacion');
  }
}
