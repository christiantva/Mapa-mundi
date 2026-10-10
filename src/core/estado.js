// Estado global mínimo del juego con suscripción a cambios.
import { cargar, guardar } from './almacen.js';

const POR_DEFECTO = {
  visitados: [], // países con sello en el pasaporte
  ajustes: {
    efectos: true,
    musica: false,
    voz: false,
    nombres: true,
    capitales: true,
    ecuador: false,
    tropico: false,
  },
};

const guardado = cargar() ?? {};
const estado = {
  ...POR_DEFECTO,
  ...guardado,
  ajustes: { ...POR_DEFECTO.ajustes, ...(guardado.ajustes ?? {}) },
  visitados: Array.isArray(guardado.visitados) ? guardado.visitados : [],
};

const oyentes = new Set();

export const obtener = () => estado;

export function actualizar(cambios) {
  Object.assign(estado, cambios);
  guardar(estado);
  oyentes.forEach((f) => f(estado));
}

export function cambiarAjuste(clave, valor) {
  actualizar({ ajustes: { ...estado.ajustes, [clave]: valor } });
}

export function marcarVisitado(id) {
  if (estado.visitados.includes(id)) return false;
  actualizar({ visitados: [...estado.visitados, id] });
  return true;
}

export function alCambiar(f) {
  oyentes.add(f);
  return () => oyentes.delete(f);
}

export const reduceMovimiento = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
