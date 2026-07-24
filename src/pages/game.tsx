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
import { recordLastPlayed } from "../utils/lastPlayedState";
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
  wordsIntoCurrentLevel,
  wordsRequiredForLevel,
  gravityIntervalMs,
} from "../utils/letrisEngine";
import { evaluateSelection, columnsFromCells, GridCell } from "../utils/letrisWords";
import { collapseColumns } from "../utils/letrisEngine";
import { maybeSaveRecord } from "../utils/letrisRecordState";

const ACCENT = "#e74c3c";
const FEEDBACK_DURATION_MS = 1300;
const CLEAR_DELAY_MS = 260;
const LEVEL_UP_POPUP_MS = 1800;

type Phase = "playing" | "levelup" | "gameover";

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
  const [levelUpNumber, setLevelUpNumber] = useState<number | null>(null);

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const levelUpTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedRecordRef = useRef(false);

  useEffect(() => {
    recordLastPlayed();
  }, []);

  const level = levelFromWordsFound(foundWords.length);
  const wordsInLevel = wordsIntoCurrentLevel(foundWords.length);
  const levelGoal = wordsRequiredForLevel(level);

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

  // Guardar récord al terminar, solo si esta partida supera alguno.
  useEffect(() => {
    if (gameState.phase === "gameover" && !savedRecordRef.current) {
      savedRecordRef.current = true;
      maybeSaveRecord(currentLanguage, score, foundWords.map((f) => f.word));
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
    const newTotalWords = foundWords.length + 1;
    setFoundWords((prev) => [...prev, { word: result.word, points: result.points }]);
    setUsedWords((prev) => new Set(prev).add(result.word));
    setFlash({ cells, kind: "success" });

    const willLevelUp = wordsIntoCurrentLevel(newTotalWords) === 0;
    const newLevel = levelFromWordsFound(newTotalWords);

    if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
    clearTimeoutRef.current = setTimeout(() => {
      setGameState((prev) => ({ ...prev, board: removeCellsAndCollapse(prev.board, cells) }));
      setFlash(null);

      if (willLevelUp) {
        setLevelUpNumber(newLevel);
        setGameState((prev) => ({ ...prev, phase: "levelup" }));
        if (levelUpTimeoutRef.current) clearTimeout(levelUpTimeoutRef.current);
        levelUpTimeoutRef.current = setTimeout(() => {
          setLevelUpNumber(null);
          setGameState({ board: createEmptyBoard(), fallingPiece: spawnPiece(currentLanguage), phase: "playing" });
        }, LEVEL_UP_POPUP_MS);
      }
    }, CLEAR_DELAY_MS);
  }

  function restartGame() {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
    if (levelUpTimeoutRef.current) clearTimeout(levelUpTimeoutRef.current);
    savedRecordRef.current = false;
    setScore(0);
    setFoundWords([]);
    setUsedWords(new Set());
    setFlash(null);
    setErrorMsg("");
    setLevelUpNumber(null);
    setGameState({ board: createEmptyBoard(), fallingPiece: spawnPiece(currentLanguage), phase: "playing" });
  }

  if (gameState.phase === "gameover") {
    const levelReached = levelFromWordsFound(foundWords.length);
    return (
      <Layout onBack={() => navigate("/")}>
        <Box sx={{ width: "100%", px: { xs: 1.5, md: 2 }, pb: 2, display: "flex", flexDirection: "column", gap: 2 }}>
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

          <Box sx={{ borderRadius: "16px", backgroundColor: "#f3f3f3", p: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: 52 }}>🧩</Typography>
            <Typography sx={{ fontFamily: "Lobster, cursive", fontSize: 26, color: "#222", textAlign: "center" }}>
              {t.gameOverTitle}
            </Typography>
            <Typography sx={{ color: "#666", fontSize: 16 }}>{t.gameOverBody(score)}</Typography>
          </Box>

          <Box sx={{ borderRadius: "16px", backgroundColor: "#fff", p: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#222", mb: 1 }}>
              {t.levelReachedLabel(levelReached)}
            </Typography>
            <FoundWordsList title={t.wordsListTitle} emptyLabel={t.wordsListEmpty} words={foundWords} />
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout onBack={() => navigate("/")}>
      <Box sx={{ width: "100%", px: { xs: 1.5, md: 2 }, pb: 2, display: "flex", flexDirection: "column" }}>
        <Box sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          backgroundColor: "rgba(0,0,0,0.18)", borderRadius: "16px", px: 2, py: 1.25, mb: 2,
        }}>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>
            {t.levelLabel} {level}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: 13 }}>
            {t.levelGoalLabel(wordsInLevel, levelGoal)}
          </Typography>
        </Box>

        <Box sx={{ position: "relative", borderRadius: "16px", overflow: "hidden", backgroundColor: "#fff", p: 1, mb: 1 }}>
          <LetrisBoard
            board={gameState.board}
            fallingPiece={gameState.fallingPiece}
            onSelectionEnd={handleSelectionEnd}
            flashCells={flash}
          />

          {errorMsg && (
            <Box sx={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", zIndex: 2 }}>
              <Typography sx={{ color: "#fff", backgroundColor: "rgba(0,0,0,0.7)", px: 1.5, py: 0.5, borderRadius: 999, fontSize: 12, fontWeight: 700, textAlign: "center", whiteSpace: "nowrap" }}>
                {errorMsg}
              </Typography>
            </Box>
          )}

          {gameState.phase === "levelup" && levelUpNumber !== null && (
            <Box sx={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
              backgroundColor: "rgba(255,255,255,0.96)", textAlign: "center", px: 2,
            }}>
              <Typography sx={{ fontSize: 44 }}>🎉</Typography>
              <Typography sx={{ fontFamily: "Lobster, cursive", fontSize: 32, color: ACCENT }}>
                {t.levelUpTitle(levelUpNumber)}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", width: "100%", gap: "2px", mb: 1 }}>
          <Button onClick={() => handleMove(-1)} sx={controlButtonSx}>
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 24 }} />
          </Button>
          <Button onClick={() => handleRotate("ccw")} sx={controlButtonSx}>
            <RotateLeftRoundedIcon sx={{ fontSize: 28 }} />
          </Button>
          <Button onClick={handleSoftDrop} sx={controlButtonSx}>
            <ArrowDownwardRoundedIcon sx={{ fontSize: 24 }} />
          </Button>
          <Button onClick={() => handleRotate("cw")} sx={controlButtonSx}>
            <RotateRightRoundedIcon sx={{ fontSize: 28 }} />
          </Button>
          <Button onClick={() => handleMove(1)} sx={controlButtonSx}>
            <ArrowForwardIosRoundedIcon sx={{ fontSize: 24 }} />
          </Button>
        </Box>

        <FoundWordsList
          title={t.wordsListTitle}
          emptyLabel={t.wordsListEmpty}
          words={foundWords}
          scoreLabel={t.scoreLabel}
          score={score}
        />
      </Box>
    </Layout>
  );
}

const controlButtonSx = {
  flex: 1,
  minWidth: 0,
  aspectRatio: "1 / 1",
  padding: 0,
  borderRadius: "12px",
  backgroundColor: "#fff",
  color: ACCENT,
  "&:hover": { backgroundColor: "#f3f3f3" },
};
