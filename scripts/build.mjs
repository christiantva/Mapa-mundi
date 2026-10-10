// Genera dist/index.html: un solo archivo con todo incrustado (JS, CSS, fuente,
// datos del mapa). Uso:
//   node scripts/build.mjs          → build de producción
//   node scripts/build.mjs --dev    → reconstruye al guardar y sirve en http://localhost:5173
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, watch, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';

const raiz = new URL('..', import.meta.url).pathname;
const dev = process.argv.includes('--dev');
const salida = `${raiz}dist/index.html`;

execFileSync(process.execPath, [`${raiz}scripts/build-geo.mjs`], { stdio: 'inherit' });

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
      legalComments: 'none',
      sourcemap: dev ? 'inline' : false,
    }),
    build({
      entryPoints: [`${raiz}src/styles/main.css`],
      bundle: true,
      minify: !dev,
      write: false,
      loader: { '.woff2': 'dataurl' },
      target: ['chrome90', 'safari14', 'firefox90'],
    }),
  ]);
  const plantilla = readFileSync(`${raiz}src/index.html`, 'utf8');
  // Evita cerrar la etiqueta <script> antes de tiempo
  const codigo = js.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  const html = plantilla
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
