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
