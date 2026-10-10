"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTicket } from "@/lib/api/support";
import { useAuthStore } from "@/stores/auth.store";
import { ArrowLeft, Check, LifeBuoy, Loader2, Send, ShieldCheck } from "lucide-react";

const TYPES = [
  { key: "ACCOUNT_ISSUE", label: "Tatizo la Akaunti" },
  { key: "PAYMENT_ISSUE", label: "Tatizo la Malipo" },
  { key: "BUG_REPORT", label: "Hitilafu ya App" },
  { key: "FEEDBACK", label: "Maoni" },
  { key: "OTHER", label: "Nyingine" },
];

export default function NewSupportTicketPage() {
  const router = useRouter();
  const access = useAuthStore((state) => state.access);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [type, setType] = useState("ACCOUNT_ISSUE");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [guestPhone, setGuestPhone] = useState("+255");
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!hasHydrated || loading) return;
    if (!subject.trim() || !message.trim()) {
      setError("Jaza kichwa cha habari na ujumbe.");
      return;
    }
    if (!access && !/^\+255\d{9}$/.test(guestPhone)) {
      setError("Weka namba sahihi kwa muundo +255712345678.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createTicket({
        type,
        subject: subject.trim(),
        message: message.trim(),
        ...(!access ? { guest_phone: guestPhone, guest_name: guestName.trim() } : {}),
      });
      if (access) router.push("/settings/support");
      else setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Imeshindikana kutuma ujumbe. Jaribu tena.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-5xl px-4 pb-32 pt-safe pt-5 text-white sm:px-6 sm:pt-8 lg:px-8 lg:pb-12">
      <header className="mb-7 flex items-center gap-3">
        <button type="button" onClick={() => router.back()} aria-label="Rudi nyuma" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/65 transition hover:bg-white/10"><ArrowLeft size={18} /></button>
        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#61d7a5]">Bashiri Care · Support</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">Ujumbe mpya</h1></div>
      </header>

      {sent ? (
        <section className="mx-auto max-w-2xl rounded-[26px] border border-[#61d7a5]/20 bg-[#101612] p-6 text-center sm:p-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-[#61d7a5]/20 bg-[#61d7a5]/10 text-[#61d7a5]"><Check size={28} /></span>
          <h2 className="mt-5 text-xl font-extrabold">Ujumbe umetumwa</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">Timu yetu itawasiliana nawe kupitia namba uliyoacha. Guest hawezi kufungua historia ya mazungumzo baada ya kutoka kwenye ukurasa huu.</p>
          <button type="button" onClick={() => router.push("/settings/support")} className="mt-6 h-11 rounded-xl bg-[#61d7a5] px-5 text-sm font-extrabold text-[#07100b]">Rudi kwenye msaada</button>
        </section>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-7">
          <section className="overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#101612]">
            <div className="border-b border-white/[0.07] bg-gradient-to-r from-[#14231a] to-[#101612] px-5 py-5 sm:px-7 sm:py-6"><div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#61d7a5]/15 bg-[#61d7a5]/[0.08] text-[#61d7a5]"><LifeBuoy size={20} /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#7ae2b5]">Timu yetu inakusikiliza</p><h2 className="mt-1 text-lg font-extrabold">Tunawezaje kukusaidia?</h2><p className="mt-1 text-xs leading-5 text-white/45">Chagua mada, eleza hali kwa ufupi, nasi tutakujibu.</p></div></div></div>
            <div className="p-4 sm:p-7">

            {!access && (
              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs font-semibold text-white/55">Namba ya simu <span className="text-[#f1c66d]">inahitajika</span></span><input value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="+255712345678" className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#61d7a5]/50" /></label>
                <label className="block"><span className="mb-2 block text-xs font-semibold text-white/55">Jina <span className="text-white/30">si lazima</span></span><input value={guestName} onChange={(event) => setGuestName(event.target.value)} autoComplete="name" placeholder="Jina lako" className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#61d7a5]/50" /></label>
              </div>
            )}

            <fieldset className="mb-5"><legend className="mb-2 text-xs font-semibold text-white/55">Mada ya ujumbe</legend><div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{TYPES.map((item) => <button type="button" key={item.key} onClick={() => setType(item.key)} aria-pressed={type === item.key} className={`min-h-11 rounded-xl border px-3 text-left text-xs font-bold transition ${type === item.key ? "border-[#61d7a5]/45 bg-[#61d7a5]/[0.09] text-[#8ce8bd]" : "border-white/[0.08] bg-black/10 text-white/60 hover:bg-white/[0.04]"}`}>{item.label}</button>)}</div></fieldset>

            <label className="mb-4 block"><span className="mb-2 block text-xs font-semibold text-white/55">Kichwa cha habari</span><input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={150} placeholder="Mfano: Malipo yangu hayajaonekana" className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#61d7a5]/50" /></label>
            <label className="block"><span className="mb-2 block text-xs font-semibold text-white/55">Ujumbe</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={6} placeholder="Eleza kinachoendelea na hatua ulizojaribu..." className="w-full resize-y rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-[#61d7a5]/50" /></label>

            {error && <p role="alert" className="mt-4 rounded-xl border border-[#f18f75]/20 bg-[#f18f75]/[0.07] px-3 py-2.5 text-xs text-[#f3a28c]">{error}</p>}
            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-[10px] text-white/30">Usiweke password au taarifa za kadi kwenye ujumbe.</p><button type="button" onClick={() => void handleSubmit()} disabled={loading || !hasHydrated} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#61d7a5] px-5 text-sm font-extrabold text-[#07100b] transition hover:bg-[#7ae2b5] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-48">{loading ? <><Loader2 size={16} className="animate-spin" /> Inatuma...</> : <><Send size={15} /> Tuma ujumbe</>}</button></div>
            </div>
          </section>

          <aside className="space-y-3 lg:sticky lg:top-6"><div className="rounded-[22px] border border-white/[0.08] bg-[#101612] p-5"><div className="flex items-center gap-2 text-sm font-bold text-white/85"><ShieldCheck size={17} className="text-[#61d7a5]" /> Faragha yako</div><p className="mt-3 text-xs leading-6 text-white/45">Ujumbe unaonekana kwako na kwa timu ya support pekee. Hatutaomba password yako kwenye chat.</p>{!access && <p className="mt-4 border-t border-white/[0.07] pt-4 text-xs leading-5 text-[#f1c66d]/80">Kwa guest, namba ya simu hutumika tu kukujibu. Historia ya mazungumzo inahitaji akaunti.</p>}</div><div className="rounded-[22px] border border-[#61d7a5]/10 bg-[#61d7a5]/[0.035] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7ae2b5]">Kabla ya kutuma</p><ul className="mt-3 space-y-2 text-xs leading-5 text-white/45"><li>• Chagua mada inayokaribia tatizo lako.</li><li>• Eleza hatua ulizojaribu tayari.</li><li>• Usitume PIN, password, au card details.</li></ul></div></aside>
        </div>
      )}
    </main>
  );
}
