// Lectura en voz alta con speechSynthesis. Prefiere voces de Perú o
// Latinoamérica; si no hay, cualquier voz en español.
//
// Para que Kusi no se corte a media frase:
// - El texto se lee por oraciones cortas: Chrome deja de hablar si una sola
//   lectura dura más de unos 15 segundos.
// - Un mensaje nuevo no interrumpe la oración que se está leyendo: espera a que
//   termine y descarta lo que faltaba del mensaje anterior. Solo callar() corta
//   en seco (al apagar la voz, por ejemplo).
// - Se guarda la referencia de la lectura en curso: si el navegador la libera,
//   deja de hablar sin avisar.
// - Después de un cancel() se espera un momento antes de volver a hablar:
//   si no, Chrome a veces descarta la frase nueva.
const sintesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
const RESPIRO_MS = 150;
const MAX_TROZO = 160;

let activa = false;
let voz = null;
let cola = [];
let actual = null;
let tSiguiente = null;
let tSeguro = null;
let ultimoCorte = -Infinity;

function elegirVoz() {
  if (!sintesis) return null;
  const voces = sintesis.getVoices().filter((v) => /^es\b|^es[-_]/i.test(v.lang));
  const prioridad = ['es-PE', 'es-419', 'es-US', 'es-MX', 'es-CO', 'es-AR', 'es-CL'];
  const norm = (l) => l.replace('_', '-');
  for (const p of prioridad) {
    const v = voces.find((x) => norm(x.lang).toLowerCase() === p.toLowerCase());
    if (v) return v;
  }
  return voces.find((v) => !/es-ES/i.test(norm(v.lang))) ?? voces[0] ?? null;
}

if (sintesis) {
  voz = elegirVoz();
  sintesis.addEventListener?.('voiceschanged', () => { voz = elegirVoz(); });
}

/** Divide el texto en oraciones; las muy largas, en sus comas. */
export function partir(texto) {
  const limpio = String(texto).replace(/[¡¿]/g, '').replace(/\s+/g, ' ').trim();
  const trozos = [];
  for (const oracion of limpio.match(/[^.!?…]+[.!?…]*/g) ?? []) {
    const o = oracion.trim();
    if (!o) continue;
    if (o.length <= MAX_TROZO) { trozos.push(o); continue; }
    // Solo comas seguidas de espacio ("34,2 millones" no se parte)
    let buf = '';
    for (const parte of o.split(/,\s+/)) {
      const junto = buf ? `${buf}, ${parte}` : parte;
      if (buf && junto.length > MAX_TROZO) { trozos.push(`${buf},`); buf = parte; }
      else buf = junto;
    }
    if (buf) trozos.push(buf);
  }
  return trozos;
}

function limpiarTiempos() {
  clearTimeout(tSiguiente);
  clearTimeout(tSeguro);
}

function hablarSiguiente() {
  if (actual || !cola.length || !sintesis) return;
  const espera = ultimoCorte + RESPIRO_MS - performance.now();
  if (espera > 0) {
    clearTimeout(tSiguiente);
    tSiguiente = setTimeout(hablarSiguiente, espera);
    return;
  }
  const texto = cola.shift();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = voz?.lang ?? 'es-PE';
  if (voz) u.voice = voz;
  u.rate = 0.95;
  u.pitch = 1.1;
  const fin = () => {
    if (actual !== u) return; // aviso tardío de una lectura ya cortada
    actual = null;
    clearTimeout(tSeguro);
    hablarSiguiente();
  };
  u.onend = fin;
  u.onerror = fin;
  actual = u;
  // Seguro por si el navegador nunca avisa el final (pasa en algunos Android).
  // Se espera el doble de lo normal: si sigue "hablando", está trabado.
  clearTimeout(tSeguro);
  tSeguro = setTimeout(() => {
    if (actual !== u) return;
    if (sintesis.speaking) cortarMotor();
    fin();
  }, 4000 + texto.length * 150);
  try {
    sintesis.speak(u);
  } catch {
    actual = null;
    cola = [];
  }
}

function cortarMotor() {
  try { sintesis?.cancel(); } catch { /* nada */ }
  ultimoCorte = performance.now();
}

export const vozDisponible = () => !!sintesis;

/** Algunos navegadores (Safari en iPad y iPhone) solo hablan si la primera
 *  lectura nace de un toque. Se llama una vez, en el primer toque. */
export function desbloquearVoz() {
  if (!sintesis) return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    sintesis.speak(u);
  } catch { /* nada */ }
}

export function activarVoz(si) {
  const antes = activa;
  activa = !!si;
  // Solo se corta al apagar la voz (no en cada cambio de ajustes)
  if (antes && !activa) callar();
}

/**
 * Lee un texto. Si Kusi está leyendo, termina la oración en curso y luego
 * lee el texto nuevo. Con { ya: true } corta en seco y lee de inmediato
 * (para el botón "Escuchar", que pide el niño).
 */
export function decir(texto, { forzar = false, ya = false } = {}) {
  if ((!activa && !forzar) || !sintesis || !texto) return;
  const trozos = partir(texto);
  if (ya && (actual || sintesis.speaking || sintesis.pending)) {
    callar();
  }
  cola = trozos;
  hablarSiguiente();
}

/** Deja terminar la oración en curso y descarta lo que faltaba leer. */
export function soltar() {
  cola = [];
  clearTimeout(tSiguiente);
}

/** Corta la lectura de inmediato. */
export function callar() {
  cola = [];
  actual = null;
  limpiarTiempos();
  if (sintesis && (sintesis.speaking || sintesis.pending)) cortarMotor();
}
