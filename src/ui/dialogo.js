// <dialog> con respaldo para navegadores que aún no lo conocen (Safari < 15.4).
export function abrirDialogo(d) {
  if (typeof d.showModal === 'function') {
    if (!d.open) d.showModal();
  } else d.setAttribute('open', '');
}

export function cerrarDialogo(d) {
  if (typeof d.close === 'function') d.close();
  else d.removeAttribute('open');
}

/** ¿El toque cayó fuera del recuadro del diálogo (en el fondo oscuro)? */
export function toqueFuera(d, e) {
  if (e.target !== d) return false;
  const r = d.getBoundingClientRect();
  // Un clic hecho con el teclado llega con coordenadas 0,0: no cuenta como fuera
  if (!e.clientX && !e.clientY) return false;
  return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
}
