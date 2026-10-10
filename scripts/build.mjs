// Genera dist/index.html: un solo archivo con todo incrustado (JS, CSS, fuente,
// datos del mapa). Uso:
//   node scripts/build.mjs          → build de producción
//   node scripts/build.mjs --dev    → reconstruye al guardar y sirve en http://localhost:5173
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, watch, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// fileURLToPath: funciona en Windows y en carpetas con espacios o tildes
const raiz = fileURLToPath(new URL('..', import.meta.url));
const dev = process.argv.includes('--dev');
const salida = `${raiz}dist/index.html`;

execFileSync(process.execPath, [`${raiz}scripts/build-geo.mjs`], { stdio: 'inherit' });

// Avisos de licencia de las bibliotecas incluidas (three.js y d3 son MIT/ISC,
// la fuente Nunito es OFL): sus licencias piden copiarlos junto con el código.
function licencias(metas) {
  const paquetes = new Set(['world-atlas']); // de ahí salen los datos del mapa (Natural Earth)
  for (const m of metas) {
    for (const entrada of Object.keys(m.inputs)) {
      const r = entrada.match(/node_modules\/((?:@[^/]+\/)?[^/]+)\//);
      if (r) paquetes.add(r[1]);
    }
  }
  const textos = [...paquetes].sort().map((nombre) => {
    const dir = `${raiz}node_modules/${nombre}`;
    const archivo = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE'].map((f) => `${dir}/${f}`).find(existsSync);
    const { version, license } = JSON.parse(readFileSync(`${dir}/package.json`, 'utf8'));
    const texto = archivo ? readFileSync(archivo, 'utf8').trim() : `Licencia: ${license}`;
    return `${nombre}@${version}\n\n${texto}`;
  });
  // Un comentario HTML no puede contener "--"
  return `<!--\nViajeros de Sudamérica incluye estas bibliotecas:\n\n${textos.join('\n\n----\n\n').replace(/--/g, '- -')}\n-->`;
}

async function construir() {
  const t0 = Date.now();
  const [js, css] = await Promise.all([
    build({
      entryPoints: [`${raiz}src/main.js`],
      bundle: true,
      minify: !dev,
      format: 'iife',
      target: ['es2020'],
      write: false,
      legalComments: 'none', // las licencias completas van al inicio del HTML (ver licencias())
      sourcemap: dev ? 'inline' : false,
      metafile: true,
    }),
    build({
      entryPoints: [`${raiz}src/styles/main.css`],
      bundle: true,
      minify: !dev,
      write: false,
      loader: { '.woff2': 'dataurl' },
      target: ['chrome90', 'safari14', 'firefox90'],
      metafile: true,
    }),
  ]);
  const plantilla = readFileSync(`${raiz}src/index.html`, 'utf8');
  // Evita cerrar la etiqueta <script> antes de tiempo
  const codigo = js.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  const html = plantilla
    .replace('<!--__LICENCIAS__-->', () => licencias([js.metafile, css.metafile]))
    .replace('/*__CSS__*/', () => css.outputFiles[0].text)
    .replace('/*__JS__*/', () => codigo);
  mkdirSync(`${raiz}dist`, { recursive: true });
  writeFileSync(salida, html);
  const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
  console.log(`✔ dist/index.html (${kb} KB) en ${Date.now() - t0} ms`);
}

await construir();

if (dev) {
  let pendiente = null;
  watch(`${raiz}src`, { recursive: true }, () => {
    clearTimeout(pendiente);
    pendiente = setTimeout(() => construir().catch((e) => console.error(e.message)), 120);
  });
  createServer((req, res) => {
    if (!existsSync(salida)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(readFileSync(salida));
  }).listen(5173, () => console.log('Servidor de desarrollo: http://localhost:5173'));
}
