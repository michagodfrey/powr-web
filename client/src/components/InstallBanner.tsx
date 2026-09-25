// Small dismissible banner prompting mobile users to install POWR to their home screen
// iOS gets Share → Add to Home Screen steps; Android gets an Install button,
// or menu instructions when Chrome hasn't offered its own install prompt
import { useEffect, useState } from "react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import {
  dismissInstallBanner,
  getInstallPlatform,
  isInstallBannerDismissed,
  isRunningStandalone,
} from "../utils/installPlatform";

// Give Chrome a moment to fire beforeinstallprompt before showing manual steps
const SHOW_DELAY_MS = 3000;

const ShareIcon = () => (
  <svg
    className="inline w-4 h-4 -mt-1 mx-0.5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 3v12m0-12l-4 4m4-4l4 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
    />
  </svg>
);

const InstallBanner = () => {
  const platform = getInstallPlatform();
  const { canPrompt, installed, promptInstall } = useInstallPrompt();
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(isInstallBannerDismissed);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (
    platform === "other" ||
    dismissed ||
    installed ||
    isRunningStandalone() ||
    (!ready && !canPrompt)
  ) {
    return null;
  }

  const handleDismiss = () => {
    dismissInstallBanner();
    setDismissed(true);
  };

  let message;
  if (platform === "ios") {
    message = (
      <>
        Tap <ShareIcon />
        <span className="sr-only">Share</span> then{" "}
        <strong>Add to Home Screen</strong>
      </>
    );
  } else if (canPrompt) {
    message = <>Add it to your home screen for quick access</>;
  } else {
    message = (
      <>
        Tap <strong>⋮</strong>
        <span className="sr-only">(menu)</span> then{" "}
        <strong>Install app</strong> or <strong>Add to Home screen</strong>
      </>
    );
  }

  return (
    <div
      role="region"
      aria-label="Install POWR"
      className="fixed inset-x-3 z-40 mx-auto max-w-md flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 shadow-lg"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
    >
      <img
        src="/icons/icon-192.png"
        alt=""
        aria-hidden="true"
        className="w-8 h-8 rounded-md flex-shrink-0"
      />
      <p className="flex-1 text-xs leading-snug text-gray-700 dark:text-gray-200">
        <span className="block font-semibold text-secondary dark:text-white">
          Install POWR
        </span>
        {message}
      </p>
      {platform === "android" && canPrompt && (
        <button
          onClick={promptInstall}
          aria-label="Install POWR app"
          className="bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-primary-dark"
        >
          Install
        </button>
      )}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss install banner"
        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default InstallBanner;
