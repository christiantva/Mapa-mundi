// Piezas compartidas por los modos de juego.
import { alAzar } from '../core/partida.js';
import { ICONOS } from '../ui/iconos.js';

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export const FELICITACIONES = ['¡Muy bien!', '¡Excelente!', '¡Lo lograste!', '¡Genial!', '¡Chévere!', '¡Qué bien lo haces!'];
export const felicitar = () => alAzar(FELICITACIONES);

export const formatoTiempo = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Temporizadores que se cancelan juntos al salir del modo. */
export function temporizadores() {
  const ids = new Set();
  return {
    despues(ms, f) {
      const id = setTimeout(() => { ids.delete(id); f(); }, ms);
      ids.add(id);
      return id;
    },
    limpiar() {
      ids.forEach(clearTimeout);
      ids.clear();
    },
  };
}

export function cabeceraModo(titulo, numero, total) {
  return `
    <header class="modo-cabecera">
      <h2 class="modo-titulo">${esc(titulo)}</h2>
      ${numero ? `<span class="modo-contador">${numero} de ${total}</span>` : ''}
    </header>`;
}

/** Tres círculos que muestran los intentos usados (con ✗, no solo color). */
export function intentosHTML(usados, max = 3) {
  let html = '<div class="intentos" aria-label="Intentos usados: ' + usados + ' de ' + max + '"><span>Intentos</span>';
  for (let i = 0; i < max; i++) {
    html += `<span class="intento${i < usados ? ' usado' : ''}">${i < usados ? ICONOS.equis : ''}</span>`;
  }
  return html + '</div>';
}

export function pistasHTML(pistas) {
  if (!pistas.length) return '';
  return `<ul class="pistas">${pistas.map((p) => `<li><span aria-hidden="true">${ICONOS.pista}</span>${esc(p)}</li>`).join('')}</ul>`;
}
