"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  ChevronDown,
  Copy,
  Crown,
  LoaderCircle,
  Plus,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
} from "lucide-react";
import {
  createLeaguePick,
  createPredictionLeague,
  getLeagueMarkets,
  getPredictionLeague,
  getPredictionLeagues,
  joinPredictionLeague,
  LeaguePick,
  PredictionLeague,
  PredictionLeagueDetail,
} from "@/lib/api/gamification";
import { getFixtures, Match } from "@/lib/api/predictions";
import { MarketDefinition } from "@/lib/types/tips";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/stores/auth.store";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("sw-TZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Avatar({ src, name }: { src: string; name: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} className="h-10 w-10 rounded-full border border-white/10 object-cover" />
  ) : (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-200 to-amber-600 text-sm font-black text-black">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function LeaguePickForm({
  inviteCode,
  picks,
  onCreated,
}: {
  inviteCode: string;
  picks: LeaguePick[];
  onCreated: () => void;
}) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [markets, setMarkets] = useState<MarketDefinition[]>([]);
  const [matchId, setMatchId] = useState("");
  const [marketKey, setMarketKey] = useState("");
  const [selectionKey, setSelectionKey] = useState("");
  const [correctScore, setCorrectScore] = useState("1-0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getFixtures(undefined, "this_week", 0, 100),
      getLeagueMarkets(),
    ]).then(([fixtureData, marketData]) => {
      setMatches(fixtureData.filter((match) => match.status === "SCHEDULED"));
      const availableMarkets = marketData.markets.filter((market) => market.available);
      setMarkets(availableMarkets);
      setMarketKey(availableMarkets[0]?.key || "");
      setSelectionKey(availableMarkets[0]?.selections[0]?.key || "");
    }).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Mechi au markets hazikupatikana.");
    }).finally(() => setLoading(false));
  }, []);

  const selectedMarket = markets.find((market) => market.key === marketKey);
  const usedMatches = new Set(picks.map((pick) => pick.match.id));
  const availableMatches = matches.filter((match) => !usedMatches.has(match.id));

  function changeMarket(key: string) {
    setMarketKey(key);
    const market = markets.find((item) => item.key === key);
    setSelectionKey(market?.selections[0]?.key || "");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!matchId || !marketKey || !(selectionKey || (marketKey === "CORRECT_SCORE" && correctScore))) {
      setError("Chagua mechi, market na pick yako.");
      return;
    }
    setSaving(true);
    try {
      await createLeaguePick(inviteCode, {
        match: Number(matchId),
        market_key: marketKey,
        selection_key: marketKey === "CORRECT_SCORE" ? correctScore : selectionKey,
      });
      setMatchId("");
      onCreated();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Pick haikuhifadhiwa.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-8"><LoaderCircle className="animate-spin text-amber-300" /></div>;

  return (
    <form onSubmit={submit} className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-300/10 text-amber-200"><Target size={19} /></span>
        <div><h3 className="font-black text-white">Weka prediction yako</h3><p className="text-xs text-white/45">Lazima iwe kabla ya kickoff · pick moja kwa mechi</p></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold text-white/50">Mechi inayokuja</span>
          <span className="relative block">
            <select value={matchId} onChange={(event) => setMatchId(event.target.value)} className="w-full appearance-none rounded-xl border border-white/10 bg-[#17181e] px-3 py-3 pr-9 text-xs text-white outline-none focus:border-amber-300/40">
              <option value="">Chagua mechi</option>
              {availableMatches.map((match) => <option key={match.id} value={match.id}>{match.home_team.name} vs {match.away_team.name} · {match.league.name}</option>)}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-3.5 text-white/40" />
          </span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold text-white/50">Market</span>
          <span className="relative block">
            <select value={marketKey} onChange={(event) => changeMarket(event.target.value)} className="w-full appearance-none rounded-xl border border-white/10 bg-[#17181e] px-3 py-3 pr-9 text-xs text-white outline-none focus:border-amber-300/40">
              {markets.map((market) => <option key={market.key} value={market.key}>{market.label}</option>)}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-3.5 text-white/40" />
          </span>
        </label>
        {selectedMarket?.key === "CORRECT_SCORE" ? (
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[11px] font-semibold text-white/50">Score unayotabiri (home-away)</span>
            <select value={correctScore} onChange={(event) => setCorrectScore(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#17181e] px-3 py-3 text-xs text-white outline-none focus:border-amber-300/40">
              {Array.from({ length: 36 }, (_, index) => `${Math.floor(index / 6)}-${index % 6}`).map((score) => <option key={score} value={score}>{score}</option>)}
            </select>
          </label>
        ) : (
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[11px] font-semibold text-white/50">Chaguo lako</span>
            <span className="relative block">
              <select value={selectionKey} onChange={(event) => setSelectionKey(event.target.value)} className="w-full appearance-none rounded-xl border border-white/10 bg-[#17181e] px-3 py-3 pr-9 text-xs text-white outline-none focus:border-amber-300/40">
                {selectedMarket?.selections.map((selection) => <option key={selection.key} value={selection.key}>{selection.label}</option>)}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3 top-3.5 text-white/40" />
            </span>
          </label>
        )}
      </div>
      {availableMatches.length === 0 && <p className="mt-3 text-xs text-amber-200/70">Hakuna mechi nyingine ya wiki hii unayoweza kuchagua. Kila mshiriki ana pick moja kwa mechi.</p>}
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</p>}
      <button type="submit" disabled={saving || availableMatches.length === 0} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-yellow-600 px-4 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-50">
        {saving ? <><LoaderCircle size={16} className="animate-spin" /> Inahifadhi pick…</> : <><Target size={16} /> Funga pick yako</>}
      </button>
    </form>
  );
}

export default function PredictionLeaguesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { requireAuth } = useRequireAuth();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthed = useAuthStore((state) => !!state.access);
  const [leagues, setLeagues] = useState<PredictionLeague[]>([]);
  const [selected, setSelected] = useState<PredictionLeague | null>(null);
  const [detail, setDetail] = useState<PredictionLeagueDetail | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<7 | 30 | 90>(7);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadLeagues = useCallback(async () => {
    const data = await getPredictionLeagues();
    return data.results;
  }, []);

  const loadDetail = useCallback(async (league: PredictionLeague) => {
    setSelected(league);
    setError("");
    try {
      const data = await getPredictionLeague(league.invite_code);
      setDetail(data);
      setSelected(data.league);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Ligi haikupatikana.");
    }
  }, []);

  const refreshLeagues = useCallback(async () => {
    setError("");
    try {
      const items = await loadLeagues();
      setLeagues(items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Ligi hazikupatikana.");
    }
  }, [loadLeagues]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthed) return;
    let active = true;
    loadLeagues().then((items) => {
      if (!active) return;
      setLeagues(items);
      const invite = searchParams.get("join");
      const initial = items.find((item) => item.invite_code === invite);
      if (initial) return loadDetail(initial);
      if (invite) {
        return joinPredictionLeague(invite)
          .then(({ league }) => loadLeagues().then((updatedItems) => {
            setLeagues(updatedItems);
            return loadDetail(league);
          }))
          .then(() => setNotice("Umejiunga na ligi ya mwaliko!"));
      }
      if (items[0]) return loadDetail(items[0]);
      return undefined;
    }).catch((loadError) => {
      if (active) setError(loadError instanceof Error ? loadError.message : "Ligi hazikupatikana.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [hasHydrated, isAuthed, loadDetail, loadLeagues, searchParams]);

  useEffect(() => {
    if (!selected) return;
    const timer = window.setInterval(() => {
      void loadDetail(selected);
      void refreshLeagues();
    }, 60000);
    return () => window.clearInterval(timer);
  }, [loadDetail, refreshLeagues, selected]);

  const myPicks = useMemo(() => detail?.picks.filter((pick) => pick.user_id === user?.id) || [], [detail, user?.id]);

  async function submitCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!requireAuth("Ingia ili kuunda ligi.")) return;
    setBusy(true);
    setError("");
    try {
      const league = await createPredictionLeague({ name: name.trim(), description: description.trim(), duration_days: duration });
      const items = await loadLeagues();
      setLeagues(items);
      setCreateOpen(false);
      setName("");
      setDescription("");
      await loadDetail(league);
      setNotice("Ligi yako imetengenezwa. Share invite link uwaite marafiki!");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Ligi haikutengenezwa.");
    } finally {
      setBusy(false);
    }
  }

  async function submitJoin(event: React.FormEvent) {
    event.preventDefault();
    if (!requireAuth("Ingia ili kujiunga na ligi.")) return;
    setBusy(true);
    setError("");
    try {
      const response = await joinPredictionLeague(inviteCode.trim());
      const items = await loadLeagues();
      setLeagues(items);
      setInviteCode("");
      await loadDetail(response.league);
      setNotice(response.joined ? "Umejiunga na ligi!" : "Ulikuwa tayari ni mshiriki wa ligi hii.");
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : "Imeshindikana kujiunga na ligi.");
    } finally {
      setBusy(false);
    }
  }

  async function shareInvite(league: PredictionLeague) {
    const url = `${window.location.origin}/leagues?join=${league.invite_code}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Jiunge na ${league.name} · Bashiri Leagues`, text: league.description || "Tushindane kwa ubashiri sahihi wa mechi.", url });
      } else {
        await navigator.clipboard.writeText(url);
        setNotice("Invite link imenakiliwa—itume kwa group la marafiki.");
      }
    } catch (shareError) {
      if (!(shareError instanceof DOMException && shareError.name === "AbortError")) {
        setError(shareError instanceof Error ? shareError.message : "Imeshindikana kushare invite.");
      }
    }
  }

  if (!hasHydrated) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#090a0c] pb-24 text-amber-200">
        <LoaderCircle className="animate-spin" size={28} />
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#090a0c] px-5 pb-24 text-white">
        <div className="max-w-sm text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-amber-300/10 text-amber-200"><Trophy size={28} /></span>
          <h1 className="mt-5 text-2xl font-black">Ingia kuanza ligi</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/50">Prediction Leagues ni za wanachama. Ingia au jisajili kisha urudi kushindana na marafiki.</p>
          <button type="button" onClick={() => requireAuth("Ingia ili kuunda au kujiunga na Prediction League.", `${window.location.pathname}${window.location.search}`)} className="mt-5 min-h-11 rounded-full bg-amber-300 px-5 text-sm font-black text-black">Ingia / Jisajili</button>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#090a0c] pb-24 text-amber-200">
        <LoaderCircle className="animate-spin" size={28} />
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#090a0c] pb-28 text-white">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#090a0c]/90 px-4 pb-3 pt-safe backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3 pt-3">
          <button type="button" aria-label="Rudi nyuma" onClick={() => router.back()} className="rounded-full bg-white/[0.05] p-2 text-white/70"><ArrowLeft size={18} /></button>
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-300/10 text-amber-200"><Trophy size={20} /></span>
          <div className="min-w-0 flex-1"><h1 className="text-lg font-black">Bashiri Leagues</h1><p className="text-[10px] uppercase tracking-[0.16em] text-white/40">Ujuzi wako dhidi ya marafiki</p></div>
          <button type="button" onClick={() => { setCreateOpen((open) => !open); setError(""); }} className="flex min-h-10 items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-yellow-600 px-3.5 text-xs font-black text-black"><Plus size={16} /><span className="hidden sm:inline">Tengeneza ligi</span></button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-7 lg:py-8">
        <aside className="space-y-4">
          <section className="rounded-3xl border border-amber-200/10 bg-gradient-to-br from-amber-300/[0.09] to-transparent p-4 sm:p-5">
            <div className="flex items-start gap-3"><Sparkles size={19} className="mt-0.5 shrink-0 text-amber-200" /><div><h2 className="font-black">Challenge marafiki</h2><p className="mt-1 text-xs leading-relaxed text-white/55">Tengeneza ligi, share code, weka pick kabla ya kickoff na ushinde kwa usahihi.</p></div></div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-black/20 p-2"><p className="text-sm font-black text-amber-200">+3</p><p className="text-[9px] text-white/45">sahihi</p></div>
              <div className="rounded-xl bg-black/20 p-2"><p className="text-sm font-black">0</p><p className="text-[9px] text-white/45">isiyo sahihi</p></div>
              <div className="rounded-xl bg-black/20 p-2"><p className="text-sm font-black">0</p><p className="text-[9px] text-white/45">VOID</p></div>
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-white/35">Pick moja kwa mechi, haiwezi kubadilishwa baada ya kutuma, na inafungwa kickoff ikifika.</p>
          </section>

          <form onSubmit={submitJoin} className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="mb-3 flex items-center gap-2"><UsersRound size={16} className="text-sky-200" /><h2 className="text-sm font-black">Jiunge na ligi</h2></div>
            <input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="Bandika invite code" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-xs text-white outline-none placeholder:text-white/30 focus:border-amber-300/40" />
            <button disabled={busy || !inviteCode.trim()} className="mt-2 min-h-10 w-full rounded-xl border border-white/10 text-xs font-bold text-white/80 disabled:opacity-40">Jiunge na marafiki</button>
          </form>

          <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black">Ligi zangu</h2><button type="button" aria-label="Refresh ligi" onClick={() => void refreshLeagues()} className="rounded-full p-1.5 text-white/45 hover:bg-white/5"><RefreshCw size={14} /></button></div>
            {loading ? <div className="flex justify-center py-5"><LoaderCircle className="animate-spin text-amber-300" /></div>
              : leagues.length === 0 ? <p className="py-3 text-xs leading-relaxed text-white/40">Bado hujajiunga na ligi. Tengeneza ya kwanza au bandika invite code ya rafiki.</p>
                : <div className="space-y-2">{leagues.map((league) => <button key={league.id} type="button" onClick={() => void loadDetail(league)} className={`w-full rounded-2xl border p-3 text-left transition-colors ${selected?.invite_code === league.invite_code ? "border-amber-200/25 bg-amber-200/[0.08]" : "border-white/[0.06] bg-black/15 hover:bg-white/[0.04]"}`}>
                  <div className="flex items-center justify-between gap-2"><span className="truncate text-xs font-bold text-white">{league.name}</span><span className="text-[10px] font-black text-amber-200">{league.my_points} pts</span></div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-white/40"><span>{league.member_count} washiriki</span><span>·</span><span>{league.my_picks_count} picks</span></div>
                </button>)}</div>}
          </section>
        </aside>

        <section className="min-w-0 space-y-5">
          {createOpen && (
            <form onSubmit={submitCreate} className="rounded-3xl border border-amber-200/15 bg-[#111218] p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2"><Trophy size={17} className="text-amber-200" /><h2 className="font-black">Tengeneza ligi yako</h2></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} required placeholder="Jina, mfano: EPL Office League" className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-300/40" />
                <select value={duration} onChange={(event) => setDuration(Number(event.target.value) as 7 | 30 | 90)} className="rounded-xl border border-white/10 bg-[#17181e] px-3 py-3 text-sm text-white outline-none"><option value={7}>Ligi ya siku 7</option><option value={30}>Ligi ya siku 30</option><option value={90}>Ligi ya siku 90</option></select>
              </div>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={280} rows={2} placeholder="Maelezo mafupi (hiari)" className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-300/40" />
              <div className="mt-3 flex gap-2"><button disabled={busy} className="min-h-10 flex-1 rounded-xl bg-amber-300 text-xs font-black text-black disabled:opacity-50">{busy ? "Inatengeneza…" : "Tengeneza na uanze"}</button><button type="button" onClick={() => setCreateOpen(false)} className="min-h-10 rounded-xl border border-white/10 px-4 text-xs font-bold text-white/60">Ghairi</button></div>
            </form>
          )}

          {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-2xl border border-red-300/15 bg-red-500/[0.06] px-4 py-3 text-xs text-red-200"><span>{error}</span><button type="button" onClick={() => setError("")}>×</button></div>}

          {!selected || !detail ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-3xl bg-amber-300/10 text-amber-200"><Trophy size={28} /></span>
              <h2 className="mt-5 text-xl font-black">Ligi yako, ushindani wako</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/45">Tengeneza ligi ya marafiki kisha share invite. Kila mtu anaweka pick kabla ya kickoff; backend hutumia score ya mechi na soko lilelile la uthibitishaji.</p>
              <button type="button" onClick={() => setCreateOpen(true)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-300 px-5 text-sm font-black text-black"><Plus size={17} /> Tengeneza ligi</button>
            </div>
          ) : (
            <>
              <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.13),transparent_40%),#111218] p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0"><div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-200"><ShieldCheck size={12} /> {detail.is_open ? "Ligi inashindaniwa" : "Muda wa ligi umeisha"}</div><h2 className="text-2xl font-black sm:text-3xl">{detail.league.name}</h2><p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/50">{detail.league.description || "Ligi ya ubashiri wa marafiki."}</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/40"><span className="inline-flex items-center gap-1"><UsersRound size={12} /> {detail.league.member_count} washiriki</span><span className="inline-flex items-center gap-1"><CalendarClock size={12} /> Inaisha {formatDate(detail.league.ends_at)}</span><span>Inasimamiwa na @{detail.league.owner_name}</span></div></div>
                  <button type="button" onClick={() => void shareInvite(detail.league)} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/[0.07] px-4 text-xs font-bold text-amber-100"><Share2 size={14} /> Alika marafiki</button>
                </div>
                <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-white/[0.07] bg-black/20 p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">Invite code</p><p className="mt-1 break-all font-mono text-xs text-amber-100/80">{detail.league.invite_code}</p></div><button type="button" onClick={() => void navigator.clipboard.writeText(`${window.location.origin}/leagues?join=${detail.league.invite_code}`).then(() => setNotice("Invite link imenakiliwa."))} className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-3 text-[11px] font-bold text-white/70"><Copy size={13} /> Copy link</button></div>
              </section>

              {detail.is_open && <LeaguePickForm inviteCode={detail.league.invite_code} picks={myPicks} onCreated={() => { void loadDetail(detail.league); void refreshLeagues(); setNotice("Pick imefungwa. Baada ya kickoff huwezi kuibadilisha."); }} />}

              <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025]">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4 sm:px-5"><div><h3 className="font-black">Leaderboard</h3><p className="mt-0.5 text-[10px] text-white/40">3 pointi kwa sahihi · 0 kwa isiyo sahihi au VOID</p></div><Crown size={18} className="text-amber-200" /></div>
                {detail.standings.length === 0 ? <p className="p-6 text-sm text-white/40">Hakuna washiriki bado.</p> : (
                  <div className="divide-y divide-white/[0.05]">{detail.standings.map((member, index) => <div key={member.user_id} className={`grid grid-cols-[32px_minmax(0,1fr)_58px_55px] items-center gap-2 px-3 py-3 sm:grid-cols-[40px_minmax(0,1fr)_72px_72px_75px] sm:px-5 ${member.user_id === detail.league.owner_id ? "bg-amber-200/[0.025]" : ""}`}>
                    <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black ${index === 0 ? "bg-amber-300 text-black" : "bg-white/[0.05] text-white/55"}`}>{index === 0 && member.picks_count > 0 ? <Crown size={14} /> : index + 1}</span>
                    <div className="flex min-w-0 items-center gap-2.5"><Avatar src={member.avatar_url} name={member.username} /><div className="min-w-0"><p className="truncate text-xs font-bold text-white">@{member.username}{member.user_id === detail.league.owner_id ? <span className="ml-1 text-[9px] text-amber-200">HOST</span> : ""}</p><p className="text-[10px] text-white/40">{member.correct_count} sahihi · {member.pending_count} pending</p></div></div>
                    <div className="text-right"><p className="text-sm font-black text-amber-200">{member.points}</p><p className="text-[9px] text-white/35">pointi</p></div>
                    <div className="hidden text-right sm:block"><p className="text-xs font-bold text-white/80">{member.accuracy === null ? "—" : `${member.accuracy}%`}</p><p className="text-[9px] text-white/35">usahihi</p></div>
                    <div className="text-right"><p className="text-xs font-bold text-white/80">{member.picks_count}</p><p className="text-[9px] text-white/35">picks</p></div>
                  </div>)}</div>
                )}
              </section>

              <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025]">
                <div className="border-b border-white/[0.06] px-4 py-4 sm:px-5"><h3 className="font-black">Picks za ligi</h3><p className="mt-0.5 text-[10px] text-white/40">Matokeo yanathibitishwa na score ya mechi iliyomalizika.</p></div>
                {detail.picks.length === 0 ? <p className="p-6 text-sm text-white/40">Picks zitaonekana hapa baada ya washiriki kuweka ubashiri wao.</p> : <div className="divide-y divide-white/[0.05]">{detail.picks.map((pick) => <div key={pick.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
                  <Avatar src={pick.avatar_url} name={pick.username} />
                  <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-white">@{pick.username} · {pick.match.home_team} vs {pick.match.away_team}</p><p className="mt-1 truncate text-[10px] text-white/45">{pick.market_label}: {pick.selection_label} · kickoff {formatDate(pick.match.kickoff_at)}</p></div>
                  <span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${pick.status === "CORRECT" ? "bg-emerald-400/10 text-emerald-200" : pick.status === "INCORRECT" ? "bg-red-400/10 text-red-200" : pick.status === "VOID" ? "bg-white/[0.06] text-white/50" : "bg-amber-300/10 text-amber-100"}`}>{pick.status === "PENDING" ? "Inasubiri" : pick.status === "CORRECT" ? "Sahihi" : pick.status === "INCORRECT" ? "Haikupatia" : "VOID"}</span>
                  <span className="w-12 text-right text-xs font-black text-amber-100">{pick.points} pts</span>
                </div>)}</div>}
              </section>
            </>
          )}
        </section>
      </div>

      {notice && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-24 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#22232a] px-4 py-3 text-xs font-semibold text-white shadow-2xl" role="status"><Check size={14} className="shrink-0 text-emerald-300" /><span>{notice}</span><button type="button" onClick={() => setNotice("")}>×</button></motion.div>}
    </main>
  );
}
