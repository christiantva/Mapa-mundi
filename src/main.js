// Viajeros de Sudamérica — punto de entrada.
import { Mapa2D } from './map/mapa2d.js';
import { Hoja } from './ui/hoja.js';
import { ICONOS } from './ui/iconos.js';
import { obtener, alCambiar, cambiarAjuste } from './core/estado.js';
import { iniciarExplorar } from './modos/explorar.js';

const app = document.getElementById('app');

app.innerHTML = `
  <header class="barra">
    <button type="button" class="logo" aria-label="Viajeros de Sudamérica">
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle cx="24" cy="24" r="21" fill="#fbf8ef" stroke="#23302a" stroke-width="2.5"/>
        <circle cx="24" cy="24" r="15.5" fill="none" stroke="#5ba829" stroke-width="2" stroke-dasharray="3 3"/>
        <path d="M14 27.5l20-9.5-6 13-3.2-4.5z" fill="#f2c230" stroke="#23302a" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    </button>
    <h1>Países y capitales de Sudamérica</h1>
    <div class="barra-acciones">
      <span class="pasaporte-mini" title="Sellos del pasaporte">${ICONOS.pasaporte}<span><span class="js-sellos">0</span>/12</span></span>
    </div>
  </header>

  <main class="escenario">
    <aside class="panel" id="panel" aria-label="Ficha del país" aria-live="polite">
      <button type="button" class="hoja-asa" hidden><span></span></button>
      <div class="panel-contenido"></div>
    </aside>

    <section class="zona-mapa" aria-label="Mapa">
      <div class="mapa-contenedor"></div>

      <div class="progreso" aria-live="polite">
        <span class="progreso-numero"><span class="js-sellos">0</span>/12</span>
        <span class="progreso-texto">visitados</span>
      </div>

      <div class="controles-mapa">
        <button type="button" class="boton-redondo boton-claro" data-accion="acercar" aria-label="Acercar el mapa">${ICONOS.mas}</button>
        <button type="button" class="boton-redondo boton-claro" data-accion="alejar" aria-label="Alejar el mapa">${ICONOS.menos}</button>
        <button type="button" class="boton-redondo boton-verde" data-accion="centrar" aria-label="Centrar el mapa en Sudamérica">${ICONOS.ubicacion}</button>
      </div>

      <div class="barra-inferior">
        <div class="cronometro" role="timer" aria-label="Tiempo de exploración">
          ${ICONOS.reloj}<span class="js-tiempo">0:00</span>
        </div>
        <button type="button" class="boton-redondo boton-claro" data-accion="ajustes" aria-label="Ajustes">${ICONOS.ajustes}</button>
      </div>
    </section>
  </main>

  <dialog class="dialogo" id="dialogo-bandera" aria-label="Bandera ampliada">
    <div class="dialogo-cuerpo"></div>
    <button type="button" class="boton-redondo boton-claro dialogo-cerrar" data-cerrar aria-label="Cerrar">${ICONOS.cerrar}</button>
  </dialog>

  <dialog class="dialogo" id="dialogo-ajustes" aria-labelledby="titulo-ajustes">
    <h2 id="titulo-ajustes">Ajustes del mapa</h2>
    <div class="ajustes-lista">
      <label class="interruptor"><input type="checkbox" data-ajuste="nombres"><span class="interruptor-pista"></span> Nombres de los países</label>
      <label class="interruptor"><input type="checkbox" data-ajuste="capitales"><span class="interruptor-pista"></span> Capitales</label>
      <label class="interruptor"><input type="checkbox" data-ajuste="ecuador"><span class="interruptor-pista"></span> Línea ecuatorial</label>
      <label class="interruptor"><input type="checkbox" data-ajuste="tropico"><span class="interruptor-pista"></span> Trópico de Capricornio</label>
    </div>
    <button type="button" class="boton boton-primario" data-cerrar>Listo</button>
  </dialog>
`;

const panel = app.querySelector('#panel');
const contenido = panel.querySelector('.panel-contenido');
const zonaMapa = app.querySelector('.zona-mapa');

const hoja = new Hoja(panel, panel.querySelector('.hoja-asa'));

const mapa = new Mapa2D(app.querySelector('.mapa-contenedor'), {
  margenes: () => {
    const alto = zonaMapa.clientHeight;
    const abajo = hoja.activa ? Math.min(hoja.altoVisible(), alto * 0.6) : 0;
    return { top: 70, right: 70, bottom: abajo + 70, left: 10, hoja: hoja.activa };
  },
});

// Diálogos
for (const d of app.querySelectorAll('dialog')) {
  d.addEventListener('click', (e) => {
    if (e.target === d || e.target.closest('[data-cerrar]')) d.close();
  });
}

// Ajustes del mapa
const dlgAjustes = app.querySelector('#dialogo-ajustes');
const sincronizarAjustes = () => {
  const { ajustes } = obtener();
  for (const input of dlgAjustes.querySelectorAll('[data-ajuste]')) input.checked = !!ajustes[input.dataset.ajuste];
  mapa.setOpciones(ajustes);
};
dlgAjustes.addEventListener('change', (e) => {
  const clave = e.target.dataset.ajuste;
  if (clave) cambiarAjuste(clave, e.target.checked);
});
alCambiar(sincronizarAjustes);
sincronizarAjustes();

// Controles del mapa
zonaMapa.addEventListener('click', (e) => {
  const accion = e.target.closest('[data-accion]')?.dataset.accion;
  if (accion === 'acercar') mapa.acercar(1.6);
  if (accion === 'alejar') mapa.acercar(1 / 1.6);
  if (accion === 'centrar') mapa.centrar();
  if (accion === 'ajustes') dlgAjustes.showModal();
});

// Cronómetro de la sesión (se detiene si la pestaña no está visible)
const tiempo = app.querySelector('.js-tiempo');
let segundos = 0;
setInterval(() => {
  if (document.hidden) return;
  segundos += 1;
  const m = Math.floor(segundos / 60), s = String(segundos % 60).padStart(2, '0');
  tiempo.textContent = `${m}:${s}`;
}, 1000);

iniciarExplorar({ mapa, hoja, panel, contenido, app });

// Encuadre inicial cuando ya conocemos el alto de la hoja
requestAnimationFrame(() => mapa.centrar());
