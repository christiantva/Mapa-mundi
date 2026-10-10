// ─────────────────────────────────────────────────────────────────────────────
// Fuentes de los datos de cada país (Fase 5: investigación de datos).
// Cada dato de data/paises.js se verificó con al menos una de estas fuentes.
// Consultadas en octubre de 2026. Ver también docs/investigacion-datos.md.
// ─────────────────────────────────────────────────────────────────────────────

// Fuentes generales que valen para todos los países
const FACTBOOK = (codigo) => ({
  dato: 'Superficie, fronteras, costas, punto más alto, idiomas, símbolos nacionales',
  fuente: 'CIA World Factbook (copia en datos abiertos factbook.json)',
  url: `https://github.com/factbook/factbook.json/blob/master/south-america/${codigo}.json`,
});
const UNESCO_PATRIMONIO = { dato: 'Lugares Patrimonio de la Humanidad', fuente: 'UNESCO, Lista del Patrimonio Mundial', url: 'https://whc.unesco.org/en/list/' };
const UNESCO_INMATERIAL = { dato: 'Fiestas y tradiciones Patrimonio Inmaterial', fuente: 'UNESCO, Patrimonio Cultural Inmaterial', url: 'https://ich.unesco.org/en/lists' };

export const FUENTES = {
  argentina: [
    { dato: 'Población (Censo 2022, resultados definitivos: 45 892 285)', fuente: 'INDEC, Censo 2022', url: 'https://censo.gob.ar/index.php/datos_definitivos_total_pais/' },
    FACTBOOK('ar'),
    { dato: 'Altura del Aconcagua (6960,8 m, medición 2012)', fuente: 'Instituto Geográfico Nacional (nota de RPP)', url: 'https://rpp.pe/lima/actualidad/nueva-altura-oficial-del-cerro-aconcagua-es-de-69608-metros-noticia-518097' },
    { dato: 'Hornero, ave nacional (encuesta escolar de 1928)', fuente: 'Aves Argentinas, revista Nuestras Aves', url: 'https://nuestrasaves.avesargentinas.org.ar/home/issue/download/n4/6' },
    { dato: 'Día de la Tradición (10 de noviembre)', fuente: 'Ley 21.154, Boletín Oficial', url: 'https://www.argentina.gob.ar/normativa/nacional/ley-21154-231404/texto' },
    { dato: 'Cataratas del Iguazú (unos 275 saltos, 1984)', fuente: 'UNESCO, Parque Nacional Iguazú', url: 'https://whc.unesco.org/en/list/303/' },
    { dato: 'Regiones: Andes, Gran Chaco, Pampa y Patagonia', fuente: 'WorldAtlas', url: 'https://www.worldatlas.com/topics/argentina/' },
    { dato: 'Mesopotamia, entre los ríos Paraná y Uruguay', fuente: 'Guest Hollow, texto de geografía', url: 'https://guesthollow.com/textbooks/5-3-argentina-uruguay-paraguay/' },
    { dato: 'El tango, Patrimonio Inmaterial (2009)', fuente: 'UNESCO', url: 'https://ich.unesco.org/en/RL/tango-00258' },
  ],
  bolivia: [
    { dato: 'Población (Censo 2024, resultados finales: 11 365 333)', fuente: 'INE Bolivia', url: 'https://cpv2024.ine.gob.bo/' },
    FACTBOOK('bl'),
    { dato: 'Idiomas oficiales (castellano y 36 lenguas indígenas)', fuente: 'Constitución Política del Estado, art. 5', url: 'https://www.constituteproject.org/constitution/Bolivia_2009' },
    { dato: 'Salar de Uyuni (10 582 km², 3656 m)', fuente: 'Encyclopaedia Britannica', url: 'https://www.britannica.com/place/Uyuni-Salt-Flat' },
    { dato: 'Salar de Uyuni, el más grande del mundo', fuente: 'Guinness World Records', url: 'https://www.guinnessworldrecords.com/world-records/82679-largest-salt-flat' },
    { dato: 'Carnaval de Oruro', fuente: 'UNESCO', url: 'https://ich.unesco.org/es/RL/el-carnaval-de-oruro-00003' },
    { dato: 'Salteña (caldo, ají y papa; origen en Potosí)', fuente: 'Correo del Sur', url: 'https://correodelsur.com/ecos/20170910/la-jugosa-y-picante-historia-de-la-saltena.html' },
  ],
  brasil: [
    { dato: 'Población (estimación 2025: 213 421 037)', fuente: 'IBGE', url: 'https://educa.ibge.gov.br/jovens/materias-especiais/23077-populacao-estimada-passa-213-milhoes.html' },
    FACTBOOK('br'),
    { dato: 'Cerca del 60 % de la selva amazónica está en Brasil', fuente: 'Noticias ONU', url: 'https://news.un.org/en/node/579422' },
    { dato: 'Ocupa la mitad del continente', fuente: 'Encyclopaedia Britannica', url: 'https://www.britannica.com/place/Brazil' },
    { dato: 'Sabiá-laranjeira y el Día del Ave (decreto de 3 de octubre de 2002)', fuente: 'Cámara de Diputados de Brasil, legislación', url: 'https://www2.camara.leg.br/legin/fed/decret_sn/2002/decreto-51564-3-outubro-2002-602027-publicacaooriginal-123470-pe.html' },
    { dato: 'Río de Janeiro, paisajes cariocas (2012)', fuente: 'UNESCO', url: 'https://whc.unesco.org/en/list/1100/' },
    { dato: 'Feijoada (frejol negro, cerdo, arroz, col y naranja)', fuente: 'Universidad de São Paulo, Portal Latinoamericano', url: 'https://sites.usp.br/portalatinoamericano/espanol-feijoada' },
  ],
  chile: [
    { dato: 'Población (Censo 2024: 18 480 432 personas censadas)', fuente: 'INE Chile (nota de El Dínamo)', url: 'https://www.eldinamo.cl/pais/2025/03/27/se-acabo-la-incognita-censo-2024-contabilizo-18-480-432-habitantes-en-chile/' },
    FACTBOOK('ci'),
    { dato: 'Largo (unos 4300 km) y ancho promedio (unos 177 km)', fuente: 'Encyclopaedia Britannica', url: 'https://www.britannica.com/place/Chile' },
    { dato: 'Cueca, danza nacional (Decreto N° 23 de 1979)', fuente: 'Memoria Chilena, Biblioteca Nacional', url: 'https://www.memoriachilena.gob.cl/602/w3-article-3510.html' },
    { dato: 'Parque Nacional Rapa Nui (1995)', fuente: 'UNESCO', url: 'https://whc.unesco.org/en/list/715/' },
  ],
  colombia: [
    { dato: 'Población (unos 53 millones en 2025)', fuente: 'DANE, nota técnica de proyecciones, julio de 2025', url: 'https://www.dane.gov.co/files/censo2018/proyecciones-de-poblacion/Nacional/NotaTecnica-PPED-jul2025.pdf' },
    { dato: 'Superficie (1 141 748 km²)', fuente: 'DANE, metadatos censales', url: 'https://microdatos.dane.gov.co/index.php/catalog/643/datafile/F11/V574' },
    FACTBOOK('co'),
    { dato: 'Idioma oficial y lenguas de grupos étnicos', fuente: 'Constitución Política de Colombia, art. 10', url: 'https://www.constituteproject.org/constitution/Colombia_2015' },
    { dato: 'Unas 1968 especies de aves, primer lugar mundial', fuente: 'Ministerio de Comercio, Industria y Turismo', url: 'https://www.mincit.gov.co/prensa/noticias/turismo/colombia-se-prepara-para-global-big-day-2024' },
    { dato: 'Carnaval de Barranquilla', fuente: 'UNESCO', url: 'https://ich.unesco.org/es/RL/el-carnaval-de-barranquilla-00051' },
    { dato: 'Cartagena de Indias (1984) y Paisaje Cultural Cafetero (2011)', fuente: 'UNESCO', url: 'https://whc.unesco.org/en/list/285/' },
  ],
  ecuador: [
    { dato: 'Población (Censo 2022: 16 938 986)', fuente: 'INEC', url: 'https://www.ecuadorencifras.gob.ec/institucional/el-inec-ratifico-la-validez-veracidad-y-confiabilidad-del-censo-ecuador-2022/' },
    { dato: 'Superficie (256 370 km²)', fuente: 'Cancillería del Ecuador', url: 'https://www.cancilleria.gob.ec/wp-content/uploads/sites/22/2021/07/ECUADOR.pdf' },
    FACTBOOK('ec'),
    { dato: 'Altura del Chimborazo (6263,47 m, medición 2016)', fuente: 'IGM e IRD (nota de El Universo)', url: 'https://www.eluniverso.com/noticias/2016/04/07/nota/5509923/volcan-chimborazo-le-arrebata-titulo-everest/' },
    { dato: 'Kichwa y shuar, idiomas de relación intercultural', fuente: 'Constitución de la República del Ecuador, art. 2', url: 'https://www.constituteproject.org/constitution/Ecuador_2021' },
    { dato: 'Islas Galápagos (1978)', fuente: 'UNESCO', url: 'https://whc.unesco.org/en/list/1/' },
    { dato: 'Inti Raymi (junio, agradecimiento a la Pachamama)', fuente: 'Primicias, citando al Ministerio de Cultura y Patrimonio', url: 'https://primicias.ec/noticias/sociedad/inti-raymi-fiesta-comunidades-indigenas-actividades-ecuador' },
  ],
  guyana: [
    { dato: 'Población (Censo 2022, cifra preliminar: 878 674)', fuente: 'Bureau of Statistics de Guyana', url: 'https://statisticsguyana.gov.gy/census/' },
    FACTBOOK('gy'),
    { dato: 'Cuatro regiones naturales', fuente: 'Stabroek News, material de Estudios Sociales de 6.° grado', url: 'https://epaper.stabroeknews.com/article/282119230426224' },
    { dato: 'Kaieteur: caída de 226 m', fuente: 'Wikipedia (Kaieteur Falls), con fuentes citadas', url: 'https://en.wikipedia.org/wiki/Kaieteur_Falls' },
    { dato: 'Mashramani, Día de la República (23 de febrero)', fuente: 'Department of Public Information, Gobierno de Guyana', url: 'https://dpi.gov.gy/mashramani-showcases-guyanas-rich-vibrant-cultural-heritage' },
    { dato: 'Pepperpot con cassareep, plato de Navidad', fuente: 'Wikipedia (Guyanese pepperpot)', url: 'https://en.wikipedia.org/wiki/Guyanese_pepperpot' },
    { dato: 'Nombre: «tierra de muchas aguas»', fuente: 'Real Jardín Botánico de Kew', url: 'https://www.kew.org/read-and-watch/the-land-of-many-waters' },
  ],
  paraguay: [
    { dato: 'Población (Censo 2022, resultados finales: 6 109 903)', fuente: 'INE Paraguay (nota de La Nación)', url: 'https://www.lanacion.com.py/pais_edicion_impresa/2024/08/22/ine-presento-los-datos-finales-del-censo-2022/' },
    FACTBOOK('pa'),
    { dato: 'Castellano y guaraní, idiomas oficiales', fuente: 'Constitución del Paraguay, art. 140', url: 'https://www.constituteproject.org/constitution/Paraguay_2011' },
    { dato: 'Pájaro campana, ave nacional', fuente: 'Ley N° 2511 de 2004', url: 'https://paraguay.justia.com/nacionales/leyes/ley-2511-nov-24-2004/gdoc' },
    { dato: 'Tereré, Patrimonio Inmaterial (2020)', fuente: 'UNESCO', url: 'https://ich.unesco.org/es/RL/practicas-y-saberes-tradicionales-del-terere-en-la-cultura-del-poha-nana-bebida-ancestral-guarani-en-paraguay-01603' },
    { dato: 'Itaipú, récord Guinness de producción acumulada (2024)', fuente: 'Swissinfo / EFE', url: 'https://www.swissinfo.ch/spa/itaip%C3%BA-logra-r%C3%A9cord-guinness-por-mayor-producci%C3%B3n-acumulada-de-energ%C3%ADa-hidroel%C3%A9ctrica/87926304' },
    { dato: 'Sopa paraguaya (pan de maíz, queso, leche)', fuente: 'La Nación (Paraguay)', url: 'https://www.lanacion.com.py/estilodevida/2024/01/23/el-origen-de-la-sopa-paraguaya-desperto-el-interes-de-new-york-times/' },
  ],
  peru: [
    { dato: 'Población (Censos Nacionales 2025, primeros resultados: 34 157 732)', fuente: 'INEI', url: 'https://www.gob.pe/institucion/inei/noticias/1399446-inei-poblacion-del-peru-totalizo-34-millones-157-mil-732-habitantes-al-2025' },
    FACTBOOK('pe'),
    { dato: 'Altura del Huascarán (6757 m, medición 2017)', fuente: 'INAIGEM (nota de Áncash Noticias)', url: 'https://ancashnoticias.com/2017/11/30/inaigem-desmiente-version-medio-grietas-huascaran/' },
    { dato: 'Idiomas oficiales', fuente: 'Constitución Política del Perú, art. 48', url: 'https://www.constituteproject.org/constitution/Peru_2009.pdf?lang=en' },
    { dato: 'Ceviche, Patrimonio Inmaterial (2023)', fuente: 'UNESCO', url: 'https://ich.unesco.org/es/RL/practicas-y-significados-asociados-a-la-preparacion-y-consumo-del-ceviche-expresion-de-la-cocina-tradicional-peruana-01952' },
    { dato: 'Festividad de la Virgen de la Candelaria (2014)', fuente: 'UNESCO', url: 'https://ich.unesco.org/en/RL/festivity-of-virgen-de-la-candelaria-of-puno-00956' },
    { dato: 'Machu Picchu (1983)', fuente: 'UNESCO', url: 'https://whc.unesco.org/en/list/274/' },
    { dato: 'Más de 3000 variedades de papa nativa', fuente: 'MIDAGRI (nota de Caretas)', url: 'https://caretas.pe/?p=810692' },
    { dato: 'Titicaca, el lago más alto navegable por barcos grandes', fuente: 'Encyclopaedia Britannica', url: 'https://www.britannica.com/place/Lake-Titicaca' },
  ],
  surinam: [
    { dato: 'Población (estimación 2025: 639 850, según datos de la ONU)', fuente: 'Banco Mundial', url: 'https://data.worldbank.org/country/suriname' },
    FACTBOOK('ns'),
    { dato: '94,4 % de su tierra es bosque (primer lugar mundial)', fuente: 'FAOSTAT / Banco Mundial', url: 'https://data.worldbank.org/indicator/AG.LND.FRST.ZS?locations=SR' },
    { dato: 'Tortuga laúd en playas de Galibi', fuente: 'WIDECAST, informe para WWF', url: 'https://www.widecast.org/What/Country/Suriname/Docs/Hilterman_2002_WWFReport.pdf' },
    { dato: 'Centro histórico de Paramaribo (2002)', fuente: 'UNESCO', url: 'https://whc.unesco.org/en/list/940/' },
    { dato: 'Keti Koti: fin de la esclavitud el 1 de julio de 1863', fuente: 'Nederlands Jeugdinstituut', url: 'https://www.nji.nl/kennis/diversiteit/ketikoti-wat-is-dat-precies' },
    { dato: 'Pom, plato con pomtajer y pollo', fuente: 'Wikipedia (Pom)', url: 'https://en.wikipedia.org/wiki/Pom_(dish)' },
  ],
  uruguay: [
    { dato: 'Población (Censo 2023, resultados finales: 3 499 451)', fuente: 'Presidencia de la República / INE', url: 'https://www.gub.uy/presidencia/comunicacion/noticias/censo-nacional-2023-contabilizo-3499451-habitantes-uruguay' },
    FACTBOOK('uy'),
    { dato: 'Candombe, Patrimonio Inmaterial (2009)', fuente: 'UNESCO', url: 'https://ich.unesco.org/es/RL/el-candombe-y-su-espacio-sociocultural-una-practica-comunitaria-00182' },
    { dato: 'Carnaval de más de 50 días', fuente: 'Ministerio de Turismo del Uruguay', url: 'https://www.gub.uy/ministerio-turismo/tematica/empleo-emprendedurismo-y-formacion?page=18' },
    { dato: 'Colonia del Sacramento (1995)', fuente: 'UNESCO', url: 'https://whc.unesco.org/en/list/747/' },
    { dato: 'Campeón y sede del primer Mundial (1930)', fuente: 'ESPN', url: 'https://espndeportes.espn.com/futbol/mundial/nota/_/id/7226690/como-fue-la-primera-final-en-la-historia-de-los-mundiales-argentina-uruguay-1930' },
    { dato: 'Chivito (Punta del Este, 1946)', fuente: 'Wikipedia (Chivito)', url: 'https://en.wikipedia.org/wiki/Chivito_(sandwich)' },
    { dato: 'El tero, considerado ave nacional', fuente: 'Billiken', url: 'https://billiken.lat/naturaleza/cual-es-el-ave-nacional-de-uruguay/' },
  ],
  venezuela: [
    { dato: 'Población (estimación 2025: 28,5 millones)', fuente: 'UNFPA, con datos de World Population Prospects 2024 (ONU)', url: 'https://www.unfpa.org/data/world-population/VE' },
    { dato: 'Superficie (916 445 km²)', fuente: 'Informe país del Instituto Geográfico de Venezuela Simón Bolívar (2003)', url: 'https://cadastraltemplate.org/version1.0/countryreport/Venezuela-esp-28May2004.pdf' },
    FACTBOOK('ve'),
    { dato: 'Castellano oficial; idiomas indígenas oficiales para sus pueblos', fuente: 'Constitución de Venezuela, art. 9', url: 'https://www.constituteproject.org/constitution/Venezuela_2009' },
    { dato: 'Salto Ángel (979 m) y Parque Nacional Canaima (1994)', fuente: 'UNESCO', url: 'https://whc.unesco.org/en/list/701/' },
    { dato: 'Diablos Danzantes de Corpus Christi (2012)', fuente: 'UNESCO', url: 'https://ich.unesco.org/es/RL/diablos-danzantes-de-venezuela-00639' },
    { dato: 'El Orinoco, gran río de Sudamérica (unos 2740 km)', fuente: 'Encyclopaedia Britannica', url: 'https://www.britannica.com/place/Orinoco-River' },
    { dato: 'La arepa, comida tradicional más consumida', fuente: 'Fiocruz, Revista de Alimentação e Cultura das Américas', url: 'https://raca.fiocruz.br/index.php/raca/article/download/18/28/146' },
  ],
};

export const FUENTES_GENERALES = [UNESCO_PATRIMONIO, UNESCO_INMATERIAL];
