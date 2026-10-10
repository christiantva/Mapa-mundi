// Modo 2: Encuentra el país. Kusi hace una pregunta y el niño toca el país.
import { PAISES_POR_ID, GUAYANA_FRANCESA, elPais } from '../data/paises.js';
import { Partida, barajar } from '../core/partida.js';
import { config, ORDEN_GEOGRAFICO } from '../core/config.js';
import { crearPreguntas } from './preguntas.js';
import { cabeceraModo, intentosHTML, pistasHTML, felicitar, temporizadores, esc } from './comun.js';
import { ICONOS } from '../ui/iconos.js';

const MAX_ERRORES = 3;

export function crearEncuentra(ctx, { ids } = {}) {
  const { mapa, kusi, sfx, confeti, contenido, hoja } = ctx;
  const titulo = 'Encuentra el país';
  const cfg = config();
  const t = temporizadores();
  let partida, preguntas, pistas, estado; // estado: 'pregunta' | 'bien' | 'respuesta'
  let hallados; // para el reto de varios países
  const encontrados = new Set();

  const pregunta = () => preguntas[partida.i];
  const claveError = (q) => q.objetivo ?? q.clave;

  function pintar(extra = '') {
    const q = pregunta();
    let pie = '';
    if (estado === 'pregunta') {
      if (cfg.pistas !== 'no') {
        pie = `<button type="button" class="boton boton-secundario" data-accion="pista" ${pistas.length >= q.pistas.length ? 'disabled' : ''}>${ICONOS.pista} Dame una pista</button>`;
      }
    } else if (estado === 'bien') {
      pie = `<p class="aviso aviso-bien">${ICONOS.sello}<span>¡Muy bien!</span></p>`;
    } else {
      pie = `<p class="aviso aviso-respuesta">${ICONOS.info}<span>${extra}</span></p>
        <button type="button" class="boton boton-primario" data-accion="siguiente">Siguiente</button>`;
    }
    const progresoReto = q.necesarios > 1 ? `<p class="juego-quedan"><strong>${hallados.size}</strong> de ${q.necesarios} encontrados</p>` : '';
    contenido.innerHTML = `
      <div class="juego">
        ${cabeceraModo(titulo, partida.numero, partida.total)}
        <p class="pregunta">${q.texto}</p>
        ${progresoReto}
        ${intentosHTML(partida.erroresDe(claveError(q)), MAX_ERRORES)}
        ${pistasHTML(pistas)}
        <div class="juego-pie">${pie}</div>
      </div>`;
  }

  function preguntar() {
    estado = 'pregunta';
    pistas = [];
    hallados = new Set();
    mapa.seleccionar(null);
    mapa.centrar();
    ctx.progreso.poner(partida.resueltos.length, partida.total, 'aciertos');
    pintar();
    const q = pregunta();
    const intro = partida.numero === 1 ? (cfg.ciclo === 'III' ? '¡Toca el país! ' : 'Yo te pregunto y tú tocas el país en el mapa. ') : '';
    kusi.decir(`${intro}${q.voz}`, 'explicando', { fijo: true });
    if (cfg.limite) ctx.reloj.cuentaRegresiva(cfg.limite * (q.necesarios > 1 ? 3 : 1), sinTiempo);
  }

  function sinTiempo() {
    if (estado !== 'pregunta') return;
    const q = pregunta();
    while (partida.erroresDe(claveError(q)) < MAX_ERRORES) partida.error(claveError(q));
    sfx.error();
    mostrarRespuesta(q, '¡Se acabó el tiempo!');
  }

  function mostrarRespuesta(q, inicio) {
    estado = 'respuesta';
    ctx.reloj.detener();
    if (q.objetivo) {
      const p = PAISES_POR_ID[q.objetivo];
      mapa.mostrarRespuesta(p.id);
      kusi.decir(`${inicio} Mira: es ${elPais(p)}. ¡La próxima vez lo encuentras!`, 'explicando', { fijo: true });
      pintar(`Es <strong>${esc(elPais(p))}</strong>: late en el mapa.`);
    } else {
      const faltan = q.acepta.filter((id) => !hallados.has(id));
      faltan.forEach((id, i) => t.despues(i * 450, () => mapa.animarAcierto(id)));
      const nombres = faltan.map((id) => elPais(id)).join(', ');
      kusi.decir(`${inicio} Faltaban: ${nombres}.`, 'explicando', { fijo: true });
      pintar(`Faltaban: <strong>${esc(nombres)}</strong>.`);
    }
    t.despues(cfg.limite ? 4000 : 6000, siguiente);
  }

  function tocar(id) {
    if (estado !== 'pregunta') return;
    sfx.pop();
    const q = pregunta();
    const clave = claveError(q);

    if (q.acepta.includes(id) && !hallados.has(id)) {
      hallados.add(id);
      encontrados.add(id);
      mapa.setVisitados([...encontrados]);
      mapa.animarAcierto(id);
      sfx.acierto();
      const pt = mapa.aPantalla(...mapa.puntoDe(id));
      confeti.lanzar({ x: pt?.[0], y: pt?.[1], cantidad: 70 });
      if (hallados.size < q.necesarios) {
        kusi.decir(`¡Sí! ${elPais(id)} es vecino del Perú. Faltan ${q.necesarios - hallados.size}.`, 'celebrando', { fijo: true });
        pintar();
        return;
      }
      estado = 'bien';
      ctx.reloj.detener();
      partida.acierto(clave);
      ctx.progreso.poner(partida.resueltos.length, partida.total, 'aciertos');
      kusi.decir(q.necesarios > 1 ? '¡Encontraste a todos los vecinos del Perú!' : `${felicitar()} Es ${elPais(id)}.`, 'celebrando');
      pintar();
      t.despues(1900, siguiente);
      return;
    }

    if (hallados.has(id)) {
      kusi.decir(`Ya encontraste ${elPais(id)}. ¡Busca otro!`, 'explicando', { fijo: true });
      return;
    }

    const n = partida.error(clave);
    mapa.animarError(id);
    sfx.error();
    const tocado = id === GUAYANA_FRANCESA.id ? 'la Guayana Francesa, que es de Francia' : elPais(id);
    if (n >= MAX_ERRORES) {
      mostrarRespuesta(q, `Ese es ${tocado}.`);
      return;
    }
    const darPista = cfg.pistas === 'auto' || (cfg.pistas === 'pedir' && n >= 2);
    const pista = q.pistas[Math.min(n - 1, q.pistas.length - 1)];
    if (darPista && pista && !pistas.includes(pista)) pistas.push(pista);
    const motivo = q.necesarios > 1 ? `Ese es ${tocado}: no limita con el Perú.` : `Ese es ${tocado}.`;
    kusi.decir(darPista && pista ? `${motivo} Pista: ${pista}` : `${motivo} ¡Intenta otra vez!`, 'pensando', { fijo: true });
    pintar();
  }

  function siguiente() {
    t.limpiar();
    if (partida.siguiente()) preguntar();
    else terminar();
  }

  function terminar() {
    ctx.reloj.detener();
    mapa.seleccionar(null);
    ctx.terminar('encuentra', titulo, partida.resumen(), (repetir) => crearEncuentra(ctx, { ids: repetir }));
  }

  function alClic(e) {
    const a = e.target.closest('[data-accion]')?.dataset.accion;
    if (a === 'pista' && estado === 'pregunta') {
      const nueva = pregunta().pistas.find((x) => !pistas.includes(x));
      if (nueva) {
        pistas.push(nueva);
        kusi.decir(nueva, 'explicando', { fijo: true });
        pintar();
      }
    }
    if (a === 'siguiente' && estado === 'respuesta') siguiente();
  }

  return {
    titulo,
    permite3D: true,
    iniciar() {
      const base = ids ?? ORDEN_GEOGRAFICO;
      const lista = cfg.aleatorio ? barajar(base) : ORDEN_GEOGRAFICO.filter((id) => base.includes(id));
      preguntas = crearPreguntas(lista, cfg.ciclo, { reto: !ids });
      partida = new Partida(preguntas.map((q) => q.clave), { barajada: false });
      encontrados.clear();
      mapa.setVisitados([]);
      mapa.setJuego({ nombres: (id) => cfg.nombres || encontrados.has(id), capitales: false });
      mapa.alSeleccionar = tocar;
      contenido.addEventListener('click', alClic);
      if (hoja.activa) hoja.poner('asomado');
      preguntar();
    },
    detener() {
      t.limpiar();
      ctx.reloj.detener();
      contenido.removeEventListener('click', alClic);
      mapa.seleccionar(null);
      mapa.setJuego(null);
    },
  };
}
