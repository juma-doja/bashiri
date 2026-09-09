"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Headphones,
  ListMusic,
  Music2,
  Pause,
  Play,
  Search,
} from "lucide-react";
import { TRACKS, useMusicPlayer } from "@/components/music/MusicPlayerProvider";

const GENRES = ["All tracks", ...Array.from(new Set(TRACKS.map((track) => track.genre)))];

export default function MusicPage() {
  const router = useRouter();
  const { currentId, isPlaying, selectTrack } = useMusicPlayer();
  const [activeGenre, setActiveGenre] = useState("All tracks");
  const [search, setSearch] = useState("");
  const [showQueue, setShowQueue] = useState(false);

  const currentTrack = TRACKS.find((track) => track.id === currentId) ?? TRACKS[0];
  const filteredTracks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return TRACKS.filter((track) => {
      const matchesGenre = activeGenre === "All tracks" || track.genre === activeGenre;
      const matchesSearch = !query || `${track.title} ${track.artist} ${track.genre}`.toLowerCase().includes(query);
      return matchesGenre && matchesSearch;
    });
  }, [activeGenre, search]);

  return (
    <main className="min-h-dvh bg-[#090a09] px-4 pb-36 pt-5 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <button onClick={() => router.back()} aria-label="Rudi nyuma" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/10 hover:text-white">
            <ArrowLeft size={19} />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#D4AF37]">
            <Headphones size={15} /> Bashiri Audio
          </div>
          <button onClick={() => setShowQueue((visible) => !visible)} aria-label="Fungua playlist" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/10 hover:text-white">
            <ListMusic size={19} />
          </button>
        </header>

        <section className="relative mt-8 overflow-hidden rounded-[28px] border border-[#D4AF37]/20 bg-[linear-gradient(135deg,#19180f_0%,#0e1611_52%,#0b0d0c_100%)] p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border-[32px] border-[#D4AF37]/10" />
          <div className="relative max-w-2xl">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#22C55E]">Listen in your own rhythm</p>
            <h1 className="max-w-xl text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl">Soundtrack your matchday.</h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-white/55">Nyimbo za Bashiri kwa focus, safari na dakika zile za mpira zenye presha.</p>
            <button onClick={() => selectTrack(TRACKS[0])} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-extrabold text-black transition hover:bg-[#e7c452]">
              <Play size={16} fill="currentColor" /> Play selection
            </button>
          </div>
        </section>

        <section className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/35">Your rotation</p>
            <h2 className="mt-1 text-2xl font-black">Fresh sounds</h2>
          </div>
          <label className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:max-w-xs">
            <Search size={16} className="text-white/40" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sounds" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
          </label>
        </section>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {GENRES.map((genre) => (
            <button key={genre} onClick={() => setActiveGenre(genre)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${activeGenre === genre ? "border-[#D4AF37] bg-[#D4AF37] text-black" : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white"}`}>
              {genre}
            </button>
          ))}
        </div>

        <section className="mt-6 grid gap-3 lg:grid-cols-2">
          {filteredTracks.map((track, index) => {
            const isCurrent = track.id === currentId;
            return (
              <button key={track.id} onClick={() => selectTrack(track)} className={`group flex items-center gap-4 rounded-2xl border p-3 text-left transition ${isCurrent ? "border-[#D4AF37]/50 bg-[#D4AF37]/[0.08]" : "border-white/8 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"}`}>
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl" style={{ background: `linear-gradient(135deg, ${track.accent}, #111)` }}>
                  <Music2 size={25} className="text-black/70" />
                  {isCurrent && isPlaying && <span className="absolute bottom-1 left-1 right-1 h-1 rounded-full bg-black/60"><span className="block h-full w-2/3 animate-pulse rounded-full bg-white" /></span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-white">{track.title}</p>
                  <p className="mt-1 text-xs text-white/45">{track.artist} <span className="mx-1 text-white/20">•</span> {track.genre}</p>
                </div>
                <span className="text-xs tabular-nums text-white/35">{track.duration}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-white/70 group-hover:bg-[#D4AF37] group-hover:text-black">
                  {isCurrent && isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
                </span>
                <span className="sr-only">Track {index + 1}</span>
              </button>
            );
          })}
        </section>

        {filteredTracks.length === 0 && <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-10 text-center text-sm text-white/45">Hakuna sound inayolingana na search yako.</div>}

        {showQueue && <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Up next</p><div className="mt-3 flex flex-wrap gap-2">{TRACKS.filter((track) => track.id !== currentId).map((track) => <button key={track.id} onClick={() => selectTrack(track)} className="rounded-full bg-white/[0.06] px-3 py-2 text-xs text-white/70 hover:bg-white/10">{track.title}</button>)}</div></div>}

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#D4AF37]/15 bg-[#D4AF37]/[0.04] p-4 text-xs leading-5 text-white/45">
          <Music2 size={17} className="mt-0.5 shrink-0 text-[#D4AF37]" />
          <p>Weka nyimbo zako kwenye <span className="font-bold text-[#D4AF37]">frontend/public/music/</span>, kisha ongeza jina lake kwenye music library. Hii inafanya player ibaki chini ya control yako.</p>
        </div>
      </div>

    </main>
  );
}
