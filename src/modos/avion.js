// Modo 3: Avión viajero. Sale de Lima y en cada turno hay un país destino.
//  III ciclo: el niño elige el nombre del país marcado.
//  IV ciclo:  elige su capital.
//  V ciclo:   elige su capital y, al aterrizar, Kusi cuenta un dato cultural.
// Si acierta, el avión vuela con ruta punteada y gana un sello; si falla, da una vuelta.
import { PAISES, PAISES_POR_ID, aPais, dePais, elPais } from '../data/paises.js';
import { Partida, barajar } from '../core/partida.js';
import { marcarVisitado } from '../core/estado.js';
import { config, RUTA_AVION } from '../core/config.js';
import { Avion } from '../map/avion.js';
import { bandera } from '../ui/banderas.js';
import { cabeceraModo, intentosHTML, felicitar, temporizadores, esc } from './comun.js';
import { ICONOS } from '../ui/iconos.js';

const LIMA = [-77.03, -12.05];
const MAX_ERRORES = 3;
const ALTO_HOJA = 290; // la hoja del celular se asoma más para ver las opciones

export function crearAvion(ctx, { ids } = {}) {
  const { mapa, kusi, sfx, confeti, contenido, hoja } = ctx;
  const titulo = 'Avión viajero';
  const cfg = config();
  const porPais = cfg.ciclo === 'III'; // en III se pregunta el país, no la capital
  const t = temporizadores();
  let partida, avion, estado, opcionesActuales, descartadas;
  const llegados = new Set();
  const sellos = [];

  const pais = () => PAISES_POR_ID[partida.actual];
  const capitalDe = (p) => p.capitales[0];
  const respuestaDe = (p) => (porPais ? p.nombre : capitalDe(p).nombre);

  function armarOpciones(p) {
    // La Paz nunca sale como opción para no confundir con la capital de Bolivia
    const otras = barajar(PAISES.filter((x) => x.id !== p.id)).slice(0, cfg.opciones - 1);
    return barajar([p, ...otras]).map((x) => ({ pais: x.id, valor: respuestaDe(x) }));
  }

  function pintar(mensaje = '') {
    const p = pais();
    const correcta = respuestaDe(p);
    const botones = opcionesActuales.map((o) => {
      const mal = descartadas.has(o.valor);
      const bien = estado !== 'pregunta' && o.valor === correcta;
      const icono = mal ? ICONOS.equis : bien ? ICONOS.sello : porPais ? '' : ICONOS.capital;
      const mini = porPais && !mal && !bien ? `<span class="opcion-bandera" aria-hidden="true">${bandera(o.pais, '')}</span>` : '';
      return `<button type="button" class="opcion${mal ? ' opcion-mal' : ''}${bien ? ' opcion-bien' : ''}" data-opcion="${esc(o.valor)}" ${mal || estado !== 'pregunta' ? 'disabled' : ''}>
        ${icono ? `<span class="opcion-icono" aria-hidden="true">${icono}</span>` : mini}${esc(o.valor)}</button>`;
    }).join('');
    const vuelta = p.id === 'peru';
    const texto = porPais
      ? `${vuelta ? '¡Volvemos a casa! ' : ''}¿Qué país tiene el globo amarillo?`
      : `${vuelta ? '¡Volvemos a casa! ' : ''}¿Cuál es la capital ${vuelta ? 'del' : 'de'} <strong>${esc(p.nombre)}</strong>?`;
    contenido.innerHTML = `
      <div class="juego">
        ${cabeceraModo(titulo, partida.numero, partida.total)}
        <p class="pregunta">${texto}</p>
        <div class="opciones">${botones}</div>
        ${intentosHTML(partida.erroresDe(p.id), MAX_ERRORES)}
        ${mensaje ? `<p class="aviso"><span>${mensaje}</span></p>` : ''}
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
    if (porPais) {
      const intro = partida.numero === 1 ? '¡Súbete a mi avión! ' : '';
      kusi.decir(`${intro}¿Qué país es este?`, partida.numero === 1 ? 'saludo' : 'explicando', { fijo: true });
    } else if (p.id === 'peru') kusi.decir('¡Volvamos a casa! ¿Cuál es la capital del Perú?', 'explicando', { fijo: true });
    else if (partida.numero === 1) kusi.decir(`¡Súbete a mi avión! Salimos de Lima. Vamos ${aPais(p)}: elige su capital para despegar.`, 'saludo', { fijo: true });
    else kusi.decir(`¡Vamos ${aPais(p)}! ¿Cuál es su capital?`, 'explicando', { fijo: true });
    if (cfg.limite) ctx.reloj.cuentaRegresiva(cfg.limite, sinTiempo);
  }

  function sinTiempo() {
    if (estado !== 'pregunta') return;
    const p = pais();
    while (partida.erroresDe(p.id) < MAX_ERRORES) partida.error(p.id);
    sfx.error();
    estado = 'respuesta';
    const r = respuestaDe(p);
    pintar(porPais ? `Era <strong>${esc(elPais(p))}</strong>.` : `La capital ${esc(dePais(p))} es <strong>${esc(r)}</strong>.`);
    kusi.decir(`¡Se acabó el tiempo! ${porPais ? `Era ${elPais(p)}` : `La capital ${dePais(p)} es ${r}`}. ¡Vamos volando!`, 'explicando');
    t.despues(2200, () => volarA(p, false));
  }

  async function volarA(p, conSello) {
    ctx.reloj.detener();
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
      const extra = p.id === 'bolivia' && !porPais ? ' El gobierno trabaja en La Paz.' : '';
      const dato = cfg.ciclo === 'V' ? ` ${p.lugar.nombre}: ${p.lugar.detalle}` : '';
      kusi.decir(`¡Llegamos a ${cap.nombre}!${extra} Un sello más para tu pasaporte.${dato}`, 'celebrando');
      t.despues(cfg.ciclo === 'V' ? 3600 : 2000, siguiente);
    } else {
      kusi.decir(`Llegamos a ${cap.nombre}, la capital ${dePais(p)}.`, 'explicando');
      t.despues(2000, siguiente);
    }
  }

  // Sello que cae sobre la capital
  function sellar(cap) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'sello-mapa');
    g.innerHTML = '<g class="sello-mapa-in"><circle r="13"/><circle r="9.5" class="sello-mapa-aro"/><path d="M-5 0.5l3 3 7-7"/></g>';
    mapa.agregarRotulo(g, cap.lon, cap.lat, { capa: 'rotulos' });
    sellos.push(g);
  }

  function elegir(valor) {
    if (estado !== 'pregunta') return;
    const p = pais();
    const correcta = respuestaDe(p);
    if (valor === correcta) {
      ctx.reloj.detener();
      partida.acierto();
      sfx.acierto();
      confeti.lanzar({ cantidad: 50 });
      kusi.decir(porPais ? `${felicitar()} Es ${elPais(p)}. ¡Despegamos!` : `${felicitar()} ${correcta}. ¡Despegamos!`, 'celebrando');
      volarA(p, true);
      return;
    }
    const n = partida.error();
    descartadas.add(valor);
    sfx.error();
    avion.darVuelta();
    if (n >= MAX_ERRORES) {
      ctx.reloj.detener();
      estado = 'respuesta';
      pintar(porPais ? `Es <strong>${esc(elPais(p))}</strong>.` : `La capital ${esc(dePais(p))} es <strong>${esc(correcta)}</strong>.`);
      kusi.decir(porPais ? `Es ${elPais(p)}. ¡Vamos volando!` : `La capital ${dePais(p)} es ${correcta}. ¡Vamos volando!`, 'explicando');
      t.despues(2200, () => volarA(p, false));
      return;
    }
    const deQuien = opcionesActuales.find((o) => o.valor === valor)?.pais;
    let frase;
    if (porPais) {
      const pista = cfg.pistas === 'auto' || (cfg.pistas === 'pedir' && n >= 2) ? ` Pista: ${p.pistas[Math.min(n - 1, p.pistas.length - 1)]}` : ' ¡Intenta otra vez!';
      frase = `No es ${elPais(deQuien)}.${pista}`;
    } else if (n === 1 && cfg.pistas !== 'no') frase = `${valor} es la capital ${dePais(deQuien)}. ¡Demos una vuelta y probemos otra vez!`;
    else if (cfg.pistas !== 'no') frase = `Pista: la capital ${dePais(p)} empieza con la letra ${correcta[0]}.`;
    else frase = 'Esa no es. ¡Demos una vuelta e intenta otra vez!';
    kusi.decir(frase, 'pensando', { fijo: true });
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
    mapa.marcador(null);
    ctx.terminar('avion', titulo, partida.resumen(), (repetir) => crearAvion(ctx, { ids: repetir }));
  }

  function alClic(e) {
    const b = e.target.closest('[data-opcion]');
    if (b && !b.disabled) elegir(b.dataset.opcion);
  }

  const modo = {
    titulo,
    iniciar() {
      // Fácil y medio siguen una ruta fija; difícil va al azar. Siempre terminamos en Lima.
      const base = (ids ?? RUTA_AVION).filter((id) => id !== 'peru');
      const orden = cfg.aleatorio ? barajar(base) : RUTA_AVION.filter((id) => base.includes(id));
      if (!ids || ids.includes('peru')) orden.push('peru');
      partida = new Partida(orden, { barajada: false });
      llegados.clear();
      mapa.setVisitados([]);
      mapa.setJuego({ nombres: (id) => llegados.has(id) || (!porPais && cfg.nombres), capitales: false });
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
      ctx.reloj.detener();
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
