import { SupportedLanguage } from "../i18n/translations";

const STORE_KEY_PREFIX = "letris_best_v1";

function storeKey(lang: SupportedLanguage): string {
  return `${STORE_KEY_PREFIX}_${lang}`;
}

export interface LetrisRecord {
  score: number;
  wordsFound: number;
}

export function getRecord(lang: SupportedLanguage): LetrisRecord | null {
  try {
    const raw = localStorage.getItem(storeKey(lang));
    return raw ? (JSON.parse(raw) as LetrisRecord) : null;
  } catch {
    return null;
  }
}

// Suma el resultado de una partida terminada al récord acumulado de
// puntos y palabras encontradas de todos los tiempos (no es el mejor
// puntaje de una sola partida, es la suma histórica de todas).
export function addToRecord(
  lang: SupportedLanguage,
  scoreEarned: number,
  wordsFoundThisGame: number
): LetrisRecord {
  const current = getRecord(lang) ?? { score: 0, wordsFound: 0 };
  const updated: LetrisRecord = {
    score: current.score + scoreEarned,
    wordsFound: current.wordsFound + wordsFoundThisGame,
  };
  localStorage.setItem(storeKey(lang), JSON.stringify(updated));
  return updated;
}
