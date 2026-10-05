// Copiado de boludeando-ads/sdk/boludeando-ads-client/src/useRewardedAd.ts el 2026-10-05.
// Si cambia la API del backend, actualizar acá y en el resto de los juegos a mano.
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchNextAd, reportImpression, reportReward } from "./adClient";
import { getAdSessionId } from "./adSessionId";
import { getCooldownRemainingSeconds, setCooldown } from "./adFrequencyCap";
import type { AdCreative } from "./types";

// Tiempo mínimo mirando el creative antes de poder confirmar la
// recompensa — evita que alguien dispare requestAd + handleAdWatched en
// el mismo tick sin que medie ninguna visualización real. Igual que el
// resto de los timers de este proyecto, no es anti-fraude robusto, es
// proporcional al tamaño del proyecto.
const MIN_VIEW_SECONDS = 4;

export function useRewardedAd(
  slot: string,
  gameSlug: string,
  locale: string,
  grantReward: () => void,
  rewardType: string = "extra_life",
) {
  const [loadingAd, setLoadingAd] = useState(false);
  const [adCreative, setAdCreative] = useState<AdCreative | null>(null);
  const [showingAd, setShowingAd] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(() => getCooldownRemainingSeconds(slot));
  const [secondsUntilCanConfirm, setSecondsUntilCanConfirm] = useState(MIN_VIEW_SECONDS);
  const impressionIdRef = useRef<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setCooldownSeconds(getCooldownRemainingSeconds(slot)), 1000);
    return () => clearInterval(interval);
  }, [slot]);

  useEffect(() => {
    if (!showingAd) {
      setSecondsUntilCanConfirm(MIN_VIEW_SECONDS);
      return;
    }
    const interval = setInterval(() => {
      setSecondsUntilCanConfirm((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [showingAd]);

  const canShowAd = cooldownSeconds <= 0 && !loadingAd && !showingAd;
  const canConfirmReward = showingAd && secondsUntilCanConfirm <= 0;

  const requestAd = useCallback(async () => {
    if (!canShowAd) return;

    setLoadingAd(true);
    const sessionId = getAdSessionId();
    const { ad } = await fetchNextAd(slot, locale, sessionId);
    setLoadingAd(false);

    if (!ad || !ad.rewardToken) {
      // Sin inventario o sin token (ej. slot mal configurado como no-rewarded).
      return;
    }

    setAdCreative(ad);
    setShowingAd(true);
    reportImpression(ad, gameSlug, sessionId, locale).then((id) => {
      impressionIdRef.current = id;
    });
  }, [canShowAd, slot, gameSlug, locale]);

  const resetAfterAd = useCallback(() => {
    setShowingAd(false);
    setAdCreative(null);
    impressionIdRef.current = null;
    setCooldown(slot);
    setCooldownSeconds(getCooldownRemainingSeconds(slot));
  }, [slot]);

  const handleAdWatched = useCallback(async () => {
    if (!canConfirmReward || !adCreative?.rewardToken) return;

    const sessionId = getAdSessionId();
    const ok = await reportReward(adCreative.rewardToken, gameSlug, sessionId, rewardType);
    resetAfterAd();
    if (ok) grantReward();
  }, [canConfirmReward, adCreative, gameSlug, rewardType, grantReward, resetAfterAd]);

  const handleAdSkipped = useCallback(() => {
    resetAfterAd();
  }, [resetAfterAd]);

  return {
    loadingAd,
    adCreative,
    showingAd,
    canShowAd,
    canConfirmReward,
    secondsUntilCanConfirm,
    requestAd,
    handleAdWatched,
    handleAdSkipped,
  };
}
