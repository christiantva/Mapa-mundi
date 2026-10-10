// Ciclo (qué se pregunta) y nivel (cómo se juega).
import { obtener } from './estado.js';

export const CICLOS = {
  III: { nombre: 'III ciclo', grados: '1.° y 2.° grado', texto: 'Países y banderas' },
  IV: { nombre: 'IV ciclo', grados: '3.° y 4.° grado', texto: 'Capitales y vecinos del Perú' },
  V: { nombre: 'V ciclo', grados: '5.° y 6.° grado', texto: 'Moneda, idioma, relieve y cultura' },
};

export const NIVELES = {
  facil: { nombre: 'Fácil', texto: 'Sin tiempo, con pistas y nombres en el mapa', limite: 0, opciones: 3, pistas: 'auto', nombres: true, aleatorio: false, umbral: 25 },
  medio: { nombre: 'Medio', texto: '30 segundos por pregunta, mapa sin nombres', limite: 30, opciones: 4, pistas: 'pedir', nombres: false, aleatorio: false, umbral: 18 },
  dificil: { nombre: 'Difícil', texto: '15 segundos, sin pistas, orden al azar', limite: 15, opciones: 4, pistas: 'no', nombres: false, aleatorio: true, umbral: 10 },
};

/** Configuración actual del juego. */
export function config() {
  const { ciclo, nivel } = obtener();
  return { ciclo, nivel, ...NIVELES[nivel] };
}

/**
 * Estrellas (1 a 3) según aciertos al primer intento y tiempo:
 *  - 3 si acierta al menos 9 de cada 10; 2 si acierta 6 de cada 10; si no, 1.
 *  - Se pierde una estrella (mínimo 1) si el promedio por pregunta pasa el
 *    umbral del nivel (25 s en fácil, 18 s en medio, 10 s en difícil).
 */
export function calcularEstrellas({ aciertos, total, segundos }, nivel) {
  const precision = total ? aciertos / total : 0;
  let e = precision >= 0.9 ? 3 : precision >= 0.6 ? 2 : 1;
  if (total && segundos / total > NIVELES[nivel].umbral) e = Math.max(1, e - 1);
  return e;
}

// Orden fijo de norte a sur (fácil y medio); en difícil se baraja.
export const ORDEN_GEOGRAFICO = ['colombia', 'venezuela', 'guyana', 'surinam', 'ecuador', 'peru', 'brasil', 'bolivia', 'paraguay', 'chile', 'argentina', 'uruguay'];
// Ruta del avión desde Lima, como un viaje de verdad, terminando en casa.
export const RUTA_AVION = ['ecuador', 'colombia', 'venezuela', 'guyana', 'surinam', 'brasil', 'uruguay', 'argentina', 'chile', 'paraguay', 'bolivia', 'peru'];
