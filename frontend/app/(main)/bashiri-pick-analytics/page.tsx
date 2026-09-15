"use client";

import { useEffect, useState } from "react";
import { getBashiriPickAnalytics, getLeagues, BashiriPickAnalytics, League } from "@/lib/api/predictions";
import { ArrowLeft, TrendingUp, TrendingDown, Target, Calendar, Filter, Trophy, Activity, Sparkles, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { AccuracySphere } from "@/components/profile/AccuracySphere";
import { MarketMasteryHeatmap } from "@/components/profile/MarketMasteryHeatmap";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function BashiriPickAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<BashiriPickAnalytics | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLeague, setSelectedLeague] = useState<string>("");
  const [selectedRange, setSelectedRange] = useState<"last_7_days" | "last_30_days" | "last_90_days">("last_30_days");

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [selectedLeague, selectedRange]);

  const loadLeagues = async () => {
    try {
      const data = await getLeagues();
      setLeagues(data);
    } catch (err) {
      console.error("Failed to load leagues:", err);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number> = {
        range: selectedRange,
      };

      if (selectedLeague) params.league = selectedLeague;

      const data = await getBashiriPickAnalytics(params);
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError("Imeshindikana kupata taarifa za analytics.");
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return "#00FF87";
    if (accuracy >= 50) return "#FFD600";
    return "#FF4757";
  };

  const formatMarketLabel = (market: string) => {
    const labels: Record<string, string> = {
      "1x2": "1X2",
      btts: "BTTS",
      over_under: "O/U 2.5",
      over_under_15: "O/U 1.5",
      double_chance: "Double Chance",
      home_goals: "Home Goals",
      away_goals: "Away Goals",
    };
    if (labels[market]) return labels[market];
    return market
      .split("_")
      .map((part) => (/^\d+$/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1)))
      .join(" ")
      .replace(/(Over|Under) (\d+) (\d+)/, "$1 $2.$3");
  };

  if (loading) {
    return (
      <main className="analytics-page min-h-screen px-4 pb-8 pt-6 sm:px-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-6 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Rudi nyuma"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/20 hover:bg-white/10"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">Performance</p>
              <h1 className="text-xl font-black text-white sm:text-2xl">Bashiri Pick Analytics</h1>
            </div>
          </header>
          <CardSkeleton />
        </div>
      </main>
    );
  }

  if (error || !analytics) {
    return (
      <main className="analytics-page min-h-screen px-4 pb-8 pt-6 sm:px-5 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <header className="mb-6 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Rudi nyuma"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/20 hover:bg-white/10"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">Performance</p>
              <h1 className="text-xl font-black text-white sm:text-2xl">Bashiri Pick Analytics</h1>
            </div>
          </header>

          <div className="glass-panel rounded-3xl p-6 text-center">
            <p className="text-sm text-white/70">{error || "Taarifa za analytics hazipatikani."}</p>
          </div>
        </div>
      </main>
    );
  }

  const accuracyColor = getAccuracyColor(analytics.summary.accuracy);
  const summaryCards = [
    {
      label: "Accuracy",
      value: `${analytics.summary.accuracy}%`,
      detail: `${analytics.summary.won}/${analytics.summary.settled_picks} picks`,
      tint: accuracyColor,
      icon: Sparkles,
    },
    {
      label: "Current Streak",
      value: `${analytics.summary.current_streak}`,
      detail: `Best: ${analytics.summary.best_streak}`,
      tint: "#D4AF37",
      icon: Activity,
    },
    {
      label: "Wins",
      value: `${analytics.summary.won}`,
      detail: "Settled results",
      tint: "#00FF87",
      icon: Trophy,
    },
    {
      label: "Losses",
      value: `${analytics.summary.lost}`,
      detail: "Unsuccessful picks",
      tint: "#FF4757",
      icon: TrendingDown,
    },
  ];

  const fieldClass =
    "w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[var(--brand-primary)] focus:bg-white/8";

  const marketMastery = analytics.market_breakdown.map((market) => ({
    market: formatMarketLabel(market.market),
    accuracy: market.total > 0 ? market.accuracy : null,
    predictions: market.total,
  }));

  return (
    <main className="analytics-page min-h-screen px-4 pb-32 pt-6 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Rudi nyuma"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/20 hover:bg-white/10"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">Performance</p>
              <h1 className="text-xl font-black text-white sm:text-2xl">Bashiri Pick Analytics</h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/10 px-3 py-1.5 sm:flex">
            <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">TopPickCard</span>
          </div>
        </header>

        <section className="glass-panel rounded-3xl p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-white">
            <Filter size={16} className="text-[var(--brand-primary)]" />
            <span className="text-sm font-bold">Filters</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">one pick per match</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">League</label>
              <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className={fieldClass}>
                <option value="">All Leagues</option>
                {leagues.map((league) => (
                  <option key={league.code} value={league.name}>
                    {league.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">Range</label>
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value as "last_7_days" | "last_30_days" | "last_90_days")}
                className={fieldClass}
              >
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last 90 Days</option>
              </select>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {summaryCards.map(({ label, value, detail, tint, icon: Icon }) => (
            <article
              key={label}
              className="glass-panel rounded-3xl p-3 transition duration-200 hover:-translate-y-0.5 hover:border-white/15 sm:p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">{label}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl" style={{ background: `${tint}1A`, color: tint }}>
                  <Icon size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-white sm:text-3xl" style={{ color: label === "Accuracy" ? tint : undefined }}>
                {value}
              </p>
              <p className="mt-2 text-xs text-white/55">{detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.5fr]">
          <article className="glass-panel rounded-3xl p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[var(--brand-primary)]" size={16} />
                <h2 className="text-sm font-bold text-white">Accuracy Sphere</h2>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">3D visualization</span>
            </div>
            <div className="flex justify-center">
              <AccuracySphere accuracy={analytics.summary.accuracy} size={220} />
            </div>
          </article>

          <article className="glass-panel rounded-3xl p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-[var(--brand-primary)]" size={16} />
                <h2 className="text-sm font-bold text-white">Market Mastery</h2>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">Heatmap</span>
            </div>
            <MarketMasteryHeatmap data={marketMastery} />
          </article>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_0.95fr]">
          <article className="glass-panel rounded-3xl p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="text-[var(--brand-primary)]" size={16} />
              <h2 className="text-sm font-bold text-white">Daily Trend</h2>
            </div>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.daily_trend}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.45)"
                    tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 10 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  />
                  <YAxis stroke="rgba(255,255,255,0.45)" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: "#111111",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                    }}
                    labelStyle={{ color: "white" }}
                    itemStyle={{ color: "#38BDF8" }}
                    formatter={(value) => [`${Number(value ?? 0)}%`, "Accuracy"]}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#38BDF8" strokeWidth={3} dot={{ fill: "#38BDF8", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <aside className="glass-panel rounded-3xl p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Target className="text-[var(--brand-primary)]" size={16} />
              <h2 className="text-sm font-bold text-white">Key Takeaways</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Settled picks</p>
                <p className="mt-2 text-2xl font-black text-white">{analytics.summary.settled_picks}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Current streak</p>
                <p className="mt-2 text-2xl font-black text-white">{analytics.summary.current_streak}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Best streak</p>
                <p className="mt-2 text-2xl font-black text-white">{analytics.summary.best_streak}</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <article className="glass-panel rounded-3xl p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Target className="text-[var(--brand-primary)]" size={16} />
              <h2 className="text-sm font-bold text-white">Market Breakdown</h2>
            </div>
            <div className="space-y-3">
              {analytics.market_breakdown.slice(0, 5).map((market) => (
                <div key={market.market} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                  <div>
                    <p className="text-xs font-bold text-white">{market.market}</p>
                    <p className="text-[10px] text-white/45">{market.won}/{market.total} picks</p>
                  </div>
                  <p className="text-sm font-black" style={{ color: getAccuracyColor(market.accuracy) }}>{market.accuracy}%</p>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-panel rounded-3xl p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="text-[var(--brand-primary)]" size={16} />
              <h2 className="text-sm font-bold text-white">League Breakdown</h2>
            </div>
            <div className="space-y-3">
              {analytics.league_breakdown.slice(0, 5).map((league) => (
                <div key={league.league} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                  <div>
                    <p className="text-xs font-bold text-white">{league.league}</p>
                    <p className="text-[10px] text-white/45">{league.won}/{league.total} picks</p>
                  </div>
                  <p className="text-sm font-black" style={{ color: getAccuracyColor(league.accuracy) }}>{league.accuracy}%</p>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-panel rounded-3xl p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="text-[var(--brand-primary)]" size={16} />
              <h2 className="text-sm font-bold text-white">Confidence Breakdown</h2>
            </div>
            <div className="space-y-3">
              {analytics.confidence_breakdown.map((conf) => (
                <div key={conf.label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                  <div>
                    <p className="text-xs font-bold text-white">{conf.label}</p>
                    <p className="text-[10px] text-white/45">{conf.won}/{conf.total} picks</p>
                  </div>
                  <p className="text-sm font-black" style={{ color: getAccuracyColor(conf.accuracy) }}>{conf.accuracy}%</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="glass-panel mt-6 rounded-3xl p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="text-[var(--brand-primary)]" size={16} />
            <h2 className="text-sm font-bold text-white">Recent Picks</h2>
          </div>

          <div className="space-y-3">
            {analytics.recent_picks.map((pick) => (
              <article
                key={pick.snapshot_id}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition hover:border-white/12 hover:bg-white/[0.04]"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{pick.home_team} vs {pick.away_team}</p>
                    <p className="mt-1 text-[11px] text-white/45">{pick.league} • {new Date(pick.created_at).toLocaleDateString()}</p>
                  </div>
                  <span
                    className="rounded-full px-2 py-1 text-[10px] font-bold"
                    style={{
                      background:
                        pick.status === "WON"
                          ? "rgba(0,255,135,0.12)"
                          : pick.status === "LOST"
                            ? "rgba(255,71,87,0.12)"
                            : "rgba(255,215,0,0.12)",
                      color:
                        pick.status === "WON" ? "#00FF87" : pick.status === "LOST" ? "#FF4757" : "#FFD600",
                    }}
                  >
                    {pick.status}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">{pick.option_label}</p>
                    <p className="mt-1 text-[10px] text-white/45">{pick.market_label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[var(--brand-primary)]">{pick.confidence}%</p>
                    <p className="text-[10px] text-white/45">TopPickCard</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.18em] text-white/25">
          Bashiri Pick Analytics • Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </main>
  );
}
