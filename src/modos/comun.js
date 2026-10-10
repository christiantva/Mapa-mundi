// Piezas compartidas por los modos de juego.
import { nombreDe } from '../data/paises.js';
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

/** Resumen al terminar una partida (la Fase 3 lo convierte en pantalla final con estrellas). */
export function resumenHTML(titulo, r) {
  const dificiles = r.dificiles.map((id) => `<span class="chip chip-fijo">${esc(nombreDe(id))}</span>`).join('');
  return `
    <section class="resumen">
      <h2 class="ficha-nombre">¡Terminaste!</h2>
      <p class="resumen-modo">${esc(titulo)}</p>
      <dl class="resumen-datos">
        <div><dt>Aciertos al primer intento</dt><dd><strong>${r.aciertos}</strong> de ${r.total}</dd></div>
        <div><dt>Tiempo</dt><dd><strong>${formatoTiempo(r.segundos)}</strong></dd></div>
      </dl>
      ${r.dificiles.length ? `<p class="etiqueta-mini">Te costaron más:</p><div class="chips">${dificiles}</div>` : '<p class="resumen-perfecto">¡No te equivocaste ni una vez!</p>'}
      <div class="resumen-botones">
        ${r.dificiles.length ? '<button type="button" class="boton boton-primario" data-resumen="practicar">Practicar estos países</button>' : ''}
        <button type="button" class="boton ${r.dificiles.length ? 'boton-secundario' : 'boton-primario'}" data-resumen="otra">${ICONOS.repetir} Jugar otra vez</button>
        <button type="button" class="boton boton-secundario" data-resumen="inicio">${ICONOS.casa} Elegir otro juego</button>
      </div>
    </section>`;
}
