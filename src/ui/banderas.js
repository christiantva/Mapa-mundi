// Banderas de Sudamérica dibujadas en SVG por código.
// Proporciones y colores según las especificaciones oficiales (referencia:
// diseños de dominio público de Wikimedia Commons). Los emblemas muy
// detallados (escudo de Ecuador, sello de Paraguay) se dibujan simplificados.
// Bolivia, Perú y Venezuela usan la versión civil (sin escudo), que es la
// bandera nacional de uso común.

let contador = 0;
const uid = () => `b${++contador}`;

const svg = (w, h, cuerpo, titulo) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" style="--r:${(w / h).toFixed(4)}" role="img" aria-label="${titulo}" preserveAspectRatio="xMidYMid meet">${cuerpo}</svg>`;

const franjasH = (w, h, colores) => {
  const alto = h / colores.length;
  return colores.map((c, i) => `<rect y="${(i * alto).toFixed(3)}" width="${w}" height="${(alto + 0.5).toFixed(3)}" fill="${c}"/>`).join('');
};

// Estrella de cinco puntas centrada en (cx, cy) con radio exterior r.
export function estrella(cx, cy, r, fill, rot = -90) {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.382 : r;
    const a = ((rot + i * 36) * Math.PI) / 180;
    p.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return `<polygon points="${p.join(' ')}" fill="${fill}"/>`;
}

// Sol de Mayo (Argentina): 16 rayos rectos y 16 flamígeros con rostro.
function solDeMayo(cx, cy, escala) {
  const recto = 'm396.84 251.31l28.454 61.992s0.4896 1.185 1.28 0.8586c0.7902-0.3267 0.2988-1.5116 0.2988-1.5116l-23.715-63.956m-0.68 24.12c-0.3465 9.4278 5.4526 14.613 4.6943 23.032-0.7569 8.42 3.8673 13.18 4.9396 16.454 1.0733 3.2744-1.16 5.2323-0.198 5.6982 0.96336 0.4662 3.07-2.1207 2.3833-6.7756-0.68675-4.6549-4.2204-6.0368-3.3898-16.32 0.83-10.283-4.206-12.678-2.98-22.058';
  const sombra = 'm404.31 274.41c0.45334 9.0538 5.5867 13.063 4.5787 21.314 2.2133-6.5249-3.1233-11.583-2.82-21.22m-7.6487-23.757l19.487 42.577-16.329-43.887';
  let rayos = '';
  for (let i = 0; i < 16; i++) {
    const a = i * 22.5;
    rayos += `<path transform="rotate(${a} 400 250)" d="${recto}" fill="#f6b40e" stroke="#85340a" stroke-width="1.1"/>`;
    rayos += `<path transform="rotate(${a} 400 250)" d="${sombra}" fill="#85340a"/>`;
  }
  const rostro = `
    <circle cx="400" cy="250" r="27.8" fill="#f6b40e" stroke="#85340a" stroke-width="1.5"/>
    <g fill="#85340a">
      <ellipse cx="390.5" cy="246.2" rx="4.6" ry="2.4" fill="none" stroke="#85340a" stroke-width="1"/>
      <ellipse cx="409.5" cy="246.2" rx="4.6" ry="2.4" fill="none" stroke="#85340a" stroke-width="1"/>
      <circle cx="390.5" cy="246.2" r="1.9"/><circle cx="409.5" cy="246.2" r="1.9"/>
      <path d="M383 243c4-4 10-4.5 14-1.2M417 243c-4-4-10-4.5-14-1.2" fill="none" stroke="#85340a" stroke-width="1.3"/>
      <path d="M398.3 244.5c1.5 3 1.5 6.5-0.7 9.5h4.8c-2.2-3-2.2-6.5-0.7-9.5" fill="none" stroke="#85340a" stroke-width="1.1"/>
      <path d="M393.5 262.5c4 2.2 9 2.2 13 0c-4 4.5-9 4.5-13 0z"/>
      <path d="M396.2 269.6c1.5-2.5 6-2.5 7.6 0" fill="none" stroke="#85340a" stroke-width="1"/>
    </g>`;
  return `<g transform="translate(${cx} ${cy}) scale(${escala}) translate(-400 -250)">${rayos}${rostro}</g>`;
}

// Sol de Mayo de Uruguay: 16 rayos alternados rectos y ondulados.
function solUruguay(cx, cy, escala) {
  let rayos = '';
  for (let i = 0; i < 8; i++) {
    const a = i * 45;
    rayos += `<g transform="rotate(${a})">
      <path d="M0,0 h6 l-6,33 l-6,-33 h6 v33"/>
      <g transform="rotate(22.5)"><path d="M1.5,9 6,12 C-2,25 7,27 0,33 3,26 -3,28 -3,16" stroke-linecap="square"/><path d="M0,11 C-2,24 4.5,28 0,33" fill="none"/></g>
    </g>`;
  }
  const cara = `<g fill="none" stroke="#000" stroke-width="1.1" stroke-linecap="round">
      <path d="M-7-3.5c1.5-1.5 4-1.5 5 0M2-3.5c1.5-1.5 4-1.5 5 0"/>
      <circle cx="-4.5" cy="-1.5" r="0.9" fill="#000"/><circle cx="4.5" cy="-1.5" r="0.9" fill="#000"/>
      <path d="M0-2v4.5h-1.2"/><path d="M-3 5c2 1.3 4 1.3 6 0"/>
    </g>`;
  return `<g transform="translate(${cx} ${cy}) scale(${escala})" fill="#fcd116" stroke="#000" stroke-width="0.6" stroke-miterlimit="20">${rayos}<circle r="11"/>${cara}</g>`;
}

// Ramas de laurel/olivo dibujadas con hojas en bucle (para emblemas).
function rama(cx, cy, r, desde, hasta, lado, color) {
  let hojas = '';
  const n = 9;
  for (let i = 0; i < n; i++) {
    const t = desde + ((hasta - desde) * i) / (n - 1);
    const a = (t * Math.PI) / 180;
    const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    const giro = t + (lado > 0 ? 60 : -60);
    hojas += `<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="${(r * 0.17).toFixed(2)}" ry="${(r * 0.07).toFixed(2)}" transform="rotate(${giro.toFixed(1)} ${x.toFixed(2)} ${y.toFixed(2)})" fill="${color}"/>`;
  }
  return `<path d="M${(cx + r * Math.cos((desde * Math.PI) / 180)).toFixed(2)},${(cy + r * Math.sin((desde * Math.PI) / 180)).toFixed(2)} A${r},${r} 0 0 ${hasta > desde ? 1 : 0} ${(cx + r * Math.cos((hasta * Math.PI) / 180)).toFixed(2)},${(cy + r * Math.sin((hasta * Math.PI) / 180)).toFixed(2)}" fill="none" stroke="${color}" stroke-width="${(r * 0.03).toFixed(2)}"/>${hojas}`;
}

const DIBUJOS = {
  argentina(t) {
    const w = 1400, h = 900;
    return svg(w, h, franjasH(w, h, ['#74acdf', '#ffffff', '#74acdf']) + solDeMayo(700, 450, 1.8), t);
  },

  bolivia(t) {
    const w = 1100, h = 750;
    return svg(w, h, franjasH(w, h, ['#d52b1e', '#f9e300', '#007934']), t);
  },

  brasil(t) {
    // Módulos oficiales: 20 × 14. Escalamos ×10.
    const id = uid();
    const estrellas = [
      // [x, y, tamaño] en coordenadas relativas al centro (unidad = 1/210 de módulo ×10)
      [-600, -132, 1], [-535, 177, 1], [-625, 243, 2], [-463, 132, 4], [-382, 250, 2], [-404, 323, 3],
      [228, -228, 1], [515, 258, 1], [617, 265, 3], [545, 323, 2], [368, 477, 2], [367, 551, 3],
      [441, 419, 3], [500, 382, 2], [365, 405, 3], [-280, 30, 2], [200, -37, 3], [0, 330, 1],
      [85, 184, 2], [0, 118, 2], [-74, 184, 3], [-37, 235, 4], [220, 495, 2], [283, 430, 3],
      [162, 412, 3], [-295, 390, 1], [0, 575, 5],
    ];
    const radio = { 1: 31.5, 2: 26.25, 3: 21, 4: 15, 5: 10.5 };
    const k = 10 / 210; // de unidades de la referencia a nuestras unidades
    const cx = 100, cy = 70;
    const est = estrellas.map(([x, y, s]) => estrella(cx + x * k, cy + y * k, radio[s] * k * 1.1, '#fff')).join('');
    return svg(200, 140, `
      <rect width="200" height="140" fill="#009b3a"/>
      <path d="M17 70 100 17 183 70 100 123z" fill="#fedf00"/>
      <defs>
        <clipPath id="${id}c"><circle cx="100" cy="70" r="35"/></clipPath>
        <path id="${id}t" d="M39.25,69.4 A81.5,81.5 0 0 1 150.58,99.25"/>
      </defs>
      <circle cx="100" cy="70" r="35" fill="#002776"/>
      <path clip-path="url(#${id}c)" fill="#fff" d="M-5,140 A85,85 0 0 1 165,140 H160 A80,80 0 1 0 0,140z"/>
      <text font-family="Nunito, Arial, sans-serif" font-weight="800" font-size="4.4" fill="#009b3a">
        <textPath href="#${id}t" startOffset="50%" text-anchor="middle" textLength="66" lengthAdjust="spacing">ORDEM E PROGRESSO</textPath>
      </text>
      ${est}`, t);
  },

  chile(t) {
    return svg(1500, 1000, `
      <rect width="1500" height="1000" fill="#d52b1e"/>
      <rect width="1500" height="500" fill="#fff"/>
      <rect width="500" height="500" fill="#0039a6"/>
      ${estrella(250, 250, 125, '#fff')}`, t);
  },

  colombia(t) {
    return svg(1500, 1000, `
      <rect width="1500" height="1000" fill="#ce1126"/>
      <rect width="1500" height="750" fill="#003893"/>
      <rect width="1500" height="500" fill="#fcd116"/>`, t);
  },

  ecuador(t) {
    // Escudo simplificado: cóndor, óvalo con el Chimborazo, el río Guayas,
    // el sol y banderas a los lados.
    const id = uid();
    const escudo = `
      <g transform="translate(720 470) scale(1.3)">
        <g fill="#034ea2" stroke="#fdd116" stroke-width="3">
          <path d="M-95,-40 L-150,150 L-110,160 L-62,-20z"/>
          <path d="M95,-40 L150,150 L110,160 L62,-20z"/>
        </g>
        <g fill="#ed1c24"><path d="M-130,85 L-150,150 L-110,160 L-98,105z"/><path d="M130,85 L150,150 L110,160 L98,105z"/></g>
        <path d="M-22,150 L22,150 L14,175 L-14,175z" fill="#8a5a2b"/>
        <defs><clipPath id="${id}o"><ellipse cx="0" cy="40" rx="78" ry="105"/></clipPath></defs>
        <g clip-path="url(#${id}o)">
          <rect x="-80" y="-70" width="160" height="230" fill="#8fd0f5"/>
          <circle cx="0" cy="-20" r="22" fill="#fdd116"/>
          <path d="M-80,90 L-30,-5 L-12,20 L10,-25 L80,85z" fill="#6b8f3c"/>
          <path d="M-8,-12 L10,-25 L26,-2 L12,-8z" fill="#fff"/>
          <rect x="-80" y="85" width="160" height="80" fill="#2a7bc0"/>
          <path d="M-35,110 h60 l-10,14 h-40z" fill="#5a3a1a"/><rect x="-6" y="80" width="5" height="32" fill="#5a3a1a"/>
        </g>
        <ellipse cx="0" cy="40" rx="78" ry="105" fill="none" stroke="#c8a400" stroke-width="7"/>
        <g fill="#3a2a1a">
          <path d="M0,-58 C-30,-70 -80,-110 -150,-100 C-110,-92 -80,-80 -60,-66 C-90,-70 -120,-72 -140,-62 C-100,-58 -60,-52 -30,-45z"/>
          <path d="M0,-58 C30,-70 80,-110 150,-100 C110,-92 80,-80 60,-66 C90,-70 120,-72 140,-62 C100,-58 60,-52 30,-45z"/>
          <ellipse cx="0" cy="-60" rx="22" ry="18"/>
          <circle cx="0" cy="-86" r="12"/>
        </g>
        <path d="M6,-88 l12,4 -12,3z" fill="#e8b000"/><path d="M-6,-94 h12 v-5 h-12z" fill="#fff"/>
      </g>`;
    return svg(1440, 960, `
      <rect width="1440" height="960" fill="#ed1c24"/>
      <rect width="1440" height="720" fill="#034ea2"/>
      <rect width="1440" height="480" fill="#ffdd00"/>
      ${escudo}`, t);
  },

  guyana(t) {
    return svg(500, 300, `
      <rect width="500" height="300" fill="#009e49"/>
      <path d="M0,0 L500,150 L0,300z" fill="#fff"/>
      <path d="M0,13.05 L456,150 L0,286.95z" fill="#fcd116"/>
      <path d="M0,0 L250,150 L0,300z" fill="#000"/>
      <path d="M0,17.5 L220.85,150 L0,282.5z" fill="#ce1126"/>`, t);
  },

  paraguay(t) {
    // Escudo nacional (anverso) simplificado: estrella de mayo, palma y olivo,
    // y la leyenda "REPÚBLICA DEL PARAGUAY".
    const id = uid();
    return svg(600, 330, `
      <rect width="600" height="330" fill="#0038a8"/>
      <rect width="600" height="220" fill="#fff"/>
      <rect width="600" height="110" fill="#d52b1e"/>
      <circle cx="300" cy="165" r="42" fill="#fff" stroke="#000" stroke-width="1.2"/>
      <circle cx="300" cy="165" r="31" fill="none" stroke="#000" stroke-width="0.6"/>
      <defs><path id="${id}r" d="M270.55,182 A34,34 0 1 1 329.45,182"/></defs>
      <text font-family="Nunito, Arial, sans-serif" font-weight="800" font-size="6.4" fill="#000">
        <textPath href="#${id}r" startOffset="50%" text-anchor="middle" textLength="118" lengthAdjust="spacing">REPÚBLICA DEL PARAGUAY</textPath>
      </text>
      ${rama(300, 165, 21, 110, 235, 1, '#007934')}
      ${rama(300, 165, 21, 70, -55, -1, '#007934')}
      ${estrella(300, 165, 10, '#fedf00')}
      <path d="M283,186 q17,8 34,0" fill="none" stroke="#d52b1e" stroke-width="2.4"/>`, t);
  },

  peru(t) {
    return svg(1500, 1000, `
      <rect width="1500" height="1000" fill="#fff"/>
      <rect width="500" height="1000" fill="#d91023"/>
      <rect x="1000" width="500" height="1000" fill="#d91023"/>`, t);
  },

  surinam(t) {
    return svg(900, 600, `
      <rect width="900" height="600" fill="#377e3f"/>
      <rect y="120" width="900" height="360" fill="#fff"/>
      <rect y="180" width="900" height="240" fill="#b40a2d"/>
      ${estrella(450, 311.46, 120, '#ecc81d')}`, t);
  },

  uruguay(t) {
    // 9 franjas (5 blancas y 4 azules) y el Sol de Mayo en el cantón.
    const w = 27, h = 18, f = h / 9;
    let franjas = `<rect width="${w}" height="${h}" fill="#fff"/>`;
    for (let i = 1; i < 9; i += 2) franjas += `<rect x="${i < 5 ? 10 : 0}" y="${(i * f).toFixed(3)}" width="${i < 5 ? 17 : 27}" height="${f}" fill="#0038a8"/>`;
    return svg(w, h, franjas + solUruguay(5, 5, 0.11), t);
  },

  venezuela(t) {
    let estrellas = '';
    for (let i = 0; i < 8; i++) {
      const a = ((-70 + i * 20 - 90) * Math.PI) / 180;
      const x = 90 + 36 * Math.cos(a), y = 84 + 36 * Math.sin(a);
      estrellas += estrella(x, y, 5, '#fff', -90 + (-70 + i * 20));
    }
    return svg(180, 120, `
      <rect width="180" height="120" fill="#cf142b"/>
      <rect width="180" height="80" fill="#00247d"/>
      <rect width="180" height="40" fill="#ffcc00"/>
      ${estrellas}`, t);
  },

  'guayana-francesa'(t) {
    // Se usa la bandera de Francia, porque es un territorio francés.
    return svg(900, 600, `
      <rect width="900" height="600" fill="#ef4135"/>
      <rect width="600" height="600" fill="#fff"/>
      <rect width="300" height="600" fill="#0055a4"/>`, t);
  },
};

export function bandera(id, titulo = 'Bandera') {
  const f = DIBUJOS[id];
  return f ? f(titulo) : '';
}

export const PROPORCION = {
  argentina: 14 / 9, bolivia: 22 / 15, brasil: 10 / 7, chile: 3 / 2, colombia: 3 / 2,
  ecuador: 3 / 2, guyana: 5 / 3, paraguay: 20 / 11, peru: 3 / 2, surinam: 3 / 2,
  uruguay: 3 / 2, venezuela: 3 / 2, 'guayana-francesa': 3 / 2,
};
