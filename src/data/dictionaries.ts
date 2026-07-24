import esWords from "an-array-of-spanish-words";
import enWords from "an-array-of-english-words";
import ptWords from "an-array-of-portuguese-words";
import { EXTRA_NAMES_ES } from "./extraNames";
import { SupportedLanguage } from "../i18n/translations";

// El pozo del Letris solo usa A-Z sin acentos (igual que la grilla de
// Sopalo), así que las palabras del diccionario se pliegan a ese mismo
// alfabeto para poder matchearlas: café→CAFE, ação→ACAO, año→ANO. Esto es
// intencional acá (a diferencia de la Ñ en Sopalo, que sí se muestra tal
// cual porque su grilla admite acentos).
function foldToPlainAZ(word: string): string {
  return word
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();
}

function buildWordSet(rawWords: string[]): Set<string> {
  const set = new Set<string>();
  for (const w of rawWords) {
    const folded = foldToPlainAZ(w);
    if (folded.length >= 3 && /^[A-Z]+$/.test(folded)) set.add(folded);
  }
  return set;
}

const WORD_SETS: Record<SupportedLanguage, Set<string>> = {
  es: buildWordSet([...(esWords as unknown as string[]), ...EXTRA_NAMES_ES]),
  en: buildWordSet(enWords as unknown as string[]),
  pt: buildWordSet(ptWords as unknown as string[]),
};

export function isValidWord(word: string, lang: SupportedLanguage): boolean {
  return WORD_SETS[lang].has(word.toUpperCase());
}
