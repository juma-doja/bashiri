"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Check,
  CheckSquare,
  ChevronDown,
  Download,
  Filter,
  RefreshCw,
  Square,
  Target,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { getHighConfidenceCards, type Card } from "@/lib/api/feed";
import { HighConfidenceCard } from "@/components/feed/cards/HighConfidenceCard";
import { FootballFieldLoader } from "@/components/ui/Skeleton";
import { generateHighConfidencePDF } from "@/lib/api/predictions";

interface HighConfidenceData {
  match: { home_team: string; away_team: string; league: string; kickoff_at: string };
  prediction: { winner: "home" | "away"; team: string; confidence: number; market: string };
}

type HighConfidenceItem = Card & { match_id: number | null; data: HighConfidenceData };

function getLocalDateKey(value: string) {
  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? null : format(date, "yyyy-MM-dd");
}

function localDateFromKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function HighConfidencePage() {
  const router = useRouter();
  const [allMatches, setAllMatches] = useState<HighConfidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const pageSize = 500;
      const firstPage = await getHighConfidenceCards(pageSize, 0);
      const cards = [...firstPage.results] as HighConfidenceItem[];
      for (let offset = pageSize; offset < firstPage.count; offset += pageSize) {
        const page = await getHighConfidenceCards(pageSize, offset);
        cards.push(...(page.results as HighConfidenceItem[]));
      }
      setAllMatches(cards);
    } catch (error) {
      console.error("Failed to load high confidence matches:", error);
      setLoadError("Picks hazijapakiwa. Angalia mtandao kisha ujaribu tena.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches, reloadKey]);

  useEffect(() => {
    setSelectedCards(new Set());
  }, [selectedLeague, selectedDate]);

  useEffect(() => () => {
    if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
  }, [pdfUrl]);

  const leagues = useMemo(() =>
    Array.from(new Set(allMatches.map((item) => item.data?.match?.league).filter(Boolean))).sort(),
  [allMatches]);

  const availableDates = useMemo(() =>
    Array.from(new Set(
      allMatches
        .map((item) => getLocalDateKey(item.data?.match?.kickoff_at || ""))
        .filter((date): date is string => Boolean(date)),
    )).sort(),
  [allMatches]);

  const matches = useMemo(() => allMatches.filter((item) => {
    const leagueMatches = selectedLeague === "all" || item.data.match.league === selectedLeague;
    const dateMatches = !selectedDate || getLocalDateKey(item.data.match.kickoff_at) === selectedDate;
    return leagueMatches && dateMatches;
  }), [allMatches, selectedDate, selectedLeague]);

  const stats = useMemo(() => {
    const total = matches.length;
    const confidenceTotal = matches.reduce((sum, item) => sum + (Number(item.data.prediction?.confidence) || 0), 0);
    return {
      total,
      avgConfidence: total ? Math.round(confidenceTotal / total) : 0,
      homeWins: matches.filter((item) => item.data.prediction?.winner === "home").length,
      awayWins: matches.filter((item) => item.data.prediction?.winner === "away").length,
    };
  }, [matches]);

  const toggleSelectMode = () => {
    setIsSelectMode((enabled) => !enabled);
    setSelectedCards(new Set());
  };

  const toggleCardSelection = (cardId: number) => {
    setSelectedCards((previous) => {
      const next = new Set(previous);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const selectAllCards = () => setSelectedCards(new Set(matches.map((match) => match.id)));

  async function handleGeneratePDF() {
    const cardsToExport = isSelectMode
      ? matches.filter((match) => selectedCards.has(match.id))
      : matches;
    if (!cardsToExport.length) return;

    setGeneratingPDF(true);
    try {
      const ids = cardsToExport.map((match) => match.id);
      const blob = await generateHighConfidencePDF(selectedLeague, ids) as unknown as Blob;
      if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(window.URL.createObjectURL(blob));
      setShowPDFPreview(true);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      window.alert("PDF imeshindikana kutengenezwa. Tafadhali jaribu tena.");
    } finally {
      setGeneratingPDF(false);
    }
  }

  function handleDownloadPDF() {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    const leagueName = selectedLeague === "all" ? "all_leagues" : selectedLeague.replace(/\s+/g, "_");
    link.download = `bashiri_high_confidence_${leagueName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowPDFPreview(false);
    setShowSuccessModal(true);
  }

  function closePDFPreview() {
    setShowPDFPreview(false);
    if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  }

  const todayKey = format(new Date(), "yyyy-MM-dd");

  return (
    <main className="min-h-dvh bg-[#080d0a] px-4 pb-32 pt-5 text-white sm:px-6 sm:pt-7 lg:px-10 lg:pb-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-center justify-between gap-4 sm:mb-7">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => router.back()} aria-label="Go back" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/65 transition hover:bg-white/10 hover:text-white">
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#61d7a5]">Bashiri / Match intelligence</p>
              <h1 className="mt-1 max-w-[205px] whitespace-normal text-[22px] font-black leading-[1.12] sm:max-w-none sm:text-3xl">High-confidence picks</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => router.push("/high-confidence-analytics")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-white sm:px-4 sm:text-sm">
              <BarChart3 size={15} /><span className="hidden sm:inline">Analytics</span>
            </button>
            <button type="button" onClick={() => setReloadKey((value) => value + 1)} disabled={loading} title="Refresh picks" aria-label="Refresh picks" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/65 transition hover:bg-white/10 hover:text-white disabled:opacity-40">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-white/[0.08] pb-4 sm:mb-6">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[#79e5b8]"><Target size={14} /> Confidence threshold 50%+</span>
          <span className="text-xs text-white/40">Upcoming fixtures · local kickoff time</span>
        </div>

        <section aria-label="Pick statistics" className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatTile label="Total picks" value={stats.total} icon={<Target size={16} />} color="#61d7a5" />
          <StatTile label="Avg confidence" value={`${stats.avgConfidence}%`} icon={<Trophy size={16} />} color="#e8bd5a" />
          <StatTile label="Home picks" value={stats.homeWins} icon={<TrendingUp size={16} />} color="#58b9ed" />
          <StatTile label="Away picks" value={stats.awayWins} icon={<TrendingUp size={16} />} color="#f18f75" />
        </section>

        <section aria-label="Filter and export picks" className="mb-8 border-y border-white/[0.08] py-5 sm:mb-9">
          <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-2.5 sm:w-[260px]">
                <Filter size={16} className="shrink-0 text-[#61d7a5]" />
                <span className="sr-only">Filter by league</span>
                <select value={selectedLeague} onChange={(event) => setSelectedLeague(event.target.value)} className="w-full appearance-none bg-transparent pr-5 text-sm font-semibold text-white outline-none">
                  <option value="all" className="bg-[#101712]">All competitions</option>
                  {leagues.map((league) => <option key={league} value={league} className="bg-[#101712]">{league}</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3.5 text-white/40" />
              </label>

              <div className="flex items-center gap-2">
                <label className="relative flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-2.5 sm:w-[230px] sm:flex-none">
                  <CalendarDays size={16} className="shrink-0 text-[#e8bd5a]" />
                  <span className="truncate text-sm font-semibold text-white/80">{selectedDate ? format(localDateFromKey(selectedDate), "EEE, d MMM yyyy") : "Choose kickoff date"}</span>
                  <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} aria-label="Choose kickoff date" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                </label>
                {selectedDate && <button type="button" onClick={() => setSelectedDate("")} aria-label="Clear date filter" title="Clear date filter" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:bg-white/10 hover:text-white"><X size={15} /></button>}
              </div>
            </div>

            <div className="grid grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap sm:gap-3">
              {isSelectMode ? (
                <>
                  <button type="button" onClick={selectAllCards} className="inline-flex items-center gap-2 rounded-xl border border-[#61d7a5]/25 bg-[#61d7a5]/10 px-3.5 py-2.5 text-xs font-bold text-[#83e6b9] transition hover:bg-[#61d7a5]/15"><Check size={14} /> Select all</button>
                  <span className="px-1 text-center text-xs tabular-nums text-white/45 sm:text-left">{selectedCards.size} selected</span>
                  <button type="button" onClick={toggleSelectMode} className="rounded-xl border border-white/10 px-3.5 py-2.5 text-xs font-bold text-white/60 transition hover:bg-white/5 hover:text-white">Cancel</button>
                </>
              ) : (
                <button type="button" onClick={toggleSelectMode} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-2.5 text-xs font-bold text-white/70 transition hover:bg-white/[0.08] hover:text-white"><CheckSquare size={14} /> Select picks</button>
              )}
              <button type="button" onClick={() => void handleGeneratePDF()} disabled={generatingPDF || matches.length === 0 || (isSelectMode && selectedCards.size === 0)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8bd5a] px-3.5 py-2.5 text-xs font-extrabold text-[#171208] transition hover:bg-[#f2cf78] disabled:cursor-not-allowed disabled:opacity-40">
                {generatingPDF ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/25 border-t-black" /> : <Download size={14} />} Export PDF
              </button>
            </div>
          </div>

          {availableDates.length > 0 && (
            <div className="mt-5 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button type="button" onClick={() => setSelectedDate("")} aria-pressed={!selectedDate} className={`shrink-0 rounded-lg border px-3.5 py-2.5 text-xs font-bold transition ${!selectedDate ? "border-[#61d7a5]/45 bg-[#61d7a5]/10 text-[#83e6b9]" : "border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white/80"}`}>Any date</button>
              {availableDates.map((date) => (
                <button key={date} type="button" onClick={() => setSelectedDate(date)} aria-pressed={selectedDate === date} className={`shrink-0 rounded-lg border px-3.5 py-2.5 text-xs font-bold transition ${selectedDate === date ? "border-[#e8bd5a]/50 bg-[#e8bd5a]/10 text-[#f1d58d]" : "border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white/80"}`}>
                  {date === todayKey ? "Today · " : ""}{format(localDateFromKey(date), "EEE d MMM")}
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Upcoming fixtures</p>
            <h2 className="mt-1 text-lg font-extrabold text-white">{selectedDate ? format(localDateFromKey(selectedDate), "EEEE, d MMMM") : "All available picks"}</h2>
          </div>
          <p className="shrink-0 text-xs tabular-nums text-white/45">{matches.length} {matches.length === 1 ? "pick" : "picks"}</p>
        </div>

        {loading ? (
          <div className="flex min-h-56 items-center justify-center"><FootballFieldLoader /></div>
        ) : loadError ? (
          <div className="rounded-2xl border border-[#f18f75]/20 bg-[#f18f75]/[0.06] px-5 py-10 text-center">
            <p className="text-sm font-semibold text-[#f3a28c]">{loadError}</p>
            <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/15">Try again</button>
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-5 py-14 text-center">
            <CalendarDays size={27} className="mx-auto text-white/25" />
            <p className="mt-4 text-base font-bold text-white">No picks for these filters</p>
            <p className="mt-1 text-sm text-white/45">Try another date or competition.</p>
            {(selectedDate || selectedLeague !== "all") && <button type="button" onClick={() => { setSelectedDate(""); setSelectedLeague("all"); }} className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-xs font-bold text-white/70 transition hover:bg-white/5">Clear filters</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {matches.map((match, index) => (
              <motion.div key={match.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.015, 0.18) }}>
                <HighConfidenceCard data={match.data} matchId={match.match_id ?? 0} isSelectMode={isSelectMode} selected={selectedCards.has(match.id)} onToggleSelect={() => toggleCardSelection(match.id)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showPDFPreview && pdfUrl && (
        <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6" onClick={closePDFPreview}>
          <section role="dialog" aria-modal="true" aria-labelledby="high-confidence-pdf-title" className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#101612] p-4 sm:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h2 id="high-confidence-pdf-title" className="text-lg font-bold">PDF preview</h2><button type="button" onClick={closePDFPreview} aria-label="Close PDF preview" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-white/60 hover:text-white"><X size={17} /></button></div>
            <iframe title="High-confidence picks PDF preview" src={pdfUrl} className="mb-4 h-[58vh] w-full rounded-xl border border-white/10 bg-white" />
            <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button type="button" onClick={closePDFPreview} className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-bold text-white/65 hover:bg-white/5">Close</button>
              <button type="button" onClick={() => window.open(pdfUrl, "_blank", "noopener,noreferrer")} className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-bold text-white/75 hover:bg-white/5">Open in new tab</button>
              <button type="button" onClick={handleDownloadPDF} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#e8bd5a] px-4 py-2.5 text-sm font-extrabold text-[#171208]"><Download size={15} /> Download PDF</button>
            </div>
          </section>
        </div>
      )}

      {showSuccessModal && (
        <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={() => setShowSuccessModal(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="pdf-success-title" className="w-full max-w-sm rounded-2xl border border-[#61d7a5]/20 bg-[#101612] p-6 text-center" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#61d7a5]/10 text-[#61d7a5]"><Check size={22} /></div>
            <h2 id="pdf-success-title" className="mt-4 text-lg font-extrabold">PDF downloaded</h2>
            <p className="mt-1 text-sm text-white/50">Your high-confidence picks are ready.</p>
            <button type="button" onClick={() => setShowSuccessModal(false)} className="mt-5 w-full rounded-lg bg-[#61d7a5] py-2.5 text-sm font-extrabold text-[#07100b]">Done</button>
          </section>
        </div>
      )}
    </main>
  );
}

function StatTile({ label, value, icon, color }: { label: string; value: string | number; icon: ReactNode; color: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
      <div className="flex min-h-7 items-center justify-between gap-3"><p className="text-xs font-semibold leading-5 text-white/55">{label}</p><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}16`, color }}>{icon}</span></div>
      <p className="mt-4 text-2xl font-black tabular-nums sm:text-3xl" style={{ color }}>{value}</p>
    </div>
  );
}
