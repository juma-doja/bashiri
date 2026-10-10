"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTicketDetail, replyToTicket, SupportTicketDetail } from "@/lib/api/support";
import { AlertCircle, ArrowLeft, LifeBuoy, Loader2, Send, ShieldCheck } from "lucide-react";
import { CardSkeleton } from "@/components/ui/Skeleton";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "#FFD600", IN_PROGRESS: "#3B82F6", RESOLVED: "#00FF87", CLOSED: "rgba(255,255,255,0.4)",
};

export default function SupportTicketThreadPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = Number(params.id);
  const [ticket, setTicket] = useState<SupportTicketDetail | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void load();
  }, [ticketId]);

  async function load() {
    setError("");
    try {
      setTicket(await getTicketDetail(ticketId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Imeshindikana kupakia mazungumzo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages.length]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      await replyToTicket(ticketId, input.trim());
      setInput("");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ujumbe haukutumwa. Jaribu tena.");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <main className="mx-auto min-h-dvh max-w-3xl px-4 pt-safe pt-6"><CardSkeleton /></main>;
  if (!ticket) return <main className="mx-auto min-h-dvh max-w-3xl px-4 pt-safe pt-6 text-white"><button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-white/60"><ArrowLeft size={17} /> Rudi</button><div className="mt-8 rounded-2xl border border-[#f18f75]/20 bg-[#101612] p-6 text-center"><AlertCircle className="mx-auto text-[#f18f75]" /><p className="mt-3 text-sm text-[#f3a28c]">{error || "Mazungumzo hayajapatikana."}</p><button onClick={() => void load()} className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-xs font-bold">Jaribu tena</button></div></main>;

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col px-3 pb-safe pt-safe text-white sm:px-5 sm:pt-5">
      <header className="sticky top-0 z-10 -mx-3 flex items-center gap-3 border-b border-white/[0.07] bg-[#090e0b]/95 px-3 py-3 backdrop-blur-xl sm:-mx-5 sm:px-5">
        <button onClick={() => router.push("/settings/support")} aria-label="Rudi inbox" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/65"><ArrowLeft size={18} /></button>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#61d7a5]/10 text-[#61d7a5]"><LifeBuoy size={18} /></span>
        <div className="min-w-0 flex-1"><h1 className="truncate text-sm font-extrabold sm:text-base">{ticket.subject}</h1><div className="mt-1 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLORS[ticket.status] }} /><span className="text-[10px] font-bold text-white/45">{ticket.status.replace("_", " ")}</span></div></div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-1 py-5 sm:px-3 sm:py-7">
        <div className="mx-auto max-w-md rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-center"><p className="text-xs font-bold text-white/65">Mazungumzo ya support</p><p className="mt-1 text-[10px] text-white/35">Jibu litaonekana hapa. Ujumbe huu unaonekana kwako na timu ya Bashiri pekee.</p></div>
        {ticket.messages.map((item) => {
          const fromSupport = item.sender_type === "ADMIN";
          return <div key={item.id} className={`flex ${fromSupport ? "justify-start" : "justify-end"}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[78%] ${fromSupport ? "rounded-tl-md border border-white/[0.07] bg-[#151d18] text-white" : "rounded-tr-md bg-[#61d7a5] text-[#07100b]"}`}><p className={`mb-1 text-[10px] font-extrabold ${fromSupport ? "text-[#83e6b9]" : "text-[#123c28]/70"}`}>{fromSupport ? "Bashiri Support" : "Wewe"}</p><p className="whitespace-pre-wrap break-words text-sm leading-6">{item.content}</p><time className={`mt-2 block text-right text-[9px] tabular-nums ${fromSupport ? "text-white/35" : "text-[#123c28]/55"}`}>{new Date(item.created_at).toLocaleString()}</time></div></div>;
        })}
        <div ref={scrollRef} />
      </div>

      <footer className="sticky bottom-0 -mx-3 border-t border-white/[0.07] bg-[#090e0b]/95 px-3 py-3 backdrop-blur-xl sm:-mx-5 sm:px-5">
        {error && <p role="alert" className="mb-2 text-xs text-[#f3a28c]">{error}</p>}
        {ticket.status === "CLOSED" ? <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3"><p className="text-xs text-white/50">Mazungumzo haya yamefungwa.</p><button onClick={() => router.push("/settings/support")} className="text-xs font-bold text-[#83e6b9]">Rudi inbox</button></div> : <div className="flex items-end gap-2"><textarea aria-label="Andika ujumbe" rows={1} className="max-h-32 min-h-11 flex-1 resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-5 text-white outline-none placeholder:text-white/30 focus:border-[#61d7a5]/45" placeholder="Andika ujumbe..." value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void handleSend(); } }} /><button type="button" onClick={() => void handleSend()} disabled={sending || !input.trim()} aria-label="Tuma ujumbe" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#61d7a5] text-[#07100b] disabled:opacity-40">{sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}</button></div>}
        {ticket.status !== "CLOSED" && <p className="mt-2 pl-2 text-[9px] text-white/25">Enter kutuma · Shift+Enter mstari mpya</p>}
      </footer>
    </main>
  );
}
