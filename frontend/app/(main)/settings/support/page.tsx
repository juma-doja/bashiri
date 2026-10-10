"use client";
import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getMyTickets, SupportTicket } from "@/lib/api/support";
import { useAuthStore } from "@/stores/auth.store";
import { ArrowLeft, CheckCheck, Clock3, LifeBuoy, MessageCircle, Plus, Search, ShieldCheck } from "lucide-react";
import { CardSkeleton } from "@/components/ui/Skeleton";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "#FFD600", IN_PROGRESS: "#3B82F6", RESOLVED: "#00FF87", CLOSED: "rgba(255,255,255,0.4)",
};
const TYPE_LABELS: Record<string, string> = {
  ACCOUNT_ISSUE: "Tatizo la Akaunti", PAYMENT_ISSUE: "Tatizo la Malipo",
  CONTENT_REPORT: "Ripoti ya Maudhui", BUG_REPORT: "Hitilafu ya App",
  FEEDBACK: "Maoni", OTHER: "Nyingine",
};

function SupportListContent() {
  const router = useRouter();
  const access = useAuthStore((state) => state.access);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");

  const loadTickets = useCallback(async () => {
    if (!hasHydrated) return;
    if (!access) {
      setTickets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getMyTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Imeshindikana kupakia mazungumzo.");
    } finally {
      setLoading(false);
    }
  }, [access, hasHydrated]);

  useEffect(() => { void loadTickets(); }, [loadTickets]);

  const visibleTickets = useMemo(() => tickets.filter((ticket) => {
    const matchesQuery = `${ticket.subject} ${TYPE_LABELS[ticket.type] || ticket.type}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = filter === "ALL" || (filter === "ACTIVE" ? ["OPEN", "IN_PROGRESS"].includes(ticket.status) : ["RESOLVED", "CLOSED"].includes(ticket.status));
    return matchesQuery && matchesStatus;
  }), [filter, query, tickets]);

  const activeCount = tickets.filter((ticket) => ["OPEN", "IN_PROGRESS"].includes(ticket.status)).length;

  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-4 pb-32 pt-safe pt-6 text-white sm:px-6 sm:pt-8 lg:px-8 lg:pb-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={() => router.back()} aria-label="Rudi nyuma" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/10"><ArrowLeft size={18} /></button>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#61d7a5]">Bashiri Care · Support</p>
            <h1 className="mt-1 truncate text-2xl font-black sm:text-3xl">Mazungumzo</h1>
          </div>
        </div>
        <button
          onClick={() => router.push("/settings/support/new")}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#61d7a5] px-3 text-sm font-bold text-[#07100b] transition hover:bg-[#7ae2b5] sm:px-4"
          aria-label="Unda ticket mpya"
        >
          <Plus size={17} /><span className="hidden sm:inline">Ujumbe mpya</span><span className="sm:hidden">Mpya</span>
        </button>
      </div>

      <section className="relative mb-7 overflow-hidden rounded-[26px] border border-[#61d7a5]/15 bg-[#101a14] p-5 sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(rgba(97,215,165,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(97,215,165,.08) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#61d7a5]/20 bg-[#61d7a5]/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8ce8bd]"><LifeBuoy size={13} /> Msaada wa moja kwa moja</span>
            <h2 className="mt-4 text-xl font-black leading-tight sm:text-2xl">Tuambie kinachoendelea.</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-white/55">Mazungumzo yako na timu ya Bashiri yako sehemu moja. Fungua ujumbe mpya au endelea na mazungumzo yaliyopo.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[230px]">
            <div className="rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">Mazungumzo</p><p className="mt-2 text-2xl font-black tabular-nums">{access ? tickets.length : "—"}</p></div>
            <div className="rounded-2xl border border-[#e8bd5a]/15 bg-[#e8bd5a]/[0.05] px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">Yanayoendelea</p><p className="mt-2 text-2xl font-black tabular-nums text-[#e8bd5a]">{access ? activeCount : "—"}</p></div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d120f]">
        <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div>
            <h2 className="text-base font-extrabold">Inbox yako</h2>
            <p className="mt-1 text-xs text-white/40">Majibu kutoka timu yetu yatafika hapa.</p>
          </div>
          {access && (
            <label className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 sm:w-64">
              <Search size={15} className="text-white/35" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tafuta ujumbe..." aria-label="Tafuta tickets" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
            </label>
          )}
        </div>

        {access && (
          <div className="flex gap-2 overflow-x-auto border-b border-white/[0.06] px-4 py-3 sm:px-6">
            {[{ id: "ALL", label: "Zote" }, { id: "ACTIVE", label: "Zinazoendelea" }, { id: "DONE", label: "Zilizofungwa" }].map((item) => (
              <button key={item.id} onClick={() => setFilter(item.id)} aria-pressed={filter === item.id} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition ${filter === item.id ? "bg-[#61d7a5]/15 text-[#7ae2b5]" : "text-white/45 hover:bg-white/[0.05] hover:text-white/75"}`}>{item.label}</button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="space-y-3 p-4 sm:p-6"><CardSkeleton /><CardSkeleton /></div>
        ) : error ? (
          <div className="px-5 py-12 text-center"><p className="text-sm text-[#f18f75]">{error}</p><button onClick={() => void loadTickets()} className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-xs font-bold text-white/70">Jaribu tena</button></div>
        ) : !access ? (
          <div className="grid gap-7 px-5 py-9 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-8 sm:py-11">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-[#61d7a5]/20 bg-[#61d7a5]/[0.08] text-[#7ae2b5] sm:mx-0"><MessageCircle size={32} /><span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-[#0d120f] bg-[#e8bd5a]" /></div>
            <div className="text-center sm:text-left"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7ae2b5]">Inbox iko tayari</p><h3 className="mt-2 text-xl font-black">Anza mazungumzo yako ya kwanza</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45 sm:mx-0">Timu ya Bashiri inaweza kusaidia kuhusu akaunti, malipo au matumizi ya app. Tutajibu ndani ya inbox hii.</p>{!access && <p className="mt-3 inline-flex items-center gap-2 text-xs text-white/40"><ShieldCheck size={14} className="text-[#7ae2b5]" /> Guest anaweza kuandika; weka simu ili tukufikie.</p>}</div>
            <button onClick={() => router.push("/settings/support/new")} className="mx-auto inline-flex h-12 items-center gap-2 rounded-xl bg-[#61d7a5] px-5 text-sm font-extrabold text-[#07100b] transition hover:bg-[#7ae2b5] sm:mx-0"><Plus size={17} /> Anzisha mazungumzo</button>
          </div>
        ) : visibleTickets.length === 0 ? (
          <div className="px-5 py-12 text-center sm:py-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-white/40"><CheckCheck size={24} /></div>
            <h3 className="mt-4 text-lg font-extrabold">{tickets.length ? "Hakuna inayolingana na utafutaji" : "Inbox yako iko tulivu"}</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/45">{tickets.length ? "Jaribu neno au kichujio kingine." : "Mazungumzo yako yote yataonekana hapa. Unaweza kuanza ujumbe mpya wakati wowote."}</p>
            {!tickets.length && <button onClick={() => router.push("/settings/support/new")} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-[#61d7a5]/25 px-4 text-sm font-bold text-[#7ae2b5]"><Plus size={15} /> Ujumbe mpya</button>}
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {visibleTickets.map((ticket) => (
              <button key={ticket.id} onClick={() => router.push(`/settings/support/${ticket.id}`)} className="group flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.035] sm:gap-4 sm:px-6 sm:py-[18px]">
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[#61d7a5]/10 bg-gradient-to-br from-[#1d392b] to-[#132018] text-[#7ae2b5] transition group-hover:border-[#61d7a5]/30"><MessageCircle size={19} />{["OPEN", "IN_PROGRESS"].includes(ticket.status) && <i className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#0d120f] bg-[#61d7a5]" />}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><span className="truncate text-sm font-bold text-white sm:text-[15px]">{ticket.subject}</span><span className="text-[10px] tabular-nums text-white/35">{new Date(ticket.updated_at).toLocaleDateString("sw-TZ", { day: "numeric", month: "short" })}</span></span>
                  <span className="mt-1 flex flex-wrap items-center gap-2"><span className="truncate text-xs text-white/45">{TYPE_LABELS[ticket.type] || ticket.type}</span><span className="h-1 w-1 rounded-full bg-white/20" /><span className="text-[10px] font-bold" style={{ color: STATUS_COLORS[ticket.status] || "#fff" }}>{ticket.status.replace("_", " ")}</span></span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-white/30"><ShieldCheck size={13} /> Mazungumzo yako yanaonekana kwako na timu ya support pekee.</p>
    </main>
  );
}

export default function SupportListPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-5 pt-safe pt-6 pb-4"><CardSkeleton /></div>}>
      <SupportListContent />
    </Suspense>
  );
}
