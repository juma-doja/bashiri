"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Target, Trophy, TrendingUp, Calendar, Filter, ArrowLeft, BarChart3 } from "lucide-react";
import { getFeed } from "@/lib/api/feed";
import { HighConfidenceCard } from "@/components/feed/cards/HighConfidenceCard";
import { FootballFieldLoader } from "@/components/ui/Skeleton";

export default function HighConfidencePage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"3_days" | "7_days" | "15_days" | "30_days">("3_days");

  useEffect(() => {
    loadMatches();
  }, [timeRange]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await getFeed(1000, 0);
      const highConfidenceMatches = data.results.filter((card: any) => card.type === "HIGH_CONFIDENCE");
      setMatches(highConfidenceMatches);
    } catch (error) {
      console.error("Failed to load high confidence matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (matches.length === 0) return { total: 0, avgConfidence: 0, homeWins: 0, awayWins: 0 };
    
    const total = matches.length;
    const avgConfidence = Math.round(matches.reduce((sum, m) => sum + m.data.prediction.confidence, 0) / total);
    const homeWins = matches.filter(m => m.data.prediction.winner === "home").length;
    const awayWins = matches.filter(m => m.data.prediction.winner === "away").length;
    
    return { total, avgConfidence, homeWins, awayWins };
  };

  const stats = calculateStats();

  return (
    <main className="min-h-screen px-4 pb-8 pt-6 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3"
        >
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <ArrowLeft size={20} style={{ color: "rgba(255,255,255,0.7)" }} />
          </button>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">Premium Picks</p>
            <h1 className="text-2xl font-black text-white sm:text-3xl">High Confidence Tips (≥50%)</h1>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="p-4 rounded-2xl" style={{ background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Target size={18} style={{ color: "#38BDF8" }} />
              <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Total Matches</p>
            </div>
            <p className="text-3xl font-black" style={{ color: "#38BDF8" }}>{stats.total}</p>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: "rgba(212, 175, 55, 0.1)", border: "1px solid rgba(212, 175, 55, 0.2)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={18} style={{ color: "#D4AF37" }} />
              <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Avg Confidence</p>
            </div>
            <p className="text-3xl font-black" style={{ color: "#D4AF37" }}>{stats.avgConfidence}%</p>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: "rgba(0, 255, 135, 0.1)", border: "1px solid rgba(0, 255, 135, 0.2)" }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} style={{ color: "#00FF87" }} />
              <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Home Wins</p>
            </div>
            <p className="text-3xl font-black" style={{ color: "#00FF87" }}>{stats.homeWins}</p>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: "rgba(255, 100, 100, 0.1)", border: "1px solid rgba(255, 100, 100, 0.2)" }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} style={{ color: "#FF6464" }} />
              <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Away Wins</p>
            </div>
            <p className="text-3xl font-black" style={{ color: "#FF6464" }}>{stats.awayWins}</p>
          </div>
        </motion.div>

        {/* Time Range Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Filter size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-transparent text-sm font-semibold text-white outline-none"
            >
              <option value="3_days">Last 3 Days</option>
              <option value="7_days">Last 7 Days</option>
              <option value="15_days">Last 15 Days</option>
              <option value="30_days">Last 30 Days</option>
            </select>
          </div>
          <button
            onClick={() => router.push("/high-confidence-analytics")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:bg-white/10"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <BarChart3 size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
            <span className="text-sm font-semibold text-white">View Analytics</span>
          </button>
        </motion.div>

        {/* Matches Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <FootballFieldLoader />
          </div>
        ) : matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Target size={48} style={{ color: "rgba(255,255,255,0.3)" }} />
            <p className="mt-4 text-lg font-semibold text-white">No high confidence matches available</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Check back later for new predictions</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <HighConfidenceCard data={match.data} matchId={match.match_id} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
