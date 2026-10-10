// Pantalla de inicio: Kusi saluda y el niño elige a qué jugar.
import { SVG_KUSI } from './kusi.js';

const DIBUJOS = {
  explorar: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="8" width="44" height="50" rx="5" fill="#fff" stroke="#23302A" stroke-width="3"/><path d="M18 20h28M18 28h28M18 36h18" stroke="#5BA829" stroke-width="3.5" stroke-linecap="round"/><circle cx="44" cy="44" r="10" fill="#F2C230" stroke="#23302A" stroke-width="3"/><path d="M40 44.5l3 3 5-6" stroke="#23302A" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  encuentra: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="30" cy="30" r="24" fill="#BFD3E6" stroke="#23302A" stroke-width="3"/><path d="M24 14c6 2 12 4 14 10s-4 8-2 14-4 10-8 10-2-10-6-14-6-10 2-20z" fill="#A8DCC9" stroke="#23302A" stroke-width="2.5" stroke-linejoin="round"/><path d="M46 30c0-9 13-9 13 0 0 7-6.5 13-6.5 13S46 37 46 30z" fill="#F2C230" stroke="#23302A" stroke-width="2.5"/><text x="52.5" y="34" text-anchor="middle" font-size="11" font-weight="900" fill="#23302A">?</text></svg>`,
  avion: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 50 Q24 18 52 16" stroke="#23302A" stroke-width="3" fill="none" stroke-dasharray="1 6" stroke-linecap="round"/><g transform="translate(46 18) rotate(-20) scale(1.25)"><path d="M2 -3.5 L-6 -15 L-10 -15 L-6.5 -3.5Z M2 3.5 L-6 15 L-10 15 L-6.5 3.5Z" fill="#F2C230" stroke="#23302A" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 0 C14 -3 11 -3.5 8 -3.5 L-10 -2.5 L-13 -8 L-15.5 -8 L-14 -2 L-14 2 L-15.5 8 L-13 8 L-10 2.5 L8 3.5 C11 3.5 14 3 14 0Z" fill="#fff" stroke="#23302A" stroke-width="1.8" stroke-linejoin="round"/></g><circle cx="10" cy="50" r="5" fill="#D9473C" stroke="#23302A" stroke-width="2.5"/></svg>`,
  arrastra: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 8v50" stroke="#23302A" stroke-width="3.5" stroke-linecap="round"/><rect x="15" y="10" width="38" height="26" rx="2" fill="#fff" stroke="#23302A" stroke-width="3"/><rect x="15" y="10" width="12.7" height="26" fill="#D91023"/><rect x="40.3" y="10" width="12.7" height="26" fill="#D91023"/><rect x="15" y="10" width="38" height="26" rx="2" fill="none" stroke="#23302A" stroke-width="3"/><path d="M38 48l6 8 3-5 6-1z" fill="#F2C230" stroke="#23302A" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
};

export const MODOS_INFO = [
  { id: 'explorar', titulo: 'Explorar con fichas', texto: 'Toca los países y conoce sus datos.', color: 'verde' },
  { id: 'encuentra', titulo: 'Encuentra el país', texto: 'Kusi te dice un país y tú lo buscas.', color: 'azul' },
  { id: 'avion', titulo: 'Avión viajero', texto: 'Elige la capital correcta y vuela.', color: 'amarillo' },
  { id: 'arrastra', titulo: 'Arrastra la bandera', texto: 'Lleva cada bandera a su país.', color: 'rosado' },
];

export function htmlInicio() {
  return `
    <section class="inicio" aria-labelledby="inicio-titulo">
      <div class="inicio-contenido">
        <div class="inicio-kusi">
          <div class="inicio-globo"><p>¡Hola! Soy <strong>Kusi</strong>, una vicuña viajera. ¿Me acompañas a recorrer Sudamérica?</p></div>
          <div class="inicio-kusi-dibujo kusi--saludo">${SVG_KUSI}</div>
        </div>
        <div class="inicio-menu">
          <h2 id="inicio-titulo">¿A qué quieres jugar?</h2>
          <div class="tarjetas-modo">
            ${MODOS_INFO.map((m) => `
              <button type="button" class="tarjeta-modo tarjeta-${m.color}" data-modo="${m.id}">
                <span class="tarjeta-dibujo">${DIBUJOS[m.id]}</span>
                <span class="tarjeta-textos"><strong>${m.titulo}</strong><span>${m.texto}</span></span>
              </button>`).join('')}
          </div>
        </div>
      </div>
    </section>`;
}
