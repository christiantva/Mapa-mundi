// Una partida: lista de rondas, errores por país y resumen final.
export function barajar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const alAzar = (lista) => lista[Math.floor(Math.random() * lista.length)];

export class Partida {
  constructor(ids, { barajada = true } = {}) {
    this.cola = barajada ? barajar(ids) : [...ids];
    this.i = 0;
    this.errores = {};
    this.resueltos = [];
    this.primerIntento = 0;
    this.inicio = performance.now();
  }

  get actual() { return this.cola[this.i]; }
  get numero() { return this.i + 1; }
  get total() { return this.cola.length; }
  get terminada() { return this.i >= this.cola.length; }
  erroresDe(id) { return this.errores[id] ?? 0; }

  error(id = this.actual) {
    this.errores[id] = this.erroresDe(id) + 1;
    return this.errores[id];
  }

  acierto(id = this.actual) {
    if (!this.erroresDe(id)) this.primerIntento += 1;
    this.resueltos.push(id);
  }

  siguiente() {
    this.i += 1;
    return !this.terminada;
  }

  resumen() {
    const dificiles = Object.entries(this.errores)
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);
    return {
      total: this.total,
      aciertos: this.primerIntento,
      dificiles,
      segundos: Math.round((performance.now() - this.inicio) / 1000),
    };
  }
}
