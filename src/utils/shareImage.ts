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

// Textos ya formateados/traducidos por el caller (t.levelReachedLabel,
// etc.) — esta función no sabe de idiomas, solo dibuja.
export interface LetrisShareLabels {
  levelLabel: string; // ej "Nivel alcanzado: 4"
  pointsLabel: string; // ej "PUNTOS (441)"
  wordsSectionLabel: string; // ej "PALABRAS ENCONTRADAS (44)"
  repeatPenaltyLabel?: string; // ej "-3 puntos por palabras repetidas"
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

// Mismo degradé que el fondo de toda la app (ver Layout/index.tsx), no un
// color aparte inventado para esta imagen.
const BG_GRADIENT_FROM = "#a34747";
const BG_GRADIENT_TO = "#F44336";
const COLOR_WHITE = "#ffffff";
const COLOR_MUTED = "rgba(255, 255, 255, 0.65)";
const COLOR_PENALTY = "rgba(255, 255, 255, 0.75)";
const ACCENT = "#e74c3c";
const CARD_LABEL_COLOR = "#888888";

export async function buildLetrisResultPngFile(
  words: LetrisShareWord[],
  labels: LetrisShareLabels,
  filename: string,
): Promise<File | null> {
  const width = 560;
  const padding = 28;
  const chipHeight = 34;
  const chipGapX = 8;
  const chipGapY = 8;
  const headerHeight = 196;

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
  // Card blanca detrás de la lista de palabras (label + chips), para que no
  // se pierdan contra el degradé rojo de fondo.
  const cardInset = 16;
  const cardTop = headerHeight - 40;
  const cardBottom = headerHeight + rowsHeight + 16;
  const height = cardBottom + (labels.repeatPenaltyLabel ? 44 : 20);

  canvas.width = width;
  canvas.height = height;

  // Tarjeta: la imagen entera es la tarjeta (bordes redondeados + fondo en
  // degradé de marca, reemplaza el blanco plano de antes).
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, BG_GRADIENT_FROM);
  gradient.addColorStop(1, BG_GRADIENT_TO);
  ctx.fillStyle = gradient;
  roundRectPath(ctx, 0, 0, width, height, 28);
  ctx.fill();

  // Título de marca, más grande.
  ctx.fillStyle = COLOR_WHITE;
  ctx.font = "bold 40px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("www.letris.net", width / 2, 50);

  // Nivel alcanzado + puntos, centrados.
  ctx.fillStyle = COLOR_WHITE;
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(labels.levelLabel, width / 2, 98);

  ctx.fillStyle = COLOR_MUTED;
  ctx.font = "bold 12px sans-serif";
  ctx.fillText(labels.pointsLabel, width / 2, 130);

  // Card blanca detrás de la lista.
  ctx.fillStyle = COLOR_WHITE;
  roundRectPath(ctx, cardInset, cardTop, width - cardInset * 2, cardBottom - cardTop, 16);
  ctx.fill();

  // Etiqueta de la lista.
  ctx.fillStyle = CARD_LABEL_COLOR;
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(labels.wordsSectionLabel, padding, 176);

  // Chips de palabras, en filas (mismo tinte rojo que la lista real en
  // pantalla, ahora que tienen la card blanca atrás para destacar).
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

  // Penalización por palabras repetidas, centrada abajo de todo (solo si
  // hubo alguna), afuera de la card blanca.
  if (labels.repeatPenaltyLabel) {
    ctx.fillStyle = COLOR_PENALTY;
    ctx.font = "600 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(labels.repeatPenaltyLabel, width / 2, height - 16);
  }

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return null;

  return new File([blob], filename, { type: "image/png" });
}
