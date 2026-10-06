// Copiado de boludeando-ads/sdk/boludeando-ads-client/src/RewardedAdModal.tsx el 2026-10-06.
// Si cambia la API del backend, actualizar acá y en el resto de los juegos a mano.
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import RewardedFallbackCreative from "./RewardedFallbackCreative";
import type { AdCreative } from "./types";

// Formato "rewarded": el doble de alto que el banner rectangular (4:1) —
// ver BANNER_ASPECT_RATIO en HouseAdBanner.tsx. object-fit: cover por el
// mismo motivo: que cualquier imagen quede recortada a esta proporción en
// vez de desvirtuar el modal si no viene con la medida exacta.
const REWARDED_ASPECT_RATIO = "2 / 1";

interface RewardedAdModalProps {
  open: boolean;
  adCreative: AdCreative | null;
  canConfirmReward: boolean;
  secondsUntilCanConfirm: number;
  onConfirm: () => void;
  onSkip: () => void;
  confirmLabel: string;
  skipLabel: string;
  waitLabel: (seconds: number) => string;
}

export default function RewardedAdModal({
  open,
  adCreative,
  canConfirmReward,
  secondsUntilCanConfirm,
  onConfirm,
  onSkip,
  confirmLabel,
  skipLabel,
  waitLabel,
}: RewardedAdModalProps) {
  return (
    <Modal open={open} onClose={onSkip} aria-labelledby="rewarded-ad-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90vw",
          maxWidth: 360,
          boxSizing: "border-box",
          backgroundColor: "#fff",
          borderRadius: 3,
          p: 2,
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        {adCreative ? (
          <Box
            component="img"
            src={adCreative.assetUrl}
            alt={adCreative.headline ?? "Publicidad"}
            sx={{
              display: "block",
              width: "100%",
              aspectRatio: REWARDED_ASPECT_RATIO,
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        ) : (
          <RewardedFallbackCreative />
        )}

        <Button
          variant="contained"
          fullWidth
          disabled={!canConfirmReward}
          onClick={onConfirm}
          sx={{ mt: 2, mb: 1, backgroundColor: "#4a7c59", "&:hover": { backgroundColor: "#3b6448" } }}
        >
          {canConfirmReward ? confirmLabel : waitLabel(secondsUntilCanConfirm)}
        </Button>

        <Typography
          component="button"
          onClick={onSkip}
          sx={{
            color: "#999",
            fontSize: 13,
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {skipLabel}
        </Typography>
      </Box>
    </Modal>
  );
}
