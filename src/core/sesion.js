// Resultados de las partidas jugadas en esta sesión (para el modo docente).
const partidas = [];

export function registrarPartida(p) {
  partidas.push({ ...p, hora: new Date() });
}

export const partidasSesion = () => [...partidas];
export const limpiarSesion = () => { partidas.length = 0; };
