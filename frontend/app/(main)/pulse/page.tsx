"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Music2, Search } from "lucide-react";
import { getPulseSummary, PulseSummary } from "@/lib/api/pulse";
import { getSavedMatches } from "@/lib/api/predictions";
import { LivePulseBar } from "@/components/pulse/LivePulseBar";
import { BentoGrid } from "@/components/pulse/BentoGrid";
import { useCommandPaletteStore } from "@/stores/commandPalette.store";
import { useAuthStore } from "@/stores/auth.store";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function BashiriPulsePage() {
  const router = useRouter();
  const openPalette = useCommandPaletteStore((s) => s.open);
  const access = useAuthStore((s) => s.access);
  const [data, setData] = useState<PulseSummary | null>(null);
  const [saved, setSaved] = useState<any[]>([]);

  useEffect(() => {
    getPulseSummary().then(setData);
    if (access) getSavedMatches().then(setSaved).catch(() => {});
  }, [access]);

  return (
    <div className="min-h-dvh bg-[#0A0A0F]">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="flex items-center justify-between px-4 md:px-6 lg:px-8 pt-safe pt-10 pb-4" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 32px)" }}>
          <motion.button 
            onClick={() => router.back()} 
            className="p-3 -ml-3 md:-ml-0 rounded-full"
            aria-label="Back"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} style={{ color: "rgba(255,255,255,0.6)" }} />
          </motion.button>
          <h1 className="text-lg font-semibold leading-snug" style={{ color: "#D4AF37" }}>⚡ Bashiri Pulse</h1>
          <motion.button 
            onClick={openPalette} 
            className="p-3 -mr-3 md:-mr-0 rounded-full"
            aria-label="Search"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search size={20} style={{ color: "rgba(255,255,255,0.6)" }} />
          </motion.button>
        </header>

        {!data ? (
          <div className="px-4 md:px-6 lg:px-8 pt-4"><CardSkeleton /></div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            className="pb-safe"
          >
            {/* LIVE INTELLIGENCE BAR */}
            {data && <LivePulseBar stats={data.stats} />}

            {/* HERO SECTION - MIC */}
            <section className="px-4 md:px-6 lg:px-8 pt-6">
              <BentoGrid data={data} mode="hero" />
            </section>

            {/* MUSIC */}
            <section className="px-4 md:px-6 lg:px-8 pt-6">
              <motion.button
                onClick={() => router.push("/music")}
                className="group relative min-h-40 w-full overflow-hidden rounded-3xl border border-[#D4AF37]/25 bg-cover bg-center text-left"
                style={{ backgroundImage: "url('/music/music_backgound.jpg')" }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,7,0.94),rgba(5,8,7,0.58),rgba(5,8,7,0.2))]" />
                <div className="relative flex min-h-40 items-center justify-between gap-5 p-5 sm:p-7">
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#22C55E]">Bashiri Audio</p>
                    <h2 className="text-2xl font-black text-white sm:text-3xl">Soundtrack your matchday.</h2>
                    <p className="mt-2 max-w-md text-xs leading-5 text-white/60">Sikiliza, discover na hifadhi nyimbo zako kwenye library yako.</p>
                  </div>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-black shadow-lg shadow-black/30 transition group-hover:scale-105">
                    <Music2 size={21} />
                  </span>
                </div>
              </motion.button>
            </section>

            {/* LIVE INTELLIGENCE - ROOMS */}
            <section className="px-4 md:px-6 lg:px-8 pt-6">
              <BentoGrid data={data} mode="live-intelligence" />
            </section>

            {/* COMMUNITY - DEBATES */}
            <section className="px-4 md:px-6 lg:px-8 pt-6">
              <BentoGrid data={data} mode="community" />
            </section>

            {/* AI INSIGHTS - DERBY & TIPS */}
            <section className="px-4 md:px-6 lg:px-8 pt-6">
              <BentoGrid data={data} mode="ai-insights" />
            </section>

            {/* HISTORY - SAVED MATCHES */}
            {saved.length > 0 && (
              <section className="px-4 md:px-6 lg:px-8 pt-8">
                <p className="text-xs font-semibold uppercase mb-4 px-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Endelea na Ulikoishia
                </p>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {saved.slice(0, 5).map((s: any) => (
                    <motion.button
                      key={s.id}
                      onClick={() => router.push(`/create/${s.match.id}/overview`)}
                      className="shrink-0 rounded-2xl px-6 py-4 text-left"
                      style={{ background: "#1A1A1A", border: "1px solid rgba(75,85,99,0.3)", boxShadow: "0 2px 12px rgba(0,0,0,0.25)" }}
                      whileHover={{ scale: 1.02, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <p className="text-xs font-semibold text-white whitespace-nowrap leading-snug">
                        {s.match.home_team.name} vs {s.match.away_team.name}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </section>
            )}

            {/* BOTTOM CTA */}
            <div className="px-4 md:px-6 lg:px-8 pt-8 pb-safe text-center">
              <motion.button 
                onClick={() => router.push("/matches")} 
                className="text-xs font-medium px-6 py-4 leading-relaxed rounded-full"
                style={{ color: "rgba(212,175,55,0.8)" }}
                whileHover={{ scale: 1.05, color: "rgba(212,175,55,1)" }}
                whileTap={{ scale: 0.95 }}
              >
                Ona Mechi Zote →
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
