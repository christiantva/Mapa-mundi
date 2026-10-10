// Viajeros de Sudamérica — punto de entrada.
import { Mapa2D } from './map/mapa2d.js';
import { Hoja } from './ui/hoja.js';
import { Kusi } from './ui/kusi.js';
import { Confeti } from './ui/confeti.js';
import { ICONOS } from './ui/iconos.js';
import { htmlInicio } from './ui/inicio.js';
import { obtener, alCambiar, cambiarAjuste } from './core/estado.js';
import { desbloquear, configurar as configurarSonido, efectos as sfx } from './core/sonido.js';
import { activarVoz, decir, vozDisponible } from './core/voz.js';
import { crearExplorar } from './modos/explorar.js';
import { crearEncuentra } from './modos/encuentra.js';
import { crearAvion } from './modos/avion.js';
import { crearArrastra } from './modos/arrastra.js';
import { resumenHTML } from './modos/comun.js';

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
    <div class="barra-titulos">
      <h1>Países y capitales de Sudamérica</h1>
      <span class="barra-modo js-nombre-modo"></span>
    </div>
    <div class="barra-acciones">
      <span class="pasaporte-mini" title="Sellos del pasaporte">${ICONOS.pasaporte}<span><span class="js-sellos">0</span>/12</span></span>
      <button type="button" class="boton-barra js-boton-inicio" aria-label="Volver al inicio" hidden>${ICONOS.casa}<span>Inicio</span></button>
    </div>
  </header>

  <main class="escenario">
    <aside class="panel" id="panel" aria-label="Panel del juego" aria-live="polite">
      <button type="button" class="hoja-asa" hidden><span></span></button>
      <div class="panel-contenido"></div>
    </aside>

    <section class="zona-mapa" aria-label="Mapa">
      <div class="mapa-contenedor"></div>

      <div class="progreso" aria-live="polite">
        <span class="progreso-numero js-progreso-numero">0/12</span>
        <span class="progreso-texto js-progreso-texto">visitados</span>
      </div>

      <div class="controles-mapa">
        <button type="button" class="boton-redondo boton-claro" data-accion="acercar" aria-label="Acercar el mapa">${ICONOS.mas}</button>
        <button type="button" class="boton-redondo boton-claro" data-accion="alejar" aria-label="Alejar el mapa">${ICONOS.menos}</button>
        <button type="button" class="boton-redondo boton-verde" data-accion="centrar" aria-label="Centrar el mapa en Sudamérica">${ICONOS.ubicacion}</button>
      </div>

      <div class="barra-inferior">
        <div class="cronometro" role="timer" aria-label="Tiempo de juego">
          ${ICONOS.reloj}<span class="js-tiempo">0:00</span>
        </div>
        <button type="button" class="boton-redondo boton-claro" data-accion="ajustes" aria-label="Ajustes">${ICONOS.ajustes}</button>
      </div>
    </section>
    ${htmlInicio()}
  </main>

  <dialog class="dialogo" id="dialogo-bandera" aria-label="Bandera ampliada">
    <div class="dialogo-cuerpo"></div>
    <button type="button" class="boton-redondo boton-claro dialogo-cerrar" data-cerrar aria-label="Cerrar">${ICONOS.cerrar}</button>
  </dialog>

  <dialog class="dialogo" id="dialogo-ajustes" aria-labelledby="titulo-ajustes">
    <h2 id="titulo-ajustes">Ajustes</h2>
    <h3 class="ajustes-grupo">Sonido</h3>
    <div class="ajustes-lista">
      <label class="interruptor"><input type="checkbox" data-ajuste="efectos"><span class="interruptor-pista"></span> Efectos de sonido</label>
      <label class="interruptor"><input type="checkbox" data-ajuste="musica"><span class="interruptor-pista"></span> Música andina</label>
      <label class="interruptor"><input type="checkbox" data-ajuste="voz"><span class="interruptor-pista"></span> Kusi lee en voz alta</label>
    </div>
    <h3 class="ajustes-grupo">Mapa (modo Explorar)</h3>
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
const pantallaInicio = app.querySelector('.inicio');
const botonInicio = app.querySelector('.js-boton-inicio');
const nombreModo = app.querySelector('.js-nombre-modo');

// Alto ocupado abajo (hoja del celular + bandeja de banderas), para ubicar
// a Kusi, el cronómetro y el encuadre del mapa.
let hoja = null;
function altoAbajo() {
  const bandeja = zonaMapa.querySelector('.bandeja');
  return (hoja?.activa ? hoja.altoVisible() : 0) + (bandeja ? bandeja.offsetHeight : 0);
}
const escenario = app.querySelector('.escenario');
function actualizarAbajo() {
  escenario.style.setProperty('--abajo', `${altoAbajo()}px`);
  escenario.classList.toggle('hoja-abierta', !!hoja?.activa && hoja.estado === 'abierto');
}

hoja = new Hoja(panel, panel.querySelector('.hoja-asa'), { alCambiar: actualizarAbajo });

const mapa = new Mapa2D(app.querySelector('.mapa-contenedor'), {
  margenes: () => {
    const alto = zonaMapa.clientHeight;
    const abajo = Math.min(altoAbajo(), alto * 0.6);
    return { top: 70, right: 70, bottom: abajo + 70, left: 10, hoja: hoja.activa || abajo > 0 };
  },
});

const kusi = new Kusi(panel);
// En escritorio Kusi vive al pie del panel; en celular flota sobre el mapa.
const ubicarKusi = () => (hoja.activa ? escenario : panel).append(kusi.el);
hoja.mq.addEventListener('change', ubicarKusi);
ubicarKusi();
const confeti = new Confeti(zonaMapa);
actualizarAbajo();

// ───── Ajustes ─────
const dlgAjustes = app.querySelector('#dialogo-ajustes');
if (!vozDisponible()) dlgAjustes.querySelector('[data-ajuste="voz"]').closest('label').hidden = true;
const sincronizarAjustes = () => {
  const { ajustes, visitados } = obtener();
  for (const input of dlgAjustes.querySelectorAll('[data-ajuste]')) input.checked = !!ajustes[input.dataset.ajuste];
  mapa.setOpciones(ajustes);
  configurarSonido({ efectos: ajustes.efectos, musica: ajustes.musica });
  activarVoz(ajustes.voz);
  app.querySelectorAll('.js-sellos').forEach((c) => { c.textContent = visitados.length; });
};
dlgAjustes.addEventListener('change', (e) => {
  const clave = e.target.dataset.ajuste;
  if (!clave) return;
  cambiarAjuste(clave, e.target.checked);
  if (clave === 'voz' && e.target.checked) decir('¡Hola! Ahora leo en voz alta.');
  if (clave === 'efectos' && e.target.checked) sfx.pop();
});
alCambiar(sincronizarAjustes);
sincronizarAjustes();

// El audio solo se activa después del primer toque (requisito de los navegadores)
const primerToque = () => {
  desbloquear();
  window.removeEventListener('pointerdown', primerToque, true);
  window.removeEventListener('keydown', primerToque, true);
};
window.addEventListener('pointerdown', primerToque, true);
window.addEventListener('keydown', primerToque, true);

// Diálogos
for (const d of app.querySelectorAll('dialog')) {
  d.addEventListener('click', (e) => {
    if (e.target === d || e.target.closest('[data-cerrar]')) d.close();
  });
}

// ───── Cronómetro ─────
const tiempo = app.querySelector('.js-tiempo');
let segundos = 0;
let corriendo = false;
const pintarTiempo = () => {
  tiempo.textContent = `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`;
};
setInterval(() => {
  if (document.hidden || !corriendo) return;
  segundos += 1;
  pintarTiempo();
}, 1000);
const cronometro = {
  reiniciar() { segundos = 0; corriendo = true; pintarTiempo(); },
  pausar() { corriendo = false; },
};

// ───── Progreso (insignia arriba a la izquierda) ─────
const progresoNumero = app.querySelector('.js-progreso-numero');
const progresoTexto = app.querySelector('.js-progreso-texto');
const progreso = {
  poner(n, total, texto) {
    progresoNumero.textContent = `${n}/${total}`;
    progresoTexto.textContent = texto;
  },
};

// ───── Gestor de modos ─────
const FABRICAS = { explorar: crearExplorar, encuentra: crearEncuentra, avion: crearAvion, arrastra: crearArrastra };
let modo = null;

const ctx = {
  app, mapa, hoja, panel, contenido, zonaMapa, kusi, sfx, confeti, progreso, cronometro,
  actualizarAbajo,
  activo: (m) => m === modo,
  terminar(titulo, resumen, fabrica) {
    cronometro.pausar();
    sfx.victoria();
    confeti.lanzar({ cantidad: 160 });
    const frase = resumen.aciertos === resumen.total
      ? '¡Perfecto! Acertaste todo al primer intento.'
      : `¡Terminaste! Acertaste ${resumen.aciertos} de ${resumen.total} al primer intento.`;
    kusi.decir(frase, 'celebrando');
    contenido.innerHTML = resumenHTML(titulo, resumen);
    contenido.scrollTop = 0;
    if (hoja.activa) {
      hoja.fijarAsomado(null);
      hoja.poner('abierto');
    }
    contenido.onclick = (e) => {
      const a = e.target.closest('[data-resumen]')?.dataset.resumen;
      if (!a) return;
      contenido.onclick = null;
      if (a === 'inicio') irInicio();
      if (a === 'otra') iniciarModo(fabrica());
      if (a === 'practicar') iniciarModo(fabrica(resumen.dificiles));
    };
  },
};

function iniciarModo(nuevo) {
  modo?.detener();
  contenido.onclick = null;
  kusi.callar();
  modo = nuevo;
  pantallaInicio.hidden = true;
  botonInicio.hidden = false;
  nombreModo.textContent = modo.titulo;
  app.querySelector('.barra').classList.add('en-modo');
  hoja.fijarAsomado(null);
  hoja.poner('asomado');
  cronometro.reiniciar();
  modo.iniciar();
  actualizarAbajo();
}

function irInicio() {
  modo?.detener();
  modo = null;
  contenido.onclick = null;
  kusi.callar();
  cronometro.pausar();
  pantallaInicio.hidden = false;
  botonInicio.hidden = true;
  nombreModo.textContent = '';
  app.querySelector('.barra').classList.remove('en-modo');
  pantallaInicio.querySelector('.tarjeta-modo')?.focus({ preventScroll: true });
}

pantallaInicio.addEventListener('click', (e) => {
  const id = e.target.closest('[data-modo]')?.dataset.modo;
  if (!id) return;
  sfx.pop();
  iniciarModo(FABRICAS[id](ctx));
});
botonInicio.addEventListener('click', irInicio);

// Controles del mapa
zonaMapa.addEventListener('click', (e) => {
  const accion = e.target.closest('[data-accion]')?.dataset.accion;
  if (accion === 'acercar') mapa.acercar(1.6);
  if (accion === 'alejar') mapa.acercar(1 / 1.6);
  if (accion === 'centrar') mapa.centrar();
  if (accion === 'ajustes') dlgAjustes.showModal();
});

// El mapa queda listo detrás de la pantalla de bienvenida
progreso.poner(obtener().visitados.length, 12, 'visitados');
requestAnimationFrame(() => mapa.centrar());

// Atajo útil para docentes y pruebas: index.html#modo=avion abre ese juego
const directo = new URLSearchParams(location.hash.slice(1)).get('modo');
if (directo && FABRICAS[directo]) iniciarModo(FABRICAS[directo](ctx));
