// Panel de la ficha del país. En escritorio es un panel lateral; en celular y
// tablet vertical es una hoja deslizable desde abajo (ver hoja.js).
import { PAISES_POR_ID, GUAYANA_FRANCESA, nombreDe, formatoMiles } from '../data/paises.js';
import { bandera } from './banderas.js';
import { ICONOS } from './iconos.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const lista = (items) => {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items.at(-1)}`;
};

const fila = (icono, etiqueta, valor) => `
  <div class="dato">
    <span class="dato-icono" aria-hidden="true">${ICONOS[icono]}</span>
    <div><dt>${etiqueta}</dt><dd>${valor}</dd></div>
  </div>`;

const tarjeta = (icono, titulo, item) => `
  <li class="cultura">
    <span class="dato-icono" aria-hidden="true">${ICONOS[icono]}</span>
    <div><span class="cultura-tipo">${titulo}</span><strong>${esc(item.nombre)}</strong><p>${esc(item.detalle)}</p></div>
  </li>`;

export function fichaBienvenida(visitados) {
  return `
    <div class="ficha ficha-bienvenida">
      <h2 class="ficha-nombre">Explora Sudamérica</h2>
      <p class="ficha-descripcion">Toca un país del mapa para abrir su ficha. Cada país que visites pone un sello en tu pasaporte.</p>
      <p class="ficha-progreso"><strong>${visitados}</strong> de 12 países visitados</p>
      <ul class="ayuda-gestos">
        <li><strong>Acercar:</strong> pellizca con dos dedos o usa la rueda del mouse.</li>
        <li><strong>Moverte:</strong> arrastra el mapa.</li>
        <li><strong>Volver:</strong> toca el botón verde de ubicación.</li>
      </ul>
    </div>`;
}

export function fichaPais(id, { recienSellado = false } = {}) {
  if (id === GUAYANA_FRANCESA.id) return fichaTerritorio();
  const p = PAISES_POR_ID[id];
  if (!p) return '';

  const capitales = p.capitales
    .map((c) => (c.rol ? `<strong>${esc(c.nombre)}</strong> <span class="rol">(${esc(c.rol)})</span>` : `<strong>${esc(c.nombre)}</strong>`))
    .join('<br>');
  const vecinos = p.limitrofes
    .map((v) => (PAISES_POR_ID[v]
      ? `<button type="button" class="chip" data-ir="${v}">${esc(nombreDe(v))}</button>`
      : `<span class="chip chip-fijo">${esc(nombreDe(v))}</span>`))
    .join('');
  const mar = p.oceanos.length
    ? `Océano ${lista(p.oceanos.map(esc))}`
    : '<strong>No tiene mar.</strong> Está rodeado de otros países.';

  return `
    <article class="ficha" aria-labelledby="ficha-titulo">
      <header class="ficha-cabecera">
        <div class="ficha-mini-bandera" aria-hidden="true">${bandera(p.id, '')}</div>
        <div class="ficha-titulos">
          <h2 class="ficha-nombre" id="ficha-titulo">${esc(p.nombre)}</h2>
          <p class="ficha-oficial">${esc(p.nombreOficial)}</p>
          <p class="ficha-capital-mini">Capital: ${p.capitales.map((c) => `<strong>${esc(c.nombre)}</strong>`).join(' y ')}</p>
        </div>
        <div class="sello-pasaporte${recienSellado ? ' recien' : ''}" title="Sello del pasaporte">
          <span>${ICONOS.sello}</span><small>Visitado</small>
        </div>
      </header>

      <div class="ficha-bandera">
        <div class="bandera-marco">${bandera(p.id, `Bandera de ${p.nombre}`)}</div>
        <button type="button" class="boton-lupa" data-accion="ampliar-bandera" aria-label="Ampliar la bandera de ${esc(p.nombre)}">${ICONOS.lupa}</button>
      </div>

      <p class="ficha-capital-corta"><span aria-hidden="true">${ICONOS.capital}</span> Capital: ${p.capitales.map((c) => `<strong>${esc(c.nombre)}</strong>`).join(' y ')}</p>

      <p class="ficha-descripcion">${esc(p.descripcion)}</p>

      ${p.notaCapital ? `<aside class="nota nota-capital"><span aria-hidden="true">${ICONOS.info}</span><p>${esc(p.notaCapital)}</p></aside>` : ''}

      <section class="ficha-seccion">
        <h3>Datos</h3>
        <dl class="datos">
          ${fila('capital', p.capitales.length > 1 ? 'Capitales' : 'Capital', capitales)}
          ${fila('personas', 'Población', `${esc(p.poblacion.texto)} de habitantes <span class="fuente">(${p.poblacion.anio})</span>`)}
          ${fila('superficie', 'Superficie', `${formatoMiles(p.superficie)} km²`)}
          ${fila('idioma', p.idiomas.length > 1 ? 'Idiomas oficiales' : 'Idioma oficial', esc(lista(p.idiomas)))}
          ${fila('moneda', 'Moneda', esc(p.moneda))}
        </dl>
      </section>

      <section class="ficha-seccion">
        <h3>Vecinos y mar</h3>
        <p class="etiqueta-mini">Limita con:</p>
        <div class="chips">${vecinos}</div>
        <p class="ficha-mar"><span aria-hidden="true">${ICONOS.ola}</span> ${mar}</p>
      </section>

      <section class="ficha-seccion">
        <h3>Naturaleza</h3>
        <p class="etiqueta-mini">Regiones naturales:</p>
        <ul class="regiones">${p.regiones.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
        <p class="ficha-relieve"><span aria-hidden="true">${ICONOS.montana}</span> ${esc(p.relieve)}</p>
      </section>

      <section class="ficha-seccion">
        <h3>Cultura</h3>
        <ul class="culturas">
          ${tarjeta('plato', 'Plato típico', p.plato)}
          ${tarjeta('animal', 'Animal emblemático', p.animal)}
          ${tarjeta('lugar', 'Lugar famoso', p.lugar)}
          ${tarjeta('fiesta', 'Fiesta o tradición', p.fiesta)}
        </ul>
      </section>

      <aside class="dato-curioso">
        <span class="dato-icono" aria-hidden="true">${ICONOS.foco}</span>
        <div><strong>¿Sabías que…?</strong><p>${esc(p.datoCurioso)}</p></div>
      </aside>

      ${p.notaExtra ? `<aside class="nota"><span aria-hidden="true">${ICONOS.info}</span><p>${esc(p.notaExtra)}</p></aside>` : ''}
    </article>`;
}

function fichaTerritorio() {
  const g = GUAYANA_FRANCESA;
  return `
    <article class="ficha" aria-labelledby="ficha-titulo">
      <header class="ficha-cabecera">
        <div>
          <h2 class="ficha-nombre" id="ficha-titulo">${g.nombre}</h2>
          <p class="ficha-oficial">Territorio de Francia</p>
        </div>
      </header>
      <aside class="nota nota-importante"><span aria-hidden="true">${ICONOS.info}</span>
        <p><strong>¡Ojo!</strong> No es un país independiente. Por eso no cuenta entre los 12 países de Sudamérica.</p>
      </aside>
      <div class="ficha-bandera">
        <div class="bandera-marco">${bandera(g.id, 'Bandera de Francia')}</div>
        <button type="button" class="boton-lupa" data-accion="ampliar-bandera" aria-label="Ampliar la bandera">${ICONOS.lupa}</button>
      </div>
      <p class="ficha-descripcion">${g.descripcion}</p>
      <section class="ficha-seccion">
        <h3>Datos</h3>
        <dl class="datos">
          ${fila('capital', 'Ciudad principal', `<strong>${g.capitales[0].nombre}</strong>`)}
          ${fila('idioma', 'Idioma', 'francés')}
          ${fila('moneda', 'Moneda', 'euro')}
          ${fila('vecinos', 'Limita con', 'Brasil y Surinam')}
        </dl>
      </section>
    </article>`;
}

export function dialogoBandera(id) {
  const p = PAISES_POR_ID[id] ?? GUAYANA_FRANCESA;
  return `
    <div class="bandera-grande">${bandera(p.id, `Bandera de ${p.nombre}`)}</div>
    <h2>${esc(p.esTerritorio ? 'Bandera de Francia' : `Bandera de ${p.nombre}`)}</h2>
    <p>${esc(p.bandera.descripcion)}</p>`;
}
