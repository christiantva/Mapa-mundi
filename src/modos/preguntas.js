// Preguntas del modo "Encuentra el país" según el ciclo.
//  III: ubicar países por su nombre.
//  IV:  nombre o capital, y un reto final: los 5 vecinos del Perú.
//  V:   además moneda, idioma, lugar famoso y preguntas combinadas.
import { PAISES_POR_ID, elPais } from '../data/paises.js';
import { barajar } from '../core/partida.js';
import { esc } from './comun.js';

// Solo idiomas que se hablan oficialmente en un único país de Sudamérica.
const IDIOMA_UNICO = { brasil: 'portugués', guyana: 'inglés', surinam: 'neerlandés' };
// Lugares que están en un solo país (Iguazú e Itaipú son compartidos).
const LUGAR = {
  bolivia: 'el Salar de Uyuni', brasil: 'el Cristo Redentor', chile: 'la Isla de Pascua',
  colombia: 'Cartagena de Indias', ecuador: 'las islas Galápagos', guyana: 'las cataratas Kaieteur',
  peru: 'Machu Picchu', uruguay: 'Colonia del Sacramento', venezuela: 'el Salto Ángel',
};

const fuerte = (t) => `<strong>${esc(t)}</strong>`;
const oceano = (p) => p.oceanos[0]?.split(' ')[0];

const TIPOS = {
  nombre: (p) => ({
    texto: `¿Dónde está ${p.articulo ? `${p.articulo} ` : ''}${fuerte(p.nombre)}?`,
    voz: `¿Dónde está ${elPais(p)}?`,
  }),
  capital: (p) => ({
    texto: `¿En qué país está la capital ${fuerte(p.capitales[0].nombre)}?`,
    voz: `¿En qué país está la capital ${p.capitales[0].nombre}? Tócalo en el mapa.`,
  }),
  moneda: (p) => ({
    texto: `¿En qué país se paga con el ${fuerte(p.moneda)}?`,
    voz: `¿En qué país se paga con el ${p.moneda}?`,
  }),
  idioma: (p) => ({
    texto: `¿En qué país el idioma oficial es el ${fuerte(IDIOMA_UNICO[p.id])}?`,
    voz: `¿En qué país el idioma oficial es el ${IDIOMA_UNICO[p.id]}?`,
  }),
  lugar: (p) => ({
    texto: `¿En qué país está ${fuerte(LUGAR[p.id])}?`,
    voz: `¿En qué país está ${LUGAR[p.id]}?`,
  }),
  combinada: (p) => {
    const mar = p.oceanos.length ? `Está junto al océano ${oceano(p)}` : 'No tiene mar';
    return {
      texto: `${mar} y su moneda es el ${fuerte(p.moneda)}. ¿Qué país es?`,
      voz: `${mar} y su moneda es el ${p.moneda}. ¿Qué país es?`,
    };
  },
};

function disponibles(p, ciclo) {
  if (ciclo === 'III') return ['nombre'];
  if (ciclo === 'IV') return ['nombre', 'capital'];
  return ['capital', 'moneda', 'combinada', ...(LUGAR[p.id] ? ['lugar'] : []), ...(IDIOMA_UNICO[p.id] ? ['idioma'] : [])];
}

/** Crea la lista de preguntas para los países dados (en ese orden). */
export function crearPreguntas(ids, ciclo, { reto = true } = {}) {
  // Reparte los tipos para que haya variedad y no salgan todos iguales
  const uso = {};
  const preguntas = ids.map((id, i) => {
    const p = PAISES_POR_ID[id];
    const tipos = disponibles(p, ciclo);
    let tipo;
    if (ciclo === 'IV') tipo = tipos[i % 2];
    else tipo = barajar(tipos).sort((a, b) => (uso[a] ?? 0) - (uso[b] ?? 0))[0];
    uso[tipo] = (uso[tipo] ?? 0) + 1;
    return { clave: id, objetivo: id, acepta: [id], necesarios: 1, tipo, ...TIPOS[tipo](p), pistas: p.pistas };
  });
  if (ciclo === 'IV' && reto) {
    const vecinos = PAISES_POR_ID.peru.limitrofes;
    preguntas.push({
      clave: 'vecinos-del-peru',
      objetivo: null,
      acepta: vecinos,
      necesarios: vecinos.length,
      tipo: 'vecinos',
      texto: `¡Reto final! Toca los ${fuerte(`${vecinos.length} países`)} que limitan con el Perú.`,
      voz: `¡Reto final! Toca los ${vecinos.length} países que limitan con el Perú.`,
      pistas: ['Uno está al norte y se llama como la línea que divide la Tierra.', 'El más grande de Sudamérica es nuestro vecino del este.', 'Compartimos el lago Titicaca con uno de ellos.'],
    });
  }
  return preguntas;
}
