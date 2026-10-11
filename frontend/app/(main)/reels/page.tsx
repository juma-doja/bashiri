"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Camera,
  Check,
  Heart,
  ImagePlus,
  LoaderCircle,
  MessageCircle,
  Play,
  Plus,
  Radio,
  Send,
  Share2,
  Sparkles,
  Trophy,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  addReelComment,
  createReelPost,
  getReelComments,
  getReels,
  ReelComment,
  ReelPost,
  toggleReelLike,
  trackReelShare,
  uploadReelMedia,
} from "@/lib/api/mic";
import { getLiveMatches, Match } from "@/lib/api/predictions";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const PAGE_SIZE = 12;

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "sasa hivi";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} dk zilizopita`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} saa zilizopita`;
  return `${Math.floor(seconds / 86400)} siku zilizopita`;
}

function Avatar({ src, name, size = 42 }: { src: string; name: string; size?: number }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className="shrink-0 rounded-full border border-white/15 object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="grid shrink-0 place-items-center rounded-full border border-white/15 bg-gradient-to-br from-amber-300 to-orange-600 font-black text-black"
      style={{ width: size, height: size }}
      aria-label={name}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function ReelCard({
  post,
  onLike,
  onComment,
  onShare,
}: {
  post: ReelPost;
  onLike: (post: ReelPost) => void;
  onComment: (post: ReelPost) => void;
  onShare: (post: ReelPost) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (post.media_type !== "VIDEO" || !videoRef.current) return;
    const video = videoRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: [0, 0.6, 1] },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [post.media_type]);

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#101115] shadow-[0_24px_70px_rgba(0,0,0,0.42)]">
      <div className="flex items-center gap-3 px-4 py-4">
        <Avatar src={post.avatar_url} name={post.username} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-white">@{post.username}</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span className="text-xs text-white/45">{relativeTime(post.created_at)}</span>
          </div>
          {post.match_details ? (
            <p className="mt-0.5 truncate text-xs text-amber-200/80">
              {post.match_details.home_team} {post.match_details.status === "LIVE" ? "· LIVE ·" : "vs"} {post.match_details.away_team}
              {post.match_details.status === "LIVE" && post.match_details.home_score !== null
                ? `  ${post.match_details.home_score}–${post.match_details.away_score}`
                : ""}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-white/40">Bashiri community</p>
          )}
        </div>
      </div>

      <div className="relative mx-auto aspect-[9/13] max-h-[min(74svh,760px)] overflow-hidden bg-black">
        {post.media_type === "VIDEO" ? (
          <>
            <video
              ref={videoRef}
              src={post.media_url}
              poster={post.thumbnail_url || undefined}
              muted
              loop
              playsInline
              controls
              className="h-full w-full object-cover"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
            {!playing && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur">
                  <Play size={24} fill="currentColor" />
                </span>
              </div>
            )}
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.media_url} alt={post.caption || `Post by ${post.username}`} className="h-full w-full object-contain" />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
        {post.match_details?.status === "LIVE" && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-red-300/25 bg-red-950/75 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-100">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" /> Live match
          </div>
        )}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-4">
          {post.caption ? (
            <p className="line-clamp-3 max-w-[78%] whitespace-pre-wrap text-sm font-medium leading-relaxed text-white drop-shadow">
              {post.caption}
            </p>
          ) : <span />}
          {post.match_details && (
            <span className="shrink-0 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-white/80 backdrop-blur">
              {post.match_details.league}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 px-3 py-3">
        <button
          type="button"
          onClick={() => onLike(post)}
          aria-label={post.user_liked ? "Toa like" : "Like"}
          className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold transition-colors hover:bg-white/[0.06]"
          style={{ color: post.user_liked ? "#ff5c83" : "rgba(255,255,255,0.8)" }}
        >
          <Heart size={20} fill={post.user_liked ? "currentColor" : "none"} />
          <span>{post.likes_count}</span>
        </button>
        <button
          type="button"
          onClick={() => onComment(post)}
          aria-label="Fungua maoni"
          className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-white/80 transition-colors hover:bg-white/[0.06]"
        >
          <MessageCircle size={20} />
          <span>{post.comments_count}</span>
        </button>
        <button
          type="button"
          onClick={() => onShare(post)}
          aria-label="Share post"
          className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-white/80 transition-colors hover:bg-white/[0.06]"
        >
          <Share2 size={20} />
          <span>{post.shares_count}</span>
        </button>
        <span className="ml-auto rounded-full bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
          {post.media_type === "VIDEO" ? `${post.duration_seconds}s reel` : "Photo"}
        </span>
      </div>
    </article>
  );
}

function CreateReelModal({
  matches,
  onClose,
  onCreated,
}: {
  matches: Match[];
  onClose: () => void;
  onCreated: (post: ReelPost) => void;
}) {
  const { requireAuth } = useRequireAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [caption, setCaption] = useState("");
  const [matchId, setMatchId] = useState("");
  const previewUrlRef = useRef<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const selected = event.target.files?.[0] || null;
    previewUrlRef.current = selected ? URL.createObjectURL(selected) : null;
    setPreview(previewUrlRef.current || "");
    setFile(selected);
  }

  function clearFile() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreview("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!requireAuth("Ingia ili kushare post yako na jamii ya Bashiri.")) return;
    if (!file) {
      setError("Chagua picha, screenshot au video kwanza.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const media = await uploadReelMedia(file, setProgress);
      const post = await createReelPost({
        ...media,
        caption: caption.trim(),
        match: matchId ? Number(matchId) : null,
      });
      onCreated(post);
      onClose();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Imeshindikana kutuma post.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <motion.form
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 25 }}
        onSubmit={submit}
        className="max-h-[92svh] w-full max-w-xl overflow-y-auto rounded-t-[28px] border border-white/10 bg-[#111218] p-5 sm:rounded-[28px] sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">Your moment</p>
            <h2 className="mt-1 text-xl font-black text-white">Share to Bashiri Reels</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Funga" className="rounded-full bg-white/[0.06] p-2 text-white/70"><X size={19} /></button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {preview ? (
          <div className="relative mb-4 grid max-h-[42svh] min-h-48 place-items-center overflow-hidden rounded-2xl bg-black">
            {file?.type.startsWith("video/") ? (
              <video src={preview} controls playsInline className="max-h-[42svh] w-full object-contain" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview ya post" className="max-h-[42svh] w-full object-contain" />
            )}
            <button type="button" onClick={clearFile} className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white"><X size={16} /></button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mb-4 flex min-h-44 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-amber-300/30 bg-amber-300/[0.04] px-5 text-center transition-colors hover:bg-amber-300/[0.08]"
          >
            <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-amber-300/10 text-amber-200"><ImagePlus size={24} /></span>
            <span className="font-bold text-white">Chagua picha, screenshot au video</span>
            <span className="mt-1 text-xs text-white/45">Picha hadi 20MB · Video sekunde 1–60, hadi 50MB</span>
          </button>
        )}
        {file && (
          <button type="button" onClick={() => fileInputRef.current?.click()} className="mb-4 flex items-center gap-2 text-xs font-semibold text-amber-200">
            {file.type.startsWith("video/") ? <Video size={15} /> : <Camera size={15} />}
            Badilisha faili
          </button>
        )}
        <textarea
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Andika caption yako…"
          className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-300/40"
        />
        <div className="mt-3">
          <label htmlFor="reel-match" className="mb-1.5 block text-xs font-semibold text-white/55">Unganisha na mechi ya live (hiari)</label>
          <select
            id="reel-match"
            value={matchId}
            onChange={(event) => setMatchId(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#18191f] px-3 py-3 text-sm text-white outline-none"
          >
            <option value="">Hakuna mechi maalum</option>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {match.home_team.name} vs {match.away_team.name} · {match.home_score ?? 0}–{match.away_score ?? 0}
              </option>
            ))}
          </select>
        </div>
        {busy && (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-white/60">
              <span>{progress >= 100 ? "Inatengeneza post…" : "Inapakia media…"}</span><span>{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
        )}
        {error && <p role="alert" className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-yellow-600 px-4 font-black text-black disabled:cursor-wait disabled:opacity-60"
        >
          {busy ? <><LoaderCircle size={18} className="animate-spin" /> Inatuma…</> : <><Send size={17} /> Share post</>}
        </button>
      </motion.form>
    </div>
  );
}

function CommentsSheet({
  post,
  onClose,
  onAdded,
}: {
  post: ReelPost;
  onClose: () => void;
  onAdded: () => void;
}) {
  const { requireAuth } = useRequireAuth();
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getReelComments(post.id)
      .then((data) => setComments(data.results))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Maoni hayakupatikana."))
      .finally(() => setLoading(false));
  }, [post.id]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!requireAuth("Ingia ili uache comment.")) return;
    if (!text.trim()) return;
    setSending(true);
    setError("");
    try {
      const created = await addReelComment(post.id, text.trim());
      setComments((previous) => [created, ...previous]);
      setText("");
      onAdded();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Comment haikutumwa.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center bg-black/70 sm:items-center sm:p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="flex max-h-[82svh] w-full max-w-lg flex-col rounded-t-[28px] border border-white/10 bg-[#111218] sm:rounded-[28px]">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div><h2 className="font-black text-white">Maoni</h2><p className="text-xs text-white/45">@{post.username}</p></div>
          <button type="button" aria-label="Funga maoni" onClick={onClose} className="rounded-full bg-white/[0.06] p-2 text-white/70"><X size={18} /></button>
        </div>
        <div className="min-h-32 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {loading ? <div className="flex justify-center py-8"><LoaderCircle className="animate-spin text-amber-300" /></div>
            : comments.length === 0 ? <p className="py-10 text-center text-sm text-white/40">Bado hakuna maoni. Anza mazungumzo!</p>
              : comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar src={comment.avatar_url} name={comment.username} size={34} />
                  <div className="min-w-0 flex-1 rounded-2xl bg-white/[0.04] px-3 py-2.5">
                    <div className="flex items-baseline justify-between gap-2"><span className="truncate text-xs font-bold text-white">@{comment.username}</span><span className="shrink-0 text-[10px] text-white/35">{relativeTime(comment.created_at)}</span></div>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/80">{comment.content}</p>
                  </div>
                </div>
              ))}
        </div>
        {error && <p role="alert" className="px-5 pb-2 text-xs text-red-300">{error}</p>}
        <form onSubmit={submit} className="flex gap-2 border-t border-white/[0.08] p-4">
          <input value={text} onChange={(event) => setText(event.target.value)} maxLength={500} placeholder="Andika comment…" className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-300/40" />
          <button disabled={sending || !text.trim()} type="submit" aria-label="Tuma comment" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-amber-300 text-black disabled:opacity-40"><Send size={17} /></button>
        </form>
      </section>
    </div>
  );
}

export default function ReelsPage() {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const [posts, setPosts] = useState<ReelPost[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [commentPost, setCommentPost] = useState<ReelPost | null>(null);
  const [notice, setNotice] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadPage = useCallback(async (offset: number, replace = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (replace) {
      setLoading(true);
      setError("");
    } else {
      setLoadingMore(true);
    }
    try {
      const data = await getReels(PAGE_SIZE, offset);
      setPosts((current) => {
        if (replace) return data.results;
        const existingIds = new Set(current.map((post) => post.id));
        return [...current, ...data.results.filter((post) => !existingIds.has(post.id))];
      });
      setNextOffset(data.next_offset);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Imeshindikana kupakia Reels.";
      setError(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, []);

  const refreshLiveMatches = useCallback(() => {
    getLiveMatches()
      .then(setLiveMatches)
      .catch((liveError) => console.error("Failed to refresh live matches:", liveError));
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => { void loadPage(0, true); }, 0);
    refreshLiveMatches();
    const liveInterval = window.setInterval(refreshLiveMatches, 30000);
    const feedInterval = window.setInterval(() => { void loadPage(0, true); }, 60000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(liveInterval);
      window.clearInterval(feedInterval);
    };
  }, [loadPage, refreshLiveMatches]);

  useEffect(() => {
    if (!loadMoreRef.current || nextOffset === null || loading) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingRef.current && nextOffset !== null) {
        void loadPage(nextOffset);
      }
    }, { rootMargin: "500px" });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loadPage, loading, nextOffset]);

  const creators = useMemo(() => {
    const byUser = new Map<number, ReelPost>();
    posts.forEach((post) => { if (!byUser.has(post.user)) byUser.set(post.user, post); });
    return [...byUser.values()].slice(0, 8);
  }, [posts]);

  const trendingTags = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((post) => {
      (post.caption.match(/#[\p{L}\p{N}_]+/gu) || []).forEach((tag) => {
        const normalized = tag.toLowerCase();
        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      });
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([tag]) => tag);
  }, [posts]);

  function updatePost(postId: number, update: Partial<ReelPost>) {
    setPosts((current) => current.map((post) => post.id === postId ? { ...post, ...update } : post));
  }

  async function handleLike(post: ReelPost) {
    if (!requireAuth("Ingia ili ulike post za watu.")) return;
    const previous = { user_liked: post.user_liked, likes_count: post.likes_count };
    updatePost(post.id, {
      user_liked: !post.user_liked,
      likes_count: Math.max(0, post.likes_count + (post.user_liked ? -1 : 1)),
    });
    try {
      const result = await toggleReelLike(post.id);
      updatePost(post.id, { user_liked: result.liked, likes_count: result.likes_count });
    } catch (likeError) {
      updatePost(post.id, previous);
      setNotice(likeError instanceof Error ? likeError.message : "Like haikuhifadhiwa.");
    }
  }

  async function handleShare(post: ReelPost) {
    const url = `${window.location.origin}/reels#reel-${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Bashiri Reels · @${post.username}`, text: post.caption, url });
        const tracked = await trackReelShare(post.id, "NATIVE");
        updatePost(post.id, { shares_count: tracked.shares_count });
        return;
      }
      await navigator.clipboard.writeText(url);
      const tracked = await trackReelShare(post.id, "COPY");
      updatePost(post.id, { shares_count: tracked.shares_count });
      setNotice("Link imenakiliwa. Isambaze kwa marafiki!");
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") return;
      setNotice(shareError instanceof Error ? shareError.message : "Imeshindikana kushare post.");
    }
  }

  function addCreatedPost(post: ReelPost) {
    setPosts((current) => [post, ...current.filter((existing) => existing.id !== post.id)]);
    setNotice("Post yako imechapishwa!");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-dvh bg-[#090a0c] pb-28 text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#090a0c]/90 px-4 pb-3 pt-safe backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3 pt-3">
          <button type="button" onClick={() => router.back()} aria-label="Rudi nyuma" className="rounded-full bg-white/[0.05] p-2 text-white/75"><ArrowLeft size={19} /></button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><Sparkles size={16} className="text-amber-300" /><h1 className="text-lg font-black tracking-tight">Bashiri Reels</h1></div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Moments za mpira. Sauti za mashabiki.</p>
          </div>
          <button type="button" onClick={() => { if (requireAuth("Ingia ili kushare post yako.")) setShowCreate(true); }} className="flex min-h-10 items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-yellow-600 px-3.5 text-xs font-black text-black shadow-[0_6px_24px_rgba(212,175,55,0.2)]">
            <Plus size={16} /> <span className="hidden xs:inline">Create</span>
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-7 px-3 pt-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,560px)_minmax(220px,280px)] lg:pt-7">
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-5">
            <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="mb-4 flex items-center gap-2"><Radio size={16} className="text-red-400" /><h2 className="text-sm font-black">Live pulse</h2></div>
              {liveMatches.length === 0 ? <p className="text-xs leading-relaxed text-white/45">Hakuna mechi inayoendelea kwa sasa. Mechi za live zitaonekana hapa moja kwa moja.</p>
                : <div className="space-y-2">{liveMatches.slice(0, 5).map((match) => (
                  <button key={match.id} type="button" onClick={() => router.push(`/match/${match.id}/overview`)} className="w-full rounded-2xl border border-red-300/10 bg-red-500/[0.04] p-3 text-left transition-colors hover:bg-red-500/[0.08]">
                    <div className="mb-1 flex items-center justify-between"><span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />Live</span><span className="font-mono text-sm font-black text-white">{match.home_score ?? 0}–{match.away_score ?? 0}</span></div>
                    <p className="truncate text-xs font-semibold text-white/85">{match.home_team.name} vs {match.away_team.name}</p>
                    <p className="mt-1 truncate text-[10px] text-white/40">{match.league.name}</p>
                  </button>
                ))}</div>}
            </section>

            {trendingTags.length > 0 && (
              <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-4">
                <h2 className="mb-3 text-sm font-black">Trending kwa jamii</h2>
                <div className="flex flex-wrap gap-2">{trendingTags.map((tag) => <span key={tag} className="rounded-full border border-amber-200/10 bg-amber-200/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-amber-100/75">{tag}</span>)}</div>
              </section>
            )}
            <p className="px-1 text-[10px] leading-relaxed text-white/30">Shiriki moments za mpira kwa heshima. Bashiri ni burudani na uchambuzi—cheza kwa uwajibikaji.</p>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between px-1">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">For you</p><h2 className="text-lg font-black">Community feed</h2></div>
            <button type="button" onClick={() => void loadPage(0, true)} className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-white/65 hover:bg-white/[0.05]">Refresh</button>
          </div>

          {creators.length > 0 && (
            <div className="mb-5 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] px-3 py-3">
              <div className="mb-2 flex items-center gap-2 px-1"><Sparkles size={13} className="text-amber-300" /><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">Creators in the feed</span></div>
              <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {creators.map((post) => <button key={post.user} type="button" onClick={() => document.getElementById(`reel-${post.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
                  <span className="rounded-full bg-gradient-to-br from-amber-300 via-orange-500 to-pink-500 p-[2px]"><span className="block rounded-full bg-[#101115] p-[2px]"><Avatar src={post.avatar_url} name={post.username} size={42} /></span></span>
                  <span className="w-full truncate text-center text-[10px] font-semibold text-white/70">@{post.username}</span>
                </button>)}
              </div>
            </div>
          )}

          {liveMatches.length > 0 && (
            <button type="button" onClick={() => router.push("/matches")} className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-red-300/15 bg-gradient-to-r from-red-500/[0.10] to-transparent px-4 py-3 text-left lg:hidden">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-300"><Radio size={17} /></span>
              <span className="min-w-0 flex-1"><span className="block text-xs font-black text-white">{liveMatches.length} {liveMatches.length === 1 ? "mechi live" : "mechi live sasa hivi"}</span><span className="mt-0.5 block truncate text-[10px] text-white/45">{liveMatches.slice(0, 2).map((match) => `${match.home_team.name} ${match.home_score ?? 0}–${match.away_score ?? 0} ${match.away_team.name}`).join("  ·  ")}</span></span>
              <ArrowUpRight size={16} className="shrink-0 text-white/45" />
            </button>
          )}

          {loading && posts.length === 0 ? (
            <div className="space-y-4">{[0, 1].map((item) => <div key={item} className="h-[520px] animate-pulse rounded-[28px] border border-white/[0.06] bg-white/[0.03]" />)}</div>
          ) : error && posts.length === 0 ? (
            <div className="rounded-3xl border border-red-300/15 bg-red-500/[0.05] p-6 text-center"><p className="text-sm text-red-200">{error}</p><button type="button" onClick={() => void loadPage(0, true)} className="mt-4 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white">Jaribu tena</button></div>
          ) : posts.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-amber-300/10 text-amber-200"><ImagePlus size={28} /></span>
              <h3 className="mt-5 text-xl font-black">Jamii inaanza na wewe</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/45">Shiriki screenshot ya mkeka, picha ya ushindi au video fupi ya reaction. Post itakuwa live baada ya upload kufanikiwa.</p>
              <button type="button" onClick={() => { if (requireAuth("Ingia ili uwe creator wa kwanza.")) setShowCreate(true); }} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-300 px-5 text-sm font-black text-black"><Plus size={17} /> Create first post</button>
            </div>
          ) : (
            <div className="space-y-5">
              {posts.map((post) => (
                <div id={`reel-${post.id}`} key={post.id} className="scroll-mt-24">
                  <ReelCard post={post} onLike={handleLike} onComment={setCommentPost} onShare={handleShare} />
                </div>
              ))}
              <div ref={loadMoreRef} className="h-8" />
              {loadingMore && <div className="flex justify-center py-5"><LoaderCircle className="animate-spin text-amber-300" /></div>}
              {nextOffset === null && posts.length > 0 && <p className="py-5 text-center text-xs text-white/35">Umefika mwisho wa posts zilizopo kwa sasa.</p>}
            </div>
          )}
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-4">
            <button type="button" onClick={() => { if (requireAuth("Ingia ili uweze kushare.")) setShowCreate(true); }} className="w-full rounded-3xl border border-amber-200/15 bg-gradient-to-br from-amber-300/[0.13] to-orange-500/[0.04] p-5 text-left transition-transform hover:-translate-y-0.5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-300 text-black"><Plus size={23} /></span>
              <h2 className="mt-4 text-lg font-black">Moment yako, jamii yako.</h2>
              <p className="mt-1 text-xs leading-relaxed text-white/55">Post screenshot, picha au video fupi hadi sekunde 60.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-amber-200">Create a Reel <ArrowUpRight size={14} /></span>
            </button>
            <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="flex items-center gap-2"><Trophy size={15} className="text-amber-300" /><h2 className="text-sm font-black">Community actions</h2></div>
              <p className="mt-2 text-xs leading-relaxed text-white/45">Like, comment na share post. Creator na jamii wanaweza kuendelea na story ya kila mechi.</p>
            </section>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {showCreate && <CreateReelModal matches={liveMatches} onClose={() => setShowCreate(false)} onCreated={addCreatedPost} />}
        {commentPost && <CommentsSheet post={commentPost} onClose={() => setCommentPost(null)} onAdded={() => setPosts((current) => current.map((post) => post.id === commentPost.id ? { ...post, comments_count: post.comments_count + 1 } : post))} />}
      </AnimatePresence>
      <AnimatePresence>
        {notice && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="fixed bottom-24 left-1/2 z-[90] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#202127] px-4 py-3 text-xs font-semibold text-white shadow-2xl" role="status"><Check size={15} className="shrink-0 text-emerald-300" /><span>{notice}</span><button type="button" aria-label="Funga ujumbe" onClick={() => setNotice("")}><X size={14} /></button></motion.div>}
      </AnimatePresence>
    </main>
  );
}
