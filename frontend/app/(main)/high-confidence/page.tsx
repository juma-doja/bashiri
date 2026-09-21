"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Target, Trophy, TrendingUp, Calendar, Filter, ArrowLeft, BarChart3, Download, Share2, CheckSquare, Square, CheckCircle, X } from "lucide-react";
import { getFeed } from "@/lib/api/feed";
import { HighConfidenceCard } from "@/components/feed/cards/HighConfidenceCard";
import { FootballFieldLoader } from "@/components/ui/Skeleton";
import { generateHighConfidencePDF } from "@/lib/api/predictions";

export default function HighConfidencePage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"3_days" | "7_days" | "15_days" | "30_days" | "1_month" | "next_3_days" | "next_7_days" | "next_30_days">("1_month");
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadMatches();
  }, [timeRange]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await getFeed(1000, 0);
      let highConfidenceMatches = data.results.filter((card: any) => card.type === "HIGH_CONFIDENCE");
      
      // Filter by time range
      const now = new Date();
      const isFuture = timeRange.startsWith("next_");
      
      if (isFuture) {
        // Future ranges - filter by match kickoff time
        let endDate = new Date(now);
        if (timeRange === "next_3_days") endDate.setDate(endDate.getDate() + 3);
        else if (timeRange === "next_7_days") endDate.setDate(endDate.getDate() + 7);
        else if (timeRange === "next_30_days") endDate.setDate(endDate.getDate() + 30);
        
        highConfidenceMatches = highConfidenceMatches.filter((card: any) => {
          const kickoffDate = new Date(card.data?.match?.kickoff_at);
          return kickoffDate >= now && kickoffDate <= endDate;
        });
      } else {
        // Past ranges - filter by card creation time
        let startDate = new Date(now);
        if (timeRange === "3_days") startDate.setDate(startDate.getDate() - 3);
        else if (timeRange === "7_days") startDate.setDate(startDate.getDate() - 7);
        else if (timeRange === "15_days") startDate.setDate(startDate.getDate() - 15);
        else if (timeRange === "30_days") startDate.setDate(startDate.getDate() - 30);
        else if (timeRange === "1_month") startDate.setDate(startDate.getDate() - 30);
        
        highConfidenceMatches = highConfidenceMatches.filter((card: any) => {
          const createdDate = new Date(card.created_at);
          return createdDate >= startDate;
        });
      }
      
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

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedCards(new Set());
  };

  const toggleCardSelection = (cardId: number) => {
    setSelectedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const selectAllCards = () => {
    const allIds = matches.map(m => m.id);
    setSelectedCards(new Set(allIds));
  };

  const deselectAllCards = () => {
    setSelectedCards(new Set());
  };

  async function handleGeneratePDF() {
    const cardsToExport = selectedCards.size > 0 
      ? matches.filter(m => selectedCards.has(m.id))
      : matches;
    
    if (cardsToExport.length === 0) return;
    
    setGeneratingPDF(true);
    try {
      const blob = await generateHighConfidencePDF(timeRange) as unknown as Blob;
      
      // Create URL for preview
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setShowPDFPreview(true);
      
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPDF(false);
    }
  }

  function handleDownloadPDF() {
    if (!pdfUrl) return;
    
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `bashiri_high_confidence_${timeRange.replace('_', '-')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setShowPDFPreview(false);
    setShowSuccessModal(true);
  }

  function handleOpenPDFInNewTab() {
    if (!pdfUrl) return;
    window.open(pdfUrl, '_blank');
  }

  function handleCancelPDF() {
    setShowPDFPreview(false);
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  }

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
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl w-full sm:w-auto" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Filter size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-transparent text-sm font-semibold text-white outline-none flex-1 sm:flex-none min-w-0"
            >
              <option value="3_days">Last 3 Days</option>
              <option value="7_days">Last 7 Days</option>
              <option value="15_days">Last 15 Days</option>
              <option value="30_days">Last 30 Days</option>
              <option value="1_month">Last Month</option>
              <option value="next_3_days">Next 3 Days</option>
              <option value="next_7_days">Next 7 Days</option>
              <option value="next_30_days">Next 30 Days</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isSelectMode ? (
              <>
                <button
                  onClick={selectAllCards}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                  style={{ background: "rgba(0, 255, 135, 0.15)", color: "#00FF87", border: "1px solid rgba(0, 255, 135, 0.3)" }}
                >
                  <CheckSquare size={14} />
                  Chagua Zote
                </button>
                <button
                  onClick={deselectAllCards}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                  style={{ background: "rgba(255, 255, 255, 0.1)", color: "white", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                >
                  <Square size={14} />
                  Ghairi Zote
                </button>
                <button
                  onClick={toggleSelectMode}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                  style={{ background: "rgba(255, 255, 255, 0.1)", color: "white", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                >
                  Katisha
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleSelectMode}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                  style={{ background: "rgba(255, 255, 255, 0.1)", color: "white", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                >
                  <CheckSquare size={14} />
                  Chagua
                </button>
                <button
                  onClick={handleGeneratePDF}
                  disabled={generatingPDF || matches.length === 0}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "rgba(212, 175, 55, 0.15)", color: "#D4AF37", border: "1px solid rgba(212, 175, 55, 0.3)" }}
                >
                  {generatingPDF ? (
                    <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  {generatingPDF ? "..." : "PDF"}
                </button>
                <button
                  onClick={() => router.push("/high-confidence-analytics")}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-white/10"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <BarChart3 size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
                  <span className="text-sm font-semibold text-white">Analytics</span>
                </button>
              </>
            )}
          </div>
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
                className="relative"
              >
                {isSelectMode && (
                  <button
                    onClick={() => toggleCardSelection(match.id)}
                    className="absolute top-2 right-2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: selectedCards.has(match.id) ? "rgba(0, 255, 135, 0.2)" : "rgba(255, 255, 255, 0.1)",
                      border: selectedCards.has(match.id) ? "1px solid rgba(0, 255, 135, 0.4)" : "1px solid rgba(255, 255, 255, 0.2)"
                    }}
                  >
                    {selectedCards.has(match.id) ? (
                      <CheckSquare size={18} style={{ color: "#00FF87" }} />
                    ) : (
                      <Square size={18} style={{ color: "rgba(255, 255, 255, 0.6)" }} />
                    )}
                  </button>
                )}
                <HighConfidenceCard data={match.data} matchId={match.match_id} />
              </motion.div>
            ))}
          </div>
        )}

        {/* PDF Preview Modal */}
        {showPDFPreview && pdfUrl && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: "rgba(0,0,0,0.8)" }}
            onClick={handleCancelPDF}
          >
            <div 
              className="rounded-2xl p-4 sm:p-6 w-full max-w-4xl"
              style={{ background: "#111111", border: "1px solid rgba(212, 175, 55, 0.3)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">PDF Preview</h3>
                <button
                  onClick={handleCancelPDF}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <X size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
                </button>
              </div>
              
              <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                <iframe src={pdfUrl} className="w-full h-[60vh]" />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:bg-white/10"
                  style={{ background: "rgba(212, 175, 55, 0.15)", color: "#D4AF37", border: "1px solid rgba(212, 175, 55, 0.3)" }}
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={handleOpenPDFInNewTab}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:bg-white/10"
                  style={{ background: "rgba(255, 255, 255, 0.1)", color: "white", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                >
                  <Share2 size={16} />
                  Open in New Tab
                </button>
                <button
                  onClick={handleCancelPDF}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:bg-white/10"
                  style={{ background: "rgba(255, 100, 100, 0.15)", color: "#FF6464", border: "1px solid rgba(255, 100, 100, 0.3)" }}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: "rgba(0,0,0,0.8)" }}
            onClick={() => setShowSuccessModal(false)}
          >
            <div 
              className="rounded-2xl p-6 max-w-sm w-full mx-4"
              style={{ background: "#111111", border: "1px solid rgba(212, 175, 55, 0.3)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "rgba(0, 255, 135, 0.2)" }}
                >
                  <CheckCircle size={32} style={{ color: "#00FF87" }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">PDF Imeshindwa!</h3>
                <p className="text-sm text-white/60 mb-4">PDF ya high confidence tips imeshindwa.</p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full rounded-xl py-3 font-bold text-black transition-all hover:scale-105"
                  style={{ background: "#D4AF37" }}
                >
                  Sawa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
