// Lectura en voz alta con speechSynthesis. Prefiere voces de Perú o
// Latinoamérica; si no hay, cualquier voz en español.
const sintesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
let activa = false;
let voz = null;

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

export const vozDisponible = () => !!sintesis;

export function activarVoz(si) {
  activa = !!si;
  if (!activa) callar();
}

export function decir(texto, { forzar = false } = {}) {
  if ((!activa && !forzar) || !sintesis || !texto) return;
  try {
    sintesis.cancel();
    const u = new SpeechSynthesisUtterance(texto.replace(/[¡¿]/g, ''));
    u.lang = voz?.lang ?? 'es-PE';
    if (voz) u.voice = voz;
    u.rate = 0.95;
    u.pitch = 1.1;
    sintesis.speak(u);
  } catch {
    /* algunos navegadores no permiten hablar sin un gesto previo */
  }
}

export function callar() {
  try { sintesis?.cancel(); } catch { /* nada */ }
}
