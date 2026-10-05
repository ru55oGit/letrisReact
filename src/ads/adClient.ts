// Copiado de boludeando-ads/sdk/boludeando-ads-client/src/adClient.ts el 2026-10-05.
// Si cambia la API del backend, actualizar acá y en el resto de los juegos a mano.
import type { AdCreative } from "./types";

const API_BASE = "https://ads-api.boludeando.com/api";

export async function fetchNextAd(
  slot: string,
  locale: string,
  sessionId: string,
): Promise<AdCreative | null> {
  const params = new URLSearchParams({ slot, locale, session: sessionId });
  const res = await fetch(`${API_BASE}/ads/next?${params.toString()}`);
  if (!res.ok) return null;

  const data = (await res.json()) as { ad: AdCreative | null };
  return data.ad;
}

export async function reportImpression(
  ad: AdCreative,
  gameSlug: string,
  sessionId: string,
  locale: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/events/impression`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creativeId: ad.creativeId,
        slotId: ad.slotId,
        gameSlug,
        sessionId,
        locale,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { impressionId: string };
    return data.impressionId;
  } catch {
    // Un fallo de red al reportar la métrica no debe romper el juego.
    return null;
  }
}

export async function reportClick(impressionId: string | null): Promise<void> {
  if (!impressionId) return;
  try {
    await fetch(`${API_BASE}/events/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ impressionId }),
    });
  } catch {
    // Igual que arriba: no bloquear la navegación del usuario por esto.
  }
}

export async function reportReward(
  rewardToken: string,
  gameSlug: string,
  sessionId: string,
  rewardType: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/events/reward`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rewardToken, gameSlug, sessionId, rewardType }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
