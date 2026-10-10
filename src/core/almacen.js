// Guardado en localStorage siempre envuelto en try/catch:
// si el navegador lo bloquea (modo privado, vista previa), el juego sigue igual.
const CLAVE = 'viajeros-sudamerica-v1';

export function cargar() {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    return crudo ? JSON.parse(crudo) : null;
  } catch {
    return null;
  }
}

export function guardar(datos) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(datos));
    return true;
  } catch {
    return false;
  }
}

export function borrar() {
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {
    /* sin almacenamiento: no hay nada que borrar */
  }
}
