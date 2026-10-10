// Todos los sonidos se generan por código con Web Audio API (sin archivos).
// El AudioContext se crea recién con el primer toque del usuario, como exigen
// los navegadores; hasta entonces todo está en silencio.

let ctx = null;
let maestro, busEfectos, busMusica;
const ajustes = { efectos: true, musica: false };
let musica = null;

function crear() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  maestro = ctx.createGain();
  maestro.gain.value = 0.9;
  // Compresor suave para que nada suene fuerte de golpe
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 4;
  maestro.connect(comp).connect(ctx.destination);
  busEfectos = ctx.createGain();
  busMusica = ctx.createGain();
  busEfectos.gain.value = ajustes.efectos ? 1 : 0;
  busMusica.gain.value = 0;
  busEfectos.connect(maestro);
  busMusica.connect(maestro);
  return ctx;
}

/**
 * Crea el audio o lo reanuda. Se llama en cada toque: en pantallas táctiles el
 * permiso llega recién al levantar el dedo, y el sistema puede suspender el
 * audio (por ejemplo, al bloquear la tablet).
 */
export function desbloquear() {
  const c = crear();
  if (!c) return;
  if (c.state !== 'running') c.resume?.().catch(() => {});
  if (ajustes.musica) iniciarMusica();
}

export function configurar({ efectos, musica: conMusica }) {
  if (efectos !== undefined) ajustes.efectos = efectos;
  if (conMusica !== undefined) ajustes.musica = conMusica;
  if (!ctx) return;
  const t = ctx.currentTime;
  busEfectos.gain.setTargetAtTime(ajustes.efectos ? 1 : 0, t, 0.05);
  if (ajustes.musica) iniciarMusica();
  else detenerMusica();
}

const listo = () => {
  if (!ctx || !ajustes.efectos) return false;
  if (ctx.state !== 'running') { ctx.resume?.().catch(() => {}); return false; }
  return true;
};

// Nota con envolvente ADSR simple
function nota(frec, inicio, dur, { tipo = 'sine', vol = 0.25, ataque = 0.01, salida = busEfectos, glissA = null } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(frec, inicio);
  if (glissA) o.frequency.exponentialRampToValueAtTime(glissA, inicio + dur);
  g.gain.setValueAtTime(0.0001, inicio);
  g.gain.exponentialRampToValueAtTime(vol, inicio + ataque);
  g.gain.exponentialRampToValueAtTime(0.0001, inicio + dur);
  o.connect(g).connect(salida);
  o.start(inicio);
  o.stop(inicio + dur + 0.05);
  return o;
}

function ruido(dur) {
  const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource();
  s.buffer = b;
  return s;
}

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

export const efectos = {
  /** Arpegio corto ascendente. */
  acierto() {
    if (!listo()) return;
    const t = ctx.currentTime;
    [72, 76, 79, 84].forEach((m, i) => nota(hz(m), t + i * 0.075, 0.28, { tipo: 'triangle', vol: 0.22 }));
  },
  /** Dos notas graves y suaves (nunca agresivo). */
  error() {
    if (!listo()) return;
    const t = ctx.currentTime;
    nota(hz(55), t, 0.22, { vol: 0.2, ataque: 0.02 });
    nota(hz(52), t + 0.2, 0.32, { vol: 0.18, ataque: 0.02 });
  },
  /** "Pop" suave al tocar un país. */
  pop() {
    if (!listo()) return;
    nota(620, ctx.currentTime, 0.09, { vol: 0.16, glissA: 300 });
  },
  /** Golpe seco del sello de pasaporte. */
  sello() {
    if (!listo()) return;
    const t = ctx.currentTime;
    const r = ruido(0.12);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 1400;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    r.connect(f).connect(g).connect(busEfectos);
    r.start(t);
    nota(140, t, 0.16, { vol: 0.45, ataque: 0.003, glissA: 60 });
  },
  /** Pequeña fanfarria de victoria. */
  victoria() {
    if (!listo()) return;
    const t = ctx.currentTime;
    const seq = [[67, 0, 0.14], [72, 0.14, 0.14], [76, 0.28, 0.14], [79, 0.42, 0.3], [76, 0.74, 0.12], [79, 0.86, 0.6]];
    for (const [m, d, dur] of seq) {
      nota(hz(m), t + d, dur + 0.1, { tipo: 'triangle', vol: 0.22 });
      nota(hz(m - 12), t + d, dur + 0.1, { tipo: 'square', vol: 0.04 });
    }
    nota(hz(48), t + 0.86, 0.8, { tipo: 'triangle', vol: 0.18 });
  },
  /** Zumbido del avión con barrido de frecuencia. Devuelve una función para detenerlo. */
  avion(duracion = 2) {
    if (!listo()) return () => {};
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(70, t);
    o.frequency.exponentialRampToValueAtTime(150, t + Math.min(0.8, duracion / 2));
    o.frequency.exponentialRampToValueAtTime(95, t + duracion);
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.frequency.value = 18;
    lfoG.gain.value = 6;
    lfo.connect(lfoG).connect(o.frequency);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(400, t);
    f.frequency.linearRampToValueAtTime(900, t + duracion / 2);
    f.frequency.linearRampToValueAtTime(350, t + duracion);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.3);
    g.gain.setValueAtTime(0.09, t + Math.max(0.35, duracion - 0.4));
    g.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
    o.connect(f).connect(g).connect(busEfectos);
    o.start(t);
    lfo.start(t);
    o.stop(t + duracion + 0.1);
    lfo.stop(t + duracion + 0.1);
    return () => {
      try {
        g.gain.cancelScheduledValues(ctx.currentTime);
        g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
        o.stop(ctx.currentTime + 0.2);
        lfo.stop(ctx.currentTime + 0.2);
      } catch { /* ya terminó */ }
    };
  },
};

// ───────── Música de fondo: melodía andina en escala pentatónica ─────────
// La menor pentatónica (la, do, re, mi, sol). Ritmo de huayno: larga-corta-corta.
const MELODIA = [
  // [nota MIDI o null, duración en corcheas]
  [76, 2], [74, 1], [72, 1], [74, 2], [76, 2], [79, 2], [76, 1], [74, 1], [72, 4],
  [72, 2], [74, 1], [72, 1], [69, 2], [72, 2], [74, 2], [72, 1], [69, 1], [67, 4],
  [69, 2], [72, 1], [74, 1], [76, 2], [79, 2], [81, 2], [79, 1], [76, 1], [74, 4],
  [76, 2], [74, 1], [72, 1], [74, 2], [72, 1], [69, 1], [67, 2], [69, 1], [72, 1], [69, 4],
];
const BAJO = [45, 52, 45, 52, 48, 55, 43, 50, 45, 52, 45, 52, 48, 55, 45, 45];

function iniciarMusica() {
  if (!ctx || musica) return;
  const t0 = ctx.currentTime + 0.1;
  busMusica.gain.cancelScheduledValues(t0);
  busMusica.gain.setTargetAtTime(0.5, t0, 0.6);
  const corchea = 60 / 104 / 2;
  const estado = { siguiente: t0, i: 0, compas: 0, tBajo: t0, ib: 0 };

  // Sonido de quena: seno con vibrato suave y un poco de soplo
  const quena = (m, t, dur) => {
    const o = ctx.createOscillator();
    const v = ctx.createOscillator();
    const vg = ctx.createGain();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = hz(m);
    v.frequency.value = 5.2;
    vg.gain.value = hz(m) * 0.008;
    v.connect(vg).connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.13, t + 0.05);
    g.gain.setValueAtTime(0.11, t + Math.max(0.06, dur - 0.08));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(busMusica);
    o.start(t); v.start(t);
    o.stop(t + dur + 0.05); v.stop(t + dur + 0.05);
  };
  // Pulsado de charango/bajo
  const pulso = (m, t) => {
    nota(hz(m), t, 0.35, { tipo: 'triangle', vol: 0.09, ataque: 0.005, salida: busMusica });
    nota(hz(m + 12), t + 0.005, 0.18, { tipo: 'triangle', vol: 0.035, ataque: 0.003, salida: busMusica });
  };

  const programar = () => {
    const ahora = ctx.currentTime;
    // Si la pestaña estuvo oculta, el temporizador se atrasa: retomamos desde
    // ahora en vez de tocar de golpe todas las notas atrasadas.
    if (estado.siguiente < ahora) estado.siguiente = ahora + 0.05;
    if (estado.tBajo < ahora) estado.tBajo = ahora + 0.05;
    const limite = ahora + 0.25;
    while (estado.siguiente < limite) {
      const [m, d] = MELODIA[estado.i];
      const dur = d * corchea;
      if (m) quena(m, estado.siguiente, dur * 0.95);
      estado.siguiente += dur;
      estado.i = (estado.i + 1) % MELODIA.length;
    }
    while (estado.tBajo < limite) {
      pulso(BAJO[estado.ib], estado.tBajo);
      estado.tBajo += corchea * 2;
      estado.ib = (estado.ib + 1) % BAJO.length;
    }
  };
  programar();
  musica = setInterval(programar, 60);
}

function detenerMusica() {
  if (!musica) return;
  clearInterval(musica);
  musica = null;
  busMusica.gain.cancelScheduledValues(ctx.currentTime);
  busMusica.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
}
