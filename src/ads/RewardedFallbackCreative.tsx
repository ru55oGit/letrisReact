// Copiado de boludeando-ads/sdk/boludeando-ads-client/src/RewardedFallbackCreative.tsx el 2026-10-05.
// Si cambia la API del backend, actualizar acá y en el resto de los juegos a mano.
import Box from "@mui/material/Box";

// Lo que RewardedAdModal muestra en vez de la imagen/video cuando el slot
// rewarded no tiene ningún creative real elegible: en vez de dejar al
// jugador sin su recompensa (o sin nada que "mirar"), invita a anunciar acá
// mismo. El token de recompensa para este caso lo emite /ads/next con
// creativeId null — ver api.ts — así que la recompensa real se sigue
// pudiendo reclamar normalmente.
const PRICE_TILES = ["$", "3", ".", "5", "0", "0"];
const SIGNUP_URL = "https://ads-api.boludeando.com/login";

export default function RewardedFallbackCreative() {
  const accentColor = "#e74c3c";
  const inkColor = "#3a1512";
  const paper = "#fff8f3";

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: "20px",
        backgroundColor: paper,
        p: "20px 16px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "5px",
          borderRadius: "15px",
          border: `2px dashed ${accentColor}73`,
          pointerEvents: "none",
        },
      }}
    >
      <Box component="span" sx={{ fontSize: 13, fontWeight: 700, color: `${inkColor}99` }}>
        Este lugar está libre
      </Box>

      <Box sx={{ display: "flex", gap: "2px" }}>
        {PRICE_TILES.map((ch, i) => (
          <Box
            key={i}
            sx={{
              display: "grid",
              placeItems: "center",
              width: ch === "." ? 7 : 20,
              height: 28,
              backgroundColor: ch === "." ? "transparent" : accentColor,
              color: ch === "." ? accentColor : "#fff",
              borderRadius: "5px",
              fontWeight: 900,
              fontSize: 17,
              boxShadow: ch === "." ? "none" : "inset 0 -3px 0 rgba(0,0,0,0.18)",
            }}
          >
            {ch}
          </Box>
        ))}
      </Box>
      <Box component="span" sx={{ fontSize: 12, fontWeight: 800, color: accentColor }}>
        por semana
      </Box>

      <Box sx={{ fontSize: 17, fontWeight: 900, color: inkColor, mt: 1 }}>Cargás tu aviso en 2 minutos</Box>

      <Box
        component="a"
        href={SIGNUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          mt: 1,
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          backgroundColor: inkColor,
          color: paper,
          borderRadius: 999,
          px: 2.5,
          py: 1.1,
          fontWeight: 800,
          fontSize: 15,
          textDecoration: "none",
        }}
      >
        Quiero anunciar
        <svg
          viewBox="0 0 24 24"
          width={16}
          height={16}
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
