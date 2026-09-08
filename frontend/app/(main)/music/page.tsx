"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  Headphones,
  ListMusic,
  Music2,
  Pause,
  Play,
  Search,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

type Track = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  src: string;
  accent: string;
};

const TRACKS: Track[] = [
  {
    id: "matchday-energy",
    title: "Matchday Energy",
    artist: "Bashiri Sounds",
    genre: "Matchday",
    duration: "03:42",
    src: "/music/matchday-energy.mp3",
    accent: "#D4AF37",
  },
  {
    id: "golden-hour",
    title: "Golden Hour",
    artist: "Bashiri Sounds",
    genre: "Chill",
    duration: "04:08",
    src: "/music/golden-hour.mp3",
    accent: "#F59E0B",
  },
  {
    id: "stadium-lights",
    title: "Stadium Lights",
    artist: "Bashiri Sounds",
    genre: "Focus",
    duration: "02:56",
    src: "/music/stadium-lights.mp3",
    accent: "#22C55E",
  },
  {
    id: "last-whistle",
    title: "Last Whistle",
    artist: "Bashiri Sounds",
    genre: "Late Night",
    duration: "03:31",
    src: "/music/last-whistle.mp3",
    accent: "#38BDF8",
  },
];

const GENRES = ["All tracks", ...Array.from(new Set(TRACKS.map((track) => track.genre)))];

export default function MusicPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeGenre, setActiveGenre] = useState("All tracks");
  const [search, setSearch] = useState("");
  const [currentId, setCurrentId] = useState(TRACKS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    setProgress(0);
    setDuration(0);
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
  }, [currentId, isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const selectTrack = (track: Track) => {
    setCurrentId(track.id);
    setIsPlaying(true);
  };

  const stepTrack = (direction: 1 | -1) => {
    const index = TRACKS.findIndex((track) => track.id === currentId);
    const nextIndex = (index + direction + TRACKS.length) % TRACKS.length;
    selectTrack(TRACKS[nextIndex]);
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return "00:00";
    return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
  };

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

      <div className="fixed bottom-3 left-3 right-3 z-20 mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#131512]/95 p-3 shadow-2xl backdrop-blur-xl sm:bottom-5 sm:p-4">
        <audio ref={audioRef} src={currentTrack.src} onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onEnded={() => stepTrack(1)} />
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:flex" style={{ background: `linear-gradient(135deg, ${currentTrack.accent}, #111)` }}><Music2 size={20} className="text-black/70" /></div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{currentTrack.title}</p><p className="truncate text-xs text-white/40">{currentTrack.artist}</p></div>
          <button onClick={() => stepTrack(-1)} aria-label="Wimbo uliopita" className="hidden text-white/60 hover:text-white sm:block"><SkipBack size={18} fill="currentColor" /></button>
          <button onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-black transition hover:bg-[#e7c452]">{isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button>
          <button onClick={() => stepTrack(1)} aria-label="Wimbo unaofuata" className="text-white/60 hover:text-white"><SkipForward size={18} fill="currentColor" /></button>
          <div className="hidden items-center gap-2 md:flex"><button onClick={() => setVolume(volume ? 0 : 0.8)} aria-label={volume ? "Mute" : "Unmute"} className="text-white/50 hover:text-white">{volume ? <Volume2 size={17} /> : <VolumeX size={17} />}</button><input aria-label="Volume" type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="w-20 accent-[#D4AF37]" /></div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] tabular-nums text-white/35"><span>{formatTime(progress)}</span><input aria-label="Song progress" type="range" min="0" max={duration || 1} step="0.1" value={progress} onChange={(event) => { const next = Number(event.target.value); setProgress(next); if (audioRef.current) audioRef.current.currentTime = next; }} className="h-1 flex-1 accent-[#D4AF37]" /><span>{duration ? formatTime(duration) : currentTrack.duration}</span></div>
      </div>
    </main>
  );
}
