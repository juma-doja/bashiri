"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FootballFieldLoader } from "@/components/ui/Skeleton";

export function PWAInstallCard() {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if user has already dismissed the card
    const hasDismissed = localStorage.getItem('pwa_install_card_dismissed');
    const isInstalled = localStorage.getItem('pwa_installed');

    if (hasDismissed || isInstalled) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    // Show card after 5 seconds on app load
    const showTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(showTimeout);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_installed', 'true');
      }
      setDeferredPrompt(null);
    }
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_install_card_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-20 right-4 z-50 max-w-xs"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))",
              border: "1px solid rgba(212,175,55,0.3)",
              backdropFilter: "blur(10px)"
            }}
          >
            {/* Content */}
            <div className="flex items-start gap-3 mb-3">
              {/* Spinning Logo with Double Lines */}
              <div className="shrink-0">
                <FootballFieldLoader size={48} showText={false} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white mb-1">Install Bashiri</h3>
                <p className="text-xs text-white/60 leading-tight">
                  Keep your predictions one tap away
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 rounded-xl py-2 flex items-center justify-center gap-2 text-xs font-bold transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #D4AF37, #CFAF7B)",
                  color: "#0A0A0A"
                }}
              >
                <Download size={12} />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="rounded-xl py-2 px-4 flex items-center justify-center text-xs font-bold transition-all hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)"
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
