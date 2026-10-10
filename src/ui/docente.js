// Modo docente: resultados de la sesión y reinicio del progreso.
import { nombreDe, PAISES_POR_ID } from '../data/paises.js';
import { CICLOS, NIVELES } from '../core/config.js';
import { esc, formatoTiempo } from '../modos/comun.js';

export function htmlDocente(partidas, { visitados }) {
  const conteo = {};
  for (const p of partidas) for (const id of p.dificiles) if (PAISES_POR_ID[id]) conteo[id] = (conteo[id] ?? 0) + 1;
  const dificiles = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
  const filas = partidas.map((p) => `
    <tr>
      <td>${p.hora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</td>
      <td>${esc(p.titulo)}</td>
      <td>${CICLOS[p.ciclo].nombre}<br><small>${NIVELES[p.nivel].nombre}</small></td>
      <td>${p.aciertos}/${p.total}</td>
      <td>${formatoTiempo(p.segundos)}</td>
      <td aria-label="${p.estrellas} estrellas">${'★'.repeat(p.estrellas)}</td>
    </tr>`).join('');
  return `
    <h2 id="titulo-docente">Modo docente</h2>
    <p>Resultados de esta sesión (se borran al cerrar la página). Sellos del pasaporte: <strong>${visitados.length}/12</strong>.</p>
    ${partidas.length ? `
      <div class="tabla-envoltura">
        <table class="tabla-docente">
          <thead><tr><th>Hora</th><th>Juego</th><th>Ciclo</th><th>Aciertos</th><th>Tiempo</th><th>Estrellas</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
      <h3 class="ajustes-grupo">Países que más costaron</h3>
      ${dificiles.length ? `<ul class="chips">${dificiles.map(([id, n]) => `<li class="chip chip-fijo">${esc(nombreDe(id))} · ${n} ${n === 1 ? 'partida' : 'partidas'}</li>`).join('')}</ul>` : '<p>Ninguno: ¡todo al primer intento!</p>'}`
    : '<p class="nota"><span>Todavía no se ha terminado ninguna partida en esta sesión.</span></p>'}
    <div class="docente-botones">
      <button type="button" class="boton boton-secundario" data-docente="copiar" ${partidas.length ? '' : 'disabled'}>Copiar resultados</button>
      <button type="button" class="boton boton-peligro" data-docente="reiniciar">Reiniciar todo el progreso</button>
      <button type="button" class="boton boton-primario" data-cerrar>Cerrar</button>
    </div>
    <p class="docente-confirmar" hidden>¿Seguro? Se borrarán los sellos, las estrellas y los ajustes de este equipo.
      <button type="button" class="boton boton-peligro" data-docente="confirmar">Sí, borrar todo</button>
      <button type="button" class="boton boton-secundario" data-docente="cancelar">No</button>
    </p>`;
}

export function textoDocente(partidas) {
  const lineas = ['Viajeros de Sudamérica — resultados de la sesión', ''];
  for (const p of partidas) {
    const dif = p.dificiles.filter((id) => PAISES_POR_ID[id]).map(nombreDe).join(', ') || '—';
    lineas.push(`${p.hora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} | ${p.titulo} | ${CICLOS[p.ciclo].nombre} ${NIVELES[p.nivel].nombre} | ${p.aciertos}/${p.total} | ${formatoTiempo(p.segundos)} | ${p.estrellas} estrellas | Costaron: ${dif}`);
  }
  return lineas.join('\n');
}
