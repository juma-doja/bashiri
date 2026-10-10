"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCheck, Clock3, Headset, MessageCircle, RefreshCw, Search, ShieldCheck, UserRound } from "lucide-react";
import { getAdminTickets } from "@/lib/api/admin";

type Ticket = {
  id: number;
  subject: string;
  type: string;
  status: string;
  updated_at: string;
  user_username?: string | null;
  guest_phone?: string | null;
  related_content_type?: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "#e8bd5a", IN_PROGRESS: "#58b9ed", RESOLVED: "#61d7a5", CLOSED: "#89918c",
};
const STATUS_LABELS: Record<string, string> = {
  OPEN: "Mpya", IN_PROGRESS: "Inaendelea", RESOLVED: "Imetatuliwa", CLOSED: "Imefungwa",
};
const TYPE_LABELS: Record<string, string> = {
  ACCOUNT_ISSUE: "Akaunti", PAYMENT_ISSUE: "Malipo", CONTENT_REPORT: "Ripoti ya maudhui",
  BUG_REPORT: "Hitilafu", FEEDBACK: "Maoni", OTHER: "Nyingine",
};
const FILTERS = [
  { value: "", label: "Zote" }, { value: "OPEN", label: "Mpya" },
  { value: "IN_PROGRESS", label: "Inaendelea" }, { value: "RESOLVED", label: "Imetatuliwa" },
  { value: "CLOSED", label: "Zilizofungwa" },
];

export default function AdminSupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminTickets({ status: statusFilter || undefined });
      setTickets(Array.isArray(data) ? data as Ticket[] : []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Imeshindikana kupakia inbox.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { void loadTickets(); }, [loadTickets]);

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tickets.filter((ticket) => !normalizedQuery ||
      `${ticket.subject} ${ticket.user_username || ""} ${ticket.guest_phone || ""} ${TYPE_LABELS[ticket.type] || ticket.type}`.toLowerCase().includes(normalizedQuery));
  }, [query, tickets]);

  const openCount = tickets.filter((ticket) => ticket.status === "OPEN").length;
  const activeCount = tickets.filter((ticket) => ["OPEN", "IN_PROGRESS"].includes(ticket.status)).length;

  return (
    <main className="mx-auto max-w-7xl pb-12">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#61d7a5]/20 bg-[#61d7a5]/[0.08] text-[#61d7a5]"><Headset size={22} /></span>
          <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#61d7a5]">Customer care</p><h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Support inbox</h1><p className="mt-1 text-xs text-white/40">Dhibiti mazungumzo na ufuatilie majibu yote.</p></div>
        </div>
        <button type="button" onClick={() => void loadTickets()} disabled={loading} aria-label="Refresh inbox" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55 transition hover:bg-white/10 hover:text-white disabled:opacity-40"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="rounded-2xl border border-white/[0.07] bg-[#101612] p-4"><p className="flex items-center gap-2 text-xs font-semibold text-white/45"><MessageCircle size={14} className="text-[#61d7a5]" /> Inbox hii</p><p className="mt-3 text-2xl font-black tabular-nums">{tickets.length}</p></div>
        <div className="rounded-2xl border border-[#e8bd5a]/15 bg-[#e8bd5a]/[0.035] p-4"><p className="flex items-center gap-2 text-xs font-semibold text-white/45"><Clock3 size={14} className="text-[#e8bd5a]" /> Zinahitaji uangalizi</p><p className="mt-3 text-2xl font-black tabular-nums text-[#e8bd5a]">{activeCount}<span className="ml-2 text-xs font-semibold text-white/35">{openCount} mpya</span></p></div>
      </section>

      <section className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0d120f]">
        <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="font-extrabold text-white">Mazungumzo</h2><p className="mt-1 text-xs text-white/40">Chagua ticket kufungua thread na kujibu.</p></div>
          <label className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 lg:w-72"><Search size={15} className="text-white/35" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tafuta mada au mtumaji" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30" /></label>
        </div>
        <div className="flex gap-2 overflow-x-auto border-b border-white/[0.06] px-4 py-3 sm:px-5">{FILTERS.map((filter) => <button type="button" key={filter.value} onClick={() => setStatusFilter(filter.value)} aria-pressed={statusFilter === filter.value} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition ${statusFilter === filter.value ? "bg-[#61d7a5]/15 text-[#8ce8bd]" : "text-white/45 hover:bg-white/[0.05] hover:text-white/75"}`}>{filter.label}</button>)}</div>

        {loading ? <div className="space-y-3 p-5"><div className="h-16 animate-pulse rounded-xl bg-white/[0.04]" /><div className="h-16 animate-pulse rounded-xl bg-white/[0.04]" /><div className="h-16 animate-pulse rounded-xl bg-white/[0.04]" /></div> : error ? (
          <div className="px-5 py-12 text-center"><AlertCircle size={24} className="mx-auto text-[#f18f75]" /><p className="mt-3 text-sm text-[#f3a28c]">{error}</p><button type="button" onClick={() => void loadTickets()} className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-xs font-bold text-white/70">Jaribu tena</button></div>
        ) : !filteredTickets.length ? (
          <div className="px-5 py-14 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-white/35"><CheckCheck size={23} /></span><h3 className="mt-4 font-bold text-white">{tickets.length ? "Hakuna inayolingana" : "Inbox iko safi"}</h3><p className="mt-1 text-sm text-white/40">{tickets.length ? "Jaribu utafutaji au kichujio kingine." : "Tickets mpya zitaonekana hapa."}</p></div>
        ) : (
          <div className="divide-y divide-white/[0.055]">{filteredTickets.map((ticket) => { const color = STATUS_COLORS[ticket.status] || "#fff"; return (
            <button type="button" key={ticket.id} onClick={() => router.push(`/admin/support/${ticket.id}`)} className="group flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.035] sm:gap-4 sm:px-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/[0.07] bg-white/[0.035] text-white/55"><UserRound size={18} /></span>
              <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><span className="truncate text-sm font-bold text-white group-hover:text-[#8ce8bd]">{ticket.subject}</span><time className="shrink-0 text-[10px] tabular-nums text-white/35">{new Date(ticket.updated_at).toLocaleString("sw-TZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</time></span><span className="mt-1.5 flex flex-wrap items-center gap-2"><span className="truncate text-xs text-white/45">{ticket.user_username ? `@${ticket.user_username}` : ticket.guest_phone || "Guest"}</span><span className="h-1 w-1 rounded-full bg-white/20" /><span className="text-[10px] text-white/40">{TYPE_LABELS[ticket.type] || ticket.type}</span></span></span>
              <span className="hidden shrink-0 items-center gap-2 sm:flex"><i className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} /><span className="text-[10px] font-bold" style={{ color }}>{STATUS_LABELS[ticket.status] || ticket.status}</span></span>
            </button>
          ); })}</div>
        )}
        <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3 text-[10px] text-white/35 sm:px-5"><span>{filteredTickets.length} mazungumzo</span><span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-[#61d7a5]" /> Admin only</span></div>
      </section>
    </main>
  );
}
