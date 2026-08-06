/**
 * Landscape-first orientation handling.
 *
 * Native Android locks landscape in the manifest. On the web we ask the
 * Screen Orientation API for a landscape lock (it requires fullscreen on most
 * browsers) and re-request it whenever the app comes back to the foreground.
 * When the browser refuses, the shell rotates its own layout instead, so the
 * game still plays sideways without the device Auto-Rotate setting.
 */

type LockableOrientation = ScreenOrientation & {
  lock?: (o: string) => Promise<void>;
  unlock?: () => void;
};

function orientationApi(): LockableOrientation | undefined {
  if (typeof window === "undefined") return undefined;
  return screen.orientation as LockableOrientation | undefined;
}

/** Requests fullscreen on the given element (needed before locking on Android Chrome). */
export async function requestFullscreen(el: HTMLElement | null) {
  try {
    if (el && !document.fullscreenElement) await el.requestFullscreen?.();
  } catch {
    /* user gesture missing or unsupported */
  }
}

/** Attempts a landscape lock. Returns true when the platform honoured it. */
export async function lockLandscape(): Promise<boolean> {
  const api = orientationApi();
  if (!api?.lock) return false;
  try {
    await api.lock("landscape");
    return true;
  } catch {
    return false;
  }
}

/** True while the viewport is taller than it is wide. */
export function isPortrait() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(orientation: portrait)").matches;
}

/**
 * Keeps re-applying the landscape lock on foreground/fullscreen/orientation
 * changes so the game resumes sideways after minimising the app.
 */
export function keepLandscape(el: () => HTMLElement | null) {
  if (typeof window === "undefined") return () => undefined;

  const reapply = async () => {
    if (document.hidden) return;
    if (!document.fullscreenElement) await requestFullscreen(el());
    await lockLandscape();
  };

  const onVisible = () => void reapply();
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("focus", onVisible);
  window.addEventListener("orientationchange", onVisible);
  document.addEventListener("fullscreenchange", onVisible);

  return () => {
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("focus", onVisible);
    window.removeEventListener("orientationchange", onVisible);
    document.removeEventListener("fullscreenchange", onVisible);
  };
}
