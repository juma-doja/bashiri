"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { MicVideoCard } from "@/components/mic/MicVideoCard";
import { getUserMicReactions, deleteMicReaction, MicReaction } from "@/lib/api/mic";
import { motion, AnimatePresence } from "framer-motion";
import { Film, RefreshCw, Plus, ArrowLeft } from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const { requireAuth, hasHydrated } = useRequireAuth();
  const [reactions, setReactions] = useState<MicReaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    
    if (!requireAuth("Fungua dashboard yako ya Mic videos — jisajili kwa dakika chache!")) {
      router.push("/home");
      return;
    }
    loadReactions();
  }, [requireAuth, router, hasHydrated]);

  const loadReactions = async () => {
    try {
      setLoading(true);
      const data = await getUserMicReactions();
      setReactions(data);
    } catch (error) {
      console.error("Failed to load reactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reactionId: number) => {
    try {
      setDeleting(reactionId);
      await deleteMicReaction(reactionId);
      setReactions(prev => prev.filter(r => r.id !== reactionId));
    } catch (error) {
      console.error("Failed to delete reaction:", error);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh px-5 pt-safe pt-10 pb-4 flex items-center justify-center" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 32px)" }}>
        <div className="text-center">
          <RefreshCw size={48} className="text-white/30 animate-spin mx-auto mb-4" />
          <p className="text-white/50">Inapakia video zako...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 pb-24 pt-safe text-white sm:px-6 lg:px-8" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 32px)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <button onClick={() => router.back()} aria-label="Rudi nyuma" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] transition hover:bg-white/[0.06]">
              <ArrowLeft size={20} className="text-white/70" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)]">
              <Film size={20} className="text-black" />
            </div>
            <h1 className="text-2xl font-black text-white">Video Zangu</h1>
          </div>
          <p className="text-sm text-white/50">
            Simamia na interact na video zote ulizopost kwenye Mic
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(17,18,24,0.96),rgba(9,10,12,0.96))] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
            <p className="mb-1 text-3xl font-black text-white">{reactions.length}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-white/50">Video Zilizopost</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(17,18,24,0.96),rgba(9,10,12,0.96))] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
            <p className="mb-1 text-3xl font-black text-white">
              {reactions.reduce((sum, r) => sum + r.vote_count, 0)}
            </p>
            <p className="text-xs uppercase tracking-[0.14em] text-white/50">Jumla ya Votes</p>
          </div>
        </div>

        {reactions.length === 0 && (
          <div className="rounded-[30px] border border-white/10 bg-[#111218]/80 p-8 text-center shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
              <Film size={40} className="text-white/30" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Hakuna Video Bado</h3>
            <p className="mb-6 text-sm text-white/50">
              Bado hujapost video yoyote kwenye Mic. Anza sasa!
            </p>
            <button
              onClick={() => router.push("/matches")}
              className="mx-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)] px-6 py-3 font-bold text-black transition-opacity hover:opacity-90"
            >
              <Plus size={20} />
              <span>Pata Video Mpya</span>
            </button>
          </div>
        )}

        <AnimatePresence>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {reactions.map((reaction) => (
              <MicVideoCard
                key={reaction.id}
                reaction={reaction}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
