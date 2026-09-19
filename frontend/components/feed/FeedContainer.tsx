"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { getFeed, Card } from "@/lib/api/feed";
import { CardSkeleton, FootballFieldLoader } from "@/components/ui/Skeleton";

import { PredictionTutorial } from "@/components/predictions/PredictionTutorial";
import { AIPickCard } from "./cards/AIPickCard";
import { LiveMatchCard } from "./cards/LiveMatchCard";
import { ResultRecapCard } from "./cards/ResultRecapCard";
import { StatCard } from "./cards/StatCard";
import { PollCard } from "./cards/PollCard";
import { MilestoneCard } from "./cards/MilestoneCard";
import { AIWeeklyReportCard } from "./cards/AIWeeklyReportCard";
import { DidYouKnowCard } from "./cards/DidYouKnowCard";
import { DebateCard } from "./cards/DebateCard";
import { MicWinnerCard } from "./cards/MicWinnerCard";
import { BestStreakCard } from "./cards/BestStreakCard";


function renderCard(card: Card) {
  switch (card.type) {
    case "AI_PICK": return <AIPickCard data={card.data} />;
    case "LIVE_MATCH": return <LiveMatchCard data={card.data} />;
    case "RESULT_RECAP": return <ResultRecapCard matchId={card.match_id} data={card.data} />;
    case "STAT": return <StatCard data={card.data} />;
    case "POLL": return <PollCard cardId={card.id} data={card.data} />;
    case "MILESTONE": return <MilestoneCard data={card.data} />;
    case "AI_WEEKLY_REPORT": return <AIWeeklyReportCard data={card.data} />;
    case "DID_YOU_KNOW": return <DidYouKnowCard data={card.data} />;
    case "DEBATE": return <DebateCard cardId={card.id} data={card.data} />;
    case "MIC_WINNER": return <MicWinnerCard cardId={card.id} data={card.data} />;
    case "BEST_STREAK_USER": return <BestStreakCard data={card.data} />;
    default: return null;
  }
}

export function FeedContainer({ externalRefreshKey }: { externalRefreshKey?: number }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [allLoaded, setAllLoaded] = useState(false);
  
  const feedRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const lastRefreshTimeRef = useRef<number>(0);
  const loadMoreInFlightRef = useRef(false);
  const loadObserverRef = useRef<IntersectionObserver | null>(null);

  const loadAllCards = useCallback(async (reset = false) => {
    if (loadMoreInFlightRef.current && !reset) return;
    loadMoreInFlightRef.current = true;
    if (reset) setFeedError(null);
    try {
      // Load all cards at once (no pagination)
      const data = await getFeed(1000, 0); // Large limit to get all cards
      setCards((prev) => {
        if (reset) return data.results;
        const existingIds = new Set(prev.map((card) => card.id));
        return [...prev, ...data.results.filter((card) => !existingIds.has(card.id))];
      });
      setAllLoaded(true);
    } catch (error) {
      console.error("Failed to load feed:", error);
      setFeedError(error instanceof Error ? error.message : "Imeshindikana kupakia feed.");
    } finally {
      setLoading(false);
      loadMoreInFlightRef.current = false;
    }
  }, []);

  // Trigger full refresh when externalRefreshKey changes
  useEffect(() => {
    if (externalRefreshKey && externalRefreshKey > 0) {
      const refreshTimeout = window.setTimeout(() => { void loadAllCards(true); }, 0);
      return () => window.clearTimeout(refreshTimeout);
    }
  }, [externalRefreshKey, loadAllCards]);

  // Smart refresh: append new data without reset
  const smartRefresh = useCallback(async () => {
    // Only refresh if feed is visible and page is active
    if (!isVisible || !isPageVisible) return;
    
    // Debounce: don't refresh if we just refreshed (within 10 seconds)
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 10000) return;
    
    lastRefreshTimeRef.current = now;
    
    try {
      // Fetch latest items and prepend them if they're new
      const data = await getFeed(1000, 0);
      
      setCards(prevCards => {
        const existingIds = new Set(prevCards.map(card => card.id));
        const newCards = data.results.filter(card => !existingIds.has(card.id));
        
        if (newCards.length > 0) {
          return [...newCards, ...prevCards];
        }
        return prevCards;
      });
    } catch (error) {
      console.error('Smart refresh failed:', error);
    }
  }, [isVisible, isPageVisible]);

  // Intersection Observer for visibility detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );

    if (feedRef.current) {
      observer.observe(feedRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !allLoaded && !loadMoreInFlightRef.current) {
          // Auto-load more cards when scrolling to bottom
          // Since we load all at once with large limit, this is mostly for future-proofing
          if (!allLoaded) {
            loadAllCards();
          }
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [allLoaded, loadAllCards]);

  // Smart polling with conditions
  useEffect(() => {
    const poll = () => {
      if (isVisible && isPageVisible) {
        smartRefresh();
      }
    };

    // Initial load
    const initialLoadTimeout = window.setTimeout(() => { void loadAllCards(true); }, 0);

    // Set up smart polling (every 30 seconds)
    const interval = setInterval(poll, 30000);

    return () => {
      clearInterval(interval);
      window.clearTimeout(initialLoadTimeout);
    };
  }, [isVisible, isPageVisible, loadAllCards, smartRefresh]);

  if (loading) {
    return (
      <div className="py-6">
        <div className="mb-8 relative z-10">
          <button
            type="button"
            onClick={() => setShowTutorial(true)}
            className="w-full rounded-2xl px-6 py-4 text-sm font-bold transition-all duration-300 shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
            style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(207,175,123,0.06))",
              border: "1px solid rgba(212,175,55,0.2)",
              color: "var(--text-primary)",
              touchAction: "manipulation"
            }}
          >
            📚 Jifunze kuhusu market predictions
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <FootballFieldLoader />
        </div>
      </div>
    );
  }

  return (
    <div ref={feedRef} className="py-6">
      <div className="mb-8 relative z-10">
        <button
          type="button"
          onClick={() => setShowTutorial(true)}
          className="w-full rounded-2xl px-6 py-4 text-sm font-bold transition-all duration-300 shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
          style={{
            background: "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(207,175,123,0.06))",
            border: "1px solid rgba(212,175,55,0.2)",
            color: "var(--text-primary)",
            touchAction: "manipulation"
          }}
        >
          📚 Jifunze kuhusu market predictions
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.id}>{renderCard(card)}</div>
        ))}
      </div>
      <div ref={loadMoreRef} className="h-4" />
      {feedError ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 py-8 text-center">
          <p className="text-sm text-red-300">{feedError}</p>
          <button
            type="button"
            onClick={() => { void loadAllCards(true); }}
            className="rounded-xl px-4 py-2 text-sm font-bold text-black"
            style={{ background: "var(--brand-accent)" }}
          >
            Jaribu tena
          </button>
        </div>
      ) : allLoaded && cards.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-xs text-white/40">Imeisha matokeo yote</p>
        </div>
      )}
      {showTutorial && <PredictionTutorial onClose={() => setShowTutorial(false)} />}
    </div>
  );
}