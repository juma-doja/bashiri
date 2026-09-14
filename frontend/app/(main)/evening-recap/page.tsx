"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { motion } from "framer-motion";
import { ArrowLeft, Moon, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function EveningRecapPage() {
  const router = useRouter();
  const { requireAuth, hasHydrated } = useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const [recapData, setRecapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!requireAuth("Ona Evening Recap — jisajili kwa dakika chache!")) {
      router.push("/home");
      return;
    }

    if (user) {
      fetchEveningRecap();
    }
  }, [user, requireAuth, router, hasHydrated]);

  const fetchEveningRecap = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from a backend endpoint
      // For now, we'll simulate with mock data based on notification data structure
      const mockRecap = {
        accuracy: 75,
        total: 20,
        correct: 15,
        wrong: 5,
        date: new Date().toLocaleDateString('sw-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        topPicks: [
          { match: "Man City vs Arsenal", prediction: "Home Win", confidence: 92, result: "WON" },
          { match: "Liverpool vs Chelsea", prediction: "Over 2.5 Goals", confidence: 88, result: "WON" },
          { match: "Bayern vs Dortmund", prediction: "Both Teams Score", confidence: 85, result: "LOST" },
        ]
      };
      setRecapData(mockRecap);
    } catch (e) {
      console.error("Failed to fetch evening recap:", e);
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
          <Moon size={20} style={{ color: "var(--brand-accent)" }} />
          <h1 className="text-xl font-bold text-white">Evening Recap</h1>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : !recapData ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-20">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Moon size={24} className="text-white/30" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Hakuna Recap bado
          </h2>
          <p className="text-sm text-white/50">
            Recap ya leo itaonekana hapa baada ya mechi kumaliza
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Date Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard hover className="p-4">
              <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                Recap ya
              </p>
              <h2 className="text-lg font-bold text-white">{recapData.date}</h2>
            </GlassCard>
          </motion.div>

          {/* Main Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard hover className="p-6">
              <div className="text-center mb-4">
                <div className="text-5xl font-black mb-2" style={{ color: "var(--brand-accent)" }}>
                  {recapData.accuracy}%
                </div>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  AI Accuracy Leo
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{recapData.total}</div>
                  <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Total Picks
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle size={16} style={{ color: "#00C878" }} />
                    <span className="text-2xl font-bold" style={{ color: "#00C878" }}>
                      {recapData.correct}
                    </span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Sahihi
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <XCircle size={16} style={{ color: "var(--danger)" }} />
                    <span className="text-2xl font-bold" style={{ color: "var(--danger)" }}>
                      {recapData.wrong}
                    </span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Sahibu
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Top Picks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard hover className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} style={{ color: "var(--brand-primary)" }} />
                <h3 className="text-sm font-bold text-white">Top Picks za Leo</h3>
              </div>
              
              <div className="space-y-3">
                {recapData.topPicks.map((pick: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl"
                    style={{ 
                      background: pick.result === "WON" ? "rgba(0,200,120,0.1)" : "rgba(255,107,107,0.1)",
                      border: `1px solid ${pick.result === "WON" ? "rgba(0,200,120,0.3)" : "rgba(255,107,107,0.3)"}`
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white mb-1">{pick.match}</p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                          {pick.prediction}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ color: pick.result === "WON" ? "#00C878" : "var(--danger)" }}>
                          {pick.result}
                        </div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                          {pick.confidence}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Performance Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard hover className="p-4">
              <h3 className="text-sm font-bold text-white mb-3">Performance Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Win Rate</span>
                  <span className="font-bold text-white">{recapData.accuracy}%</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${recapData.accuracy}%`,
                      background: recapData.accuracy >= 70 ? "#00C878" : recapData.accuracy >= 50 ? "var(--brand-primary)" : "var(--danger)"
                    }}
                  />
                </div>
                <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {recapData.accuracy >= 70 ? "🎉 Performance nzuri leo!" : recapData.accuracy >= 50 ? "👍 Performance ya wastani." : "📈 Tunaendelea kuboresha."}
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}