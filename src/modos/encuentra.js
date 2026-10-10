// Modo 2: Encuentra el país. Kusi pide un país y el niño lo toca en el mapa.
import { PAISES, PAISES_POR_ID, GUAYANA_FRANCESA, elPais } from '../data/paises.js';
import { Partida } from '../core/partida.js';
import { cabeceraModo, intentosHTML, pistasHTML, felicitar, temporizadores, esc } from './comun.js';
import { ICONOS } from '../ui/iconos.js';

const MAX_ERRORES = 3;

export function crearEncuentra(ctx, { ids } = {}) {
  const { mapa, kusi, sfx, confeti, contenido, hoja } = ctx;
  const titulo = 'Encuentra el país';
  const t = temporizadores();
  let partida, pistas, estado; // estado: 'pregunta' | 'bien' | 'respuesta'
  const encontrados = new Set();

  const pais = () => PAISES_POR_ID[partida.actual];

  function pintar() {
    const p = pais();
    const errores = partida.erroresDe(p.id);
    let pie = '';
    if (estado === 'pregunta') {
      pie = `<button type="button" class="boton boton-secundario" data-accion="pista" ${pistas.length >= p.pistas.length ? 'disabled' : ''}>${ICONOS.pista} Dame una pista</button>`;
    } else if (estado === 'bien') {
      pie = `<p class="aviso aviso-bien">${ICONOS.sello} ¡Encontraste ${esc(elPais(p))}!</p>`;
    } else {
      pie = `<p class="aviso aviso-respuesta">${ICONOS.info} ${esc(p.articulo ? `El ${p.nombre}` : p.nombre)} es el país que late en el mapa.</p>
        <button type="button" class="boton boton-primario" data-accion="siguiente">Siguiente país</button>`;
    }
    contenido.innerHTML = `
      <div class="juego">
        ${cabeceraModo(titulo, partida.numero, partida.total)}
        <p class="pregunta">¿Dónde está ${p.articulo ? `${p.articulo} ` : ''}<strong>${esc(p.nombre)}</strong>?</p>
        ${intentosHTML(errores, MAX_ERRORES)}
        ${pistasHTML(pistas)}
        <div class="juego-pie">${pie}</div>
      </div>`;
  }

  function preguntar() {
    estado = 'pregunta';
    pistas = [];
    mapa.seleccionar(null);
    mapa.centrar();
    ctx.progreso.poner(encontrados.size, partida.total, 'encontrados');
    pintar();
    const intro = partida.numero === 1 ? 'Yo te digo un país y tú lo tocas en el mapa. ' : '';
    kusi.decir(`${intro}¿Dónde está ${elPais(pais())}?`, 'explicando', { fijo: true });
  }

  function tocar(id) {
    if (estado !== 'pregunta') return;
    sfx.pop();
    const p = pais();
    if (id === p.id) {
      estado = 'bien';
      partida.acierto();
      encontrados.add(id);
      mapa.setVisitados([...encontrados]);
      mapa.animarAcierto(id);
      sfx.acierto();
      const pt = mapa.aPantalla(...mapa.puntoDe(id));
      confeti.lanzar({ x: pt?.[0], y: pt?.[1], cantidad: 70 });
      ctx.progreso.poner(encontrados.size, partida.total, 'encontrados');
      kusi.decir(`${felicitar()} Ese es ${elPais(p)}.`, 'celebrando');
      pintar();
      t.despues(1900, siguiente);
      return;
    }

    const n = partida.error();
    mapa.animarError(id);
    sfx.error();
    const tocado = id === GUAYANA_FRANCESA.id ? 'la Guayana Francesa, que es de Francia' : elPais(id);
    if (n >= MAX_ERRORES) {
      estado = 'respuesta';
      mapa.mostrarRespuesta(p.id);
      kusi.decir(`Ese es ${tocado}. Mira: ${elPais(p)} está aquí. ¡La próxima vez lo encuentras!`, 'explicando', { fijo: true });
      pintar();
      return;
    }
    const pista = p.pistas[Math.min(n - 1, p.pistas.length - 1)];
    if (!pistas.includes(pista)) pistas.push(pista);
    kusi.decir(`Ese es ${tocado}. Pista: ${pista}`, 'pensando', { fijo: true });
    pintar();
  }

  function siguiente() {
    t.limpiar();
    if (partida.siguiente()) preguntar();
    else terminar();
  }

  function terminar() {
    mapa.seleccionar(null);
    ctx.terminar(titulo, partida.resumen(), (repetir) => crearEncuentra(ctx, { ids: repetir }));
  }

  function alClic(e) {
    const a = e.target.closest('[data-accion]')?.dataset.accion;
    if (a === 'pista' && estado === 'pregunta') {
      const p = pais();
      const nueva = p.pistas.find((x) => !pistas.includes(x));
      if (nueva) {
        pistas.push(nueva);
        kusi.decir(nueva, 'explicando', { fijo: true });
        pintar();
      }
    }
    if (a === 'siguiente') siguiente();
  }

  return {
    titulo,
    iniciar() {
      partida = new Partida(ids ?? PAISES.map((p) => p.id));
      encontrados.clear();
      mapa.setVisitados([]);
      mapa.setJuego({ nombres: (id) => encontrados.has(id), capitales: false });
      mapa.alSeleccionar = tocar;
      contenido.addEventListener('click', alClic);
      if (hoja.activa) hoja.poner('asomado');
      preguntar();
    },
    detener() {
      t.limpiar();
      contenido.removeEventListener('click', alClic);
      mapa.seleccionar(null);
      mapa.setJuego(null);
    },
  };
}
