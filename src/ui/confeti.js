// Confeti en un <canvas> con requestAnimationFrame. Respeta "reducir movimiento".
import { reduceMovimiento } from '../core/estado.js';

const COLORES = ['#5BA829', '#F2C230', '#D9473C', '#3F7FBF', '#F4B8C5', '#A8DCC9'];

export class Confeti {
  constructor(contenedor) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'confeti';
    this.canvas.setAttribute('aria-hidden', 'true');
    contenedor.append(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.particulas = [];
    this.corriendo = false;
  }

  /** Lanza confeti desde (x, y) en píxeles del contenedor (por defecto, arriba al centro). */
  lanzar({ x, y, cantidad = 90, fuerza = 1 } = {}) {
    if (reduceMovimiento()) return;
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (this.canvas.width !== Math.round(r.width * dpr)) {
      this.canvas.width = Math.round(r.width * dpr);
      this.canvas.height = Math.round(r.height * dpr);
    }
    this.dpr = dpr;
    const ox = x ?? r.width / 2, oy = y ?? r.height * 0.35;
    for (let i = 0; i < cantidad; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      const v = (5 + Math.random() * 7) * fuerza;
      this.particulas.push({
        x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        w: 6 + Math.random() * 6, h: 4 + Math.random() * 5,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.35,
        color: COLORES[i % COLORES.length], vida: 1,
      });
    }
    if (!this.corriendo) {
      this.corriendo = true;
      this.ultimo = performance.now();
      requestAnimationFrame((t) => this.#cuadro(t));
    }
  }

  #cuadro(t) {
    const dt = Math.min(3, (t - this.ultimo) / 16.7);
    this.ultimo = t;
    const { ctx, dpr } = this;
    const alto = this.canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const p of this.particulas) {
      p.vy += 0.28 * dt;
      p.vx *= 0.985;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.y > alto * 0.75) p.vida -= 0.03 * dt;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.vida);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 1.7)));
      ctx.restore();
    }
    this.particulas = this.particulas.filter((p) => p.vida > 0 && p.y < alto + 30);
    if (this.particulas.length) requestAnimationFrame((n) => this.#cuadro(n));
    else {
      this.corriendo = false;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
