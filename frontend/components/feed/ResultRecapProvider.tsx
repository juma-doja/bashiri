"use client";

import { useState, useEffect } from "react";
import { ResultRecapModal } from "./ResultRecapModal";
import { getFeed } from "@/lib/api/feed";

export function ResultRecapProvider() {
  const [showResultRecapModal, setShowResultRecapModal] = useState(false);
  const [recentRecaps, setRecentRecaps] = useState<any[]>([]);

  useEffect(() => {
    // Show result recap modal after 5 minutes
    const timer = setTimeout(async () => {
      try {
        // Check cooldown (24 hours)
        const lastViewed = localStorage.getItem('lastResultRecapViewed');
        const now = Date.now();
        const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

        if (lastViewed && (now - parseInt(lastViewed)) < COOLDOWN_MS) {
          return; // Don't show if within cooldown
        }

        // Fetch recent result recaps
        const data = await getFeed(1000, 0);
        const resultRecaps = data.results.filter((card: any) => card.type === 'RESULT_RECAP');
        
        if (resultRecaps.length > 0) {
          setRecentRecaps(resultRecaps);
          setShowResultRecapModal(true);
        }
      } catch (error) {
        console.error('Failed to fetch result recaps:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    localStorage.setItem('lastResultRecapViewed', Date.now().toString());
    setShowResultRecapModal(false);
  };

  return (
    <ResultRecapModal
      isOpen={showResultRecapModal}
      onClose={handleClose}
      recentRecaps={recentRecaps}
    />
  );
}
