"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCards } from "@/lib/api/feed";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, TrendingUp, Target } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function AIPicksPage() {
  const router = useRouter();
  const { requireAuth, hasHydrated } = useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!requireAuth("Ona AI Picks — jisajili kwa dakika chache!")) {
      router.push("/home");
      return;
    }

    if (user) {
      fetchAIPicks();
    }
  }, [user, requireAuth, router, hasHydrated]);

  const fetchAIPicks = async () => {
    setLoading(true);
    try {
      const data = await getCards();
      if (data) {
        const aiPicks = data.filter((card: any) => card.type === "AI_PICK");
        setCards(aiPicks);
      }
    } catch (e) {
      console.error("Failed to fetch AI picks:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#050508] px-5 pt-safe pb-6" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 32px)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} aria-label="Rudi nyuma">
          <ArrowLeft size={20} style={{ color: "rgba(255,255,255,0.6)" }} />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles size={20} style={{ color: "var(--brand-primary)" }} />
          <h1 className="text-xl font-bold text-white">AI Picks za Leo</h1>
        </div>
      </div>

      {/* Stats Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <GlassCard hover className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
                {cards.length}
              </div>
              <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                Picks Leo
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp size={16} style={{ color: "#00C878" }} />
                <span className="text-2xl font-bold" style={{ color: "#00C878" }}>
                  {cards.filter((c: any) => c.data?.ai_pick?.confidence >= 85).length}
                </span>
              </div>
              <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                High Confidence
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Target size={16} style={{ color: "#38BDF8" }} />
                <span className="text-2xl font-bold" style={{ color: "#38BDF8" }}>
                  {Math.round(cards.reduce((acc: number, c: any) => acc + (c.data?.ai_pick?.confidence || 0), 0) / (cards.length || 1))}%
                </span>
              </div>
              <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                Avg Confidence
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* AI Picks List */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-20">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Sparkles size={24} className="text-white/30" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Hakuna AI Picks bado
          </h2>
          <p className="text-sm text-white/50">
            Picks za AI zitaonekana hapa ukifanya shughuli
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card: any, index: number) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => router.push(`/create/${card.data?.match_id}/predict`)}
            >
              <GlassCard hover className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(212,175,55,0.2)", color: "var(--brand-primary)" }}>
                        AI Pick #{index + 1}
                      </span>
                      {card.data?.ai_pick?.confidence >= 85 && (
                        <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(0,200,120,0.2)", color: "#00C878" }}>
                          High Confidence
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">
                      {card.data?.match?.home_team?.name} vs {card.data?.match?.away_team?.name}
                    </h3>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {card.data?.match?.league?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold" style={{ color: "var(--brand-primary)" }}>
                      {card.data?.ai_pick?.confidence}%
                    </div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                      Confidence
                    </div>
                  </div>
                </div>
                
                {card.data?.ai_pick?.prediction && (
                  <div className="mt-3 p-3 rounded-xl" style={{ background: "rgba(212,175,55,0.1)" }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--brand-primary)" }}>
                      Prediction:
                    </p>
                    <p className="text-sm text-white">
                      {card.data.ai_pick.prediction}
                    </p>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}