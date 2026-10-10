// Pasaporte con 12 sellos (uno por país) y las mejores estrellas por juego.
import { PAISES, COLORES_ATLAS } from '../data/paises.js';
import { CICLOS, NIVELES } from '../core/config.js';
import { bandera } from './banderas.js';
import { esc } from '../modos/comun.js';

const JUEGOS = { encuentra: 'Encuentra el país', avion: 'Avión viajero', arrastra: 'Arrastra la bandera' };
// Giro fijo por país para que los sellos parezcan puestos a mano
const giro = (id) => ((id.charCodeAt(0) * 7 + id.length * 13) % 25) - 12;

export function htmlPasaporte({ visitados, records, ciclo, nivel }) {
  const sellos = PAISES.map((p) => {
    const ok = visitados.includes(p.id);
    return `
      <li class="sello${ok ? ' sello-ok' : ''}" style="--color:${COLORES_ATLAS[p.color]};--giro:${giro(p.id)}deg">
        <span class="sello-circulo">
          ${ok ? `<span class="sello-bandera">${bandera(p.id, '')}</span><span class="sello-nombre">${esc(p.nombre)}</span><span class="sello-capital">${esc(p.capitales[0].nombre)}</span>`
            : `<span class="sello-vacio" aria-hidden="true">?</span><span class="sello-falta">${esc(p.nombre)}</span>`}
        </span>
        <span class="visualmente-oculto">${esc(p.nombre)}: ${ok ? 'sello conseguido' : 'sin sello todavía'}</span>
      </li>`;
  }).join('');
  const filas = Object.entries(JUEGOS).map(([id, nombre]) => {
    const e = records[`${id}|${ciclo}|${nivel}`] ?? 0;
    return `<li><span>${nombre}</span><span class="mini-estrellas" aria-label="${e} de 3 estrellas">${'★'.repeat(e)}<span class="apagadas">${'★'.repeat(3 - e)}</span></span></li>`;
  }).join('');
  return `
    <div class="pasaporte-tapa">
      <h2 id="titulo-pasaporte">Mi pasaporte de Sudamérica</h2>
      <p><strong>${visitados.length}</strong> de 12 sellos. Visita países en <em>Explorar</em> o vuela con el <em>Avión viajero</em> para conseguir más.</p>
    </div>
    <ol class="sellos">${sellos}</ol>
    <h3 class="ajustes-grupo">Mis mejores estrellas (${CICLOS[ciclo].grados}, ${NIVELES[nivel].nombre.toLowerCase()})</h3>
    <ul class="records">${filas}</ul>`;
}
