// Estado global mínimo del juego con suscripción a cambios.
import { cargar, guardar } from './almacen.js';

const POR_DEFECTO = {
  visitados: [], // países con sello en el pasaporte
  ciclo: 'IV', // III (1.° y 2.°), IV (3.° y 4.°), V (5.° y 6.°)
  nivel: 'facil', // facil, medio, dificil
  records: {}, // mejores estrellas: { 'encuentra|IV|facil': 3 }
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
  records: guardado.records && typeof guardado.records === 'object' ? guardado.records : {},
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

/** Guarda las estrellas si superan el mejor resultado. Devuelve true si es récord. */
export function registrarEstrellas(clave, estrellas) {
  if ((estado.records[clave] ?? 0) >= estrellas) return false;
  actualizar({ records: { ...estado.records, [clave]: estrellas } });
  return true;
}

/** Borra todo el progreso guardado (modo docente). */
export function reiniciarTodo() {
  actualizar({ visitados: [], records: {}, ciclo: POR_DEFECTO.ciclo, nivel: POR_DEFECTO.nivel, ajustes: { ...POR_DEFECTO.ajustes } });
}
