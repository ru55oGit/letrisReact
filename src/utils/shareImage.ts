// Redibuja el resultado de la partida en un canvas para compartirlo como
// imagen (navigator.share({ files: [...] })). No se clona el DOM real: los
// estilos de MUI (className hasheado por Emotion) no viajan a un canvas de
// forma confiable entre navegadores — mismo criterio que el resto del hub
// (ver shareImage.ts de enroscaloReact/emojinaloReact/imaginaloReact). Se
// redibuja desde los mismos datos (foundWords/score/level) que ya usa la
// pantalla de game over.

interface LetrisShareWord {
  word: string;
  points: number;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const ACCENT = "#e74c3c";

export async function buildLetrisResultPngFile(
  words: LetrisShareWord[],
  score: number,
  level: number,
  filename: string,
): Promise<File | null> {
  const width = 560;
  const padding = 28;
  const chipHeight = 34;
  const chipGapX = 8;
  const chipGapY = 8;
  const headerHeight = 168;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Primera pasada: medir el ancho de cada chip "PALABRA +N" para armar las
  // filas (wrap) antes de saber el alto final del canvas.
  ctx.font = "bold 14px monospace";
  const maxRowWidth = width - padding * 2;
  const chips = words.map((w) => {
    const label = `${w.word} +${w.points}`;
    return { label, width: ctx.measureText(label).width + 24 };
  });

  const rows: { label: string; width: number }[][] = [];
  let currentRow: typeof chips = [];
  let currentRowWidth = 0;
  for (const chip of chips) {
    const needed = currentRow.length === 0 ? chip.width : currentRowWidth + chipGapX + chip.width;
    if (needed > maxRowWidth && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [chip];
      currentRowWidth = chip.width;
    } else {
      currentRow.push(chip);
      currentRowWidth = needed;
    }
  }
  if (currentRow.length > 0) rows.push(currentRow);

  const rowsHeight = Math.max(rows.length, 1) * (chipHeight + chipGapY);
  const height = headerHeight + rowsHeight + padding;

  canvas.width = width;
  canvas.height = height;

  // Tarjeta blanca redondeada, igual que el resto del hub.
  ctx.fillStyle = "#ffffff";
  roundRectPath(ctx, 0, 0, width, height, 28);
  ctx.fill();

  // Título de marca.
  ctx.fillStyle = ACCENT;
  ctx.font = "bold 30px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("www.letris.net", width / 2, 44);

  // Nivel alcanzado + puntos.
  ctx.fillStyle = "#222222";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(`Nivel alcanzado: ${level}`, width / 2, 86);

  ctx.fillStyle = "#666666";
  ctx.font = "600 16px sans-serif";
  ctx.fillText(`${score} puntos`, width / 2, 116);

  // Etiqueta de la lista.
  ctx.fillStyle = "#888888";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`PALABRAS ENCONTRADAS (${words.length})`, padding, 148);

  // Chips de palabras, en filas (igual estética que FoundWordsList).
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  let y = headerHeight;
  for (const row of rows) {
    let x = padding;
    for (const chip of row) {
      ctx.fillStyle = "rgba(231, 76, 60, 0.1)";
      roundRectPath(ctx, x, y, chip.width, chipHeight, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(231, 76, 60, 0.35)";
      ctx.lineWidth = 1;
      roundRectPath(ctx, x, y, chip.width, chipHeight, 6);
      ctx.stroke();

      ctx.fillStyle = ACCENT;
      ctx.fillText(chip.label, x + 12, y + chipHeight / 2 + 1);

      x += chip.width + chipGapX;
    }
    y += chipHeight + chipGapY;
  }

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return null;

  return new File([blob], filename, { type: "image/png" });
}
