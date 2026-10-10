# Investigación de datos — Viajeros de Sudamérica

Fase 5. Verificación de **todos** los datos de `src/data/paises.js` con fuentes reales,
consultadas en octubre de 2026. Las URL de cada dato están en `src/data/fuentes.js`
y se muestran en el juego al final de cada ficha ("Fuentes de estos datos").

## Método

1. **Base de datos estructurada:** se descargó el CIA World Factbook (copia abierta
   `factbook.json`, actualizada semanalmente) para los 12 países. De ahí salen
   superficie, fronteras, costas, punto más alto, idiomas y símbolos nacionales.
2. **Fuente oficial de cada país** para la población: el último censo o la
   proyección del instituto nacional de estadística.
3. **Constituciones y leyes** para idiomas oficiales, ave nacional y fiestas
   (Constitute Project, boletines oficiales).
4. **Listas oficiales de la UNESCO** para lugares (Patrimonio Mundial) y fiestas o
   tradiciones (Patrimonio Cultural Inmaterial).
5. **Enciclopedias y récords** (Britannica, Guinness) para los "¿Sabías que…?".
6. Cuando dos fuentes serias no coinciden, el juego usa la oficial del país y el
   código lo deja anotado.

## Qué se corrigió

| País | Dato | Antes | Ahora | Fuente |
|---|---|---|---|---|
| Argentina | Población | 46 millones (provisorio) | 45,9 millones (definitivo: 45 892 285) | INDEC, Censo 2022 |
| Bolivia | Población | 11,3 millones (preliminar) | 11,4 millones (final: 11 365 333) | INE Bolivia, Censo 2024 |
| Brasil | Población | 203 millones (censo 2022) | 213 millones (estimación 2025: 213 421 037) | IBGE |
| Brasil | Regiones | Lista propia | Los 6 biomas oficiales | IBGE |
| Brasil | Animal | Guacamayo azul (no es símbolo) | Sabiá-laranjeira (ave nacional popular; decreto de 2002) | Cámara de Diputados de Brasil |
| Colombia | Población | 53 millones (2024) | 53 millones (2025) | DANE, nota técnica de julio de 2025 |
| Ecuador | Animal | Tortuga gigante (no es símbolo) | Cóndor andino (símbolo nacional) | CIA World Factbook |
| Guyana | Población | 800 mil (estimación) | 879 mil (censo: 878 674, preliminar) | Bureau of Statistics, Censo 2022 |
| Guyana | Regiones | Lista propia | Las 4 regiones naturales que se enseñan en Guyana | Material escolar de 6.° grado (Stabroek News) |
| Guyana | Plato | "Con canela y ají" | Con cassareep (jugo de yuca) | Wikipedia, Guyanese pepperpot |
| Paraguay | Tradición | San Juan | Tereré (UNESCO, 2020) | UNESCO |
| Paraguay | Bandera | "Única bandera con dos lados distintos" | "Por detrás lleva un escudo distinto" | Afirmación absoluta retirada |
| Perú | Población | 34 millones (estimación 2024) | 34,2 millones (Censo 2025: 34 157 732) | INEI, primeros resultados |
| Perú | Huascarán | 6768 m | 6757 m (medición de 2017) | INAIGEM |
| Surinam | Población | 620 mil | 640 mil (estimación 2025: 639 850) | Banco Mundial con datos de la ONU |
| Surinam | Julianatop | 1280 m | 1230 m (otras fuentes: 1280 m) | CIA World Factbook |
| Uruguay | Población | 3,4 millones (preliminar) | 3,5 millones (final: 3 499 451) | INE Uruguay, Censo 2023 |
| Uruguay | Animal | Ñandú (sin respaldo) | Tero (considerado ave nacional, sin ley) | Billiken; selección de rugby "Los Teros" |
| Uruguay | Carnaval | "Dura unos 40 días" | "Dura más de 50 días" | Ministerio de Turismo del Uruguay |
| Venezuela | Población | 28 millones (2023) | 28,5 millones (2025) | ONU, World Population Prospects 2024 |
| Chile | Fiesta | "Se comen empanadas" (sin fuente) | La cueca es danza nacional desde 1979 | Decreto N° 23 (Memoria Chilena) |
| Argentina | Fiesta | "Se celebra a los gauchos con caballos" | Recuerda el nacimiento de José Hernández | Ley 21.154 |
| Varios | Ave o animal | "Ave nacional" sin respaldo | Se indica si es oficial, popular o solo representativo | Factbook, leyes de cada país |

## Datos confirmados (sin cambios)

- **Capitales y coordenadas:** las 12, con Bolivia como caso especial: Sucre es la
  capital constitucional y La Paz, la sede de gobierno (CIA World Factbook).
- **Superficies:**
  - Argentina 2 780 400 km², Bolivia 1 098 581, Chile 756 102, Guyana 214 969,
    Paraguay 406 752, Perú 1 285 216, Surinam 163 820 y Uruguay 176 215
    (CIA World Factbook).
  - Brasil 8 510 000 (IBGE).
  - Colombia 1 141 748 (DANE).
  - Ecuador 256 370 (Cancillería del Ecuador).
  - Venezuela 916 445 (Instituto Geográfico de Venezuela).
- **Fronteras:** todas coinciden con el CIA World Factbook. Brasil limita con todos
  los países menos Chile y Ecuador.
- **Puntos más altos:**
  - Aconcagua: 6961 m (IGN 2012, que mide 6960,8 m).
  - Ojos del Salado: 6893 m.
  - Chimborazo: 6263 m (IGM e IRD, 2016).
  - Sajama: 6542 m.
  - Pico Cristóbal Colón: 5730 m.
  - Pico Bolívar: 4978 m.
  - Pico da Neblina: 2995 m.
  - Roraima, lado guyanés: 2775 m.
  - Cerro Peró: 842 m.
  - Cerro Catedral: 514 m.
- **Idiomas oficiales:** según las constituciones de Bolivia (art. 5), Colombia
  (art. 10), Ecuador (art. 2), Paraguay (art. 140), Perú (art. 48) y Venezuela
  (art. 9).
- **Patrimonio Mundial (UNESCO):**
  - Iguazú (1984), Cartagena (1984), Galápagos (1978) y Machu Picchu (1983).
  - Rapa Nui (1995), Canaima (1994), Colonia del Sacramento (1995) y Paramaribo
    (2002).
  - Río de Janeiro (2012), que incluye el Cristo Redentor.
- **Patrimonio Inmaterial (UNESCO):**
  - Carnaval de Oruro, Carnaval de Barranquilla y Candombe.
  - Diablos Danzantes, Virgen de la Candelaria y ceviche (2023).
  - Tango (2009) y tereré (2020).
- **"¿Sabías que…?"**
  - El Salar de Uyuni es el más grande del mundo (Guinness).
  - El Salto Ángel mide 979 m.
  - Kaieteur cae 226 m, más de 4 veces la altura del Niágara.
  - Chile mide unos 4300 km de largo y unos 177 km de ancho en promedio
    (Britannica).
  - Colombia tiene unas 1968 especies de aves, el primer lugar mundial.
  - El Perú tiene más de 3000 variedades de papa nativa (MIDAGRI).
  - El Titicaca es el lago más alto navegable por barcos grandes (Britannica).
  - Surinam tiene 94,4 % de bosque, el primer lugar mundial (FAOSTAT).
  - Uruguay fue sede y campeón del Mundial de 1930.
  - Itaipú tiene el récord Guinness de producción acumulada (2024).
  - En Paraguay el 80 % de la población habla guaraní en casa (Factbook, 2012).

## Desacuerdos entre fuentes (para el docente)

- **Huascarán:**
  - 6768 m: cifra clásica, medida en 1932-1936.
  - 6757 m: INAIGEM, 2017. El juego usa esta.
  - 6746 m: CIA World Factbook.
- **Superficie de Ecuador:** 256 370 km² según la Cancillería (el juego usa esta);
  283 561 km² según el Factbook y la UE.
- **Superficie de Venezuela:** 916 445 km² según el IGVSB (el juego usa esta);
  912 050 km² según el Factbook.
- **Julianatop (Surinam):** 1230 m según el Factbook; 1280 m en otras fuentes.
- **Salto Ángel:** se considera la catarata más alta del mundo, aunque algunos
  investigadores discuten si lo es el salto Tugela (Sudáfrica). Por eso el juego
  dice "considerado".
- **Censos aún no definitivos:**
  - Perú 2025: primeros resultados.
  - Guyana 2022: cifra preliminar.
  - Surinam y Venezuela no tienen censo reciente publicado; se usan estimaciones de
    la ONU.
- **Hornero, sabiá y tero:** no los declaró ninguna ley. Fueron elegidos por
  encuesta o costumbre, y así se indica en cada ficha.

## Límites de esta investigación

- Algunos sitios oficiales (INEI, DANE, UNESCO) no se pudieron abrir directamente
  desde el entorno de trabajo. En esos casos los datos se confirmaron con los
  resultados del buscador que muestran la página oficial y con al menos otra fuente
  coincidente.
- Las cifras de población cambian cada año. Conviene revisarlas cuando los
  institutos publiquen resultados definitivos, sobre todo el Censo 2025 del Perú.
