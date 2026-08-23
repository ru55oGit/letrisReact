const FROM_HUB_KEY = "letris_from_hub";

// Una vez que el usuario entra desde el hub "Boludeando" (?from=boludeando),
// el header con el botón de volver queda persistido para siempre en este
// dispositivo — no depende de que el link compartido tenga el parámetro. Si
// alguien comparte la URL del juego sin pasar por el hub, nunca se setea
// esta marca y el header no aparece.
export function markFromHub(): void {
  try {
    window.localStorage.setItem(FROM_HUB_KEY, "1");
  } catch {
    /* localStorage no disponible */
  }
}

export function cameFromHubBefore(): boolean {
  try {
    return window.localStorage.getItem(FROM_HUB_KEY) === "1";
  } catch {
    return false;
  }
}
