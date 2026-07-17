import { SupportedLanguage } from "../i18n/translations";
import { isValidWord } from "../data/dictionaries";
import { Board } from "./letrisEngine";

export interface GridCell {
  row: number;
  col: number;
}

// Devuelve las celdas entre start y end SOLO si forman una línea recta
// (horizontal, vertical o diagonal a 45°); si no, null (selección inválida).
export function getLineCells(start: GridCell, end: GridCell): GridCell[] | null {
  const dRow = end.row - start.row;
  const dCol = end.col - start.col;

  if (dRow === 0 && dCol === 0) return [{ row: start.row, col: start.col }];
  if (dRow !== 0 && dCol !== 0 && Math.abs(dRow) !== Math.abs(dCol)) return null;

  const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
  const stepRow = Math.sign(dRow);
  const stepCol = Math.sign(dCol);

  const cells: GridCell[] = [];
  for (let i = 0; i <= steps; i++) {
    cells.push({ row: start.row + stepRow * i, col: start.col + stepCol * i });
  }
  return cells;
}

function extractWord(board: Board, cells: GridCell[]): string | null {
  let word = "";
  for (const { row, col } of cells) {
    const letter = board[row]?.[col];
    if (!letter) return null; // alguna celda de la selección está vacía
    word += letter;
  }
  return word;
}

export type SelectionResult =
  | { status: "invalid" }
  | { status: "new"; word: string; cells: GridCell[]; points: number }
  | { status: "repeat"; word: string; points: number };

function pointsForWord(word: string): number {
  const lengthBonus = Math.max(0, word.length - 4);
  return 10 + lengthBonus;
}

export function evaluateSelection(
  board: Board,
  cells: GridCell[],
  lang: SupportedLanguage,
  usedWords: Set<string>
): SelectionResult {
  if (cells.length < 3) return { status: "invalid" };

  const forward = extractWord(board, cells);
  if (!forward) return { status: "invalid" };
  const backward = [...forward].reverse().join("");

  const word = isValidWord(forward, lang) ? forward : isValidWord(backward, lang) ? backward : null;
  if (!word) return { status: "invalid" };

  if (usedWords.has(word)) {
    return { status: "repeat", word, points: -1 };
  }

  return { status: "new", word, cells, points: pointsForWord(word) };
}

export function columnsFromCells(cells: GridCell[]): Set<number> {
  return new Set(cells.map((c) => c.col));
}
