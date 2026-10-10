// Modo 4: Arrastra la bandera. Las banderas están en una bandeja; el niño las
// arrastra hasta su país. También se puede tocar una bandera y luego el país
// (o usar Tab + Enter con el teclado).
import { PAISES, PAISES_POR_ID, GUAYANA_FRANCESA, dePais } from '../data/paises.js';
import { Partida, barajar } from '../core/partida.js';
import { bandera } from '../ui/banderas.js';
import { cabeceraModo, felicitar, temporizadores, esc, reemplazarPanel } from './comun.js';
import { reduceMovimiento } from '../core/estado.js';
import { config } from '../core/config.js';

const NS = 'http://www.w3.org/2000/svg';
const MAX_ERRORES = 3;

export function crearArrastra(ctx, { ids } = {}) {
  const { mapa, kusi, sfx, confeti, contenido, hoja, zonaMapa } = ctx;
  const titulo = 'Arrastra la bandera';
  const cfg = config();
  const t = temporizadores();
  let partida, bandeja, elegida = null, arrastre = null;
  const colocadas = [];

  function pintarPanel(mensaje = '') {
    const quedan = partida.total - partida.resueltos.length;
    reemplazarPanel(contenido, `
      <div class="juego">
        ${cabeceraModo(titulo)}
        <p class="pregunta">Arrastra cada bandera hasta su país.</p>
        ${cfg.limite ? `<p class="juego-ayuda">Tienes ${cfg.limite} segundos para cada bandera.</p>` : ''}
        <p class="juego-ayuda">También puedes tocar una bandera y después tocar el país.</p>
        <p class="juego-quedan"><strong>${quedan}</strong> ${quedan === 1 ? 'bandera por colocar' : 'banderas por colocar'}</p>
        ${mensaje ? `<p class="aviso"><span>${mensaje}</span></p>` : ''}
      </div>`);
  }

  function crearBandeja(lista) {
    bandeja = document.createElement('div');
    bandeja.className = 'bandeja';
    bandeja.setAttribute('role', 'listbox');
    bandeja.setAttribute('aria-label', 'Bandeja de banderas');
    bandeja.innerHTML = lista.map((id, i) => `
      <button type="button" class="bandeja-item" data-bandera="${id}" role="option" aria-selected="false" aria-label="Bandera ${i + 1}">
        ${bandera(id, `Bandera ${i + 1}`)}
      </button>`).join('');
    zonaMapa.append(bandeja);
    bandeja.addEventListener('pointerdown', inicioArrastre);
    bandeja.addEventListener('keydown', (e) => {
      const item = e.target.closest('[data-bandera]');
      if (item && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        elegir(item);
      }
    });
    ctx.actualizarAbajo();
  }

  function elegir(item) {
    if (item?.disabled) item = null; // bandera que ya va camino a su país
    for (const b of bandeja.querySelectorAll('.bandeja-item')) {
      b.classList.toggle('elegida', b === item);
      b.setAttribute('aria-selected', String(b === item));
    }
    elegida = item?.dataset.bandera ?? null;
    if (elegida) {
      sfx.pop();
      kusi.decir('Ahora toca el país de esta bandera.', 'explicando');
    }
  }

  // ───── Arrastre con Pointer Events ─────
  function inicioArrastre(e) {
    const item = e.target.closest('.bandeja-item');
    if (!item || item.disabled || !e.isPrimary || arrastre) return;
    e.preventDefault();
    const r = item.getBoundingClientRect();
    arrastre = { item, id: item.dataset.bandera, x0: e.clientX, y0: e.clientY, movido: false, dx: e.clientX - r.left, dy: e.clientY - r.top, r };
    item.setPointerCapture(e.pointerId);
    item.addEventListener('pointermove', moverArrastre);
    item.addEventListener('pointerup', finArrastre);
    item.addEventListener('pointercancel', cancelarArrastre);
  }

  function crearFantasma() {
    const { item, r } = arrastre;
    const f = document.createElement('div');
    f.className = 'bandera-fantasma';
    f.innerHTML = item.innerHTML;
    f.style.width = `${r.width}px`;
    document.body.append(f);
    arrastre.fantasma = f;
    item.classList.add('arrastrando');
    sfx.pop();
  }

  function moverArrastre(e) {
    const a = arrastre;
    if (!a) return;
    if (!a.movido && Math.hypot(e.clientX - a.x0, e.clientY - a.y0) > 8) {
      a.movido = true;
      crearFantasma();
    }
    if (!a.movido) return;
    a.fantasma.style.transform = `translate(${e.clientX - a.dx}px, ${e.clientY - a.dy}px) rotate(-4deg) scale(1.08)`;
    const id = paisEn(e.clientX, e.clientY);
    if (id !== a.sobre) {
      a.sobre = id;
      mapa.resaltar(id);
    }
  }

  function paisEn(x, y) {
    const el = document.elementFromPoint(x, y)?.closest?.('[data-id]');
    return el && mapa.svg.contains(el) ? el.dataset.id : null;
  }

  function soltarListeners(item) {
    item.removeEventListener('pointermove', moverArrastre);
    item.removeEventListener('pointerup', finArrastre);
    item.removeEventListener('pointercancel', cancelarArrastre);
  }

  function finArrastre(e) {
    const a = arrastre;
    if (!a) return;
    soltarListeners(a.item);
    arrastre = null;
    mapa.resaltar(null);
    if (!a.movido) { elegir(a.item); return; }
    const destino = paisEn(e.clientX, e.clientY);
    if (destino) intentar(a.id, destino, a);
    else volverABandeja(a);
  }

  function cancelarArrastre() {
    const a = arrastre;
    if (!a) return;
    soltarListeners(a.item);
    arrastre = null;
    mapa.resaltar(null);
    if (a.movido) volverABandeja(a);
  }

  function volverABandeja(a) {
    const f = a.fantasma;
    const r = a.item.getBoundingClientRect();
    const fin = () => { f.remove(); a.item.classList.remove('arrastrando'); };
    if (reduceMovimiento()) { fin(); return; }
    f.animate([
      { transform: f.style.transform },
      { transform: `translate(${r.left}px, ${r.top}px) rotate(0) scale(1)` },
    ], { duration: 520, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'forwards' }).onfinish = fin;
  }

  // ───── Reglas ─────
  function intentar(idBandera, idPais, a = null) {
    const item = a?.item ?? bandeja.querySelector(`[data-bandera="${idBandera}"]`);
    if (idBandera === idPais) { colocar(idBandera, item, a?.fantasma); return; }

    const n = partida.error(idBandera);
    sfx.error();
    mapa.animarError(idPais);
    if (a) volverABandeja(a);
    const p = PAISES_POR_ID[idBandera];
    if (n >= MAX_ERRORES) {
      // La bandera queda bloqueada mientras Kusi la lleva a su lugar
      apartar(idBandera, item);
      kusi.decir(`Mira, esta es la bandera ${dePais(p)}. ¡La pongo en su lugar!`, 'explicando');
      t.despues(900, () => colocar(idBandera, item, null, false));
      return;
    }
    const noEs = `Esa no es la bandera ${idPais === GUAYANA_FRANCESA.id ? 'de la Guayana Francesa' : dePais(idPais)}.`;
    if (cfg.pistas === 'no') kusi.decir(`${noEs} ¡Intenta otra vez!`, 'pensando', { fijo: true });
    else if (n === 1 && cfg.pistas === 'auto') kusi.decir(`${noEs} Pista: ${p.pistas[0]}`, 'pensando', { fijo: true });
    else if (n === 1) kusi.decir(`${noEs} ¡Intenta otra vez!`, 'pensando', { fijo: true });
    else kusi.decir(`Es la bandera ${dePais(p)}. ¡Búscalo en el mapa!`, 'pensando', { fijo: true });
    pintarPanel(n === 2 && cfg.pistas !== 'no' ? `Esa bandera es ${p.articulo ? 'del' : 'de'} <strong>${esc(p.nombre)}</strong>.` : '');
  }

  // Saca una bandera del juego (ya no se puede elegir ni arrastrar)
  function apartar(id, item) {
    if (item) {
      item.disabled = true;
      item.classList.add('colocando');
    }
    if (elegida === id) elegir(null);
  }

  function colocar(id, item, fantasma, acerto = true) {
    // Cada bandera se coloca una sola vez (evita doble puntaje con toques rápidos)
    if (!bandeja || partida.resueltos.includes(id)) { fantasma?.remove(); return; }
    apartar(id, item);
    if (acerto) partida.acierto(id);
    else partida.resueltos.push(id);
    const [lon, lat] = mapa.puntoDe(id);
    const destino = mapa.aPantalla(lon, lat);
    const rz = zonaMapa.getBoundingClientRect();

    const poner = () => {
      fantasma?.remove();
      if (!bandeja) return; // se salió del juego durante la animación
      item?.remove();
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'bandera-pin');
      const svg = new DOMParser().parseFromString(bandera(id, ''), 'image/svg+xml').documentElement;
      const ancho = 44, alto = ancho / Number(svg.style.getPropertyValue('--r') || 1.5);
      svg.setAttribute('width', ancho);
      svg.setAttribute('height', alto);
      svg.setAttribute('x', -ancho / 2);
      svg.setAttribute('y', -alto - 22);
      g.innerHTML = `<g class="bandera-pin-in"><rect x="${-ancho / 2 - 3}" y="${-alto - 25}" width="${ancho + 6}" height="${alto + 6}" rx="4" fill="#fff" stroke="#23302A" stroke-width="1.5"/></g>`;
      g.firstChild.append(document.importNode(svg, true));
      mapa.agregarRotulo(g, lon, lat, { capa: 'rotulos' });
      colocadas.push(g);
      mapa.refrescarRotulos();
      mapa.animarAcierto(id);
      if (acerto) {
        sfx.acierto();
        confeti.lanzar({ x: destino?.[0], y: destino?.[1], cantidad: 50 });
        const p = PAISES_POR_ID[id];
        const extra = cfg.ciclo === 'IV' ? ` Su capital es ${p.capitales[0].nombre}.` : cfg.ciclo === 'V' ? ` ${p.bandera.descripcion}` : '';
        kusi.decir(`${felicitar()} Esa es la bandera ${dePais(id)}.${extra}`, 'celebrando');
      }
      ctx.progreso.poner(partida.resueltos.length, partida.total, 'banderas');
      pintarPanel();
      ctx.actualizarAbajo();
      if (partida.resueltos.length === partida.total) {
        ctx.reloj.detener();
        t.despues(1400, terminar);
      } else if (cfg.limite) ctx.reloj.cuentaRegresiva(cfg.limite, sinTiempo);
    };

    if (!fantasma || !destino || reduceMovimiento()) { poner(); return; }
    const x = rz.left + destino[0] - 25, y = rz.top + destino[1] - 50;
    fantasma.animate([
      { transform: fantasma.style.transform },
      { transform: `translate(${x}px, ${y}px) scale(0.5)` },
    ], { duration: 320, easing: 'ease-in', fill: 'forwards' }).onfinish = poner;
  }

  function tocarPais(id) {
    if (!elegida) {
      sfx.pop();
      kusi.decir('Primero elige una bandera de la bandeja.', 'explicando');
      return;
    }
    const item = bandeja?.querySelector(`[data-bandera="${elegida}"]`);
    const b = elegida;
    elegir(null);
    if (!item || item.disabled) {
      kusi.decir('Primero elige una bandera de la bandeja.', 'explicando');
      return;
    }
    if (b === id) colocar(b, item, null);
    else intentar(b, id);
  }

  // Se acabó el tiempo para esta bandera: Kusi la coloca y seguimos.
  function sinTiempo() {
    if (!bandeja) return;
    const item = (elegida && bandeja.querySelector(`[data-bandera="${elegida}"]:not([disabled])`)) || bandeja.querySelector('.bandeja-item:not([disabled])');
    if (!item) return;
    if (arrastre) cancelarArrastre();
    elegir(null);
    const id = item.dataset.bandera;
    while (partida.erroresDe(id) < MAX_ERRORES) partida.error(id);
    sfx.error();
    kusi.decir(`¡Se acabó el tiempo! Esta es la bandera ${dePais(id)}.`, 'explicando');
    colocar(id, item, null, false);
  }

  function terminar() {
    ctx.terminar('arrastra', titulo, partida.resumen(), (repetir) => crearArrastra(ctx, { ids: repetir }));
  }

  return {
    titulo,
    iniciar() {
      const lista = ids ?? PAISES.map((p) => p.id);
      partida = new Partida(lista);
      mapa.setVisitados([]);
      mapa.setJuego({ nombres: (id) => cfg.nombres || partida.resueltos.includes(id), capitales: false });
      mapa.alSeleccionar = tocarPais;
      mapa.seleccionar(null);
      crearBandeja(barajar(lista));
      hoja.poner('oculto');
      mapa.centrar();
      ctx.progreso.poner(0, partida.total, 'banderas');
      pintarPanel();
      kusi.decir(cfg.ciclo === 'III' ? '¡Lleva cada bandera a su país!' : 'Arrastra cada bandera hasta su país. ¡Tú puedes!', 'saludo');
      if (cfg.limite) ctx.reloj.cuentaRegresiva(cfg.limite, sinTiempo);
    },
    detener() {
      t.limpiar();
      ctx.reloj.detener();
      if (arrastre) cancelarArrastre();
      document.querySelectorAll('.bandera-fantasma').forEach((f) => f.remove());
      bandeja?.remove();
      bandeja = null;
      colocadas.forEach((g) => mapa.quitarRotulo(g));
      colocadas.length = 0;
      mapa.resaltar(null);
      mapa.setJuego(null);
      hoja.poner('asomado');
      ctx.actualizarAbajo();
    },
  };
}
