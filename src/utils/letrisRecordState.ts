import { SupportedLanguage } from "../i18n/translations";

const STORE_KEY_PREFIX = "letris_best_v1";
const MAX_STORED_WORDS = 100;

function storeKey(lang: SupportedLanguage): string {
  return `${STORE_KEY_PREFIX}_${lang}`;
}

export interface LetrisRecord {
  score: number;
  wordsFound: number;
  words: string[]; // últimas palabras encontradas, en orden cronológico (tope MAX_STORED_WORDS)
}

export function getRecord(lang: SupportedLanguage): LetrisRecord | null {
  try {
    const raw = localStorage.getItem(storeKey(lang));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LetrisRecord>;
    return {
      score: parsed.score ?? 0,
      wordsFound: parsed.wordsFound ?? 0,
      words: parsed.words ?? [], // datos guardados antes de sumar esta lista
    };
  } catch {
    return null;
  }
}

// Suma el resultado de una partida terminada al récord acumulado de
// puntos y palabras encontradas de todos los tiempos (no es el mejor
// puntaje de una sola partida, es la suma histórica de todas).
export function addToRecord(lang: SupportedLanguage, scoreEarned: number, newWords: string[]): LetrisRecord {
  const current = getRecord(lang) ?? { score: 0, wordsFound: 0, words: [] };
  const updated: LetrisRecord = {
    score: current.score + scoreEarned,
    wordsFound: current.wordsFound + newWords.length,
    words: [...current.words, ...newWords].slice(-MAX_STORED_WORDS),
  };
  localStorage.setItem(storeKey(lang), JSON.stringify(updated));
  return updated;
}
