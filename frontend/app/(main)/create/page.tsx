"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFixtures, getLeagues, Match, League } from "@/lib/api/predictions";
import { getHeroSlides, HeroSlide } from "@/lib/api/hero-carousel";
import { CardSkeleton, GoalPostLoader } from "@/components/ui/Skeleton";
import { BookButton } from "@/components/ui/BookButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { Calendar, ChevronDown, ArrowLeft, ChevronDown as LoadMoreIcon, Target, TrendingUp, Flame } from "lucide-react";
import { MatchOddsCard } from "@/components/predictions/MatchOddsCard";
import { motion } from "framer-motion";
import Image from "next/image";

export default function CreatePredictionStep1() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [heroSlide, setHeroSlide] = useState<HeroSlide | null>(null);
  const [activeFilter, setActiveFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('create_active_filter');
      return saved || 'today';
    }
    return 'today';
  });
  const [selectedLeague, setSelectedLeague] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('create_selected_league');
      return saved || 'all';
    }
    return 'all';
  });
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const filters = [
    { id: "today", label: "Leo" },
    { id: "tomorrow", label: "Kesho" },
    { id: "this_week", label: "Wiki Hii" },
    { id: "next_week", label: "Wiki Ijayo" },
    { id: "this_month", label: "Mwezi Huu" },
  ];

  const loadMatches = useCallback(async (filter: string, newOffset = 0) => {
    setLoading(true);
    if (newOffset === 0) setError(null);
    try {
      const leagueParam = selectedLeague === "all" ? undefined : selectedLeague;
      const data = await getFixtures(undefined, filter, newOffset, 50, leagueParam);
      if (newOffset === 0) {
        setMatches(data);
      } else {
        setMatches(prev => [...prev, ...data]);
      }
      setHasMore(data.length === 50);
      setOffset(newOffset);
    } catch (error) {
      console.error("Failed to load matches:", error);
      setError(error instanceof Error ? error.message : "Imeshindikana kupakia mechi.");
    } finally {
      setLoading(false);
    }
  }, [selectedLeague]);

  useEffect(() => {
    // Load leagues
    getLeagues().then(setLeagues);
    // Load matches
    const loadTimeout = window.setTimeout(() => { void loadMatches(activeFilter, 0); }, 0);
    // Load hero slide for static image
    getHeroSlides().then((data) => {
      if (data.slides && data.slides.length > 0) {
        setHeroSlide(data.slides[0]);
      }
    }).catch(() => {
      // Fallback if hero slides fail to load
    });
    return () => window.clearTimeout(loadTimeout);
  }, [activeFilter, loadMatches, retryKey]);

  // Save filter preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('create_active_filter', activeFilter);
    }
  }, [activeFilter]);

  // Save league preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('create_selected_league', selectedLeague);
    }
  }, [selectedLeague]);

  const handleLoadMore = () => {
    loadMatches(activeFilter, offset + 50);
  };

  const grouped = matches.reduce((acc: Record<string, Match[]>, m) => {
    const key = m.league.name;
    acc[key] = acc[key] || [];
    acc[key].push(m);
    return acc;
  }, {});

  // Sort leagues alphabetically
  const sortedLeagues = Object.keys(grouped).sort();

  // No client-side filtering needed - server handles it now
  const filteredLeagues = sortedLeagues;

  return (
    <div>
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 pt-safe pt-8 pb-6 md:pb-8" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 32px)" }}>
        <div className="flex items-center gap-3 mb-3 md:mb-4">
          <button type="button" onClick={() => router.back()} aria-label="Rudi nyuma" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft size={24} className="text-white/60" />
          </button>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">Chagua Mechi</h1>
        </div>
        <p className="text-sm md:text-base lg:text-lg text-white/50 md:text-white/60 max-w-2xl">Anza prediction yako ya AI</p>
      </div>

      {/* Static Hero Image */}
      {heroSlide && (
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6 md:mb-8 lg:mb-10 rounded-2xl md:rounded-3xl overflow-hidden relative h-48 md:h-56 lg:h-64 xl:h-72"
          style={{
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 1px var(--border)"
          }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(9,9,11,0.1) 0%, rgba(9,9,11,0.3) 60%, rgba(9,9,11,0.7) 100%), url(${heroSlide.image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          />
          {/* Gradient overlay for better text readability */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, transparent 0%, rgba(9,9,11,0.2) 50%, rgba(9,9,11,0.5) 100%)"
            }}
          />
        </motion.div>
      )}

      {/* Date Filter Tabs */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 pb-4 md:pb-6">
        {/* League Select */}
        <div className="mb-4 md:mb-6">
          <div className="relative group">
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(207, 175, 123, 0.05))",
                border: "1px solid rgba(212, 175, 55, 0.2)"
              }}
            />
            <select
              value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                aria-label="Chagua ligi"
              className="w-full pl-4 pr-12 py-3.5 md:py-4 rounded-xl text-sm md:text-base font-semibold appearance-none cursor-pointer transition-all duration-300 relative z-10"
              style={{
                background: "rgba(15, 15, 20, 0.8)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "white",
                outline: "none",
                backdropFilter: "blur(20px)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(212, 175, 55, 0.5)";
                e.target.style.boxShadow = "0 4px 25px rgba(212, 175, 55, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.12)";
                e.target.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)";
              }}
            >
              <option value="all" style={{ background: "#0f0f14", color: "white", fontWeight: "600" }}>Ligi Zote</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.poisson_key} style={{ background: "#0f0f14", color: "white", fontWeight: "500" }}>
                  {league.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-transform duration-300 group-hover:translate-y-0.5"
              style={{ color: "rgba(255,255,255,0.5)" }}
            />
          </div>
        </div>
        <div className="relative">
          <div
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: 'x mandatory'
            }}
          >
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                aria-pressed={activeFilter === filter.id}
                className="px-4 py-2 md:px-5 md:py-2.5 rounded-lg text-sm md:text-base font-bold whitespace-nowrap transition-all snap-start shrink-0"
                style={{
                  background: activeFilter === filter.id ? "rgba(56, 189, 248, 0.2)" : "rgba(255,255,255,0.05)",
                  color: activeFilter === filter.id ? "#38BDF8" : "rgba(255,255,255,0.6)",
                  border: activeFilter === filter.id ? "1px solid #38BDF8" : "1px solid rgba(255,255,255,0.1)",
                  minWidth: 'fit-content'
                }}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  {filter.label}
                </div>
              </button>
            ))}
          </div>
          {/* Scroll indicators */}
          <div className="absolute right-0 top-0 bottom-2 w-8 pointer-events-none" style={{ background: "linear-gradient(to right, transparent, #0a0a0a)" }} />
        </div>
        <div className="flex items-center justify-between mt-2 md:mt-3">
          <span className="text-xs md:text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            {matches.length} mechi
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 lg:px-12 space-y-6 md:space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-24">
            <GoalPostLoader />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[18rem] md:min-h-[24rem] text-center pt-10 md:pt-16">
            <p className="text-sm md:text-base font-semibold text-red-300">{error}</p>
            <button
              type="button"
              onClick={() => setRetryKey((value) => value + 1)}
              className="mt-4 md:mt-6 rounded-xl px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-bold text-black"
              style={{ background: "#38BDF8" }}
            >
              Jaribu tena
            </button>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-dvh text-center pt-20 md:pt-32">
            <div className="text-6xl md:text-8xl mb-4 md:mb-6">🏟️</div>
            <p className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">Hakuna Mechi</p>
            <p className="text-sm md:text-base text-white/60 max-w-xs md:max-w-md">
              Hakuna mechi kwa {filters.find(f => f.id === activeFilter)?.label}. Jaribu filter nyingine.
            </p>
          </div>
        ) : (
          filteredLeagues.map((league) => (
            <motion.div
              key={league}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-xs md:text-sm font-bold uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                <Flame size={12} className="text-[#D4AF37]" />
                {league}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-5">
                {grouped[league].map((m, index) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => router.push(`/create/${m.id}/overview`)}
                  >
                    <GlassCard
                      hover
                      texture
                      className="p-4 md:p-5 lg:p-6 cursor-pointer"
                    >
                      {/* Match Header */}
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-[#D4AF37]" />
                          <span className="text-xs md:text-sm font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
                            {new Date(m.kickoff_at).toLocaleDateString("sw-TZ", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp size={12} className="text-[#00FF87]" />
                          <span className="text-xs md:text-sm font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
                            {new Date(m.kickoff_at).toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>

                      {/* Teams with Logos */}
                      <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {/* Home Team */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center overflow-hidden bg-white/5 flex-shrink-0">
                              {m.home_team.crest_url ? (
                                <Image
                                  src={m.home_team.crest_url}
                                  alt={m.home_team.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-contain p-1"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <Target size={16} className="text-[#D4AF37] hidden" />
                            </div>
                            <span className="text-sm md:text-base font-bold text-white truncate">{m.home_team.name}</span>
                          </div>

                          {/* VS */}
                          <div className="px-2 py-1 md:px-3 md:py-1.5 rounded-lg bg-white/5 flex-shrink-0">
                            <span className="text-xs md:text-sm font-bold text-white/40">VS</span>
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                            <span className="text-sm md:text-base font-bold text-white truncate text-right">{m.away_team.name}</span>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center overflow-hidden bg-white/5 flex-shrink-0">
                              {m.away_team.crest_url ? (
                                <Image
                                  src={m.away_team.crest_url}
                                  alt={m.away_team.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-contain p-1"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <Target size={16} className="text-[#D4AF37] hidden" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stage Badge */}
                      {m.stage_display && (
                        <div className="mb-3 md:mb-4">
                          <span className="text-xs md:text-sm rounded-full px-3 py-1 md:px-4 md:py-1.5 font-semibold" style={{ background: "rgba(255,214,0,0.1)", color: "#FFD600", border: "1px solid rgba(255,214,0,0.2)" }}>
                            {m.stage_display}{m.group_name ? ` • ${m.group_name}` : ""}
                          </span>
                        </div>
                      )}

                      {/* Integrated Odds Card */}
                      <MatchOddsCard
                        matchId={m.id}
                        homeTeam={m.home_team.name}
                        awayTeam={m.away_team.name}
                        compact={true}
                      />
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {hasMore && !error && (
        <div className="flex justify-center py-8 md:py-12">
          <BookButton onClick={handleLoadMore} icon={LoadMoreIcon} loading={loading} disabled={loading}>
            Pakia Zaidi
          </BookButton>
        </div>
      )}
    </div>
  );
}