"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLeagues, getFavoriteLeagues, setFavoriteLeagues } from "@/lib/api/settings";
import { League } from "@/lib/api/predictions";
import { BashiriButton } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ArrowLeft, Check } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function FavoriteLeaguesPage() {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!requireAuth("Weka ligi unazopenda — jisajili kwa dakika chache!")) {
      router.push("/home");
      return;
    }
    Promise.all([getLeagues(), getFavoriteLeagues()]).then(([leaguesData, favData]) => {
      if (favData) {
        setLeagues(leaguesData);
        setSelected(new Set(favData.league_ids));
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [requireAuth, router]);

  function toggle(leagueId: number) {
    setSaved(false);
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(leagueId) ? next.delete(leagueId) : next.add(leagueId);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    await setFavoriteLeagues(Array.from(selected));
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 pb-32 pt-safe text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl pb-20">
        <div className="flex items-center gap-3 pb-4 pt-10" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 32px)" }}>
          <button onClick={() => router.back()} aria-label="Rudi nyuma" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] transition hover:bg-white/[0.06]">
            <ArrowLeft size={20} className="text-white/70" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white">Ligi Ninazopenda</h1>
            <p className="text-sm text-white/50">Chagua ligi zako zinazokupenda</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#111218]/80 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.22)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/60">Available Leagues</p>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">
              {leagues.length} items
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {loading ? [1, 2, 3].map((i) => <CardSkeleton key={i} />) : leagues.map((league) => {
              const isSelected = selected.has(league.id);
              return (
                <button
                  key={league.id}
                  onClick={() => toggle(league.id)}
                  className={`flex min-h-[72px] w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-[#00FF87]/50 bg-[#00FF87]/10 shadow-[0_0_0_1px_rgba(0,255,135,0.18)]'
                      : 'border-white/10 bg-[#0f1116] hover:border-white/20 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="text-sm font-bold text-white">{league.name}</span>
                  {isSelected && <Check size={16} className="text-[#00FF87]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-safe pb-4 pt-3" style={{ background: "linear-gradient(180deg, transparent, var(--background) 30%)" }}>
        <div className="mx-auto max-w-5xl">
          <BashiriButton className="w-full" size="lg" loading={saving} onClick={handleSave}>
            {saved ? "Imehifadhiwa ✓" : "Hifadhi"}
          </BashiriButton>
        </div>
      </div>
    </div>
  );
}
