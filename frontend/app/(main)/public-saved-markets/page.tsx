"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Users, TrendingUp, Bookmark, Copy, EyeOff } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiClient } from "@/lib/api/client";
import { getSavedMarkets, toggleSavedMarketPublic, type SavedMarket } from "@/lib/api/predictions";

interface PublicSavedMarket {
  id: number;
  match: {
    id: number;
    home_team: { name: string };
    away_team: { name: string };
    kickoff_at: string;
    league: { name: string };
  };
  market_key: string;
  created_at: string;
  ai_pick?: string;
  ai_confidence?: number;
  username: string;
  user: number;
}

export default function PublicSavedMarketsPage() {
  const router = useRouter();
  const { requireAuth, hasHydrated } = useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const [publicMarkets, setPublicMarkets] = useState<PublicSavedMarket[]>([]);
  const [myMarkets, setMyMarkets] = useState<SavedMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert market key to readable label
  const getMarketLabel = (key: string) => {
    const labels: Record<string, string> = {
      "1X2": "Matokeo ya Mechi",
      "DOUBLE_CHANCE": "Double Chance",
      "DRAW_NO_BET": "Draw No Bet",
      "BTTS": "Timu Zote Kufunga (BTTS)",
      "OVER_UNDER_1_5": "Over/Under 1.5",
      "OVER_UNDER_2_5": "Over/Under 2.5",
      "HOME_GOALS_OVER_0_5": "Home Over/Under 0.5",
      "HOME_GOALS_OVER_1_5": "Home Over/Under 1.5",
      "HOME_GOALS_OVER_2_5": "Home Over/Under 2.5",
      "AWAY_GOALS_OVER_0_5": "Away Over/Under 0.5",
      "AWAY_GOALS_OVER_1_5": "Away Over/Under 1.5",
      "AWAY_GOALS_OVER_2_5": "Away Over/Under 2.5",
      "CORRECT_SCORE": "Correct Score",
    };
    return labels[key] || key;
  };

  const fetchPublicMarkets = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiClient<PublicSavedMarket[]>("/predictions/public-saved-markets/");
      setPublicMarkets(data || []);
    } catch (err) {
      console.error("Failed to fetch public saved markets:", err);
      setError("Imeshindikana kupakia public saved markets.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyMarkets = useCallback(async () => {
    try {
      const data = await getSavedMarkets();
      setMyMarkets(data || []);
    } catch (err) {
      console.error("Failed to fetch my saved markets:", err);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!requireAuth("Ona Public Saved Markets — jisajili kwa dakika chache!")) {
      router.push("/home");
      return;
    }

    if (user) {
      void fetchPublicMarkets();
      void fetchMyMarkets();
    }
  }, [user, requireAuth, router, hasHydrated, fetchPublicMarkets, fetchMyMarkets]);

  const handleCopyMarket = async (market: PublicSavedMarket) => {
    try {
      await apiClient("/predictions/save-market/", {
        method: "POST",
        body: JSON.stringify({
          match_id: market.match.id,
          market_key: market.market_key
        })
      });
      alert("Market imekopiwwa kwenye saved markets zako!");
      void fetchMyMarkets();
    } catch (err) {
      console.error("Failed to copy market:", err);
      alert("Imeshindwa kukopi market. Tafadhali jaribu tena.");
    }
  };

  const handleToggleMyMarketPublic = async (marketId: number) => {
    try {
      const updatedMarket = await toggleSavedMarketPublic(marketId);
      setMyMarkets((prev) =>
        prev.map((market) =>
          market.id === marketId ? { ...market, is_public: updatedMarket.is_public } : market,
        ),
      );

      void fetchPublicMarkets();
      alert(updatedMarket.is_public ? "Saved market imewekwa kuwa public." : "Saved market imewekwa kuwa private.");
    } catch (err) {
      console.error("Failed to toggle my saved market public status:", err);
      alert("Imeshindwa kubadilisha hali ya public. Tafadhali jaribu tena.");
    }
  };

  const handleViewUserProfile = (userId: number) => {
    router.push(`/profile?user_id=${userId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ background: "#0a0a0a" }}>
        <div className="text-center">
          <Globe size={48} style={{ color: "#D4AF37", opacity: 0.5 }} className="mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Tafadhali Jiunge Ndogo</h2>
          <p className="text-sm text-white/50 mb-6">Unahitaji kuwa na akaunti ili kuona public saved markets.</p>
          <button 
            type="button" 
            onClick={() => router.push('/login')} 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
          >
            Ingia / Jisajili
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Header */}
      <div className="px-5 pt-safe pt-10 pb-4" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 32px)" }}>
        <div className="flex items-center gap-3 mb-6">
          <button type="button" onClick={() => router.back()} aria-label="Rudi nyuma">
            <ArrowLeft size={20} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(212, 175, 55, 0.2)" }}>
            <Globe size={20} style={{ color: "#D4AF37" }} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Public Saved Markets</h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              {publicMarkets.length} market{publicMarkets.length !== 1 ? 's' : ''} from other users
            </p>
          </div>
        </div>

        {/* Stats Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <GlassCard hover className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Users size={16} style={{ color: "#D4AF37" }} />
                  <span className="text-2xl font-bold" style={{ color: "#D4AF37" }}>
                    {new Set(publicMarkets.map(m => m.user)).size}
                  </span>
                </div>
                <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Active Users
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Bookmark size={16} style={{ color: "#00C878" }} />
                  <span className="text-2xl font-bold" style={{ color: "#00C878" }}>
                    {publicMarkets.length}
                  </span>
                </div>
                <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Total Markets
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp size={16} style={{ color: "var(--brand-accent)" }} />
                  <span className="text-2xl font-bold" style={{ color: "var(--brand-accent)" }}>
                    {publicMarkets.filter(m => m.ai_confidence && m.ai_confidence >= 80).length}
                  </span>
                </div>
                <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  High Confidence
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <section className="px-5 pb-0 pt-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/35">Your visibility</p>
            <h2 className="mt-1 text-2xl font-black">My public markets</h2>
          </div>
        </div>

        {myMarkets.length === 0 ? (
          <GlassCard className="p-4">
            <p className="text-sm text-white/50">Huna markets yoyote iliyowekwa public bado.</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {myMarkets.map((market) => (
              <GlassCard key={market.id} hover className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-white">
                      {market.match.home_team.name} vs {market.match.away_team.name}
                    </h3>
                    <p className="mt-1 text-xs text-white/45">{getMarketLabel(market.market_key)}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleToggleMyMarketPublic(market.id)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      market.is_public
                        ? "border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]"
                        : "border-white/10 bg-white/[0.04] text-white/70"
                    }`}
                  >
                    {market.is_public ? <EyeOff size={14} /> : <Globe size={14} />}
                    {market.is_public ? "Make private" : "Make public"}
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      {/* Content */}
      <div className="px-5 pb-8">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-red-300">{error}</p>
            <button
              type="button"
              onClick={fetchPublicMarkets}
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-black"
              style={{ background: "#D4AF37" }}
            >
              Jaribu tena
            </button>
          </div>
        ) : publicMarkets.length === 0 ? (
          <div className="text-center py-12">
            <Globe size={48} style={{ color: "rgba(255,255,255,0.2)" }} />
            <p className="text-sm mt-4" style={{ color: "rgba(255,255,255,0.4)" }}>
              Hakuna public saved markets bado
            </p>
            <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>
              Kuwa wa kwanza kuweka saved markets zako kuwa public!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {publicMarkets.map((market, index) => (
              <motion.div
                key={market.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard hover className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={() => handleViewUserProfile(market.user)}
                          className="text-xs font-bold px-2 py-0.5 rounded-full hover:bg-white/10 transition-colors"
                          style={{ background: "rgba(212, 175, 55, 0.2)", color: "#D4AF37" }}
                        >
                          @{market.username}
                        </button>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {market.match.league.name}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {market.match.home_team.name} vs {market.match.away_team.name}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(212, 175, 55, 0.2)", color: "#D4AF37" }}>
                        {getMarketLabel(market.market_key)}
                      </span>
                      {market.ai_pick && (
                        <span className="text-xs font-bold" style={{ color: "#00FF87" }}>
                          AI: {market.ai_pick} {market.ai_confidence && `(${market.ai_confidence}%)`}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleCopyMarket(market)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-white/10"
                      style={{ background: "rgba(0, 200, 120, 0.15)", color: "#00C878", border: "1px solid rgba(0, 200, 120, 0.3)" }}
                    >
                      <Copy size={12} />
                      Copy
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <span>
                      {new Date(market.created_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span>
                      {new Date(market.match.kickoff_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}