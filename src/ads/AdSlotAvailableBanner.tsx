// Copiado de boludeando-ads/sdk/boludeando-ads-client/src/AdSlotAvailableBanner.tsx el 2026-10-09.
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";

// Fallback que HouseAdBanner muestra en vez de nada cuando un slot
// house/sold no tiene ninguna creatividad real elegible: en vez de dejar el
// espacio en blanco, invita a anunciar ahí mismo. Diseño armado por el
// usuario (banner-anuncia.html), portado a React/MUI acá.
const ROTATING_LINES = [
  "Tu marca podría estar acá",
  "Que te vean mientras juegan",
  "Ideal para tu emprendimiento",
  "Cargás tu aviso en 2 minutos",
  "Anunciá en Boludeando",
];

const ROTATE_INTERVAL_MS = 2800;
const EXIT_DURATION_MS = 500;
const SIGNUP_URL = "https://ads-api.boludeando.com/login";

interface AdSlotAvailableBannerProps {
  // 1000 = tier "banner" (default, ver adFormats.ts). Pasar 2000 para el
  // fallback del slot "banner doble". Sin separador de miles en los tiles:
  // ocupa menos ancho horizontal y deja más lugar al texto rotativo.
  weeklyPrice?: number;
  // true para el fallback del slot "banner doble" — el alto (y el resto de
  // las medidas internas) se duplica para que no "salte" de tamaño cuando
  // una campaña real reemplaza el fallback (HouseAdBanner renderiza esa
  // campaña a aspectRatio 2:1, el doble de alto que el banner simple 4:1).
  double?: boolean;
  accentColor?: string;
  inkColor?: string;
}

export default function AdSlotAvailableBanner({
  weeklyPrice = 1000,
  double = false,
  accentColor = "#e74c3c",
  inkColor = "#3a1512",
}: AdSlotAvailableBannerProps) {
  const priceTiles = String(weeklyPrice).split("");
  const [index, setIndex] = useState(0);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);

  useEffect(() => {
    const rotate = setInterval(() => {
      setIndex((current) => {
        setExitingIndex(current);
        return (current + 1) % ROTATING_LINES.length;
      });
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(rotate);
  }, []);

  useEffect(() => {
    if (exitingIndex === null) return;
    const clear = setTimeout(() => setExitingIndex(null), EXIT_DURATION_MS);
    return () => clearTimeout(clear);
  }, [exitingIndex]);

  const paper = "#fff8f3";

  return (
    <Box
      component="a"
      href={SIGNUP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Anunciá en este espacio por $${weeklyPrice} la semana`}
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: double ? 2.5 : 1.5,
        width: "100%",
        mx: "auto",
        boxSizing: "border-box",
        minHeight: double ? 160 : 80,
        p: double ? "20px 20px 20px 24px" : "12px 12px 12px 16px",
        backgroundColor: paper,
        borderRadius: double ? "28px" : "20px",
        textDecoration: "none",
        color: inkColor,
        overflow: "hidden",
        isolation: "isolate",
        transition: "transform 0.15s ease",
        "&:hover": { transform: "translateY(-1px)" },
        "&:active": { transform: "scale(0.985)" },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "5px",
          borderRadius: double ? "22px" : "15px",
          border: `2px dashed ${accentColor}73`,
          pointerEvents: "none",
          zIndex: -1,
        },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          component="span"
          sx={{ display: "block", fontSize: double ? 14 : 12, fontWeight: 700, color: `${inkColor}99`, mb: double ? 0.75 : 0.25 }}
        >
          Este lugar está libre
        </Box>
        <Box sx={{ position: "relative", height: double ? 32 : 24, overflow: "hidden" }}>
          {ROTATING_LINES.map((line, i) => {
            const isIn = i === index;
            const isOut = i === exitingIndex;
            return (
              <Box
                key={line}
                sx={{
                  position: "absolute",
                  inset: 0,
                  fontSize: double ? { xs: 18, sm: 22 } : { xs: 14, sm: 16 },
                  lineHeight: double ? "32px" : "24px",
                  fontWeight: 900,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  transform: isIn ? "translateY(0)" : isOut ? "translateY(-110%)" : "translateY(110%)",
                  opacity: isIn ? 1 : 0,
                  transition: "transform 0.45s cubic-bezier(.2,.8,.2,1), opacity 0.3s",
                }}
              >
                {line}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: double ? 1 : 0.5 }}>
        <Box sx={{ display: "flex", gap: double ? "3px" : "2px" }}>
          {priceTiles.map((ch, i) => (
            <Box
              key={i}
              sx={{
                display: "grid",
                placeItems: "center",
                width: double ? 22 : 15,
                height: double ? 34 : 24,
                backgroundColor: accentColor,
                color: "#fff",
                borderRadius: double ? "7px" : "5px",
                fontWeight: 900,
                fontSize: double ? 20 : 14,
                boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.18)",
              }}
            >
              {ch}
            </Box>
          ))}
        </Box>
        <Box component="span" sx={{ fontSize: double ? 13 : 11, fontWeight: 800, color: accentColor }}>
          por semana
        </Box>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          width: double ? 56 : 40,
          height: double ? 56 : 40,
          borderRadius: "50%",
          backgroundColor: inkColor,
          color: paper,
          "@media (max-width: 360px)": { display: "none" },
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={double ? 26 : 18}
          height={double ? 26 : 18}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Box>
    </Box>
  );
}
