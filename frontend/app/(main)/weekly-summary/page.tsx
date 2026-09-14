"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Award, Target, Calendar } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function WeeklySummaryPage() {
  const router = useRouter();
  const { requireAuth, hasHydrated } = useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!requireAuth("Ona Weekly Summary — jisajili kwa dakika chache!")) {
      router.push("/home");
      return;
    }

    if (user) {
      fetchWeeklySummary();
    }
  }, [user, requireAuth, router, hasHydrated]);

  const fetchWeeklySummary = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from a backend endpoint
      // For now, we'll simulate with mock data based on notification data structure
      const mockSummary = {
        accuracy: 68,
        total: 25,
        correct: 17,
        is_top_10: true,
        week_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('sw-KE', { month: 'short', day: 'numeric' }),
        week_end: new Date().toLocaleDateString('sw-KE', { month: 'short', day: 'numeric' }),
        daily_breakdown: [
          { day: "Jumatatu", predictions: 4, correct: 3, accuracy: 75 },
          { day: "Jumanne", predictions: 3, correct: 2, accuracy: 67 },
          { day: "Jumatano", predictions: 5, correct: 4, accuracy: 80 },
          { day: "Alhamisi", predictions: 4, correct: 2, accuracy: 50 },
          { day: "Ijumaa", predictions: 5, correct: 3, accuracy: 60 },
          { day: "Jumamosi", predictions: 2, correct: 2, accuracy: 100 },
          { day: "Jumapili", predictions: 2, correct: 1, accuracy: 50 },
        ],
        achievements: [
          { icon: "🔥", title: "Hot Streak", description: "3 consecutive correct predictions" },
          { icon: "🎯", title: "Sharp Shooter", description: "80%+ accuracy on Wednesday" },
          { icon: "⭐", title: "Top 10%", description: "You're in the top 10% this week!" },
        ]
      };
      setSummaryData(mockSummary);
    } catch (e) {
      console.error("Failed to fetch weekly summary:", e);
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
          <TrendingUp size={20} style={{ color: "#00C878" }} />
          <h1 className="text-xl font-bold text-white">Weekly Summary</h1>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : !summaryData ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-20">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <TrendingUp size={24} className="text-white/30" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Hakuna Summary bado
          </h2>
          <p className="text-sm text-white/50">
            Summary ya wiki itaonekana hapa baada ya kufanya predictions
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Week Range */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard hover className="p-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {summaryData.week_start} - {summaryData.week_end}
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Top Achievement */}
          {summaryData.is_top_10 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div 
                className="p-4 rounded-3xl backdrop-blur-md hover:scale-[1.02] transition-all duration-300"
                style={{ 
                  background: "linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.05) 100%)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  boxShadow: "0 3px 18px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(212,175,55,0.3)" }}>
                    <Award size={24} style={{ color: "var(--brand-primary)" }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Wiki hii ulikuwa top 10%! 🏆</h3>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                      Performance yako ni miongoni mwa bora zaidi
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Main Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard hover className="p-6">
              <div className="text-center mb-4">
                <div className="text-5xl font-black mb-2" style={{ color: "#00C878" }}>
                  {summaryData.accuracy}%
                </div>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Weekly Accuracy
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{summaryData.total}</div>
                  <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Total Predictions
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: "#00C878" }}>
                    {summaryData.correct}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Sahihi
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Daily Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard hover className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Target size={18} style={{ color: "var(--brand-primary)" }} />
                <h3 className="text-sm font-bold text-white">Daily Breakdown</h3>
              </div>
              
              <div className="space-y-3">
                {summaryData.daily_breakdown.map((day: any, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-20 text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {day.day}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white">{day.correct}/{day.predictions}</span>
                        <span className="text-xs font-bold" style={{ color: day.accuracy >= 70 ? "#00C878" : day.accuracy >= 50 ? "var(--brand-primary)" : "var(--danger)" }}>
                          {day.accuracy}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${day.accuracy}%`,
                            background: day.accuracy >= 70 ? "#00C878" : day.accuracy >= 50 ? "var(--brand-primary)" : "var(--danger)"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard hover className="p-4">
              <h3 className="text-sm font-bold text-white mb-3">Achievements</h3>
              <div className="space-y-3">
                {summaryData.achievements.map((achievement: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-white">{achievement.title}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}