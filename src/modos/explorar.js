// Modo 1: Explorar con fichas.
import { obtener, marcarVisitado, alCambiar } from '../core/estado.js';
import { fichaPais, fichaBienvenida, dialogoBandera } from '../ui/ficha.js';
import { PAISES_POR_ID } from '../data/paises.js';

export function iniciarExplorar({ mapa, hoja, contenido, app }) {
  let actual = null;
  const contadores = app.querySelectorAll('.js-sellos');
  const dlgBandera = app.querySelector('#dialogo-bandera');

  const pintarProgreso = () => {
    const { visitados } = obtener();
    contadores.forEach((c) => { c.textContent = visitados.length; });
    mapa.setVisitados(visitados);
    if (!actual) contenido.innerHTML = fichaBienvenida(visitados.length);
  };

  function seleccionar(id) {
    actual = id;
    const esPais = !!PAISES_POR_ID[id];
    const nuevo = esPais && marcarVisitado(id);
    contenido.innerHTML = fichaPais(id, { recienSellado: nuevo });
    contenido.scrollTop = 0;
    if (hoja.activa && hoja.estado !== 'abierto') hoja.poner('asomado');
    mapa.seleccionar(id);
  }

  mapa.alSeleccionar = (id) => seleccionar(id);

  contenido.addEventListener('click', (e) => {
    const ir = e.target.closest('[data-ir]')?.dataset.ir;
    if (ir) {
      if (hoja.activa) hoja.poner('asomado');
      seleccionar(ir);
      return;
    }
    if (e.target.closest('[data-accion="ampliar-bandera"]') && actual) {
      dlgBandera.querySelector('.dialogo-cuerpo').innerHTML = dialogoBandera(actual);
      dlgBandera.showModal();
    }
  });

  alCambiar(pintarProgreso);
  pintarProgreso();
}
