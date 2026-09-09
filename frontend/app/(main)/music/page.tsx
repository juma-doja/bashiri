"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Headphones,
  ListMusic,
  Music2,
  Pause,
  Play,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useMusicPlayer } from "@/components/music/MusicPlayerProvider";
import { createMusicTrack, deleteMusicTrack, getMusicUploadSignature, uploadMusicToCloudinary } from "@/lib/api/music";

const SYSTEM_GENRES = ["Matchday", "Chill", "Focus", "Late Night"];

export default function MusicPage() {
  const router = useRouter();
  const { currentId, isPlaying, selectTrack, togglePlay, tracks, addUploadedTrack, removeUploadedTrack } = useMusicPlayer();
  const [activeGenre, setActiveGenre] = useState("All tracks");
  const [search, setSearch] = useState("");
  const [showQueue, setShowQueue] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("OTHER");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTrack = tracks.find((track) => track.id === currentId) ?? tracks[0];
  const genres = ["All tracks", ...Array.from(new Set([...SYSTEM_GENRES, ...tracks.map((track) => track.genre)]))];
  const filteredTracks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tracks.filter((track) => {
      const matchesGenre = activeGenre === "All tracks" || track.genre === activeGenre;
      const matchesSearch = !query || `${track.title} ${track.artist} ${track.genre}`.toLowerCase().includes(query);
      return matchesGenre && matchesSearch;
    });
  }, [activeGenre, search, tracks]);

  async function handleUpload() {
    if (!uploadFile || !title.trim()) {
      setUploadError("Chagua audio na weka title ya wimbo.");
      return;
    }
    if (uploadFile.size > 50 * 1024 * 1024) {
      setUploadError("Wimbo usizidi 50MB.");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const metadata = await new Promise<{ duration: number }>((resolve, reject) => {
        const audio = document.createElement("audio");
        audio.onloadedmetadata = () => resolve({ duration: Math.round(audio.duration) });
        audio.onerror = () => reject(new Error("Audio file haisomeki."));
        audio.src = URL.createObjectURL(uploadFile);
      });
      const signature = await getMusicUploadSignature();
      const uploaded = await uploadMusicToCloudinary(uploadFile, signature);
      const track = await createMusicTrack({
        title: title.trim(),
        artist: artist.trim(),
        genre,
        audio_url: uploaded.audio_url,
        cloudinary_public_id: uploaded.cloudinary_public_id,
        duration_seconds: uploaded.duration_seconds || metadata.duration,
        file_size_bytes: uploaded.file_size_bytes,
      });
      addUploadedTrack(track);
      setTitle("");
      setArtist("");
      setUploadFile(null);
      setShowUpload(false);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Imeshindwa kuhifadhi wimbo.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(trackId: number) {
    if (!window.confirm("Futa wimbo huu kwenye library yako?")) return;
    await deleteMusicTrack(trackId);
    removeUploadedTrack(trackId);
  }

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

        <section
          className="relative mt-8 overflow-hidden rounded-[28px] border border-[#D4AF37]/20 bg-cover bg-center p-6 sm:p-10"
          style={{ backgroundImage: "url('/music/music_backgound.jpg')" }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,10,8,0.94),rgba(7,10,8,0.68),rgba(7,10,8,0.42))]" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border-[32px] border-[#D4AF37]/10" />
          <div className="relative max-w-2xl">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#22C55E]">Listen in your own rhythm</p>
            <h1 className="max-w-xl text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl">Soundtrack your matchday.</h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-white/55">Nyimbo za Bashiri kwa focus, safari na dakika zile za mpira zenye presha.</p>
            <button onClick={() => selectTrack(tracks[0])} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-extrabold text-black transition hover:bg-[#e7c452]">
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
          {genres.map((genre) => (
            <button key={genre} onClick={() => setActiveGenre(genre)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${activeGenre === genre ? "border-[#D4AF37] bg-[#D4AF37] text-black" : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white"}`}>
              {genre}
            </button>
          ))}
        </div>

        <section className="mt-6 rounded-2xl border border-[#38BDF8]/20 bg-[#38BDF8]/[0.05] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#38BDF8]">Your cloud library</p>
              <p className="mt-1 text-sm text-white/55">Upload audio zako, zitahifadhiwa salama na zitaendelea kuonekana ukirudi.</p>
            </div>
            <button onClick={() => setShowUpload((value) => !value)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#38BDF8] px-4 py-2.5 text-xs font-extrabold text-[#06131a] hover:bg-[#67ceff]"><Upload size={15} /> {showUpload ? "Close upload" : "Upload music"}</button>
          </div>
          {showUpload && <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-2">
            <input ref={fileInputRef} type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} className="sm:col-span-2 block w-full text-xs text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" />
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Song title" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30" />
            <input value={artist} onChange={(event) => setArtist(event.target.value)} placeholder="Artist name (optional)" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30" />
            <select value={genre} onChange={(event) => setGenre(event.target.value)} className="rounded-xl border border-white/10 bg-[#101414] px-3 py-2.5 text-sm text-white outline-none"><option value="OTHER">Other</option><option value="MATCHDAY">Matchday</option><option value="CHILL">Chill</option><option value="FOCUS">Focus</option><option value="LATE_NIGHT">Late Night</option></select>
            <button disabled={uploading} onClick={handleUpload} className="rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-extrabold text-black disabled:opacity-50">{uploading ? "Uploading..." : "Save to library"}</button>
            {uploadError && <p className="sm:col-span-2 text-xs text-red-300">{uploadError}</p>}
          </div>}
        </section>

        <section className="mt-6 grid gap-3 lg:grid-cols-2">
          {filteredTracks.map((track, index) => {
            const isCurrent = track.id === currentId;
            return (
              <button key={track.id} onClick={() => isCurrent ? togglePlay() : selectTrack(track)} className={`group flex items-center gap-4 rounded-2xl border p-3 text-left transition ${isCurrent ? "border-[#D4AF37]/50 bg-[#D4AF37]/[0.08]" : "border-white/8 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"}`}>
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
                {track.ownerTrackId && <span onClick={(event) => { event.stopPropagation(); void handleDelete(track.ownerTrackId!); }} role="button" aria-label={`Futa ${track.title}`} className="flex h-8 w-8 items-center justify-center rounded-full text-white/25 hover:bg-red-500/10 hover:text-red-300"><Trash2 size={14} /></span>}
                <span className="sr-only">Track {index + 1}</span>
              </button>
            );
          })}
        </section>

        {filteredTracks.length === 0 && <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-10 text-center text-sm text-white/45">Hakuna sound inayolingana na search yako.</div>}

        {showQueue && <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Up next</p><div className="mt-3 flex flex-wrap gap-2">{tracks.filter((track) => track.id !== currentId).map((track) => <button key={track.id} onClick={() => selectTrack(track)} className="rounded-full bg-white/[0.06] px-3 py-2 text-xs text-white/70 hover:bg-white/10">{track.title}</button>)}</div></div>}

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#D4AF37]/15 bg-[#D4AF37]/[0.04] p-4 text-xs leading-5 text-white/45">
          <Music2 size={17} className="mt-0.5 shrink-0 text-[#D4AF37]" />
          <p>System tracks zinabaki kwenye library, lakini nyimbo zako sasa unaweza ku-upload na kuzisikiliza kwenye device yoyote ukiwa umeingia account yako.</p>
        </div>
      </div>

    </main>
  );
}
