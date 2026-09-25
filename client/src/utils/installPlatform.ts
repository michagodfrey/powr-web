// Platform detection for the PWA install banner

export type InstallPlatform = "ios" | "android" | "other";

const DISMISS_KEY = "powr-install-banner-dismissed";

export const getInstallPlatform = (): InstallPlatform => {
  const ua = navigator.userAgent;
  // iPadOS reports itself as Mac, so also check for a touch screen
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  if (isIOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
};

// True when already running as an installed app (launched from home screen)
export const isRunningStandalone = (): boolean =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export const isInstallBannerDismissed = (): boolean => {
  try {
    return localStorage.getItem(DISMISS_KEY) === "true";
  } catch {
    return false;
  }
};

export const dismissInstallBanner = () => {
  try {
    localStorage.setItem(DISMISS_KEY, "true");
  } catch {
    // Storage unavailable (e.g. private mode) — banner just reappears next visit
  }
};
