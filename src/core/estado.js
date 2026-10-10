// Estado global mínimo del juego con suscripción a cambios.
import { cargar, guardar } from './almacen.js';
import { PAISES_POR_ID } from '../data/paises.js';

const CICLOS_VALIDOS = ['III', 'IV', 'V'];
const NIVELES_VALIDOS = ['facil', 'medio', 'dificil'];
const objetoGuardado = () => {
  const g = cargar();
  return g && typeof g === 'object' ? g : {};
};

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

// Lo guardado puede venir de una versión anterior o estar dañado: solo se
// aceptan valores conocidos (si no, la pantalla de inicio no funcionaría).
function limpiar(g) {
  const objeto = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
  const ajustes = { ...POR_DEFECTO.ajustes };
  for (const [k, v] of Object.entries(objeto(g.ajustes))) if (k in ajustes && typeof v === 'boolean') ajustes[k] = v;
  const records = {};
  for (const [k, v] of Object.entries(objeto(g.records))) {
    const n = Math.round(Number(v));
    if (n >= 1) records[k] = Math.min(3, n);
  }
  return {
    ciclo: CICLOS_VALIDOS.includes(g.ciclo) ? g.ciclo : POR_DEFECTO.ciclo,
    nivel: NIVELES_VALIDOS.includes(g.nivel) ? g.nivel : POR_DEFECTO.nivel,
    visitados: Array.isArray(g.visitados) ? [...new Set(g.visitados)].filter((id) => PAISES_POR_ID[id]) : [],
    records,
    ajustes,
  };
}

const estado = limpiar(objetoGuardado());

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
