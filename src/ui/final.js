// Pantalla final de una partida: estrellas, resumen y qué practicar.
import { PAISES_POR_ID, nombreDe } from '../data/paises.js';
import { CICLOS, NIVELES } from '../core/config.js';
import { bandera } from './banderas.js';
import { SVG_KUSI } from './kusi.js';
import { ICONOS } from './iconos.js';
import { esc, formatoTiempo } from '../modos/comun.js';

const ESTRELLA = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 4l5.9 12.6 13.8 1.6-10.2 9.4 2.8 13.6L24 34.4 11.7 41.2l2.8-13.6L4.3 18.2l13.8-1.6z"/></svg>';

const FRASES = {
  3: '¡Increíble! Eres un gran viajero de Sudamérica.',
  2: '¡Muy bien! Con un poco más de práctica llegas a 3 estrellas.',
  1: '¡Buen intento! Practiquemos juntos los países que costaron más.',
};

export function htmlFinal({ titulo, resumen, estrellas, record, ciclo, nivel }) {
  const dificiles = resumen.dificiles.filter((id) => PAISES_POR_ID[id]);
  const estrellasHTML = [1, 2, 3].map((n) => `<span class="estrella${n <= estrellas ? ' ganada' : ''}" style="--i:${n}">${ESTRELLA}</span>`).join('');
  return `
    <div class="final-tarjeta" role="dialog" aria-modal="true" aria-labelledby="final-titulo">
      <div class="final-kusi kusi--celebrando">${SVG_KUSI}</div>
      <div class="final-cuerpo">
        <p class="final-modo">${esc(titulo)} · ${CICLOS[ciclo].grados} · ${NIVELES[nivel].nombre}</p>
        <h2 id="final-titulo">¡Terminaste!</h2>
        <div class="estrellas" role="img" aria-label="${estrellas} de 3 estrellas">${estrellasHTML}</div>
        ${record ? `<p class="final-record">${ICONOS.sello} ¡Nuevo récord en este juego!</p>` : ''}
        <p class="final-frase">${FRASES[estrellas]}</p>
        <dl class="resumen-datos">
          <div><dt>Aciertos al primer intento</dt><dd><strong>${resumen.aciertos}</strong> de ${resumen.total}</dd></div>
          <div><dt>Tiempo</dt><dd><strong>${formatoTiempo(resumen.segundos)}</strong></dd></div>
        </dl>
        ${dificiles.length ? `
          <p class="etiqueta-mini">Te costaron más:</p>
          <ul class="final-dificiles">${dificiles.map((id) => `<li><span class="mini-bandera">${bandera(id, '')}</span>${esc(nombreDe(id))}</li>`).join('')}</ul>`
        : '<p class="resumen-perfecto">¡No te equivocaste ni una vez!</p>'}
        <div class="final-botones">
          ${dificiles.length ? '<button type="button" class="boton boton-primario" data-final="practicar">Practicar estos países</button>' : ''}
          <button type="button" class="boton ${dificiles.length ? 'boton-secundario' : 'boton-primario'}" data-final="otra">${ICONOS.repetir} Jugar otra vez</button>
          <button type="button" class="boton boton-secundario" data-final="inicio">${ICONOS.casa} Elegir otro juego</button>
        </div>
      </div>
    </div>`;
}
