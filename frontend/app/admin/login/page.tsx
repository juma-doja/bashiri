"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { adminLogin } from "@/lib/api/admin";
import { useAdminAuthStore } from "@/stores/admin-auth.store";
import { BashiriButton } from "@/components/ui/Button";
import { BashiriInput } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";

const isPhoneValid = (value: string) => /^\+255\d{9}$/.test(value);

export default function AdminLoginPage() {
  const router = useRouter();
  const setSession = useAdminAuthStore((s) => s.setSession);
  const [phone, setPhone] = useState("+255");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setError("");

    if (!isPhoneValid(phone)) {
      setError("Namba ya simu si sahihi. Andika kwa muundo +255712345678");
      return;
    }

    if (!password) {
      setError("Weka password yako ili kuingia");
      return;
    }

    setLoading(true);
    try {
      const data = await adminLogin(phone, password);
      setSession(data.access, data.refresh, data.user);
      router.push("/admin/dashboard");
    } catch (e: any) {
      setError(e.message || "Hitilafu wakati wa kuingia");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#080d0b] px-4 py-10 text-white sm:px-6">
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(97,215,165,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(97,215,165,.055) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#61d7a5]/[0.07]" />
      <section className="relative w-full max-w-[420px] rounded-2xl border border-white/[0.09] bg-[#0d1410]/95 p-6 shadow-[0_24px_90px_rgba(0,0,0,.45)] sm:p-8">
        <div className="mb-7 flex items-center justify-between">
          <img src="/bashiri-logo-horizontal.svg" alt="Bashiri" className="h-7 w-auto" />
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#61d7a5]/20 bg-[#61d7a5]/[0.08] text-[#79e5b8]"><ShieldCheck size={19} /></span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#79e5b8]">Restricted access</p>
        <h1 className="mt-2 text-2xl font-black text-white">Admin sign in</h1>
        <p className="mt-2 text-sm leading-6 text-white/45">Ingia kwenye Bashiri operations workspace kwa akaunti yenye ruhusa ya admin.</p>

        <form className="mt-7 space-y-5" onSubmit={handleLogin}>
          <PhoneInput label="Namba ya simu" value={phone} onChange={setPhone} autoComplete="username" />
          <BashiriInput label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          {error && <div role="alert" className="rounded-lg border border-[#f18f75]/20 bg-[#f18f75]/[0.07] px-3 py-2.5 text-xs leading-5 text-[#f2a28b]">{error}</div>}
          <BashiriButton className="w-full" size="lg" type="submit" loading={loading} disabled={loading}>
            <span>{loading ? "Inathibitisha akaunti..." : "Ingia kwenye dashboard"}</span>
            {!loading && <ArrowRight size={16} />}
          </BashiriButton>
        </form>

        <div className="mt-6 flex items-center gap-2 border-t border-white/[0.07] pt-4 text-[10px] text-white/30"><LockKeyhole size={12} /> Protected administrator session</div>
      </section>
    </main>
  );
}
