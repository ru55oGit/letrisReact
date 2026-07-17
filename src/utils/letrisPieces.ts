// Piezas de Tetris representadas como matriz 4x4 booleana (convención
// "guideline" clásica, orientación de spawn). Rotarlas es simplemente
// rotar la matriz 90°, así que si guardamos las letras DENTRO de la
// matriz (en vez de en una lista aparte con offsets por rotación), la
// identidad "esta celda tiene esta letra" viaja sola al rotar.

export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export const PIECE_TYPES: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];

// true = celda ocupada por la pieza en su rotación de spawn.
const SHAPES: Record<PieceType, boolean[][]> = {
  I: [
    [false, false, false, false],
    [true, true, true, true],
    [false, false, false, false],
    [false, false, false, false],
  ],
  O: [
    [false, true, true, false],
    [false, true, true, false],
    [false, false, false, false],
    [false, false, false, false],
  ],
  T: [
    [false, true, false, false],
    [true, true, true, false],
    [false, false, false, false],
    [false, false, false, false],
  ],
  S: [
    [false, true, true, false],
    [true, true, false, false],
    [false, false, false, false],
    [false, false, false, false],
  ],
  Z: [
    [true, true, false, false],
    [false, true, true, false],
    [false, false, false, false],
    [false, false, false, false],
  ],
  J: [
    [true, false, false, false],
    [true, true, true, false],
    [false, false, false, false],
    [false, false, false, false],
  ],
  L: [
    [false, false, true, false],
    [true, true, true, false],
    [false, false, false, false],
    [false, false, false, false],
  ],
};

export const PIECE_COLORS: Record<PieceType, string> = {
  I: "#3ba7e0",
  O: "#e0c93b",
  T: "#a35be0",
  S: "#4fbf6b",
  Z: "#e05c5c",
  J: "#4a6de0",
  L: "#e08a3b",
};

export function getSpawnShape(type: PieceType): boolean[][] {
  return SHAPES[type].map((row) => [...row]);
}

// Rota una matriz NxN 90° en sentido horario.
export function rotateMatrixCW<T>(matrix: T[][]): T[][] {
  const n = matrix.length;
  const result: T[][] = Array.from({ length: n }, () => new Array(n));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[c][n - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

export function rotateMatrixCCW<T>(matrix: T[][]): T[][] {
  const n = matrix.length;
  const result: T[][] = Array.from({ length: n }, () => new Array(n));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[n - 1 - c][r] = matrix[r][c];
    }
  }
  return result;
}
