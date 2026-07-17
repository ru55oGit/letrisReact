import { SupportedLanguage } from "../i18n/translations";

const STORE_KEY_PREFIX = "letris_best_v1";

function storeKey(lang: SupportedLanguage): string {
  return `${STORE_KEY_PREFIX}_${lang}`;
}

export interface LetrisRecord {
  score: number;
  wordsFound: number;
  date: string;
}

export function getRecord(lang: SupportedLanguage): LetrisRecord | null {
  try {
    const raw = localStorage.getItem(storeKey(lang));
    return raw ? (JSON.parse(raw) as LetrisRecord) : null;
  } catch {
    return null;
  }
}

export function maybeSaveRecord(lang: SupportedLanguage, score: number, wordsFound: number): boolean {
  const current = getRecord(lang);
  if (current && current.score >= score) return false;

  const isoDate = new Date().toISOString().slice(0, 10);
  localStorage.setItem(storeKey(lang), JSON.stringify({ score, wordsFound, date: isoDate }));
  return true;
}
