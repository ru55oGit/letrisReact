import { SupportedLanguage } from "../i18n/translations";

const STORE_KEY_PREFIX = "letris_best_v1";

function storeKey(lang: SupportedLanguage): string {
  return `${STORE_KEY_PREFIX}_${lang}`;
}

export interface LetrisRecord {
  score: number;
  wordsFound: number;
  words: string[]; // palabras encontradas en la partida que estableció este récord
}

export function getRecord(lang: SupportedLanguage): LetrisRecord | null {
  try {
    const raw = localStorage.getItem(storeKey(lang));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LetrisRecord>;
    return {
      score: parsed.score ?? 0,
      wordsFound: parsed.wordsFound ?? 0,
      words: parsed.words ?? [], // por si el récord se guardó antes de sumar esta lista
    };
  } catch {
    return null;
  }
}

// Guarda el resultado de una partida terminada SOLO si supera el mejor
// puntaje anterior; en ese caso reemplaza por completo el récord (puntos,
// cantidad y palabras) por los de esta partida. Si no lo supera, no toca
// nada. Devuelve true si quedó como nuevo récord.
export function maybeSaveRecord(lang: SupportedLanguage, score: number, words: string[]): boolean {
  const current = getRecord(lang);
  if (current && current.score >= score) return false;

  const updated: LetrisRecord = { score, wordsFound: words.length, words };
  localStorage.setItem(storeKey(lang), JSON.stringify(updated));
  return true;
}
