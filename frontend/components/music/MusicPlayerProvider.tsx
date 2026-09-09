"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ListMusic, Music2, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";

export type Track = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  src: string;
  accent: string;
};

export const TRACKS: Track[] = [
  { id: "matchday-energy", title: "Matchday Energy", artist: "Bashiri Sounds", genre: "Matchday", duration: "03:42", src: "/music/matchday-energy.mp3", accent: "#D4AF37" },
  { id: "golden-hour", title: "Golden Hour", artist: "Bashiri Sounds", genre: "Chill", duration: "04:08", src: "/music/golden-hour.mp3", accent: "#F59E0B" },
  { id: "stadium-lights", title: "Stadium Lights", artist: "Bashiri Sounds", genre: "Focus", duration: "02:56", src: "/music/stadium-lights.mp3", accent: "#22C55E" },
  { id: "last-whistle", title: "Last Whistle", artist: "Bashiri Sounds", genre: "Late Night", duration: "03:31", src: "/music/last-whistle.mp3", accent: "#38BDF8" },
];

type MusicPlayerContextValue = {
  currentTrack: Track;
  currentId: string;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  selectTrack: (track: Track) => void;
  togglePlay: () => void;
  stepTrack: (direction: 1 | -1) => void;
  setProgress: (value: number) => void;
  setVolume: (value: number) => void;
};

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) throw new Error("useMusicPlayer must be used inside MusicPlayerProvider");
  return context;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "00:00";
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

function GlobalMiniPlayer() {
  const { currentTrack, isPlaying, progress, duration, volume, togglePlay, stepTrack, setProgress, setVolume } = useMusicPlayer();
  const [isVisible, setIsVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        aria-label="Onyesha music player"
        className="fixed bottom-20 right-4 z-40 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#D4AF37]/60 bg-[#111218]/90 text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)] backdrop-blur-xl transition hover:scale-110 hover:bg-[#D4AF37] hover:text-black sm:bottom-5 sm:right-5"
      >
        <Music2 size={14} className={isPlaying ? "animate-pulse" : ""} />
        {isPlaying && <span className="absolute inset-0 rounded-full border border-[#D4AF37]/60" />}
      </button>
    );
  }

  return (
    <div className="fixed bottom-[5.75rem] left-3 right-3 z-40 mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#131512]/95 p-3 shadow-2xl backdrop-blur-xl sm:bottom-5 sm:left-auto sm:right-5 sm:w-[min(27rem,calc(100vw-2rem))] sm:p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${currentTrack.accent}, #111)` }}>
          <Music2 size={18} className="text-black/70" />
        </div>
        <button onClick={() => setExpanded((value) => !value)} className="min-w-0 flex-1 text-left" aria-label="Fungua music controls">
          <p className="truncate text-xs font-extrabold text-white">{currentTrack.title}</p>
          <p className="truncate text-[10px] text-white/40">{currentTrack.artist}</p>
        </button>
        <button onClick={() => stepTrack(-1)} aria-label="Wimbo uliopita" className="text-white/55 hover:text-white"><SkipBack size={16} fill="currentColor" /></button>
        <button onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-black">
          {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
        </button>
        <button onClick={() => stepTrack(1)} aria-label="Wimbo unaofuata" className="text-white/55 hover:text-white"><SkipForward size={16} fill="currentColor" /></button>
        <button onClick={() => setExpanded((value) => !value)} aria-label="Playlist" className="hidden text-white/45 hover:text-white sm:block"><ListMusic size={16} /></button>
        <button onClick={() => setIsVisible(false)} aria-label="Ficha music player" className="text-white/45 transition hover:text-white"><ChevronDown size={17} /></button>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[9px] tabular-nums text-white/35">
        <span>{formatTime(progress)}</span>
        <input aria-label="Song progress" type="range" min="0" max={duration || 1} step="0.1" value={progress} onChange={(event) => setProgress(Number(event.target.value))} className="h-1 flex-1 accent-[#D4AF37]" />
        <span>{duration ? formatTime(duration) : currentTrack.duration}</span>
      </div>
      {expanded && (
        <div className="mt-2 flex items-center gap-2 border-t border-white/10 pt-2">
          <button onClick={() => setVolume(volume ? 0 : 0.8)} aria-label={volume ? "Mute" : "Unmute"} className="text-white/55">{volume ? <Volume2 size={15} /> : <VolumeX size={15} />}</button>
          <input aria-label="Volume" type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="w-full accent-[#D4AF37]" />
        </div>
      )}
    </div>
  );
}

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentId, setCurrentId] = useState(TRACKS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgressState] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const currentTrack = useMemo(() => TRACKS.find((track) => track.id === currentId) ?? TRACKS[0], [currentId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = currentTrack.src;
    audio.load();
    setProgressState(0);
    setDuration(0);
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
  }, [currentTrack.src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const selectTrack = (track: Track) => {
    if (track.id === currentId && !isPlaying) {
      audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      return;
    }
    setCurrentId(track.id);
    setIsPlaying(true);
  };

  const stepTrack = (direction: 1 | -1) => {
    const index = TRACKS.findIndex((track) => track.id === currentId);
    selectTrack(TRACKS[(index + direction + TRACKS.length) % TRACKS.length]);
  };

  const setProgress = (value: number) => {
    setProgressState(value);
    if (audioRef.current) audioRef.current.currentTime = value;
  };

  const contextValue = { currentTrack, currentId, isPlaying, progress, duration, volume, selectTrack, togglePlay, stepTrack, setProgress, setVolume };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
      <audio ref={audioRef} onTimeUpdate={(event) => setProgressState(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onEnded={() => stepTrack(1)} />
      <GlobalMiniPlayer />
    </MusicPlayerContext.Provider>
  );
}
