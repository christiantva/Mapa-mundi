// Extrae de world-atlas (Natural Earth) solo Sudamérica + contexto (Centroamérica,
// Caribe, México) y lo guarda como TopoJSON compacto para incrustarlo en el HTML.
// La Guayana Francesa viene dentro de "France": se separa como geometría propia.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as tc from 'topojson-client';

const require = createRequire(import.meta.url);
const t50 = JSON.parse(readFileSync(require.resolve('world-atlas/countries-50m.json'), 'utf8'));
const t110 = JSON.parse(readFileSync(require.resolve('world-atlas/countries-110m.json'), 'utf8'));

// ISO 3166-1 numérico -> clave del juego
export const SUDAMERICA = {
  '032': 'argentina', '068': 'bolivia', '076': 'brasil', '152': 'chile',
  '170': 'colombia', '218': 'ecuador', '328': 'guyana', '600': 'paraguay',
  '604': 'peru', '740': 'surinam', '858': 'uruguay', '862': 'venezuela',
};

// Contexto en gris: todo lo que caiga en esta caja (lon/lat) además de Sudamérica.
const BOX = { w: -120, e: -28, s: -62, n: 34 };

function decodeArc(topo, i) {
  const arc = topo.arcs[i < 0 ? ~i : i];
  const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; });
}
function ringsBBox(topo, polygonArcs) {
  let w = Infinity, e = -Infinity, s = Infinity, n = -Infinity;
  for (const ring of polygonArcs) for (const a of ring) for (const [x, y] of decodeArc(topo, a)) {
    if (x < w) w = x; if (x > e) e = x; if (y < s) s = y; if (y > n) n = y;
  }
  return { w, e, s, n };
}
const inBox = (b) => b.e > BOX.w && b.w < BOX.e && b.n > BOX.s && b.s < BOX.n;
const polys = (g) => (g.type === 'Polygon' ? [g.arcs] : g.arcs);

// Recorta una topología a las geometrías elegidas y reindexa los arcos usados.
function subset(topo, geometries) {
  const used = new Map();
  const remap = (i) => {
    const k = i < 0 ? ~i : i;
    if (!used.has(k)) used.set(k, used.size);
    const j = used.get(k);
    return i < 0 ? ~j : j;
  };
  const geoms = geometries.map((g) => ({
    ...g,
    arcs: g.type === 'Polygon'
      ? g.arcs.map((r) => r.map(remap))
      : g.arcs.map((p) => p.map((r) => r.map(remap))),
  }));
  const arcs = [...used.keys()].map((k) => topo.arcs[k]);
  return { type: 'Topology', transform: topo.transform, objects: { countries: { type: 'GeometryCollection', geometries: geoms } }, arcs };
}

// --- Detalle 50m: Sudamérica + contexto cercano ---
const elegidos = [];
for (const g of t50.objects.countries.geometries) {
  if (!g.arcs) continue;
  if (SUDAMERICA[g.id]) {
    elegidos.push({ type: g.type, arcs: g.arcs, id: SUDAMERICA[g.id], properties: { sa: 1 } });
    continue;
  }
  if (g.id === '250') {
    // Francia: solo nos quedamos con el polígono de la Guayana Francesa.
    const guayana = polys(g).filter((p) => { const b = ringsBBox(t50, p); return b.w > -55 && b.e < -50 && b.n < 7; });
    if (guayana.length) elegidos.push({ type: 'MultiPolygon', arcs: guayana, id: 'guayana-francesa', properties: { fr: 1 } });
    continue;
  }
  const keep = polys(g).filter((p) => inBox(ringsBBox(t50, p)));
  if (!keep.length) continue;
  // Si el país es muy grande (EE. UU.), solo guardamos sus polígonos dentro de la caja.
  elegidos.push({ type: 'MultiPolygon', arcs: keep, id: 'c' + (g.id ?? g.properties.name), properties: { name: g.properties.name } });
}
const detalle = subset(t50, elegidos);

// --- Mundo 110m para el globo 3D y el contexto lejano ---
const mundo = subset(t110, t110.objects.countries.geometries.filter((g) => g.arcs).map((g) => ({
  type: g.type, arcs: g.arcs, id: SUDAMERICA[g.id] || 'c' + g.id, properties: {},
})));

writeFileSync(new URL('../src/data/geo-detalle.generated.json', import.meta.url), JSON.stringify(detalle));
writeFileSync(new URL('../src/data/geo-mundo.generated.json', import.meta.url), JSON.stringify(mundo));
const kb = (o) => (JSON.stringify(o).length / 1024).toFixed(0) + ' KB';
console.log(`geo: detalle ${elegidos.length} geometrías (${kb(detalle)}), mundo ${kb(mundo)}`);
