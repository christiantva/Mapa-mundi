// Kusi, la vicuña viajera: personaje guía dibujado en SVG por código.
// Estados: saludo, explicando, celebrando, pensando, durmiendo (y normal).
import { decir as hablar, soltar } from '../core/voz.js';
import { ICONOS } from './iconos.js';

const PIEL = '#C98B4F';
const PIEL_OSCURA = '#A86E39';
const CREMA = '#FBF3E4';
const PEZUNA = '#5A3A22';

export const SVG_KUSI = `
<svg class="kusi-svg" viewBox="0 0 200 222" aria-hidden="true" focusable="false">
  <ellipse class="k-sombra" cx="112" cy="213" rx="60" ry="7" fill="rgba(35,48,42,.18)"/>
  <g class="k-todo">
    <g class="k-patas" stroke-linecap="round" fill="none">
      <path d="M142 168 L146 206" stroke="${PIEL_OSCURA}" stroke-width="10"/>
      <path d="M104 172 L100 206" stroke="${PIEL_OSCURA}" stroke-width="10"/>
      <path d="M156 166 L160 208" stroke="${PIEL}" stroke-width="11"/>
      <path d="M116 172 L114 208" stroke="${PIEL}" stroke-width="11"/>
      <g fill="${PEZUNA}" stroke="none">
        <rect x="140" y="203" width="12" height="7" rx="3"/><rect x="94" y="203" width="12" height="7" rx="3"/>
        <rect x="154" y="205" width="13" height="7" rx="3"/><rect x="108" y="205" width="13" height="7" rx="3"/>
      </g>
    </g>
    <path class="k-cola" d="M166 138 C182 128 186 146 176 154 C170 156 166 150 166 146Z" fill="${CREMA}"/>
    <ellipse cx="128" cy="146" rx="48" ry="30" fill="${PIEL}"/>
    <path d="M90 156 C112 178 150 176 172 158 C168 174 146 182 124 181 C104 180 92 170 90 156Z" fill="${CREMA}"/>
    <g class="k-mochila">
      <path d="M128 118 C116 132 112 150 116 166" stroke="#2F6AA6" stroke-width="5" fill="none" stroke-linecap="round"/>
      <rect x="124" y="104" width="46" height="48" rx="13" fill="#3F7FBF"/>
      <rect x="124" y="104" width="46" height="19" rx="9" fill="#2F6AA6"/>
      <rect x="134" y="130" width="26" height="15" rx="5" fill="#5B9BD9"/>
      <circle cx="147" cy="119" r="3.2" fill="#F2C230"/>
      <path d="M131 109 h32" stroke="#F2C230" stroke-width="2.5" stroke-dasharray="3 3"/>
    </g>
    <path d="M84 160 C74 132 70 106 72 80 L100 80 C100 106 106 126 118 146Z" fill="${PIEL}"/>
    <path d="M76 154 C70 132 68 112 72 92 C78 108 84 122 98 132 C92 142 86 150 76 154Z" fill="${CREMA}"/>
    <g class="k-cabeza">
      <path d="M62 40 C55 30 52 18 56 10 C63 17 68 28 68 37Z" fill="${PIEL}" stroke="${PIEL_OSCURA}" stroke-width="1.5"/>
      <path d="M94 37 C96 27 100 18 107 14 C109 23 104 33 99 39Z" fill="${PIEL}" stroke="${PIEL_OSCURA}" stroke-width="1.5"/>
      <ellipse cx="80" cy="64" rx="25" ry="22" fill="${PIEL}"/>
      <ellipse cx="64" cy="76" rx="16" ry="12" fill="#E9C9A0"/>
      <ellipse cx="55" cy="72" rx="2" ry="1.4" fill="${PEZUNA}"/><ellipse cx="62" cy="71" rx="2" ry="1.4" fill="${PEZUNA}"/>
      <path class="k-boca" d="M55 81 Q61 86 68 81" stroke="${PEZUNA}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <ellipse class="k-boca-abierta" cx="61" cy="83" rx="4.5" ry="3.6" fill="#7A2F2A"/>
      <circle cx="66" cy="68" r="4" fill="#F4A6A0" opacity=".75"/><circle cx="97" cy="68" r="4" fill="#F4A6A0" opacity=".75"/>
      <g class="k-ojos">
        <ellipse cx="72" cy="58" rx="6.5" ry="7.5" fill="#fff"/><ellipse cx="91" cy="58" rx="6.5" ry="7.5" fill="#fff"/>
        <g class="k-pupilas" fill="#23302A">
          <circle cx="71" cy="59" r="4.3"/><circle cx="90" cy="59" r="4.3"/>
          <circle cx="69.6" cy="57.2" r="1.5" fill="#fff"/><circle cx="88.6" cy="57.2" r="1.5" fill="#fff"/>
        </g>
      </g>
      <g class="k-ojos-cerrados" stroke="#23302A" stroke-width="2.4" fill="none" stroke-linecap="round">
        <path d="M66 59 Q72 64 78 59"/><path d="M85 59 Q91 64 97 59"/>
      </g>
      <g class="k-chullo">
        <path d="M54 50 C54 22 104 18 106 48Z" fill="#D9473C"/>
        <path d="M58 32 C70 25 94 24 102 31 L104 37 C92 31 70 31 56 39Z" fill="#5BA829"/>
        <path d="M54.5 45 C70 38 92 37 105.5 43 L106 50 C92 44 70 45 54 52Z" fill="#F2C230"/>
        <path d="M58 48 l4 -5 l4 5 l4 -5 l4 5 l4 -5 l4 5 l4 -5 l4 5 l4 -5 l4 5 l4 -5" stroke="#D9473C" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
        <path d="M54 50 C50 62 52 72 58 76 L64 54Z" fill="#D9473C"/>
        <path d="M106 48 C110 60 108 70 102 74 L98 52Z" fill="#D9473C"/>
        <path d="M58 76 v12 M102 74 v12" stroke="#F2C230" stroke-width="2.4"/>
        <circle cx="58" cy="90" r="3.6" fill="#5BA829"/><circle cx="102" cy="88" r="3.6" fill="#5BA829"/>
        <path d="M80 21 C80 14 86 10 92 12" stroke="#D9473C" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="94" cy="11" r="6.5" fill="#F2C230"/>
      </g>
    </g>
    <g class="k-brazo">
      <path d="M96 156 C86 150 72 140 60 128" stroke="${PIEL}" stroke-width="11" stroke-linecap="round" fill="none"/>
      <g class="k-mapita" transform="translate(30 100) rotate(-12)">
        <rect width="34" height="26" rx="2.5" fill="#FBF8EF" stroke="#8A7A5A" stroke-width="1.6"/>
        <path d="M11.3 0v26M22.6 0v26" stroke="#D6CDB5" stroke-width="1.4"/>
        <path d="M5 18 C9 10 14 15 18 12 C22 9 25 15 30 7" stroke="#5BA829" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M8 22 l18 -12" stroke="#23302A" stroke-width="1.2" stroke-dasharray="1.5 2.5"/>
        <circle cx="26" cy="9" r="2.4" fill="#D9473C"/>
      </g>
      <ellipse cx="58" cy="127" rx="6" ry="4.5" fill="${PEZUNA}"/>
    </g>
  </g>
  <g class="k-zzz" fill="#3C6488" font-weight="900" font-family="Nunito, sans-serif">
    <text x="112" y="40" font-size="16">z</text><text x="124" y="26" font-size="20">z</text><text x="138" y="10" font-size="24">Z</text>
  </g>
  <g class="k-piensa">
    <circle cx="116" cy="44" r="4" fill="#fff" stroke="#23302A" stroke-width="1.5"/>
    <circle cx="126" cy="30" r="6" fill="#fff" stroke="#23302A" stroke-width="1.5"/>
    <circle cx="146" cy="14" r="12" fill="#fff" stroke="#23302A" stroke-width="1.8"/>
    <text x="146" y="20" text-anchor="middle" font-size="17" font-weight="900" fill="#23302A" font-family="Nunito, sans-serif">?</text>
  </g>
</svg>`;

const ESTADOS = ['saludo', 'explicando', 'celebrando', 'pensando', 'durmiendo', 'normal'];
const INACTIVIDAD_MS = 30000;

export class Kusi {
  constructor(contenedor) {
    this.el = document.createElement('div');
    this.el.className = 'kusi';
    this.el.innerHTML = `
      <div class="kusi-globo" role="status" aria-live="polite" hidden>
        <p class="kusi-texto"></p>
        <button type="button" class="boton boton-primario kusi-accion" hidden></button>
        <button type="button" class="kusi-escuchar" aria-label="Escuchar a Kusi">${ICONOS.parlante}</button>
      </div>
      <button type="button" class="kusi-boton" aria-label="Kusi, tu guía. Toca para repetir lo que dijo.">${SVG_KUSI}</button>`;
    contenedor.append(this.el);
    this.globo = this.el.querySelector('.kusi-globo');
    this.texto = this.el.querySelector('.kusi-texto');
    this.ultimo = '';
    this.estado('normal');

    this.el.querySelector('.kusi-boton').addEventListener('click', () => {
      if (this.actual === 'durmiendo') this.despertar();
      else if (this.ultimo) this.decir(this.ultimo, 'explicando', { ya: true });
    });
    // El niño pide escuchar: se lee aunque la voz esté apagada, desde el principio
    this.el.querySelector('.kusi-escuchar').addEventListener('click', () => hablar(this.ultimo, { forzar: true, ya: true }));

    // Se duerme si no hay actividad durante 30 s
    this.actividad = performance.now();
    const despierta = () => {
      this.actividad = performance.now();
      if (this.actual === 'durmiendo') this.despertar();
    };
    window.addEventListener('pointerdown', despierta, true);
    window.addEventListener('keydown', despierta, true);
    setInterval(() => {
      if (this.actual !== 'durmiendo' && performance.now() - this.actividad > INACTIVIDAD_MS && !document.hidden) {
        this.ocultarGlobo();
        this.estado('durmiendo');
      }
    }, 2000);
  }

  estado(nombre) {
    this.actual = nombre;
    for (const e of ESTADOS) this.el.classList.toggle(`kusi--${e}`, e === nombre);
    // Reinicia la animación aunque el estado se repita
    const svg = this.el.querySelector('.kusi-svg');
    svg.style.animation = 'none';
    void svg.offsetWidth;
    svg.style.animation = '';
  }

  /** Muestra un mensaje en el globo, lo lee si la voz está activa y anima a Kusi. */
  decir(texto, estado = 'explicando', { fijo = false, accion = null, ya = false } = {}) {
    this.ultimo = texto;
    this.texto.textContent = texto;
    const b = this.el.querySelector('.kusi-accion');
    b.hidden = !accion;
    if (accion) {
      b.textContent = accion.texto;
      b.onclick = () => { b.hidden = true; this.ocultarGlobo(); accion.alHacer(); };
      fijo = true;
    }
    this.globo.hidden = false;
    this.globo.classList.remove('entra');
    void this.globo.offsetWidth;
    this.globo.classList.add('entra');
    this.estado(estado);
    hablar(texto, { ya });
    clearTimeout(this.tVolver);
    clearTimeout(this.tOcultar);
    const lectura = Math.max(2200, texto.split(/\s+/).length * 380);
    if (estado !== 'pensando' && estado !== 'durmiendo') {
      this.tVolver = setTimeout(() => { if (this.actual === estado) this.estado('normal'); }, Math.min(lectura, estado === 'celebrando' ? 1600 : 4000));
    }
    // En celular el globo tapa parte del mapa: siempre se esconde solo
    // (la pregunta sigue visible en la hoja de abajo).
    const movil = this.el.classList.contains('kusi-flotante');
    if (movil && !accion) this.tOcultar = setTimeout(() => this.ocultarGlobo(), Math.min(lectura + 1500, 6500));
    else if (!fijo) this.tOcultar = setTimeout(() => this.ocultarGlobo(), lectura + 4500);
  }

  ocultarGlobo() {
    this.globo.hidden = true;
  }

  despertar() {
    this.actividad = performance.now();
    this.decir('¡Uy, me quedé dormida! ¿Seguimos jugando?', 'saludo');
  }

  /** Esconde el globo y descarta lo que faltaba leer (la oración en curso termina). */
  callar() {
    soltar();
    this.ocultarGlobo();
  }
}
