import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import RotateLeftRoundedIcon from "@mui/icons-material/RotateLeftRounded";
import RotateRightRoundedIcon from "@mui/icons-material/RotateRightRounded";
import Layout from "../components/Layout";
import LetrisBoard from "../components/LetrisBoard";
import FoundWordsList, { FoundWordEntry } from "../components/FoundWordsList";
import { useLanguage } from "../i18n/LanguageContext";
import {
  Board,
  FallingPiece,
  createEmptyBoard,
  spawnPiece,
  hasCollision,
  tryMove,
  tryRotate,
  lockPiece,
  levelFromWordsFound,
  gravityIntervalMs,
} from "../utils/letrisEngine";
import { evaluateSelection, columnsFromCells, GridCell } from "../utils/letrisWords";
import { collapseColumns } from "../utils/letrisEngine";
import { addToRecord } from "../utils/letrisRecordState";

const ACCENT = "#e74c3c";
const FEEDBACK_DURATION_MS = 1300;
const CLEAR_DELAY_MS = 260;

type Phase = "playing" | "gameover";

interface GameState {
  board: Board;
  fallingPiece: FallingPiece;
  phase: Phase;
}

function removeCellsAndCollapse(board: Board, cells: GridCell[]): Board {
  const cleared = board.map((row) => [...row]);
  for (const { row, col } of cells) cleared[row][col] = null;
  return collapseColumns(cleared, columnsFromCells(cells));
}

export default function Game() {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();

  const [gameState, setGameState] = useState<GameState>(() => {
    const board = createEmptyBoard();
    return { board, fallingPiece: spawnPiece(currentLanguage), phase: "playing" };
  });
  const [score, setScore] = useState(0);
  const [foundWords, setFoundWords] = useState<FoundWordEntry[]>([]);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState<{ cells: GridCell[]; kind: "success" | "error" } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedRecordRef = useRef(false);

  const level = levelFromWordsFound(foundWords.length);

  // Gravedad automática.
  useEffect(() => {
    if (gameState.phase !== "playing") return;
    const interval = setInterval(() => {
      setGameState((prev) => {
        if (prev.phase !== "playing") return prev;
        const moved = tryMove(prev.board, prev.fallingPiece, 1, 0);
        if (moved) return { ...prev, fallingPiece: moved };

        const { board: lockedBoard, gameOver } = lockPiece(prev.board, prev.fallingPiece);
        if (gameOver) return { ...prev, board: lockedBoard, phase: "gameover" };

        const nextPiece = spawnPiece(currentLanguage);
        if (hasCollision(lockedBoard, nextPiece.matrix, nextPiece.row, nextPiece.col)) {
          return { ...prev, board: lockedBoard, phase: "gameover" };
        }
        return { board: lockedBoard, fallingPiece: nextPiece, phase: "playing" };
      });
    }, gravityIntervalMs(level));
    return () => clearInterval(interval);
  }, [gameState.phase, level, currentLanguage]);

  // Sumar el resultado de esta partida al récord acumulado al terminar.
  useEffect(() => {
    if (gameState.phase === "gameover" && !savedRecordRef.current) {
      savedRecordRef.current = true;
      addToRecord(currentLanguage, score, foundWords.length);
    }
  }, [gameState.phase, currentLanguage, score, foundWords.length]);

  function scheduleFeedbackClear() {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => {
      setFlash(null);
      setErrorMsg("");
    }, FEEDBACK_DURATION_MS);
  }

  function handleMove(dCol: number) {
    setGameState((prev) => {
      if (prev.phase !== "playing") return prev;
      const moved = tryMove(prev.board, prev.fallingPiece, 0, dCol);
      return moved ? { ...prev, fallingPiece: moved } : prev;
    });
  }

  function handleSoftDrop() {
    setGameState((prev) => {
      if (prev.phase !== "playing") return prev;
      const moved = tryMove(prev.board, prev.fallingPiece, 1, 0);
      return moved ? { ...prev, fallingPiece: moved } : prev;
    });
  }

  function handleRotate(dir: "cw" | "ccw") {
    setGameState((prev) => {
      if (prev.phase !== "playing") return prev;
      const rotated = tryRotate(prev.board, prev.fallingPiece, dir);
      return rotated ? { ...prev, fallingPiece: rotated } : prev;
    });
  }

  function handleSelectionEnd(cells: GridCell[]) {
    if (gameState.phase !== "playing" || cells.length < 3) return;

    const result = evaluateSelection(gameState.board, cells, currentLanguage, usedWords);

    if (result.status === "invalid") {
      setFlash({ cells, kind: "error" });
      setErrorMsg(t.errorNotInDictionary);
      scheduleFeedbackClear();
      return;
    }

    if (result.status === "repeat") {
      setScore((s) => Math.max(0, s + result.points));
      setFlash({ cells, kind: "error" });
      setErrorMsg(t.errorAlreadyUsed(result.word));
      scheduleFeedbackClear();
      return;
    }

    setScore((s) => s + result.points);
    setFoundWords((prev) => [...prev, { word: result.word, points: result.points }]);
    setUsedWords((prev) => new Set(prev).add(result.word));
    setFlash({ cells, kind: "success" });

    if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
    clearTimeoutRef.current = setTimeout(() => {
      setGameState((prev) => ({ ...prev, board: removeCellsAndCollapse(prev.board, cells) }));
      setFlash(null);
    }, CLEAR_DELAY_MS);
  }

  function restartGame() {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
    savedRecordRef.current = false;
    setScore(0);
    setFoundWords([]);
    setUsedWords(new Set());
    setFlash(null);
    setErrorMsg("");
    setGameState({ board: createEmptyBoard(), fallingPiece: spawnPiece(currentLanguage), phase: "playing" });
  }

  if (gameState.phase === "gameover") {
    return (
      <Layout onBack={() => navigate("/")}>
        <Box sx={{ width: "100%", px: { xs: 1.5, md: 2 }, pb: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ borderRadius: "16px", backgroundColor: "#f3f3f3", p: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: 52 }}>🧩</Typography>
            <Typography sx={{ fontFamily: "Lobster, cursive", fontSize: 26, color: "#222", textAlign: "center" }}>
              {t.gameOverTitle}
            </Typography>
            <Typography sx={{ color: "#666", fontSize: 16 }}>{t.gameOverBody(score)}</Typography>
          </Box>
          <Button onClick={restartGame} variant="contained" size="large" sx={{
            backgroundColor: "#fff", color: ACCENT, fontWeight: 800, fontSize: 18,
            py: 1.6, borderRadius: 999, textTransform: "none",
            boxShadow: "0 0 0 4px rgba(255,255,255,0.35), 0 10px 24px rgba(0,0,0,0.4)",
          }}>
            {t.playAgainButton}
          </Button>
          <Button onClick={() => navigate("/")} sx={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
            {t.backToHomeButton}
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout onBack={() => navigate("/")}>
      <Box sx={{ width: "100%", px: { xs: 1.5, md: 2 }, pb: 2, display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 13, textTransform: "uppercase", opacity: 0.8 }}>
            {t.scoreLabel}
          </Typography>
          <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: 20, fontFamily: "monospace" }}>
            {score}
          </Typography>
        </Box>

        <Box sx={{ minHeight: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {errorMsg && (
            <Typography sx={{ color: "#fff", backgroundColor: "rgba(0,0,0,0.25)", px: 1.5, py: 0.25, borderRadius: 999, fontSize: 12, fontWeight: 700, textAlign: "center" }}>
              {errorMsg}
            </Typography>
          )}
        </Box>

        <Box sx={{ borderRadius: "16px", overflow: "hidden", backgroundColor: "#fff", p: 1 }}>
          <LetrisBoard
            board={gameState.board}
            fallingPiece={gameState.fallingPiece}
            onSelectionEnd={handleSelectionEnd}
            flashCells={flash}
          />
        </Box>

        <Box sx={{ display: "flex", width: "100%", gap: "2px", height: 24 }}>
          <Button onClick={() => handleMove(-1)} sx={controlButtonSx}>
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 14 }} />
          </Button>
          <Button onClick={() => handleRotate("ccw")} sx={controlButtonSx}>
            <RotateLeftRoundedIcon sx={{ fontSize: 16 }} />
          </Button>
          <Button onClick={handleSoftDrop} sx={controlButtonSx}>
            <ArrowDownwardRoundedIcon sx={{ fontSize: 14 }} />
          </Button>
          <Button onClick={() => handleRotate("cw")} sx={controlButtonSx}>
            <RotateRightRoundedIcon sx={{ fontSize: 16 }} />
          </Button>
          <Button onClick={() => handleMove(1)} sx={controlButtonSx}>
            <ArrowForwardIosRoundedIcon sx={{ fontSize: 14 }} />
          </Button>
        </Box>

        <FoundWordsList title={t.wordsListTitle} emptyLabel={t.wordsListEmpty} words={foundWords} />
      </Box>
    </Layout>
  );
}

const controlButtonSx = {
  flex: 1,
  minWidth: 0,
  height: 24,
  minHeight: 24,
  padding: 0,
  borderRadius: "6px",
  backgroundColor: "#fff",
  color: ACCENT,
  "&:hover": { backgroundColor: "#f3f3f3" },
};
