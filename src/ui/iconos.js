// Íconos de trazo simple (24×24) en línea, sin archivos externos.
const i = (cuerpo) =>
  `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${cuerpo}</svg>`;

export const ICONOS = {
  lupa: i('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/><path d="M8 10.5h5M10.5 8v5"/>'),
  ubicacion: i('<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/>'),
  ajustes: i('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'),
  cerrar: i('<path d="M6 6l12 12M18 6 6 18"/>'),
  mas: i('<path d="M12 5v14M5 12h14"/>'),
  menos: i('<path d="M5 12h14"/>'),
  reloj: i('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/>'),
  pasaporte: i('<rect x="5" y="2.5" width="14" height="19" rx="2"/><circle cx="12" cy="10.5" r="3.5"/><path d="M9 17h6"/>'),
  capital: i('<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>'),
  personas: i('<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c3 .2 5.5 2.5 5.5 5.8"/>'),
  superficie: i('<path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3z"/><path d="M9 4v13M15 7v13"/>'),
  idioma: i('<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>'),
  moneda: i('<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2c-.6-1-1.6-1.5-2.8-1.5-1.6 0-2.8.9-2.8 2.1 0 2.9 5.8 1.6 5.8 4.5 0 1.3-1.3 2.2-3 2.2-1.3 0-2.4-.6-3-1.6M12 6v1.7M12 16.5V18"/>'),
  vecinos: i('<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20" stroke-dasharray="2 2.5"/>'),
  ola: i('<path d="M2 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/>'),
  montana: i('<path d="M2 20 9 7l4 7 2.5-4L22 20z"/><path d="M7.4 10l1.6 1.5 1.5-1.4"/>'),
  plato: i('<path d="M3 13h18a9 9 0 0 1-18 0z"/><path d="M9 9c0-1.5 1.5-1.5 1.5-3M13.5 9c0-1.5 1.5-1.5 1.5-3"/>'),
  animal: i('<circle cx="6" cy="10" r="2"/><circle cx="10" cy="5.5" r="2"/><circle cx="15" cy="5.5" r="2"/><circle cx="19" cy="10" r="2"/><path d="M12.5 11c3 0 5.5 4 5.5 6.5 0 2-2 2.5-3.2 2-1-.4-1.6-.6-2.3-.6s-1.3.2-2.3.6c-1.2.5-3.2 0-3.2-2C7 15 9.5 11 12.5 11z"/>'),
  lugar: i('<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>'),
  fiesta: i('<path d="M4 20 9 7l8 8z"/><path d="M14 4v2M19 9h2M17.5 5.5 16 7M12 2.5c1 1 1 2 0 3"/>'),
  foco: i('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>'),
  info: i('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
  sello: i('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16.5 9"/>'),
};
