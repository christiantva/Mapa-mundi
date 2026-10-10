// Viajeros de Sudamérica — punto de entrada.
import { Mapa2D } from './map/mapa2d.js';
import { Globo3D, webglDisponible } from './map/globo3d.js';
import { Hoja } from './ui/hoja.js';
import { Kusi } from './ui/kusi.js';
import { Confeti } from './ui/confeti.js';
import { ICONOS } from './ui/iconos.js';
import { htmlInicio, pintarSelectores } from './ui/inicio.js';
import { htmlFinal } from './ui/final.js';
import { htmlPasaporte } from './ui/pasaporte.js';
import { htmlDocente, textoDocente } from './ui/docente.js';
import { obtener, alCambiar, cambiarAjuste, actualizar, registrarEstrellas, reiniciarTodo } from './core/estado.js';
import { config, calcularEstrellas } from './core/config.js';
import { registrarPartida, partidasSesion, limpiarSesion } from './core/sesion.js';
import { desbloquear, configurar as configurarSonido, efectos as sfx } from './core/sonido.js';
import { activarVoz, decir, vozDisponible, callar } from './core/voz.js';
import { PAISES_POR_ID } from './data/paises.js';
import { crearExplorar } from './modos/explorar.js';
import { crearEncuentra } from './modos/encuentra.js';
import { crearAvion } from './modos/avion.js';
import { crearArrastra } from './modos/arrastra.js';

const app = document.getElementById('app');
const hay3D = webglDisponible();

app.innerHTML = `
  <header class="barra">
    <button type="button" class="logo js-logo" aria-label="Viajeros de Sudamérica. Docentes: mantener presionado 3 segundos.">
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle class="logo-progreso" cx="24" cy="24" r="22.5" fill="none" stroke="#F2C230" stroke-width="3" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" transform="rotate(-90 24 24)"/>
        <circle cx="24" cy="24" r="20" fill="#fbf8ef" stroke="#23302a" stroke-width="2.5"/>
        <circle cx="24" cy="24" r="14.5" fill="none" stroke="#5ba829" stroke-width="2" stroke-dasharray="3 3"/>
        <path d="M14 27.5l20-9.5-6 13-3.2-4.5z" fill="#f2c230" stroke="#23302a" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    </button>
    <div class="barra-titulos">
      <h1>Países y capitales de Sudamérica</h1>
      <span class="barra-modo js-nombre-modo"></span>
    </div>
    <div class="barra-acciones">
      <button type="button" class="pasaporte-mini js-pasaporte" aria-label="Abrir mi pasaporte">${ICONOS.pasaporte}<span><span class="js-sellos">0</span>/12</span></button>
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
      <div class="globo-contenedor" hidden></div>

      <div class="progreso" aria-live="polite">
        <span class="progreso-numero js-progreso-numero">0/12</span>
        <span class="progreso-texto js-progreso-texto">visitados</span>
      </div>

      <div class="controles-mapa">
        ${hay3D ? '<button type="button" class="boton-redondo boton-claro boton-vista" data-accion="vista" aria-pressed="false" aria-label="Ver el globo 3D"><span class="js-vista">3D</span></button>' : ''}
        <button type="button" class="boton-redondo boton-claro" data-accion="acercar" aria-label="Acercar el mapa">${ICONOS.mas}</button>
        <button type="button" class="boton-redondo boton-claro" data-accion="alejar" aria-label="Alejar el mapa">${ICONOS.menos}</button>
        <button type="button" class="boton-redondo boton-verde" data-accion="centrar" aria-label="Centrar el mapa en Sudamérica">${ICONOS.ubicacion}</button>
      </div>

      <div class="barra-inferior">
        <div class="cronometro js-cronometro" role="timer" aria-label="Tiempo de juego">
          ${ICONOS.reloj}<span class="js-tiempo">0:00</span>
        </div>
        <button type="button" class="boton-redondo boton-claro" data-accion="ajustes" aria-label="Ajustes">${ICONOS.ajustes}</button>
      </div>
    </section>
    ${htmlInicio()}
    <section class="final" hidden></section>
  </main>

  <dialog class="dialogo" id="dialogo-bandera" aria-label="Bandera ampliada">
    <div class="dialogo-cuerpo"></div>
    <button type="button" class="boton-redondo boton-claro dialogo-cerrar" data-cerrar aria-label="Cerrar">${ICONOS.cerrar}</button>
  </dialog>

  <dialog class="dialogo dialogo-pasaporte" id="dialogo-pasaporte" aria-labelledby="titulo-pasaporte">
    <div class="dialogo-cuerpo"></div>
    <button type="button" class="boton-redondo boton-claro dialogo-cerrar" data-cerrar aria-label="Cerrar">${ICONOS.cerrar}</button>
  </dialog>

  <dialog class="dialogo dialogo-docente" id="dialogo-docente" aria-labelledby="titulo-docente">
    <div class="dialogo-cuerpo"></div>
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

const $ = (s) => app.querySelector(s);
const panel = $('#panel');
const contenido = panel.querySelector('.panel-contenido');
const zonaMapa = $('.zona-mapa');
const escenario = $('.escenario');
const pantallaInicio = $('.inicio');
const pantallaFinal = $('.final');
const botonInicio = $('.js-boton-inicio');
const nombreModo = $('.js-nombre-modo');
const barra = $('.barra');

// Alto ocupado abajo (hoja del celular + bandeja de banderas), para ubicar
// a Kusi, el cronómetro y el encuadre del mapa.
let hoja = null;
let globo = null;
function altoAbajo() {
  const bandeja = zonaMapa.querySelector('.bandeja');
  return (hoja?.activa ? hoja.altoVisible() : 0) + (bandeja ? bandeja.offsetHeight : 0);
}
function actualizarAbajo() {
  escenario.style.setProperty('--abajo', `${altoAbajo()}px`);
  escenario.classList.toggle('hoja-abierta', !!hoja?.activa && hoja.estado === 'abierto');
  if (globo?.activo) globo.redimensionar();
}
hoja = new Hoja(panel, panel.querySelector('.hoja-asa'), { alCambiar: actualizarAbajo });

const mapa = new Mapa2D($('.mapa-contenedor'), {
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
const confetiFinal = new Confeti(pantallaFinal);
actualizarAbajo();

// ───── Globo 3D (si el equipo tiene WebGL) ─────
let vista = '2d';
const botonVista = $('[data-accion="vista"]');
function cambiarVista(nueva) {
  if (!globo && nueva === '3d') {
    try {
      globo = new Globo3D($('.globo-contenedor'), {
        alSeleccionar: (id) => mapa.alSeleccionar(id, { origen: 'globo' }),
        margenAbajo: () => (hoja.activa ? hoja.altoVisible() : 0) + 20,
        alLento: () => kusi.decir('Tu equipo va un poco lento con el globo. ¿Volvemos al mapa 2D?', 'pensando', {
          accion: { texto: 'Volver al mapa 2D', alHacer: () => cambiarVista('2d') },
        }),
      });
    } catch {
      kusi.decir('Este equipo no puede mostrar el globo 3D. Seguimos con el mapa.', 'pensando');
      botonVista?.remove();
      return;
    }
  }
  vista = nueva;
  const es3D = vista === '3d';
  if (es3D) {
    globo.sincronizar({ seleccionado: mapa.seleccionado, juego: mapa.juego, visitados: [...mapa.visitados], opciones: mapa.opciones });
    globo.autoGiro = modo?.id === 'explorar';
    globo.activar();
  } else globo?.desactivar();
  $('.mapa-contenedor').classList.toggle('oculto-3d', es3D);
  zonaMapa.classList.toggle('vista-3d', es3D);
  if (botonVista) {
    botonVista.setAttribute('aria-pressed', String(es3D));
    botonVista.setAttribute('aria-label', es3D ? 'Volver al mapa 2D' : 'Ver el globo 3D');
    botonVista.querySelector('.js-vista').textContent = es3D ? '2D' : '3D';
  }
}
// Lo que los modos le piden al mapa también se refleja en el globo
for (const m of ['seleccionar', 'animarAcierto', 'animarError', 'mostrarRespuesta', 'setJuego', 'setVisitados', 'setOpciones', 'centrar']) {
  const original = mapa[m].bind(mapa);
  mapa[m] = (...args) => {
    const r = original(...args);
    if (globo?.activo) globo[m](...args);
    return r;
  };
}
const aPantalla2D = mapa.aPantalla.bind(mapa);
mapa.aPantalla = (...a) => (globo?.activo ? null : aPantalla2D(...a));

// ───── Ajustes ─────
const dlgAjustes = $('#dialogo-ajustes');
if (!vozDisponible()) dlgAjustes.querySelector('[data-ajuste="voz"]').closest('label').hidden = true;
const sincronizarAjustes = () => {
  const { ajustes, visitados, ciclo, nivel } = obtener();
  for (const input of dlgAjustes.querySelectorAll('[data-ajuste]')) input.checked = !!ajustes[input.dataset.ajuste];
  mapa.setOpciones(ajustes);
  configurarSonido({ efectos: ajustes.efectos, musica: ajustes.musica });
  activarVoz(ajustes.voz);
  app.querySelectorAll('.js-sellos').forEach((c) => { c.textContent = visitados.length; });
  pintarSelectores(pantallaInicio, ciclo, nivel);
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

// Diálogos: se cierran tocando fuera o con [data-cerrar]
for (const d of app.querySelectorAll('dialog')) {
  d.addEventListener('click', (e) => {
    if (e.target === d || e.target.closest('[data-cerrar]')) d.close();
  });
}

// ───── Reloj: tiempo total de la partida y cuenta regresiva por pregunta ─────
const elCrono = $('.js-cronometro');
const elTiempo = $('.js-tiempo');
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const reloj = {
  segundos: 0, corriendo: false, restante: null, alFin: null,
  pintar() {
    const cuenta = this.restante !== null;
    elTiempo.textContent = mmss(cuenta ? this.restante : this.segundos);
    elCrono.classList.toggle('cuenta', cuenta);
    elCrono.classList.toggle('urgente', cuenta && this.restante <= 5);
    elCrono.setAttribute('aria-label', cuenta ? `Te quedan ${this.restante} segundos` : 'Tiempo de juego');
  },
  reiniciar() { this.segundos = 0; this.corriendo = true; this.restante = null; this.pintar(); },
  pausar() { this.corriendo = false; this.restante = null; this.pintar(); },
  cuentaRegresiva(seg, alFin) { this.restante = seg; this.alFin = alFin; this.pintar(); },
  detener() { this.restante = null; this.alFin = null; this.pintar(); },
};
setInterval(() => {
  if (document.hidden || !reloj.corriendo || app.querySelector('dialog[open]')) return;
  reloj.segundos += 1;
  if (reloj.restante !== null) {
    reloj.restante -= 1;
    if (reloj.restante <= 0) {
      const f = reloj.alFin;
      reloj.detener();
      f?.();
      return;
    }
  }
  reloj.pintar();
}, 1000);

// ───── Progreso (insignia arriba a la izquierda) ─────
const progreso = {
  poner(n, total, texto) {
    $('.js-progreso-numero').textContent = `${n}/${total}`;
    $('.js-progreso-texto').textContent = texto;
  },
};

// ───── Gestor de modos ─────
const FABRICAS = { explorar: crearExplorar, encuentra: crearEncuentra, avion: crearAvion, arrastra: crearArrastra };
let modo = null;

const ctx = {
  app, mapa, hoja, panel, contenido, zonaMapa, kusi, sfx, confeti, progreso, reloj,
  actualizarAbajo,
  activo: (m) => m === modo,
  terminar(idModo, titulo, resumen, fabrica) {
    reloj.pausar();
    const { ciclo, nivel } = config();
    const r = { ...resumen, dificiles: resumen.dificiles.filter((id) => PAISES_POR_ID[id]) };
    const estrellas = calcularEstrellas(r, nivel);
    const record = registrarEstrellas(`${idModo}|${ciclo}|${nivel}`, estrellas);
    registrarPartida({ modo: idModo, titulo, ciclo, nivel, estrellas, ...r });
    kusi.callar();
    pantallaFinal.innerHTML = htmlFinal({ titulo, resumen: r, estrellas, record, ciclo, nivel });
    pantallaFinal.hidden = false;
    pantallaFinal.querySelector('.boton')?.focus({ preventScroll: true });
    sfx.victoria();
    setTimeout(() => confetiFinal.lanzar({ cantidad: 60 * estrellas, fuerza: 1.2 }), 300);
    const frase = r.aciertos === r.total ? '¡Perfecto! Acertaste todo al primer intento.' : `¡Terminaste! Acertaste ${r.aciertos} de ${r.total}.`;
    decir(`${frase} Ganaste ${estrellas} ${estrellas === 1 ? 'estrella' : 'estrellas'}.`);
    pantallaFinal.onclick = (e) => {
      const a = e.target.closest('[data-final]')?.dataset.final;
      if (!a) return;
      pantallaFinal.hidden = true;
      if (a === 'inicio') irInicio();
      if (a === 'otra') iniciarModo(idModo, fabrica());
      if (a === 'practicar') iniciarModo(idModo, fabrica(r.dificiles));
    };
  },
};

function iniciarModo(id, nuevo) {
  modo?.detener();
  kusi.callar();
  pantallaFinal.hidden = true;
  modo = nuevo;
  modo.id = id;
  pantallaInicio.hidden = true;
  botonInicio.hidden = false;
  nombreModo.textContent = modo.titulo;
  barra.classList.add('en-modo');
  hoja.fijarAsomado(null);
  hoja.poner('asomado');
  reloj.reiniciar();
  // El avión y las banderas usan el mapa 2D
  if (botonVista) {
    botonVista.disabled = !modo.permite3D;
    botonVista.title = modo.permite3D ? '' : 'Este juego se juega en el mapa 2D';
  }
  if (!modo.permite3D && vista === '3d') cambiarVista('2d');
  if (globo) globo.autoGiro = id === 'explorar';
  modo.iniciar();
  if (vista === '3d') cambiarVista('3d');
  actualizarAbajo();
}

function irInicio() {
  modo?.detener();
  modo = null;
  kusi.callar();
  reloj.pausar();
  pantallaFinal.hidden = true;
  pantallaInicio.hidden = false;
  botonInicio.hidden = true;
  nombreModo.textContent = '';
  barra.classList.remove('en-modo');
  progreso.poner(obtener().visitados.length, 12, 'visitados');
  pantallaInicio.querySelector('.tarjeta-modo')?.focus({ preventScroll: true });
}

pantallaInicio.addEventListener('click', (e) => {
  const ciclo = e.target.closest('[data-ciclo]')?.dataset.ciclo;
  const nivel = e.target.closest('[data-nivel]')?.dataset.nivel;
  const id = e.target.closest('[data-modo]')?.dataset.modo;
  if (ciclo) {
    sfx.pop();
    // En III ciclo la voz de Kusi viene activada (aún están aprendiendo a leer)
    const cambios = { ciclo };
    if (ciclo === 'III' && vozDisponible()) cambios.ajustes = { ...obtener().ajustes, voz: true };
    actualizar(cambios);
    if (ciclo === 'III') decir('¡Hola! Yo te leo todo en voz alta.');
  }
  if (nivel) {
    sfx.pop();
    actualizar({ nivel });
  }
  if (id) {
    sfx.pop();
    iniciarModo(id, FABRICAS[id](ctx));
  }
});
// Flechas para moverse dentro de cada grupo de opciones (radiogroup)
pantallaInicio.addEventListener('keydown', (e) => {
  const actual = e.target.closest('[role="radio"]');
  if (!actual || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
  e.preventDefault();
  const grupo = [...actual.parentElement.querySelectorAll('[role="radio"]')];
  const paso = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
  const sig = grupo[(grupo.indexOf(actual) + paso + grupo.length) % grupo.length];
  sig.focus();
  sig.click();
});
botonInicio.addEventListener('click', irInicio);

// ───── Pasaporte ─────
const dlgPasaporte = $('#dialogo-pasaporte');
$('.js-pasaporte').addEventListener('click', () => {
  dlgPasaporte.querySelector('.dialogo-cuerpo').innerHTML = htmlPasaporte(obtener());
  dlgPasaporte.showModal();
});

// ───── Modo docente: mantener presionado el logo 3 segundos ─────
const dlgDocente = $('#dialogo-docente');
const logo = $('.js-logo');
let tDocente = null;
const abrirDocente = () => {
  logo.classList.remove('presionando');
  sfx.sello();
  dlgDocente.querySelector('.dialogo-cuerpo').innerHTML = htmlDocente(partidasSesion(), obtener());
  dlgDocente.showModal();
};
const empezarPresion = () => {
  clearTimeout(tDocente);
  logo.classList.add('presionando');
  tDocente = setTimeout(abrirDocente, 3000);
};
const cancelarPresion = () => {
  clearTimeout(tDocente);
  logo.classList.remove('presionando');
};
logo.addEventListener('pointerdown', empezarPresion);
logo.addEventListener('pointerup', cancelarPresion);
logo.addEventListener('pointerleave', cancelarPresion);
logo.addEventListener('pointercancel', cancelarPresion);
logo.addEventListener('contextmenu', (e) => e.preventDefault());
logo.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); empezarPresion(); } });
logo.addEventListener('keyup', (e) => { if (e.key === 'Enter' || e.key === ' ') cancelarPresion(); });
dlgDocente.addEventListener('click', async (e) => {
  const a = e.target.closest('[data-docente]')?.dataset.docente;
  const confirmar = dlgDocente.querySelector('.docente-confirmar');
  if (a === 'reiniciar') confirmar.hidden = false;
  if (a === 'cancelar') confirmar.hidden = true;
  if (a === 'confirmar') {
    callar();
    reiniciarTodo();
    limpiarSesion();
    dlgDocente.close();
    irInicio();
  }
  if (a === 'copiar') {
    try {
      await navigator.clipboard.writeText(textoDocente(partidasSesion()));
      e.target.textContent = '¡Copiado!';
    } catch {
      e.target.textContent = 'No se pudo copiar';
    }
  }
});

// ───── Controles del mapa ─────
zonaMapa.addEventListener('click', (e) => {
  const accion = e.target.closest('[data-accion]')?.dataset.accion;
  const en3D = globo?.activo;
  if (accion === 'acercar') (en3D ? globo.acercar(1.4) : mapa.acercar(1.6));
  if (accion === 'alejar') (en3D ? globo.acercar(1 / 1.4) : mapa.acercar(1 / 1.6));
  if (accion === 'centrar') mapa.centrar();
  if (accion === 'ajustes') dlgAjustes.showModal();
  if (accion === 'vista') cambiarVista(vista === '3d' ? '2d' : '3d');
});

// El mapa queda listo detrás de la pantalla de bienvenida
progreso.poner(obtener().visitados.length, 12, 'visitados');
requestAnimationFrame(() => mapa.centrar());

// Atajo útil para docentes y pruebas: index.html#modo=avion abre ese juego
const directo = new URLSearchParams(location.hash.slice(1)).get('modo');
if (directo && FABRICAS[directo]) iniciarModo(directo, FABRICAS[directo](ctx));
