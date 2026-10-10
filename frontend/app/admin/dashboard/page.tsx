"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboardStats, getVisitorAnalytics } from "@/lib/api/admin";
import { useAdminAuthStore } from "@/stores/admin-auth.store";
import { Activity, ArrowDownRight, ArrowRight, Bell, CalendarDays, CreditCard, RefreshCw, ShieldAlert, Target, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DashboardStats {
  total_users: number;
  total_subscribers: number;
  new_users_this_month: number;
  revenue_this_month_tzs: number;
  revenue_all_time_tzs: number;
  ai_prediction_accuracy: number;
  total_ai_predictions_resolved: number;
  matches_today: number;
  live_matches_now: number;
  pending_transactions: number;
}

interface VisitorDay {
  date: string;
  registered: number;
  guests: number;
}

interface VisitorAnalytics {
  daily: VisitorDay[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const admin = useAdminAuthStore((state) => state.admin);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [visitors, setVisitors] = useState<VisitorDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const dashboardData = await getDashboardStats<DashboardStats>();
      setStats(dashboardData);
      try {
        const visitorData = await getVisitorAnalytics<VisitorAnalytics>();
        setVisitors(visitorData.daily || []);
      } catch (visitorError) {
        console.error("Failed to load dashboard traffic chart:", visitorError);
        setVisitors([]);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Imeshindwa kupakia dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  if (loading && !stats) {
    return <div className="flex min-h-[50vh] items-center justify-center"><div className="flex items-center gap-3 text-sm text-white/45"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-[#61d7a5]" />Loading operations overview</div></div>;
  }

  const number = (value: number) => (value || 0).toLocaleString("en-US");
  const money = (value: number) => `TZS ${(value || 0).toLocaleString("en-US")}`;
  const chartData = visitors.map((day) => ({
    ...day,
    label: new Date(`${day.date}T12:00:00`).toLocaleDateString("en", { month: "short", day: "numeric" }),
  }));
  const visitorPeak = Math.max(1, ...chartData.map((day) => day.registered + day.guests));

  const metrics = [
    { label: "Total users", value: number(stats?.total_users || 0), detail: `+${number(stats?.new_users_this_month || 0)} this month`, icon: Users, tone: "mint", href: "/admin/users" },
    { label: "Active PRO", value: number(stats?.total_subscribers || 0), detail: "Current subscribers", icon: TrendingUp, tone: "blue", href: "/admin/users" },
    { label: "Revenue this month", value: money(stats?.revenue_this_month_tzs || 0), detail: `${money(stats?.revenue_all_time_tzs || 0)} all time`, icon: CreditCard, tone: "gold", href: "/admin/transactions" },
    { label: "AI accuracy", value: `${stats?.ai_prediction_accuracy || 0}%`, detail: `${number(stats?.total_ai_predictions_resolved || 0)} resolved picks`, icon: Target, tone: "coral", href: "/admin/ml-status" },
    { label: "Matches today", value: number(stats?.matches_today || 0), detail: `${number(stats?.live_matches_now || 0)} live now`, icon: CalendarDays, tone: "blue", href: "/admin/matches" },
    { label: "Pending payments", value: number(stats?.pending_transactions || 0), detail: "Require review", icon: ArrowDownRight, tone: "coral", href: "/admin/transactions" },
  ];

  const shortcuts = [
    { label: "Review payments", detail: `${number(stats?.pending_transactions || 0)} waiting`, icon: CreditCard, href: "/admin/transactions", tone: "gold" },
    { label: "Manage users", detail: `${number(stats?.total_users || 0)} accounts`, icon: Users, href: "/admin/users", tone: "mint" },
    { label: "Moderation queue", detail: "Reports and videos", icon: ShieldAlert, href: "/admin/moderation", tone: "coral" },
    { label: "Send notification", detail: "Reach a user segment", icon: Bell, href: "/admin/notifications", tone: "blue" },
  ];

  const toneClasses: Record<string, string> = {
    mint: "text-[#80e4b4] bg-[#61d7a5]/[0.09] border-[#61d7a5]/15",
    blue: "text-[#78c8ef] bg-[#58b9ed]/[0.09] border-[#58b9ed]/15",
    gold: "text-[#ebc772] bg-[#e8bd5a]/[0.09] border-[#e8bd5a]/15",
    coral: "text-[#ee9b83] bg-[#f18f75]/[0.09] border-[#f18f75]/15",
  };

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 border-b border-white/[0.07] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.19em] text-[#79e5b8]">Control room / Overview</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Good day, {admin?.username || "Admin"}</h2>
          <p className="mt-2 text-sm text-white/45">Live operational snapshot for Bashiri.</p>
        </div>
        <button type="button" onClick={() => void loadDashboard()} disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.035] px-3.5 text-xs font-bold text-white/65 transition hover:bg-white/[0.08] hover:text-white sm:self-auto">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh data
        </button>
      </section>

      {error && (
        <div role="alert" className="flex flex-col justify-between gap-3 rounded-xl border border-[#f18f75]/20 bg-[#f18f75]/[0.06] px-4 py-3 sm:flex-row sm:items-center">
          <p className="text-sm text-[#f2a28b]">{error}</p>
          <button type="button" onClick={() => void loadDashboard()} className="shrink-0 text-xs font-bold text-[#f2a28b] underline underline-offset-4">Try again</button>
        </div>
      )}

      <section aria-label="Business metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metrics.map(({ label, value, detail, icon: Icon, tone, href }) => (
          <button key={label} type="button" onClick={() => router.push(href)} className="group min-w-0 rounded-xl border border-white/[0.07] bg-[#0d1410] p-4 text-left transition hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-[#101a14]">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[11px] font-semibold text-white/45">{label}</span>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${toneClasses[tone]}`}><Icon size={15} /></span>
            </div>
            <p className="mt-4 truncate text-[23px] font-black leading-none tabular-nums text-white">{value}</p>
            <p className="mt-2 truncate text-[10px] text-white/35">{detail}</p>
          </button>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
        <div className="min-w-0 rounded-xl border border-white/[0.07] bg-[#0d1410] p-4 sm:p-5">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">Audience</p>
              <h3 className="mt-1 text-base font-extrabold text-white">30-day traffic</h3>
            </div>
            <div className="flex flex-wrap justify-end gap-3 text-[10px] text-white/50">
              <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#58b9ed]" /> Guests</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#61d7a5]" /> Accounts</span>
            </div>
          </div>
          <div className="h-[250px] w-full">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 4, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminGuestFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#58b9ed" stopOpacity={0.24} /><stop offset="95%" stopColor="#58b9ed" stopOpacity={0} /></linearGradient>
                    <linearGradient id="adminAccountFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#61d7a5" stopOpacity={0.2} /><stop offset="95%" stopColor="#61d7a5" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#68756d", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} domain={[0, visitorPeak]} tick={{ fill: "#68756d", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#101812", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: "#fff", fontSize: 12 }} labelStyle={{ color: "#9eaaa2" }} />
                  <Area type="monotone" dataKey="guests" name="Guests" stroke="#58b9ed" strokeWidth={2} fill="url(#adminGuestFill)" />
                  <Area type="monotone" dataKey="registered" name="Accounts" stroke="#61d7a5" strokeWidth={2} fill="url(#adminAccountFill)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-white/35">No traffic data available yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-[#0d1410] p-4 sm:p-5">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">Shortcuts</p>
            <h3 className="mt-1 text-base font-extrabold text-white">Operations</h3>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {shortcuts.map(({ label, detail, icon: Icon, href, tone }) => (
              <button key={href} type="button" onClick={() => router.push(href)} className="flex w-full items-center gap-3 py-3 text-left group">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${toneClasses[tone]}`}><Icon size={16} /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-white/80 group-hover:text-white">{label}</span><span className="mt-0.5 block truncate text-[10px] text-white/35">{detail}</span></span>
                <ArrowRight size={15} className="text-white/25 transition group-hover:translate-x-0.5 group-hover:text-white/65" />
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-[#e8bd5a]/15 bg-[#e8bd5a]/[0.05] p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#ebc772]">Needs attention</p>
            <p className="mt-1 text-sm font-bold text-white">{number(stats?.pending_transactions || 0)} pending payments</p>
            <button type="button" onClick={() => router.push("/admin/transactions")} className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#ebc772]">Open transactions <ArrowRight size={12} /></button>
          </div>
        </div>
      </section>

      <section className="flex flex-col justify-between gap-3 border-t border-white/[0.07] pt-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-[11px] text-white/35"><span className="h-1.5 w-1.5 rounded-full bg-[#61d7a5]" /><Activity size={13} /> Live operational snapshot</div>
        <p className="text-[10px] text-white/30">All figures are loaded from the current dashboard APIs.</p>
      </section>
    </div>
  );
}
