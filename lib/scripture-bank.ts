import { NARRATION_WPS } from "./constants";

/**
 * 📖 BANCO AMPLIO DE ESCRITURAS (Reina-Valera 1960) — muchos Salmos y versículos
 * poderosos. Sirve para que las prédicas y los versículos NO se repitan: se
 * elige uno al azar evitando los usados recientemente (memoria anti-repetición).
 */

export interface Scripture {
  verse: string;
  reference: string;
}

export const SCRIPTURES: Scripture[] = [
  // ----- Salmos -----
  { verse: "Jehová es mi pastor; nada me faltará.", reference: "Salmos 23:1" },
  { verse: "Aunque ande en valle de sombra de muerte, no temeré mal alguno, porque tú estarás conmigo.", reference: "Salmos 23:4" },
  { verse: "Jehová es mi luz y mi salvación; ¿de quién temeré?", reference: "Salmos 27:1" },
  { verse: "Encomienda a Jehová tu camino, y confía en él; y él hará.", reference: "Salmos 37:5" },
  { verse: "Deléitate asimismo en Jehová, y él te concederá las peticiones de tu corazón.", reference: "Salmos 37:4" },
  { verse: "Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.", reference: "Salmos 46:1" },
  { verse: "Estad quietos, y conoced que yo soy Dios.", reference: "Salmos 46:10" },
  { verse: "Echa sobre Jehová tu carga, y él te sustentará.", reference: "Salmos 55:22" },
  { verse: "En Dios solamente está acallada mi alma; de él viene mi salvación.", reference: "Salmos 62:1" },
  { verse: "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente.", reference: "Salmos 91:1" },
  { verse: "Con sus plumas te cubrirá, y debajo de sus alas estarás seguro.", reference: "Salmos 91:4" },
  { verse: "Este es el día que hizo Jehová; nos gozaremos y alegraremos en él.", reference: "Salmos 118:24" },
  { verse: "Lámpara es a mis pies tu palabra, y lumbre a mi camino.", reference: "Salmos 119:105" },
  { verse: "Alzaré mis ojos a los montes; ¿de dónde vendrá mi socorro?", reference: "Salmos 121:1" },
  { verse: "Mi socorro viene de Jehová, que hizo los cielos y la tierra.", reference: "Salmos 121:2" },
  { verse: "Si Jehová no edificare la casa, en vano trabajan los que la edifican.", reference: "Salmos 127:1" },
  { verse: "Te alabaré; porque formidables, maravillosas son tus obras.", reference: "Salmos 139:14" },
  { verse: "Cercano está Jehová a todos los que le invocan, a todos los que le invocan de veras.", reference: "Salmos 145:18" },
  { verse: "Él sana a los quebrantados de corazón, y venda sus heridas.", reference: "Salmos 147:3" },
  { verse: "Clamé a Jehová en mi angustia, y él me respondió.", reference: "Salmos 120:1" },
  { verse: "Bueno es Jehová para con todos, y sus misericordias sobre todas sus obras.", reference: "Salmos 145:9" },
  { verse: "Espera en Jehová; esfuérzate, y aliéntese tu corazón.", reference: "Salmos 27:14" },
  { verse: "Cantad a Jehová cántico nuevo, porque ha hecho maravillas.", reference: "Salmos 98:1" },
  { verse: "El Señor es mi fortaleza y mi cántico, y ha sido mi salvación.", reference: "Salmos 118:14" },
  { verse: "En paz me acostaré, y asimismo dormiré; porque solo tú, Jehová, me haces vivir confiado.", reference: "Salmos 4:8" },

  // ----- Antiguo Testamento -----
  { verse: "Porque yo sé los pensamientos que tengo acerca de vosotros, pensamientos de paz, y no de mal.", reference: "Jeremías 29:11" },
  { verse: "Los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.", reference: "Isaías 40:31" },
  { verse: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo.", reference: "Isaías 41:10" },
  { verse: "Ninguna arma forjada contra ti prosperará.", reference: "Isaías 54:17" },
  { verse: "Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo.", reference: "Josué 1:9" },
  { verse: "Jehová peleará por vosotros, y vosotros estaréis tranquilos.", reference: "Éxodo 14:14" },
  { verse: "Por la misericordia de Jehová no hemos sido consumidos, porque nunca decayeron sus misericordias.", reference: "Lamentaciones 3:22" },
  { verse: "Nuevas son cada mañana; grande es tu fidelidad.", reference: "Lamentaciones 3:23" },
  { verse: "Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces.", reference: "Jeremías 33:3" },
  { verse: "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.", reference: "Proverbios 3:5" },
  { verse: "Reconócelo en todos tus caminos, y él enderezará tus veredas.", reference: "Proverbios 3:6" },
  { verse: "El nombre de Jehová es torre fuerte; a él correrá el justo, y será levantado.", reference: "Proverbios 18:10" },
  { verse: "Todo tiene su tiempo, y todo lo que se quiere debajo del cielo tiene su hora.", reference: "Eclesiastés 3:1" },
  { verse: "El gozo de Jehová es vuestra fuerza.", reference: "Nehemías 8:10" },

  // ----- Nuevo Testamento -----
  { verse: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito.", reference: "Juan 3:16" },
  { verse: "Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mí.", reference: "Juan 14:6" },
  { verse: "La paz os dejo, mi paz os doy; no se turbe vuestro corazón, ni tenga miedo.", reference: "Juan 14:27" },
  { verse: "Estas cosas os he hablado para que en mí tengáis paz. En el mundo tendréis aflicción; pero confiad, yo he vencido al mundo.", reference: "Juan 16:33" },
  { verse: "A los que aman a Dios, todas las cosas les ayudan a bien.", reference: "Romanos 8:28" },
  { verse: "Si Dios es por nosotros, ¿quién contra nosotros?", reference: "Romanos 8:31" },
  { verse: "Ni la muerte, ni la vida, podrá separarnos del amor de Dios, que es en Cristo Jesús.", reference: "Romanos 8:38-39" },
  { verse: "Todo lo puedo en Cristo que me fortalece.", reference: "Filipenses 4:13" },
  { verse: "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración.", reference: "Filipenses 4:6" },
  { verse: "Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.", reference: "Filipenses 4:7" },
  { verse: "Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús.", reference: "Filipenses 4:19" },
  { verse: "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.", reference: "Mateo 11:28" },
  { verse: "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.", reference: "Mateo 6:33" },
  { verse: "Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.", reference: "Hebreos 11:1" },
  { verse: "Jesucristo es el mismo ayer, y hoy, y por los siglos.", reference: "Hebreos 13:8" },
  { verse: "Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.", reference: "1 Pedro 5:7" },
  { verse: "El amor es sufrido, es benigno; el amor no tiene envidia, no es jactancioso.", reference: "1 Corintios 13:4" },
  { verse: "Y ahora permanecen la fe, la esperanza y el amor, estos tres; pero el mayor de ellos es el amor.", reference: "1 Corintios 13:13" },
  { verse: "De modo que si alguno está en Cristo, nueva criatura es; las cosas viejas pasaron; he aquí todas son hechas nuevas.", reference: "2 Corintios 5:17" },
  { verse: "Bástate mi gracia; porque mi poder se perfecciona en la debilidad.", reference: "2 Corintios 12:9" },
  { verse: "El cual también nos hizo ministros competentes de un nuevo pacto.", reference: "2 Corintios 3:6" },
  { verse: "Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.", reference: "2 Timoteo 1:7" },
  { verse: "Fiel es Dios, que no os dejará ser tentados más de lo que podéis resistir.", reference: "1 Corintios 10:13" },
  { verse: "Gustad, y ved que es bueno Jehová; dichoso el hombre que confía en él.", reference: "Salmos 34:8" },
  { verse: "Cercano está Jehová a los quebrantados de corazón; y salva a los contritos de espíritu.", reference: "Salmos 34:18" },

  // ----- Más Salmos -----
  { verse: "Bienaventurado el varón que no anduvo en consejo de malos.", reference: "Salmos 1:1" },
  { verse: "Será como árbol plantado junto a corrientes de aguas, que da su fruto en su tiempo.", reference: "Salmos 1:3" },
  { verse: "¿Qué es el hombre, para que tengas de él memoria, y el hijo del hombre, para que lo visites?", reference: "Salmos 8:4" },
  { verse: "Los cielos cuentan la gloria de Dios, y el firmamento anuncia la obra de sus manos.", reference: "Salmos 19:1" },
  { verse: "Confía en Jehová, y haz el bien; y habitarás en la tierra, y te apacentarás de la verdad.", reference: "Salmos 37:3" },
  { verse: "Guarda silencio ante Jehová, y espera en él.", reference: "Salmos 37:7" },
  { verse: "Como el ciervo brama por las corrientes de las aguas, así clama por ti, oh Dios, el alma mía.", reference: "Salmos 42:1" },
  { verse: "¿Por qué te abates, oh alma mía, y por qué te turbas dentro de mí? Espera en Dios.", reference: "Salmos 42:5" },
  { verse: "Crea en mí, oh Dios, un corazón limpio, y renueva un espíritu recto dentro de mí.", reference: "Salmos 51:10" },
  { verse: "En el día que temo, yo en ti confío.", reference: "Salmos 56:3" },
  { verse: "Una cosa he demandado a Jehová, ésta buscaré; que esté yo en la casa de Jehová todos los días de mi vida.", reference: "Salmos 27:4" },
  { verse: "Jehová es la fortaleza de mi vida; ¿de quién he de atemorizarme?", reference: "Salmos 27:1b" },
  { verse: "Por la mañana sembrarás tu semilla; los que sembraron con lágrimas, con regocijo segarán.", reference: "Salmos 126:5" },
  { verse: "Si subiere a los cielos, allí estás tú; y si en el Seol hiciere mi estrado, he aquí, allí tú estás.", reference: "Salmos 139:8" },
  { verse: "Clamé a ti, oh Jehová; dije: Tú eres mi esperanza, y mi porción en la tierra de los vivientes.", reference: "Salmos 142:5" },
  { verse: "Jehová cumplirá su propósito en mí; tu misericordia, oh Jehová, es para siempre.", reference: "Salmos 138:8" },
  { verse: "Bendice, alma mía, a Jehová, y no olvides ninguno de sus beneficios.", reference: "Salmos 103:2" },
  { verse: "Como está de lejos el oriente del occidente, hizo alejar de nosotros nuestras rebeliones.", reference: "Salmos 103:12" },
  { verse: "Como el padre se compadece de los hijos, se compadece Jehová de los que le temen.", reference: "Salmos 103:13" },
  { verse: "Tú guardarás en completa paz a aquel cuyo pensamiento en ti persevera.", reference: "Isaías 26:3" },
  { verse: "Enséñame a hacer tu voluntad, porque tú eres mi Dios.", reference: "Salmos 143:10" },
  { verse: "Clemente y misericordioso es Jehová, lento para la ira, y grande en misericordia.", reference: "Salmos 145:8" },
  { verse: "La noche durará solo una noche; a la mañana vendrá la alegría.", reference: "Salmos 30:5" },
  { verse: "Tú cambiaste mi lamento en baile; desataste mi cilicio, y me ceñiste de alegría.", reference: "Salmos 30:11" },
  { verse: "Deposita en Jehová tus obras, y tus pensamientos serán afirmados.", reference: "Proverbios 16:3" },

  // ----- Más Antiguo Testamento -----
  { verse: "Esforzaos y cobrad ánimo; no temáis, porque Jehová tu Dios es el que va contigo.", reference: "Deuteronomio 31:6" },
  { verse: "Jehová es el que va delante de ti; él estará contigo, no te dejará, ni te desamparará.", reference: "Deuteronomio 31:8" },
  { verse: "No con ejército, ni con fuerza, sino con mi Espíritu, ha dicho Jehová de los ejércitos.", reference: "Zacarías 4:6" },
  { verse: "Grande es tu fidelidad; nuevas son tus misericordias cada mañana.", reference: "Lamentaciones 3:23b" },
  { verse: "Pedro andaba sobre las aguas; mas viendo el fuerte viento, tuvo miedo.", reference: "Mateo 14:30" },
  { verse: "Buscad a Jehová mientras puede ser hallado, llamadle en tanto que está cercano.", reference: "Isaías 55:6" },
  { verse: "Porque como los cielos son más altos que la tierra, así son mis caminos más altos que vuestros caminos.", reference: "Isaías 55:9" },
  { verse: "He aquí que yo hago cosa nueva; pronto saldrá a luz; ¿no la conoceréis?", reference: "Isaías 43:19" },
  { verse: "Cuando pases por las aguas, yo estaré contigo; y si por los ríos, no te anegarán.", reference: "Isaías 43:2" },
  { verse: "El Espíritu de Jehová el Señor está sobre mí, porque me ungió Jehová; me ha enviado a predicar buenas nuevas a los abatidos.", reference: "Isaías 61:1" },
  { verse: "Pero los que esperan a Jehová caminarán, y no se fatigarán.", reference: "Isaías 40:31b" },
  { verse: "Aunque la higuera no florezca, con todo, yo me alegraré en Jehová.", reference: "Habacuc 3:17-18" },
  { verse: "Jehová está en medio de ti, poderoso, él salvará; se gozará sobre ti con alegría.", reference: "Sofonías 3:17" },
  { verse: "Y seréis buscados por mí, y me hallaréis, porque me buscaréis de todo vuestro corazón.", reference: "Jeremías 29:13" },
  { verse: "Con amor eterno te he amado; por tanto, te prolongué mi misericordia.", reference: "Jeremías 31:3" },
  { verse: "Bienaventurado el varón que confía en Jehová, y cuya confianza es Jehová.", reference: "Jeremías 17:7" },
  { verse: "Humillaos, pues, bajo la poderosa mano de Dios, para que él os exalte cuando fuere tiempo.", reference: "1 Pedro 5:6" },
  { verse: "Pon tu esperanza en Jehová; sé valiente, y espera en él.", reference: "Salmos 27:14b" },

  // ----- Más Nuevo Testamento -----
  { verse: "Pedid, y se os dará; buscad, y hallaréis; llamad, y se os abrirá.", reference: "Mateo 7:7" },
  { verse: "Porque donde está vuestro tesoro, allí estará también vuestro corazón.", reference: "Mateo 6:21" },
  { verse: "Vosotros sois la luz del mundo; una ciudad asentada sobre un monte no se puede esconder.", reference: "Mateo 5:14" },
  { verse: "Bienaventurados los que lloran, porque ellos recibirán consolación.", reference: "Mateo 5:4" },
  { verse: "Venid en pos de mí, y os haré pescadores de hombres.", reference: "Mateo 4:19" },
  { verse: "Y he aquí yo estoy con vosotros todos los días, hasta el fin del mundo.", reference: "Mateo 28:20" },
  { verse: "Para los hombres es imposible, mas para Dios todo es posible.", reference: "Mateo 19:26" },
  { verse: "Yo soy la luz del mundo; el que me sigue, no andará en tinieblas.", reference: "Juan 8:12" },
  { verse: "Y conoceréis la verdad, y la verdad os hará libres.", reference: "Juan 8:32" },
  { verse: "Yo soy la resurrección y la vida; el que cree en mí, aunque esté muerto, vivirá.", reference: "Juan 11:25" },
  { verse: "En la casa de mi Padre muchas moradas hay; voy, pues, a preparar lugar para vosotros.", reference: "Juan 14:2" },
  { verse: "Yo soy la vid, vosotros los pámpanos; el que permanece en mí, éste lleva mucho fruto.", reference: "Juan 15:5" },
  { verse: "Nadie tiene mayor amor que este, que uno ponga su vida por sus amigos.", reference: "Juan 15:13" },
  { verse: "Pedid, y recibiréis, para que vuestro gozo sea cumplido.", reference: "Juan 16:24" },
  { verse: "Mas a todos los que le recibieron, les dio potestad de ser hechos hijos de Dios.", reference: "Juan 1:12" },
  { verse: "Así que la fe es por el oír, y el oír, por la palabra de Dios.", reference: "Romanos 10:17" },
  { verse: "No os conforméis a este siglo, sino transformaos por medio de la renovación de vuestro entendimiento.", reference: "Romanos 12:2" },
  { verse: "Gozaos con los que se gozan; llorad con los que lloran.", reference: "Romanos 12:15" },
  { verse: "No seas vencido de lo malo, sino vence con el bien el mal.", reference: "Romanos 12:21" },
  { verse: "Y el Dios de esperanza os llene de todo gozo y paz en el creer.", reference: "Romanos 15:13" },
  { verse: "Cosas que ojo no vio, ni oído oyó, son las que Dios ha preparado para los que le aman.", reference: "1 Corintios 2:9" },
  { verse: "Velad, estad firmes en la fe; portaos varonilmente, y esforzaos.", reference: "1 Corintios 16:13" },
  { verse: "Por tanto, no desmayamos; antes aunque este nuestro hombre exterior se va desgastando, el interior se renueva de día en día.", reference: "2 Corintios 4:16" },
  { verse: "Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios.", reference: "Efesios 2:8" },
  { verse: "Somos hechura suya, creados en Cristo Jesús para buenas obras.", reference: "Efesios 2:10" },
  { verse: "Y a Aquel que es poderoso para hacer todas las cosas mucho más abundantemente de lo que pedimos o entendemos.", reference: "Efesios 3:20" },
  { verse: "Vestíos de toda la armadura de Dios, para que podáis estar firmes contra las asechanzas del diablo.", reference: "Efesios 6:11" },
  { verse: "Estando persuadido de esto, que el que comenzó en vosotros la buena obra, la perfeccionará.", reference: "Filipenses 1:6" },
  { verse: "Regocijaos en el Señor siempre. Otra vez digo: ¡Regocijaos!", reference: "Filipenses 4:4" },
  { verse: "Todo lo que es verdadero, todo lo honesto, todo lo justo, todo lo puro... en esto pensad.", reference: "Filipenses 4:8" },
  { verse: "Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres.", reference: "Colosenses 3:23" },
  { verse: "Estad siempre gozosos. Orad sin cesar. Dad gracias en todo.", reference: "1 Tesalonicenses 5:16-18" },
  { verse: "Mas el Señor es fiel, que os afirmará y guardará del mal.", reference: "2 Tesalonicenses 3:3" },
  { verse: "Pelea la buena batalla de la fe, echa mano de la vida eterna.", reference: "1 Timoteo 6:12" },
  { verse: "Acerquémonos, pues, confiadamente al trono de la gracia, para alcanzar misericordia.", reference: "Hebreos 4:16" },
  { verse: "Y sin fe es imposible agradar a Dios.", reference: "Hebreos 11:6" },
  { verse: "Puestos los ojos en Jesús, el autor y consumador de la fe.", reference: "Hebreos 12:2" },
  { verse: "Sean vuestras costumbres sin avaricia, contentos con lo que tenéis ahora; porque él dijo: No te desampararé.", reference: "Hebreos 13:5" },
  { verse: "Tened por sumo gozo cuando os halléis en diversas pruebas.", reference: "Santiago 1:2" },
  { verse: "Si alguno de vosotros tiene falta de sabiduría, pídala a Dios, el cual da a todos abundantemente.", reference: "Santiago 1:5" },
  { verse: "Someteos, pues, a Dios; resistid al diablo, y huirá de vosotros.", reference: "Santiago 4:7" },
  { verse: "Acercaos a Dios, y él se acercará a vosotros.", reference: "Santiago 4:8" },
  { verse: "Bendito el Dios y Padre de nuestro Señor Jesucristo, que... nos hizo renacer para una esperanza viva.", reference: "1 Pedro 1:3" },
  { verse: "Mas vosotros sois linaje escogido, real sacerdocio, nación santa, pueblo adquirido por Dios.", reference: "1 Pedro 2:9" },
  { verse: "En esto consiste el amor: no en que nosotros hayamos amado a Dios, sino en que él nos amó a nosotros.", reference: "1 Juan 4:10" },
  { verse: "En el amor no hay temor, sino que el perfecto amor echa fuera el temor.", reference: "1 Juan 4:18" },
  { verse: "Y esta es la confianza que tenemos en él, que si pedimos alguna cosa conforme a su voluntad, él nos oye.", reference: "1 Juan 5:14" },
  { verse: "He aquí, yo estoy a la puerta y llamo; si alguno oye mi voz y abre la puerta, entraré a él.", reference: "Apocalipsis 3:20" },
  { verse: "Y enjugará Dios toda lágrima de los ojos de ellos; y ya no habrá muerte, ni habrá más llanto.", reference: "Apocalipsis 21:4" },
  { verse: "He aquí, yo hago nuevas todas las cosas.", reference: "Apocalipsis 21:5" },
];

/** Baraja + selección aleatoria evitando referencias usadas recientemente. */
export function pickScripture(opts?: { avoid?: string[] }): Scripture {
  const avoid = new Set((opts?.avoid ?? []).map((r) => r.trim()));
  const pool = SCRIPTURES.filter((s) => !avoid.has(s.reference));
  // Si ya se usaron casi todas, reinicia el pool para seguir variando.
  const from = pool.length > 0 ? pool : SCRIPTURES;
  return from[Math.floor(Math.random() * from.length)];
}

/** Aproxima el número de palabras objetivo para una duración. */
export function targetWordsFor(durationSec: number): number {
  return Math.floor(durationSec * NARRATION_WPS);
}
