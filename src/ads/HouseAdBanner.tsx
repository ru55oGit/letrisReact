// Copiado de boludeando-ads/sdk/boludeando-ads-client/src/HouseAdBanner.tsx el 2026-10-05.
// Si cambia la API del backend, actualizar acá y en el resto de los juegos a mano.
import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import { fetchNextAd, reportImpression, reportClick } from "./adClient";
import { getAdSessionId } from "./adSessionId";
import type { AdCreative } from "./types";

interface HouseAdBannerProps {
  slot: string;
  gameSlug: string;
  locale: string;
}

export default function HouseAdBanner({ slot, gameSlug, locale }: HouseAdBannerProps) {
  const [ad, setAd] = useState<AdCreative | null>(null);
  const impressionIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const sessionId = getAdSessionId();

    fetchNextAd(slot, locale, sessionId).then((result) => {
      if (cancelled || !result) return;
      setAd(result);
      reportImpression(result, gameSlug, sessionId, locale).then((id) => {
        if (!cancelled) impressionIdRef.current = id;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [slot, gameSlug, locale]);

  if (!ad) return null;

  return (
    <Box
      component="a"
      href={ad.clickUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => reportClick(impressionIdRef.current)}
      sx={{
        display: "block",
        width: "100%",
        maxWidth: ad.width ?? 320,
        mx: "auto",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <img
        src={ad.assetUrl}
        alt={ad.headline ?? "Publicidad"}
        style={{ width: "100%", display: "block" }}
      />
    </Box>
  );
}
