"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAdminTicketDetail, replyAdminTicket, updateTicketStatus } from "@/lib/api/admin";
import { AlertCircle, ArrowLeft, Check, ChevronDown, Clock3, Loader2, Send, ShieldCheck, UserRound } from "lucide-react";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const STATUS_COLORS: Record<string, string> = {
  OPEN: "#e8bd5a", IN_PROGRESS: "#58b9ed", RESOLVED: "#61d7a5", CLOSED: "#89918c",
};
const STATUS_LABELS: Record<string, string> = {
  OPEN: "Mpya", IN_PROGRESS: "Inaendelea", RESOLVED: "Imetatuliwa", CLOSED: "Imefungwa",
};

export default function AdminSupportTicketPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = Number(params.id);
  const [ticket, setTicket] = useState<any>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      setTicket(await getAdminTicketDetail(ticketId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Imeshindikana kupakia ticket.");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [ticket?.messages?.length]);

  async function handleSend() {
    if (!input.trim()) return;
    setSending(true);
    setSending(true);
    setError("");
    try {
      await replyAdminTicket(ticketId, input.trim());
      setInput("");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Jibu halikutumwa. Jaribu tena.");
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(statusValue: string) {
    setUpdatingStatus(true);
    setError("");
    try {
      await updateTicketStatus(ticketId, statusValue);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Status haikubadilishwa.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) return <div className="mx-auto max-w-5xl space-y-4"><div className="h-16 animate-pulse rounded-2xl bg-white/[0.04]" /><div className="h-[55vh] animate-pulse rounded-2xl bg-white/[0.025]" /></div>;
  if (!ticket) return <div className="mx-auto max-w-2xl rounded-2xl border border-[#f18f75]/20 bg-[#f18f75]/[0.05] p-8 text-center"><AlertCircle size={25} className="mx-auto text-[#f18f75]" /><h1 className="mt-3 font-bold text-white">Ticket haikupatikana</h1><p className="mt-2 text-sm text-[#f3a28c]">{error || "Jaribu tena au rudi kwenye inbox."}</p><div className="mt-5 flex justify-center gap-2"><button type="button" onClick={() => void load()} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white/70">Jaribu tena</button><button type="button" onClick={() => router.push("/admin/support")} className="rounded-xl bg-[#61d7a5] px-4 py-2 text-xs font-bold text-[#07100b]">Inbox</button></div></div>;

  const statusColor = STATUS_COLORS[ticket.status] || "#89918c";

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-7xl flex-col overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0d120f] lg:min-h-[calc(100dvh-5rem)]">
      <header className="border-b border-white/[0.07] bg-[#101612] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3"><button type="button" onClick={() => router.push("/admin/support")} aria-label="Rudi inbox" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10"><ArrowLeft size={17} /></button><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-white/60"><UserRound size={18} /></div><div className="min-w-0"><h1 className="break-words text-base font-extrabold text-white sm:text-lg">{ticket.subject}</h1><p className="mt-1 break-all text-xs text-white/45">{ticket.user_username ? `@${ticket.user_username}` : ticket.guest_phone || "Guest"}<span className="mx-2 text-white/20">·</span>{ticket.type}</p></div></div>
          <label className="relative flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 text-xs font-bold" style={{ color: statusColor }}><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />{STATUS_LABELS[ticket.status] || ticket.status}<ChevronDown size={13} className="text-white/40" /><select value={ticket.status} disabled={updatingStatus} onChange={(event) => void handleStatusChange(event.target.value)} aria-label="Badilisha status ya ticket" className="absolute inset-0 h-full w-full cursor-pointer opacity-0">{STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}</select></label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-white/40"><span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1">{ticket.type}</span>{ticket.related_content_type && <span className="rounded-full border border-[#e8bd5a]/20 bg-[#e8bd5a]/[0.06] px-2.5 py-1 text-[#e8bd5a]">Related: {ticket.related_content_type} #{ticket.related_object_id}</span>}<span className="ml-auto flex items-center gap-1"><Clock3 size={12} />{new Date(ticket.updated_at).toLocaleString("sw-TZ", { dateStyle: "medium", timeStyle: "short" })}</span></div>
      </header>

      <section className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-7 sm:py-7">
        <div className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.025] px-4 py-2 text-[10px] text-white/40"><ShieldCheck size={13} className="text-[#61d7a5]" /> Mazungumzo ya faragha · Admin workspace</div>
        {(ticket.messages || []).map((message: any) => { const fromAdmin = message.sender_type === "ADMIN"; return (
          <div key={message.id} className={`flex ${fromAdmin ? "justify-end" : "justify-start"}`}><div className={`max-w-[90%] rounded-[20px] px-4 py-3 sm:max-w-[75%] sm:px-5 ${fromAdmin ? "rounded-br-md bg-[#61d7a5] text-[#07100b]" : "rounded-bl-md border border-white/[0.07] bg-[#171e19] text-white"}`}><p className={`mb-1.5 text-[10px] font-extrabold ${fromAdmin ? "text-[#16422e]/70" : "text-[#8ce8bd]"}`}>{fromAdmin ? "Bashiri Support" : ticket.user_username ? `@${ticket.user_username}` : "Guest"}</p><p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p><time className={`mt-2 block text-right text-[9px] tabular-nums ${fromAdmin ? "text-[#16422e]/55" : "text-white/35"}`}>{new Date(message.created_at).toLocaleString("sw-TZ", { dateStyle: "medium", timeStyle: "short" })}</time></div></div>
        ); })}
        {!ticket.messages?.length && <p className="py-10 text-center text-sm text-white/35">Hakuna ujumbe kwenye ticket hii bado.</p>}
        <div ref={scrollRef} />
      </section>

      <footer className="border-t border-white/[0.07] bg-[#101612] p-3 sm:p-5">
        {error && <p role="alert" className="mb-3 rounded-xl border border-[#f18f75]/20 bg-[#f18f75]/[0.06] px-3 py-2 text-xs text-[#f3a28c]">{error}</p>}
        <div className="flex items-end gap-2 rounded-2xl border border-white/[0.09] bg-black/20 p-2 focus-within:border-[#61d7a5]/35"><textarea aria-label="Andika jibu" rows={1} className="max-h-36 min-h-11 flex-1 resize-y bg-transparent px-3 py-3 text-sm leading-5 text-white outline-none placeholder:text-white/30" placeholder="Andika jibu kwa mtumiaji..." value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void handleSend(); } }} /><button type="button" onClick={() => void handleSend()} disabled={sending || !input.trim()} aria-label="Tuma jibu" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#61d7a5] text-[#07100b] transition hover:bg-[#7ae2b5] disabled:opacity-40">{sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}</button></div><div className="mt-2 flex items-center justify-between px-1 text-[9px] text-white/30"><span>Enter kutuma · Shift+Enter mstari mpya</span><span>{input.length}/5000</span></div>
      </footer>
    </main>
  );
}
