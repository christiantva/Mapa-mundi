// Modo 1: Explorar con fichas.
import { obtener, marcarVisitado, alCambiar } from '../core/estado.js';
import { fichaPais, fichaBienvenida, dialogoBandera } from '../ui/ficha.js';
import { PAISES_POR_ID, GUAYANA_FRANCESA, aPais } from '../data/paises.js';
import { config } from '../core/config.js';
import { abrirDialogo } from '../ui/dialogo.js';

export function crearExplorar(ctx) {
  const { mapa, hoja, contenido, app, kusi, sfx, confeti } = ctx;
  const dlgBandera = app.querySelector('#dialogo-bandera');
  let actual = null;
  let quitarOyente = null;

  const pintarProgreso = () => {
    const { visitados } = obtener();
    ctx.progreso.poner(visitados.length, 12, 'visitados');
    mapa.setVisitados(visitados);
    if (!actual) contenido.innerHTML = fichaBienvenida(visitados.length);
  };

  function seleccionar(id) {
    actual = id;
    const p = PAISES_POR_ID[id];
    const nuevo = !!p && marcarVisitado(id);
    contenido.innerHTML = fichaPais(id, { recienSellado: nuevo, ciclo: config().ciclo });
    contenido.scrollTop = 0;
    if (hoja.activa && hoja.estado !== 'abierto') hoja.poner('asomado');
    mapa.seleccionar(id);
    sfx.pop();
    if (nuevo) setTimeout(() => sfx.sello(), 250);

    if (!p) {
      kusi.decir(`La ${GUAYANA_FRANCESA.nombre} no es un país: es un territorio de Francia.`, 'explicando');
    } else if (nuevo && obtener().visitados.length === 12) {
      sfx.victoria();
      confeti.lanzar({ cantidad: 160 });
      kusi.decir('¡Visitaste los 12 países de Sudamérica! Tu pasaporte está completo.', 'celebrando');
    } else {
      const capital = p.capitales.length > 1
        ? `Tiene dos ciudades principales: ${p.capitales[0].nombre} y ${p.capitales[1].nombre}.`
        : `Su capital es ${p.capitales[0].nombre}.`;
      kusi.decir(`¡Llegamos ${aPais(p)}! ${capital}`, nuevo ? 'celebrando' : 'explicando');
    }
  }

  function alClic(e) {
    const ir = e.target.closest('[data-ir]')?.dataset.ir;
    if (ir) {
      if (hoja.activa) hoja.poner('asomado');
      seleccionar(ir);
      return;
    }
    if (e.target.closest('[data-accion="ampliar-bandera"]') && actual) {
      dlgBandera.querySelector('.dialogo-cuerpo').innerHTML = dialogoBandera(actual);
      abrirDialogo(dlgBandera);
    }
  }

  return {
    permite3D: true,
    titulo: 'Explorar con fichas',
    iniciar() {
      actual = null;
      mapa.setJuego(null);
      mapa.seleccionar(null);
      mapa.alSeleccionar = seleccionar;
      contenido.addEventListener('click', alClic);
      quitarOyente = alCambiar(pintarProgreso);
      pintarProgreso();
      kusi.decir('¡Hola! Soy Kusi. Toca un país del mapa para conocerlo y ganar su sello.', 'saludo');
    },
    detener() {
      contenido.removeEventListener('click', alClic);
      quitarOyente?.();
      mapa.seleccionar(null);
    },
  };
}
