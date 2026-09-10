"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLeagues, getTeams, getFavoriteTeams, setFavoriteTeams } from "@/lib/api/settings";
import { League, Team } from "@/lib/api/predictions";
import { BashiriButton } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ArrowLeft, Check } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function FavoriteTeamsPage() {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teamsByLeague, setTeamsByLeague] = useState<Record<string, Team[]>>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!requireAuth("Weka timu unazopenda — jisajili kwa dakika chache!")) {
      router.push("/home");
      return;
    }
    async function load() {
      const [leaguesData, favData] = await Promise.all([getLeagues(), getFavoriteTeams()]);
      if (favData) {
        setLeagues(leaguesData);
        setSelected(new Set(favData.team_ids));

        const teamsMap: Record<string, Team[]> = {};
        for (const league of leaguesData) {
          teamsMap[league.poisson_key] = await getTeams(league.poisson_key);
        }
        setTeamsByLeague(teamsMap);
      }
      setLoading(false);
    }
    load();
  }, [requireAuth, router]);

  function toggle(teamId: number) {
    setSaved(false);
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(teamId) ? next.delete(teamId) : next.add(teamId);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    await setFavoriteTeams(Array.from(selected));
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
            <h1 className="text-2xl font-black text-white">Timu Ninazopenda</h1>
            <p className="text-sm text-white/50">Chagua timu zako zinazokupenda</p>
          </div>
        </div>

        <div className="space-y-5">
          {loading ? (
            [1, 2, 3].map((i) => <CardSkeleton key={i} />)
          ) : (
            leagues.map((league) => (
              <div key={league.id} className="rounded-[28px] border border-white/10 bg-[#111218]/80 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.22)] sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/60">
                    {league.name}
                  </p>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">
                    {(teamsByLeague[league.poisson_key] || []).length} teams
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {(teamsByLeague[league.poisson_key] || []).map((team) => {
                    const isSelected = selected.has(team.id);
                    return (
                      <button
                        key={team.id}
                        onClick={() => toggle(team.id)}
                        className={`flex min-h-[60px] items-center justify-between gap-2 rounded-2xl border p-3 text-left transition-all ${
                          isSelected
                            ? 'border-[#00FF87]/50 bg-[#00FF87]/10 shadow-[0_0_0_1px_rgba(0,255,135,0.18)]'
                            : 'border-white/10 bg-[#0f1116] hover:border-white/20 hover:bg-white/[0.03]'
                        }`}
                      >
                        <span className="flex-1 truncate text-xs font-bold text-white">{team.name}</span>
                        {isSelected && <Check size={14} className="text-[#00FF87]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
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
