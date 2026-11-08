import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

/**
 * InstallBanner Component
 * Listens for the beforeinstallprompt event and renders a clean, fixed bottom
 * banner allowing the user to install the VitaLity PWA directly to their device.
 */
export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the app is already installed / in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      return;
    }

    // Capture the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar or default browser prompt from appearing
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show our custom banner
      setIsVisible(true);
    };

    // When the app is successfully installed, hide the banner
    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      console.log('[VitaLity PWA] App installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the native browser install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult?.outcome === 'accepted') {
        console.log('[VitaLity PWA] User accepted the installation');
      } else {
        console.log('[VitaLity PWA] User dismissed the installation');
      }
    } catch (err) {
      console.error('[VitaLity PWA] Error during installation prompt:', err);
    } finally {
      // Prompt can only be used once
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="App installation banner"
      className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl shadow-stone-900/10 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3">
        {/* App Icon preview */}
        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/25">
          <Smartphone className="w-5 h-5 text-white" />
        </div>

        {/* Banner Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-stone-900">VitaLity</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
              App
            </span>
          </div>
          <p className="text-xs text-stone-600 font-medium leading-snug mt-0.5">
            Get VitaLity on your home screen.
          </p>
        </div>

        {/* Action Buttons: Install & Close */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-sm shadow-emerald-600/25 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

