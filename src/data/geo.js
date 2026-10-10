// Geometrías del mapa (generadas por scripts/build-geo.mjs desde world-atlas).
import { feature, mesh } from 'topojson-client';
import detalle from './geo-detalle.generated.json';

const obj = detalle.objects.countries;

export const featuresDetalle = feature(detalle, obj).features;
export const featuresSudamerica = featuresDetalle.filter((f) => f.properties.sa || f.properties.fr);
export const featuresContexto = featuresDetalle.filter((f) => !f.properties.sa && !f.properties.fr);

// Fronteras interiores (líneas compartidas entre dos países) y costas.
export const fronteras = mesh(detalle, obj, (a, b) => a !== b);
export const costas = mesh(detalle, obj, (a, b) => a === b);
