// ─────────────────────────────────────────────────────────────────────────────
// Datos de los 12 países de Sudamérica (y la nota de la Guayana Francesa).
// Este es el único archivo que hace falta editar para cambiar textos o cifras.
//
// Cifras redondeadas para niños. TODOS los datos fueron verificados en la
// Fase 5 con fuentes reales: institutos oficiales de estadística, constituciones,
// leyes, listas de la UNESCO, CIA World Factbook y enciclopedias. La lista
// completa de fuentes por país está en FUENTES (data/fuentes.js) y en
// docs/investigacion-datos.md. Donde las fuentes no coinciden, se indica.
//
// Campos:
//   capitales[]   { nombre, rol?, lon, lat, rotulo? }  (Bolivia tiene dos;
//                 rotulo: 'izq' | 'arr' | 'abj' indica dónde va el nombre)
//   poblacion     { texto, anio, fuente }  (fuente oficial; ver data/fuentes.js)
//   superficie    km² (número) — se muestra con separador de miles
//   limitrofes[]  claves de otros países (o 'guayana-francesa', 'panama')
//   oceanos[]     vacío si el país no tiene mar
//   etiqueta      dónde escribir el nombre en el mapa (lon, lat, giro en grados)
//   color         color de atlas del país en el mapa
//   ubicacion     frase corta para pistas: dónde está
//   pistas[]      pistas cada vez más claras (para los modos de juego)
// ─────────────────────────────────────────────────────────────────────────────

export const PAISES = [
  {
    id: 'argentina',
    nombre: 'Argentina',
    nombreOficial: 'República Argentina',
    capitales: [{ nombre: 'Buenos Aires', lon: -58.38, lat: -34.6, rotulo: 'izq' }],
    poblacion: { texto: '45,9 millones', anio: 2022, fuente: 'INDEC, Censo 2022 (resultados definitivos: 45 892 285)' },
    superficie: 2780400, // CIA World Factbook (parte continental, sin la Antártida)
    idiomas: ['castellano'], // idioma oficial de hecho (CIA World Factbook)
    moneda: 'peso argentino',
    limitrofes: ['chile', 'bolivia', 'paraguay', 'brasil', 'uruguay'],
    oceanos: ['Atlántico'],
    regiones: ['Los Andes', 'El Gran Chaco', 'La Mesopotamia (entre los ríos Paraná y Uruguay)', 'La Pampa', 'La Patagonia'],
    relieve: 'Al oeste se elevan los Andes con el Aconcagua (6961 m), la montaña más alta de América. Al centro está la Pampa, una gran llanura muy buena para el cultivo y la ganadería.', // Aconcagua 6960,8 m: medición IGN 2012
    plato: { nombre: 'Asado', detalle: 'Carne cocinada sobre brasas en la parrilla, una costumbre que viene de los gauchos.' },
    animal: { nombre: 'Hornero', detalle: 'Fue elegido ave nacional en 1928 en una encuesta a escolares. Hace su nido de barro con forma de horno.' },
    lugar: { nombre: 'Cataratas del Iguazú', detalle: 'Unos 275 saltos de agua en la frontera con Brasil. Son Patrimonio de la Humanidad (UNESCO, 1984).' },
    fiesta: { nombre: 'Día de la Tradición', detalle: 'Cada 10 de noviembre se recuerda el nacimiento de José Hernández, autor del poema gaucho Martín Fierro.' },
    datoCurioso: 'En Argentina está el Aconcagua, la montaña más alta de América: ¡mide casi 7 kilómetros de alto! Todas las montañas más altas que él están en Asia.',
    descripcion: 'Argentina es el segundo país más grande de Sudamérica. Tiene montañas altísimas, llanuras enormes y glaciares en el sur. Es famosa por el tango, que es Patrimonio de la Humanidad.',
    notaExtra: 'Argentina reclama como suyas las islas Malvinas, que hoy están administradas por el Reino Unido.', // así lo describe el CIA World Factbook
    bandera: { descripcion: 'Tres franjas horizontales: celeste, blanca y celeste. En el centro está el Sol de Mayo.' },
    color: 'lavanda',
    etiqueta: { lon: -65.5, lat: -36.5 },
    ubicacion: 'Está al sur, junto al océano Atlántico.',
    pistas: ['Está al sur de Sudamérica, al lado de Chile.', 'Es muy grande y llega casi hasta la punta sur del continente.', 'Está junto al océano Atlántico, al este de la cordillera de los Andes.'],
  },
  {
    id: 'bolivia',
    nombre: 'Bolivia',
    nombreOficial: 'Estado Plurinacional de Bolivia',
    capitales: [
      { nombre: 'Sucre', rol: 'capital constitucional', lon: -65.26, lat: -19.04 },
      { nombre: 'La Paz', rol: 'sede de gobierno', lon: -68.12, lat: -16.5, rotulo: 'izq' },
    ],
    notaCapital: 'Bolivia tiene dos ciudades principales. Sucre es la capital que dice su Constitución. En La Paz trabajan el presidente y los congresistas, por eso se llama sede de gobierno.',
    poblacion: { texto: '11,4 millones', anio: 2024, fuente: 'INE Bolivia, Censo 2024 (resultados finales: 11 365 333)' },
    superficie: 1098581,
    idiomas: ['castellano', 'quechua', 'aimara', 'guaraní', 'y otras 33 lenguas originarias'], // Constitución, art. 5: castellano y 36 idiomas de los pueblos indígenas
    moneda: 'boliviano',
    limitrofes: ['peru', 'brasil', 'paraguay', 'argentina', 'chile'],
    oceanos: [],
    regiones: ['Altiplano', 'Valles y yungas', 'Llanos orientales (Amazonía y Chaco)'],
    relieve: 'Al oeste está el Altiplano, una meseta muy alta entre dos cordilleras. Allí están el lago Titicaca, que comparte con el Perú, y el Salar de Uyuni. Al este hay llanos y selva.',
    plato: { nombre: 'Salteña', detalle: 'Empanada jugosa rellena de carne, papa y ají.' },
    animal: { nombre: 'Llama', detalle: 'Es símbolo nacional de Bolivia, junto con el cóndor andino. Vive en el Altiplano y da lana.' },
    lugar: { nombre: 'Salar de Uyuni', detalle: 'Un desierto blanco de sal de unos 10 582 km², a 3656 m de altura.' },
    fiesta: { nombre: 'Carnaval de Oruro', detalle: 'Más de 28 000 bailarines desfilan con trajes de colores; el baile principal es la diablada. Es Patrimonio de la Humanidad (UNESCO).' },
    datoCurioso: 'El Salar de Uyuni es el desierto de sal más grande del mundo, según los Récords Guinness. ¡Y está a 3656 metros de altura!',
    descripcion: 'Bolivia está en el centro de Sudamérica y no tiene salida al mar. Tiene montañas, un altiplano muy alto y selva. Allí viven muchos pueblos originarios con sus propias lenguas.',
    bandera: { descripcion: 'Tres franjas horizontales: roja, amarilla y verde. La bandera del Estado lleva además el escudo en el centro.' },
    color: 'rosado',
    etiqueta: { lon: -63.4, lat: -15.4 },
    ubicacion: 'Está en el centro y no tiene mar.',
    pistas: ['No tiene mar: está rodeada de otros países.', 'Está al sureste del Perú. Compartimos con ella el lago Titicaca.', 'Está entre el Perú, Brasil, Paraguay, Argentina y Chile.'],
  },
  {
    id: 'brasil',
    nombre: 'Brasil',
    nombreOficial: 'República Federativa del Brasil',
    capitales: [{ nombre: 'Brasilia', lon: -47.88, lat: -15.79 }],
    poblacion: { texto: '213 millones', anio: 2025, fuente: 'IBGE, estimación al 1 de julio de 2025 (213 421 037)' },
    superficie: 8510000, // IBGE: 8 510 417,771 km² (redondeado)
    idiomas: ['portugués'],
    moneda: 'real',
    limitrofes: ['uruguay', 'argentina', 'paraguay', 'bolivia', 'peru', 'colombia', 'venezuela', 'guyana', 'surinam', 'guayana-francesa'],
    oceanos: ['Atlántico'],
    regiones: ['Amazonía', 'Cerrado', 'Caatinga', 'Mata Atlántica', 'Pantanal', 'Pampa'], // los 6 biomas del IBGE
    relieve: 'Al norte está la llanura del río Amazonas, cubierta de selva. Al centro y al sur hay mesetas y sierras bajas. Su punto más alto es el Pico da Neblina (2995 m).', // IBGE 2016: 2995,30 m
    plato: { nombre: 'Feijoada', detalle: 'Guiso de frejol negro con carne de cerdo, servido con arroz, col y naranja.' },
    animal: { nombre: 'Sabiá-laranjeira', detalle: 'Pájaro de pecho anaranjado considerado el ave nacional. Un decreto de 2002 lo celebra en el Día del Ave, el 5 de octubre.' },
    lugar: { nombre: 'Cristo Redentor', detalle: 'Gran estatua sobre el cerro Corcovado, en Río de Janeiro. Sus paisajes son Patrimonio de la Humanidad (UNESCO, 2012).' },
    fiesta: { nombre: 'Carnaval de Río', detalle: 'Las escuelas de samba desfilan y compiten en el Sambódromo con música, baile y carros alegóricos.' },
    datoCurioso: 'Brasil es tan grande que ocupa casi la mitad de Sudamérica. Limita con todos los países del continente, menos con Chile y Ecuador.',
    descripcion: 'Brasil es el país más grande y con más habitantes de Sudamérica. Allí está cerca del 60 % de la selva amazónica. Es el único país de Sudamérica donde se habla portugués.',
    bandera: { descripcion: 'Fondo verde con un rombo amarillo. En el centro, un círculo azul con 27 estrellas y la frase "Ordem e Progresso" (Orden y Progreso).' },
    color: 'verde',
    etiqueta: { lon: -51.5, lat: -9.5 },
    ubicacion: 'Es el país más grande, al este.',
    pistas: ['Es el país más grande de Sudamérica.', 'Está al este, junto al océano Atlántico.', 'Allí está la mayor parte de la selva amazónica.'],
  },
  {
    id: 'chile',
    nombre: 'Chile',
    nombreOficial: 'República de Chile',
    capitales: [{ nombre: 'Santiago', lon: -70.65, lat: -33.45, rotulo: 'izq' }],
    poblacion: { texto: '18,5 millones', anio: 2024, fuente: 'INE Chile, Censo 2024 (18 480 432 personas censadas)' },
    superficie: 756102, // CIA World Factbook (sin el territorio antártico que reclama)
    idiomas: ['castellano'],
    moneda: 'peso chileno',
    limitrofes: ['peru', 'bolivia', 'argentina'],
    oceanos: ['Pacífico'],
    regiones: ['Norte Grande (desierto)', 'Norte Chico', 'Zona Central', 'Zona Sur', 'Zona Austral (Patagonia)', 'Chile insular'],
    relieve: 'Es una franja larga y angosta entre los Andes y el océano Pacífico. Al norte está el desierto de Atacama y al sur hay lagos, glaciares y fiordos. Su cumbre más alta es el Ojos del Salado (6893 m).',
    plato: { nombre: 'Pastel de choclo', detalle: 'Pastel horneado de choclo molido con carne, pollo, aceitunas y huevo duro.' },
    animal: { nombre: 'Huemul', detalle: 'Ciervo del sur de Chile. Es símbolo nacional y aparece en el escudo junto al cóndor.' },
    lugar: { nombre: 'Isla de Pascua (Rapa Nui)', detalle: 'Isla en medio del Pacífico con enormes estatuas de piedra llamadas moáis.' },
    fiesta: { nombre: 'Fiestas Patrias', detalle: 'En septiembre se celebra la patria bailando cueca, que es la danza nacional desde 1979.' },
    datoCurioso: 'Chile mide unos 4300 kilómetros de largo, pero en promedio solo unos 177 de ancho. ¡Es como una cinta pegada al mar!',
    descripcion: 'Chile es un país largo y delgado, al sur del Perú, junto al océano Pacífico. Tiene uno de los desiertos más secos del mundo y, en el sur, bosques y glaciares.',
    bandera: { descripcion: 'Dos franjas: blanca arriba y roja abajo. Arriba a la izquierda, un cuadrado azul con una estrella blanca.' },
    color: 'amarillo',
    etiqueta: { lon: -71.2, lat: -27.5, giro: -86 },
    ubicacion: 'Está al sur, pegadito al océano Pacífico.',
    pistas: ['Está al sur, pegadito al océano Pacífico.', 'Es largo y delgado como una cinta.', 'Está al sur del Perú, entre los Andes y el mar.'],
  },
  {
    id: 'colombia',
    nombre: 'Colombia',
    nombreOficial: 'República de Colombia',
    capitales: [{ nombre: 'Bogotá', lon: -74.07, lat: 4.71, rotulo: 'izq' }],
    poblacion: { texto: '53 millones', anio: 2025, fuente: 'DANE, proyecciones actualizadas en julio de 2025 (base: Censo 2018)' },
    superficie: 1141748, // DANE (territorio continental e insular)
    idiomas: ['castellano', 'y lenguas indígenas en sus territorios'],
    moneda: 'peso colombiano',
    limitrofes: ['panama', 'venezuela', 'brasil', 'peru', 'ecuador'],
    oceanos: ['Pacífico', 'Atlántico (mar Caribe)'],
    regiones: ['Andina', 'Caribe', 'Pacífica', 'Orinoquía', 'Amazonía', 'Insular'],
    relieve: 'Los Andes se dividen en tres cordilleras que cruzan el país. Al norte, junto al mar Caribe, está la Sierra Nevada de Santa Marta. Al este hay llanos y selva amazónica.',
    plato: { nombre: 'Bandeja paisa', detalle: 'Plato abundante de Antioquia con frejoles, arroz, carne, chicharrón, huevo, plátano, palta y arepa.' },
    animal: { nombre: 'Cóndor andino', detalle: 'Es el símbolo nacional de Colombia. Vuela muy alto sobre las montañas.' },
    lugar: { nombre: 'Cartagena de Indias', detalle: 'Puerto con murallas y fortalezas junto al mar Caribe. Es Patrimonio de la Humanidad (UNESCO, 1984).' },
    fiesta: { nombre: 'Carnaval de Barranquilla', detalle: 'Cuatro días de disfraces, máscaras y música antes de la Cuaresma. Es Patrimonio de la Humanidad (UNESCO).' },
    datoCurioso: 'Colombia es el único país de Sudamérica con costas en el océano Pacífico y en el mar Caribe. ¡Y es el país con más tipos de aves del mundo: cerca de 1968 especies!',
    descripcion: 'Colombia está en la esquina noroeste de Sudamérica y es la puerta hacia Centroamérica. Tiene playas en dos mares, montañas, llanos y selva. Su paisaje cafetero es Patrimonio de la Humanidad.',
    bandera: { descripcion: 'Tres franjas horizontales: amarilla (la más ancha, ocupa la mitad), azul y roja.' },
    color: 'amarillo',
    etiqueta: { lon: -72.4, lat: 1.9 },
    ubicacion: 'Está al norte, junto a Panamá y al mar Caribe.',
    pistas: ['Está al norte de Sudamérica.', 'Tiene costa en el mar Caribe y en el océano Pacífico.', 'Limita con Panamá, que ya es Centroamérica.'],
  },
  {
    id: 'ecuador',
    nombre: 'Ecuador',
    nombreOficial: 'República del Ecuador',
    capitales: [{ nombre: 'Quito', lon: -78.47, lat: -0.18, rotulo: 'izq' }],
    poblacion: { texto: '16,9 millones', anio: 2022, fuente: 'INEC, Censo 2022 (16 938 986)' },
    superficie: 256370, // Cancillería del Ecuador. Ojo: el CIA World Factbook da 283 561 km²
    idiomas: ['castellano', 'kichwa y shuar (idiomas oficiales de relación intercultural)'],
    moneda: 'dólar estadounidense',
    limitrofes: ['colombia', 'peru'],
    oceanos: ['Pacífico'],
    regiones: ['Costa', 'Sierra', 'Amazonía', 'Región Insular (islas Galápagos)'],
    relieve: 'La cordillera de los Andes cruza el país con muchos volcanes, como el Chimborazo (6263 m) y el Cotopaxi. Al oeste está la costa y al este, la selva amazónica.', // Chimborazo 6263,47 m: IGM e IRD, 2016
    plato: { nombre: 'Encebollado', detalle: 'Caldo de pescado con yuca y cebolla curtida en limón, típico de la costa.' },
    animal: { nombre: 'Cóndor andino', detalle: 'Es el símbolo nacional de Ecuador y aparece en lo alto de su escudo.' },
    lugar: { nombre: 'Islas Galápagos', detalle: 'Islas con animales que no viven en ningún otro lugar del mundo. Fueron el primer Patrimonio de la Humanidad (UNESCO, 1978).' },
    fiesta: { nombre: 'Inti Raymi', detalle: 'Fiesta andina del sol en junio, para agradecer a la Pachamama por la cosecha.' },
    datoCurioso: 'Ecuador significa «línea ecuatorial» en castellano, porque esa línea cruza el país. Y la cima del Chimborazo es el punto de la Tierra más alejado de su centro.',
    descripcion: 'Ecuador es un país pequeño del noroeste de Sudamérica, junto al Perú. Por él pasa la línea ecuatorial. Tiene costa, sierra, selva y las islas Galápagos.',
    bandera: { descripcion: 'Tres franjas: amarilla (la mitad), azul y roja. En el centro está el escudo con un cóndor y el volcán Chimborazo.' },
    color: 'rosado',
    etiqueta: { lon: -78.2, lat: -2.5 },
    ubicacion: 'Está al norte del Perú, sobre la línea ecuatorial.',
    pistas: ['Es nuestro vecino del norte.', 'Por allí pasa la línea ecuatorial, ¡por eso se llama así!', 'Está entre Colombia y el Perú, junto al océano Pacífico.'],
  },
  {
    id: 'guyana',
    nombre: 'Guyana',
    nombreOficial: 'República Cooperativa de Guyana',
    capitales: [{ nombre: 'Georgetown', lon: -58.16, lat: 6.8, rotulo: 'arr' }],
    poblacion: { texto: '879 mil', anio: 2022, fuente: 'Bureau of Statistics de Guyana, Censo 2022 (cifra preliminar: 878 674)' },
    superficie: 214969,
    idiomas: ['inglés'],
    moneda: 'dólar guyanés',
    limitrofes: ['venezuela', 'brasil', 'surinam'],
    oceanos: ['Atlántico'],
    regiones: ['Llanura costera baja', 'Colinas de arena y arcilla', 'Tierras altas con bosque', 'Sabanas del interior (como el Rupununi)'],
    relieve: 'La costa es baja y plana. El interior está cubierto de selva y tiene mesetas de cima plana, como el monte Roraima (2775 m en su lado guyanés), que comparte con Venezuela y Brasil.',
    plato: { nombre: 'Pepperpot', detalle: 'Guiso de carne con cassareep, una salsa oscura hecha con jugo de yuca. Se come en Navidad.' },
    animal: { nombre: 'Hoatzín', detalle: 'Ave nacional de Guyana, con cresta de plumas. Sus crías tienen garritas en las alas.' },
    lugar: { nombre: 'Cataratas Kaieteur', detalle: 'Una caída de agua de 226 metros en medio de la selva.' },
    fiesta: { nombre: 'Mashramani', detalle: 'Desfile con música y disfraces que celebra el Día de la República, el 23 de febrero.' },
    datoCurioso: 'Guyana es el único país de Sudamérica donde el idioma oficial es el inglés. Su catarata Kaieteur es más de cuatro veces más alta que las famosas cataratas del Niágara.',
    descripcion: 'Guyana está al norte de Sudamérica, junto al océano Atlántico. Gran parte de su territorio es selva y casi 9 de cada 10 personas viven en la costa. Su nombre significa "tierra de muchas aguas".',
    bandera: { descripcion: 'Fondo verde con una flecha amarilla de borde blanco y un triángulo rojo de borde negro. Se le llama "La punta de flecha dorada".' },
    color: 'amarillo',
    etiqueta: { lon: -58.9, lat: 4.6, giro: -60 },
    ubicacion: 'Está al norte, junto al Atlántico, entre Venezuela y Surinam.',
    pistas: ['Está al norte, junto al océano Atlántico.', 'Es un país pequeño donde se habla inglés.', 'Está entre Venezuela y Surinam.'],
  },
  {
    id: 'paraguay',
    nombre: 'Paraguay',
    nombreOficial: 'República del Paraguay',
    capitales: [{ nombre: 'Asunción', lon: -57.58, lat: -25.26 }],
    poblacion: { texto: '6,1 millones', anio: 2022, fuente: 'INE Paraguay, Censo 2022 (resultados finales: 6 109 903)' },
    superficie: 406752,
    idiomas: ['castellano', 'guaraní'],
    moneda: 'guaraní',
    limitrofes: ['bolivia', 'brasil', 'argentina'],
    oceanos: [],
    regiones: ['Región Oriental (bosques y colinas)', 'Región Occidental o Chaco'],
    relieve: 'El río Paraguay divide el país en dos. Al oeste está el Chaco, una llanura seca. Al este hay colinas suaves, bosques y ríos grandes como el Paraná. Su punto más alto es el cerro Peró (842 m).',
    plato: { nombre: 'Sopa paraguaya', detalle: 'A pesar de su nombre, es un pan suave de harina de maíz, queso, leche y cebolla.' },
    animal: { nombre: 'Pájaro campana', detalle: 'Ave nacional por la Ley 2511 de 2004. Su canto suena como una campana.' },
    lugar: { nombre: 'Represa de Itaipú', detalle: 'Central hidroeléctrica compartida con Brasil. Tiene el récord Guinness de más energía producida en total.' },
    fiesta: { nombre: 'Tereré', detalle: 'Bebida fría de yerba mate con hierbas, que se comparte entre amigos. Es Patrimonio de la Humanidad (UNESCO, 2020).' },
    datoCurioso: 'En Paraguay 8 de cada 10 personas hablan guaraní en casa, una lengua originaria. ¡Y la sopa paraguaya no es una sopa, sino un pan!',
    descripcion: 'Paraguay está en el centro de Sudamérica y no tiene mar. Es uno de los países donde más se habla una lengua originaria: el guaraní. Sus ríos son muy importantes para la vida y el comercio.',
    bandera: { descripcion: 'Tres franjas horizontales: roja, blanca y azul. En el centro tiene un escudo con una estrella amarilla. ¡Y por detrás lleva un escudo distinto!' },
    color: 'amarillo',
    etiqueta: { lon: -58.6, lat: -22.8 },
    ubicacion: 'Está en el centro, no tiene mar.',
    pistas: ['Está en el centro, no tiene mar.', 'Está entre Bolivia, Brasil y Argentina.', 'Allí se habla castellano y guaraní.'],
  },
  {
    id: 'peru',
    nombre: 'Perú',
    articulo: 'el', // en el Perú se dice "el Perú", "al Perú", "del Perú"
    nombreOficial: 'República del Perú',
    capitales: [{ nombre: 'Lima', lon: -77.03, lat: -12.05, rotulo: 'izq' }],
    poblacion: { texto: '34,2 millones', anio: 2025, fuente: 'INEI, Censos Nacionales 2025 (primeros resultados: 34 157 732)' },
    superficie: 1285216,
    idiomas: ['castellano', 'quechua', 'aimara', 'y otras lenguas originarias (en las zonas donde predominan)'],
    moneda: 'sol',
    limitrofes: ['ecuador', 'colombia', 'brasil', 'bolivia', 'chile'],
    oceanos: ['Pacífico (Mar de Grau)'],
    regiones: ['Costa', 'Sierra', 'Selva', 'Las 8 regiones naturales de Javier Pulgar Vidal: chala, yunga, quechua, suni, puna, janca, rupa rupa y omagua'],
    relieve: 'La cordillera de los Andes cruza el Perú de norte a sur. El nevado Huascarán (6757 m) es su montaña más alta. En la costa hay desiertos y valles, y al este está la selva amazónica.', // INAIGEM, medición de 2017
    plato: { nombre: 'Ceviche', detalle: 'Pescado fresco con limón, cebolla y ají. Su preparación es Patrimonio de la Humanidad (UNESCO, 2023).' },
    animal: { nombre: 'Vicuña', detalle: 'Es símbolo nacional y está en nuestro escudo. Su lana es una de las más finas del mundo.' },
    lugar: { nombre: 'Machu Picchu', detalle: 'Ciudad inca construida en lo alto de una montaña, en Cusco. Es Patrimonio de la Humanidad (UNESCO, 1983).' },
    fiesta: { nombre: 'Virgen de la Candelaria', detalle: 'En Puno, cada febrero, miles de danzantes quechuas y aimaras bailan con trajes muy coloridos. Es Patrimonio de la Humanidad (UNESCO, 2014).' },
    datoCurioso: 'La papa nació en los Andes. ¡En el Perú hay más de 3000 variedades nativas! Y el lago Titicaca es el lago más alto del mundo por donde navegan barcos grandes.',
    descripcion: 'El Perú es nuestro país. Está en el oeste de Sudamérica, junto al océano Pacífico. Tiene costa, sierra y selva, y fue el centro del Imperio de los incas.',
    bandera: { descripcion: 'Tres franjas verticales: roja, blanca y roja. El pabellón nacional lleva además el escudo en el centro.' },
    color: 'naranja',
    etiqueta: { lon: -75.2, lat: -9.6 },
    ubicacion: 'Es nuestro país, al oeste, junto al Pacífico.',
    pistas: ['¡Es nuestro país!', 'Está al oeste, junto al océano Pacífico.', 'Está entre Ecuador, Colombia, Brasil, Bolivia y Chile.'],
  },
  {
    id: 'surinam',
    nombre: 'Surinam',
    nombreOficial: 'República de Surinam',
    capitales: [{ nombre: 'Paramaribo', lon: -55.2, lat: 5.85, rotulo: 'abj' }],
    poblacion: { texto: '640 mil', anio: 2025, fuente: 'Banco Mundial con datos de la ONU, estimación 2025 (639 850). Sin censo reciente publicado' },
    superficie: 163820,
    idiomas: ['neerlandés'],
    moneda: 'dólar surinamés',
    limitrofes: ['guyana', 'brasil', 'guayana-francesa'],
    oceanos: ['Atlántico'],
    regiones: ['Llanura costera', 'Sabanas', 'Selva del interior'],
    relieve: 'La costa es baja y tiene manglares. El interior es una meseta cubierta de selva tropical, con ríos y cerros. Su punto más alto es el Julianatop (1230 m).', // CIA World Factbook; otras fuentes dan 1280 m
    plato: { nombre: 'Pom', detalle: 'Pastel horneado de pollo con pomtajer, una raíz parecida a la papa, y jugo de cítricos.' },
    animal: { nombre: 'Tortuga laúd', detalle: 'La tortuga marina más grande. Llega a playas de Surinam, como Galibi, para poner sus huevos.' }, // no es símbolo oficial: Surinam no tiene animal nacional
    lugar: { nombre: 'Centro histórico de Paramaribo', detalle: 'Calles con antiguas casas de madera. Es Patrimonio de la Humanidad (UNESCO, 2002).' },
    fiesta: { nombre: 'Keti Koti', detalle: 'Cada 1 de julio se celebra el fin de la esclavitud (1863). Keti Koti significa «cadenas rotas».' },
    datoCurioso: 'Surinam es el país más pequeño de Sudamérica y el país con más bosque del mundo: ¡94 de cada 100 partes de su tierra son bosque!',
    descripcion: 'Surinam es el país más pequeño de Sudamérica y está al norte, junto al océano Atlántico. Allí se habla neerlandés, el idioma de los Países Bajos. Su gente tiene orígenes de muchas partes del mundo.',
    bandera: { descripcion: 'Cinco franjas horizontales: verde, blanca, roja (la más ancha), blanca y verde. En el centro, una estrella amarilla.' },
    color: 'rosado',
    etiqueta: { lon: -55.9, lat: 3.9, giro: -60 },
    ubicacion: 'Está al norte, junto al Atlántico. Es el más pequeño.',
    pistas: ['Es el país más pequeño de Sudamérica.', 'Está al norte, junto al océano Atlántico.', 'Está entre Guyana y la Guayana Francesa.'],
  },
  {
    id: 'uruguay',
    nombre: 'Uruguay',
    nombreOficial: 'República Oriental del Uruguay',
    capitales: [{ nombre: 'Montevideo', lon: -56.16, lat: -34.9 }],
    poblacion: { texto: '3,5 millones', anio: 2023, fuente: 'INE Uruguay, Censo 2023 (resultados finales: 3 499 451)' },
    superficie: 176215,
    idiomas: ['castellano'],
    moneda: 'peso uruguayo',
    limitrofes: ['argentina', 'brasil'],
    oceanos: ['Atlántico (y el Río de la Plata)'],
    regiones: ['Llanuras y cuchillas (colinas suaves)', 'Costa con playas'],
    relieve: 'Es un país casi plano, con colinas suaves llamadas cuchillas. Su punto más alto, el cerro Catedral, mide solo 514 m. Tiene muchas playas sobre el Atlántico y el Río de la Plata.',
    plato: { nombre: 'Chivito', detalle: 'Sándwich de carne de res con jamón, queso y huevo. Nació en Punta del Este en 1946.' },
    animal: { nombre: 'Tero', detalle: 'Ave muy común en el campo, considerada el ave nacional. La selección de rugby se llama «Los Teros».' }, // sin ley que lo declare oficial
    lugar: { nombre: 'Colonia del Sacramento', detalle: 'Barrio antiguo de calles de piedra junto al río. Es Patrimonio de la Humanidad (UNESCO, 1995).' },
    fiesta: { nombre: 'Candombe y Carnaval', detalle: 'El candombe, con sus tambores, es Patrimonio de la Humanidad (UNESCO, 2009). El carnaval dura más de 50 días.' },
    datoCurioso: 'Uruguay organizó y ganó el primer Mundial de fútbol de la historia, en 1930.',
    descripcion: 'Uruguay es un país pequeño al sureste de Sudamérica, entre Argentina y Brasil. Es casi plano, con praderas y playas. Es famoso por el candombe y el fútbol.',
    bandera: { descripcion: 'Nueve franjas horizontales blancas y azules. Arriba a la izquierda tiene el Sol de Mayo.' },
    color: 'naranja',
    etiqueta: { lon: -56, lat: -32.6 },
    ubicacion: 'Está al sureste, entre Argentina y Brasil.',
    pistas: ['Está al sureste de Sudamérica.', 'Es pequeño y está entre Argentina y Brasil.', 'Está junto al océano Atlántico y el Río de la Plata.'],
  },
  {
    id: 'venezuela',
    nombre: 'Venezuela',
    nombreOficial: 'República Bolivariana de Venezuela',
    capitales: [{ nombre: 'Caracas', lon: -66.9, lat: 10.49, rotulo: 'arr' }],
    poblacion: { texto: '28,5 millones', anio: 2025, fuente: 'ONU, World Population Prospects 2024 (estimación 2025). Sin censo reciente' },
    superficie: 916445, // Instituto Geográfico de Venezuela Simón Bolívar y OTCA (el CIA World Factbook da 912 050 km²)
    idiomas: ['castellano', 'y lenguas indígenas'],
    moneda: 'bolívar',
    limitrofes: ['colombia', 'brasil', 'guyana'],
    oceanos: ['Atlántico (mar Caribe)'],
    regiones: ['Los Andes', 'Los Llanos', 'La Guayana (tepuyes)', 'La costa caribeña', 'Delta del Orinoco'],
    relieve: 'Al oeste están los Andes con el pico Bolívar (4978 m). En el centro hay grandes llanos cruzados por el río Orinoco. Al sur están los tepuyes, montañas de cima plana.',
    plato: { nombre: 'Arepa', detalle: 'Pan redondo de maíz. Es la comida tradicional más consumida en Venezuela.' },
    animal: { nombre: 'Turpial', detalle: 'Ave nacional de Venezuela, de plumas anaranjadas y negras.' },
    lugar: { nombre: 'Salto Ángel', detalle: 'Cae desde el tepuy Auyán, en el Parque Nacional Canaima, Patrimonio de la Humanidad (UNESCO, 1994).' },
    fiesta: { nombre: 'Diablos Danzantes', detalle: 'En Corpus Christi, bailarines con máscaras de diablo salen a las calles. Es Patrimonio de la Humanidad (UNESCO, 2012).' },
    datoCurioso: 'En Venezuela está el Salto Ángel, considerado la catarata más alta del mundo: 979 metros. ¡El agua cae casi un kilómetro!',
    descripcion: 'Venezuela está al norte de Sudamérica, junto al mar Caribe. Tiene montañas, llanos, selva y los tepuyes. El río Orinoco es uno de los más grandes del continente.',
    bandera: { descripcion: 'Tres franjas horizontales: amarilla, azul y roja. En la azul hay ocho estrellas blancas en forma de arco.' },
    color: 'naranja',
    etiqueta: { lon: -66, lat: 7.2 },
    ubicacion: 'Está al norte, junto al mar Caribe.',
    pistas: ['Está al norte, junto al mar Caribe.', 'Está entre Colombia y Guyana.', 'Allí está el Salto Ángel, considerado la catarata más alta del mundo.'],
  },
];

// La Guayana Francesa aparece en el mapa, pero no es un país independiente.
export const GUAYANA_FRANCESA = {
  id: 'guayana-francesa',
  nombre: 'Guayana Francesa',
  esTerritorio: true,
  capitales: [{ nombre: 'Cayena', lon: -52.33, lat: 4.92 }],
  descripcion: 'La Guayana Francesa no es un país independiente: es un territorio que pertenece a Francia. Por eso allí se habla francés y se usa el euro. Desde aquí Europa lanza cohetes al espacio.',
  idiomas: ['francés'],
  moneda: 'euro',
  limitrofes: ['brasil', 'surinam'],
  oceanos: ['Atlántico'],
  bandera: { descripcion: 'Usa la bandera de Francia: tres franjas verticales azul, blanca y roja.' },
  etiqueta: { lon: -53.2, lat: 3.9, giro: -60 },
};

// Nombres para los vecinos que no son de Sudamérica.
export const OTROS_VECINOS = { panama: 'Panamá', 'guayana-francesa': 'Guayana Francesa (Francia)' };

export const PAISES_POR_ID = Object.fromEntries(PAISES.map((p) => [p.id, p]));

export const COLORES_ATLAS = {
  naranja: '#F6C08A',
  rosado: '#F4B8C5',
  amarillo: '#F7E39A',
  verde: '#A8DCC9',
  lavanda: '#BFC6EC',
};

export function nombreDe(id) {
  return PAISES_POR_ID[id]?.nombre ?? OTROS_VECINOS[id] ?? id;
}

// Separador de miles con espacio fino, como recomienda la RAE (2 780 400).
// Nombre con artículo para las frases de Kusi: "el Perú", "al Perú", "del Perú".
const pais = (x) => (typeof x === 'string' ? PAISES_POR_ID[x] : x);
export const elPais = (x) => { const p = pais(x); return p ? (p.articulo ? `el ${p.nombre}` : p.nombre) : nombreDe(x); };
export const aPais = (x) => { const p = pais(x); return p?.articulo ? `al ${p.nombre}` : `a ${elPais(x)}`; };
export const dePais = (x) => { const p = pais(x); return p?.articulo ? `del ${p.nombre}` : `de ${elPais(x)}`; };

export const formatoMiles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F');
