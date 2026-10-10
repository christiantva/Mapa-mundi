// Modo 3: Avión viajero. Sale de Lima; en cada turno el niño elige la capital
// del país destino. Si acierta, el avión vuela hasta allá y gana un sello.
import { PAISES, PAISES_POR_ID, aPais, dePais } from '../data/paises.js';
import { Partida, barajar } from '../core/partida.js';
import { marcarVisitado } from '../core/estado.js';
import { Avion } from '../map/avion.js';
import { cabeceraModo, intentosHTML, felicitar, temporizadores, esc } from './comun.js';
import { ICONOS } from '../ui/iconos.js';

const LIMA = [-77.03, -12.05];
const MAX_ERRORES = 3;
const ALTO_HOJA = 290; // la hoja del celular se asoma más para ver las opciones

// Capitales que pueden salir como opción (La Paz no, para no confundir con Bolivia)
const CAPITALES = PAISES.map((p) => ({ pais: p.id, nombre: p.capitales[0].nombre }));

export function crearAvion(ctx, { ids, opciones = 4 } = {}) {
  const { mapa, kusi, sfx, confeti, contenido, hoja } = ctx;
  const titulo = 'Avión viajero';
  const t = temporizadores();
  let partida, avion, estado, opcionesActuales, descartadas;
  const llegados = new Set();

  const pais = () => PAISES_POR_ID[partida.actual];
  const capitalDe = (p) => p.capitales[0];

  function armarOpciones(p) {
    const otras = barajar(CAPITALES.filter((c) => c.pais !== p.id)).slice(0, opciones - 1);
    return barajar([{ pais: p.id, nombre: capitalDe(p).nombre }, ...otras]);
  }

  function pintar(mensaje = '') {
    const p = pais();
    const correcta = capitalDe(p).nombre;
    const botones = opcionesActuales.map((o) => {
      const mal = descartadas.has(o.nombre);
      const bien = estado !== 'pregunta' && o.nombre === correcta;
      return `<button type="button" class="opcion${mal ? ' opcion-mal' : ''}${bien ? ' opcion-bien' : ''}" data-opcion="${esc(o.nombre)}" ${mal || estado !== 'pregunta' ? 'disabled' : ''}>
        <span class="opcion-icono" aria-hidden="true">${mal ? ICONOS.equis : bien ? ICONOS.sello : ICONOS.capital}</span>${esc(o.nombre)}</button>`;
    }).join('');
    const vuelta = p.id === 'peru';
    contenido.innerHTML = `
      <div class="juego">
        ${cabeceraModo(titulo, partida.numero, partida.total)}
        <p class="pregunta">${vuelta ? '¡Volvemos a casa! ' : ''}¿Cuál es la capital ${vuelta ? 'del' : 'de'} <strong>${esc(p.nombre)}</strong>?</p>
        <div class="opciones">${botones}</div>
        ${intentosHTML(partida.erroresDe(p.id), MAX_ERRORES)}
        ${mensaje ? `<p class="aviso">${mensaje}</p>` : ''}
      </div>`;
  }

  function preguntar() {
    estado = 'pregunta';
    descartadas = new Set();
    const p = pais();
    opcionesActuales = armarOpciones(p);
    mapa.seleccionar(p.id, { zoom: false });
    mapa.marcador(p.id);
    ctx.progreso.poner(llegados.size, partida.total, 'sellos');
    pintar();
    if (p.id === 'peru') kusi.decir('¡Volvamos a casa! ¿Cuál es la capital del Perú?', 'explicando', { fijo: true });
    else if (partida.numero === 1) kusi.decir(`¡Súbete a mi avión! Salimos de Lima. Vamos ${aPais(p)}: elige su capital para despegar.`, 'saludo', { fijo: true });
    else kusi.decir(`¡Vamos ${aPais(p)}! ¿Cuál es su capital?`, 'explicando', { fijo: true });
  }

  async function volarA(p, conSello) {
    estado = 'volando';
    mapa.marcador(null);
    pintar();
    const cap = capitalDe(p);
    const parar = sfx.avion(4);
    await avion.volar([cap.lon, cap.lat]);
    parar();
    if (!ctx.activo(modo)) return;
    if (conSello) {
      llegados.add(p.id);
      marcarVisitado(p.id);
      mapa.setVisitados([...llegados]);
      sfx.sello();
      sellar(cap);
      ctx.progreso.poner(llegados.size, partida.total, 'sellos');
      const extra = p.id === 'bolivia' ? ' El gobierno trabaja en La Paz.' : '';
      kusi.decir(`¡Llegamos a ${cap.nombre}!${extra} Un sello más para tu pasaporte.`, 'celebrando');
    } else {
      kusi.decir(`Llegamos a ${cap.nombre}, la capital ${dePais(p)}.`, 'explicando');
    }
    t.despues(2000, siguiente);
  }

  // Sello que cae sobre la capital
  function sellar(cap) {
    const NS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'sello-mapa');
    g.innerHTML = '<g class="sello-mapa-in"><circle r="13"/><circle r="9.5" class="sello-mapa-aro"/><path d="M-5 0.5l3 3 7-7"/></g>';
    mapa.agregarRotulo(g, cap.lon, cap.lat, { capa: 'rotulos' });
    sellos.push(g);
  }
  const sellos = [];

  function elegir(nombre) {
    if (estado !== 'pregunta') return;
    const p = pais();
    const cap = capitalDe(p).nombre;
    if (nombre === cap) {
      partida.acierto();
      sfx.acierto();
      confeti.lanzar({ cantidad: 50 });
      kusi.decir(`${felicitar()} ${cap}. ¡Despegamos!`, 'celebrando');
      volarA(p, true);
      return;
    }
    const n = partida.error();
    descartadas.add(nombre);
    sfx.error();
    avion.darVuelta();
    const deQuien = CAPITALES.find((c) => c.nombre === nombre);
    if (n >= MAX_ERRORES) {
      estado = 'respuesta';
      pintar(`La capital ${esc(dePais(p))} es <strong>${esc(cap)}</strong>.`);
      kusi.decir(`La capital ${dePais(p)} es ${cap}. ¡Vamos volando!`, 'explicando');
      t.despues(2200, () => volarA(p, false));
      return;
    }
    if (n === 1) kusi.decir(`${nombre} es la capital ${dePais(deQuien.pais)}. ¡Demos una vuelta y probemos otra vez!`, 'pensando', { fijo: true });
    else kusi.decir(`Pista: la capital ${dePais(p)} empieza con la letra ${cap[0]}.`, 'pensando', { fijo: true });
    pintar();
  }

  function siguiente() {
    t.limpiar();
    if (partida.siguiente()) preguntar();
    else terminar();
  }

  function terminar() {
    mapa.seleccionar(null);
    mapa.marcador(null);
    ctx.terminar(titulo, partida.resumen(), (repetir) => crearAvion(ctx, { ids: repetir, opciones }));
  }

  function alClic(e) {
    const b = e.target.closest('[data-opcion]');
    if (b && !b.disabled) elegir(b.dataset.opcion);
  }

  const modo = {
    titulo,
    iniciar() {
      // Destinos al azar y al final volvemos a Lima
      const lista = (ids ?? PAISES.map((p) => p.id)).filter((id) => id !== 'peru');
      const orden = [...barajar(lista), ...((ids ?? ['peru']).includes('peru') ? ['peru'] : [])];
      partida = new Partida(orden, { barajada: false });
      llegados.clear();
      mapa.setVisitados([]);
      mapa.setJuego({ nombres: () => true, capitales: false });
      mapa.alSeleccionar = () => {};
      hoja.fijarAsomado(ALTO_HOJA);
      if (hoja.activa) hoja.poner('asomado');
      mapa.centrar();
      avion = new Avion(mapa, LIMA);
      contenido.addEventListener('click', alClic);
      preguntar();
    },
    detener() {
      t.limpiar();
      contenido.removeEventListener('click', alClic);
      avion?.destruir();
      sellos.forEach((s) => mapa.quitarRotulo(s));
      sellos.length = 0;
      mapa.marcador(null);
      mapa.seleccionar(null);
      mapa.setJuego(null);
      hoja.fijarAsomado(null);
    },
  };
  return modo;
}
