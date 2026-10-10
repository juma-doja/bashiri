"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
import { getUsers } from "@/lib/api/admin";

interface AdminUserRow {
  id: number;
  phone_number: string;
  username: string | null;
  avatar_url: string;
  is_active: boolean;
  is_staff: boolean;
  is_subscriber: boolean;
  is_subscription_active: boolean;
  total_predictions: number;
  correct_predictions: number;
  accuracy_percentage: number;
  date_joined: string;
}

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getUsers({
        search: search.trim() || undefined,
        is_active: statusFilter === "all" ? undefined : statusFilter === "active",
        is_subscriber: subscriptionFilter === "all" ? undefined : subscriptionFilter === "pro",
        limit: PAGE_SIZE,
        offset,
      }) as { count: number; results: AdminUserRow[] };
      setUsers(response.results || []);
      setCount(response.count || 0);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Imeshindwa kupakia users.");
    } finally {
      setLoading(false);
    }
  }, [offset, search, statusFilter, subscriptionFilter]);

  useEffect(() => { void loadUsers(); }, [loadUsers]);
  useEffect(() => { setOffset(0); }, [search, statusFilter, subscriptionFilter]);

  const start = count ? offset + 1 : 0;
  const end = Math.min(offset + PAGE_SIZE, count);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 border-b border-white/[0.07] pb-5 sm:flex-row sm:items-end">
        <div className="flex items-start gap-3">
          <button type="button" onClick={() => router.back()} aria-label="Go back" className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] text-white/55 hover:bg-white/[0.08]"><ArrowLeft size={17} /></button>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#79e5b8]">Accounts / Directory</p>
            <h2 className="mt-1 text-2xl font-black text-white">Users</h2>
            <p className="mt-1 text-xs text-white/40">Search accounts and open a profile to manage access, subscriptions and credentials.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 sm:self-auto">
          <Users size={15} className="text-[#79e5b8]" />
          <span className="text-sm font-bold tabular-nums text-white">{count.toLocaleString()}</span>
          <span className="text-xs text-white/40">accounts</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(220px,1fr)_180px_180px]">
        <label className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0d1410] px-3.5 py-3">
          <Search size={16} className="shrink-0 text-white/35" />
          <span className="sr-only">Search phone or username</span>
          <input className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30" placeholder="Search phone or username" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d1410] px-3.5 py-3 text-xs font-semibold text-white/55">
          <span className="shrink-0">Account status</span>
          <select aria-label="Account status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-w-0 flex-1 border-0 bg-transparent text-right text-xs font-bold text-white outline-none">
            <option value="all">All</option><option value="active">Active</option><option value="suspended">Suspended</option>
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d1410] px-3.5 py-3 text-xs font-semibold text-white/55">
          <span className="shrink-0">Subscription</span>
          <select aria-label="Subscription status" value={subscriptionFilter} onChange={(event) => setSubscriptionFilter(event.target.value)} className="min-w-0 flex-1 border-0 bg-transparent text-right text-xs font-bold text-white outline-none">
            <option value="all">All</option><option value="pro">PRO</option><option value="free">Free</option>
          </select>
        </label>
      </section>

      {error && <div role="alert" className="flex flex-col justify-between gap-3 rounded-xl border border-[#f18f75]/20 bg-[#f18f75]/[0.06] px-4 py-3 sm:flex-row sm:items-center"><p className="text-sm text-[#f2a28b]">{error}</p><button type="button" onClick={() => void loadUsers()} className="text-left text-xs font-bold text-[#f2a28b] underline underline-offset-4">Retry</button></div>}

      <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0d1410]">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] text-sm">
            <thead><tr><th className="text-left">Account</th><th className="text-left">Phone</th><th className="text-left">Plan</th><th className="text-right">Picks</th><th className="text-right">Accuracy</th><th className="text-left">Access</th><th className="text-right">Joined</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-white/40"><span className="inline-flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-[#61d7a5]" />Loading users</span></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-white/40">No users match these filters.</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} onClick={() => router.push(`/admin/users/${user.id}`)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") router.push(`/admin/users/${user.id}`); }} className="cursor-pointer">
                  <td><div className="flex min-w-[160px] items-center gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/[0.06] text-xs font-bold text-white/70">{user.avatar_url ? <img src={user.avatar_url} alt="" className="h-full w-full object-cover" /> : (user.username?.[0]?.toUpperCase() || "?")}</span><span><span className="block font-bold text-white/85">@{user.username || "Unnamed"}</span>{user.is_staff && <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-wider text-[#ebc772]">Admin</span>}</span></div></td>
                  <td className="whitespace-nowrap text-white/55">{user.phone_number}</td>
                  <td><span className={`rounded-md px-2 py-1 text-[10px] font-bold ${user.is_subscription_active ? "bg-[#58b9ed]/10 text-[#78c8ef]" : "bg-white/[0.04] text-white/40"}`}>{user.is_subscription_active ? "PRO" : "FREE"}</span></td>
                  <td className="text-right tabular-nums text-white/60">{(user.total_predictions || 0).toLocaleString()}</td>
                  <td className="text-right tabular-nums text-[#80e4b4]">{user.accuracy_percentage || 0}%</td>
                  <td><span className={`inline-flex items-center gap-1.5 text-xs ${user.is_active ? "text-[#80e4b4]" : "text-[#ee9b83]"}`}><i className={`h-1.5 w-1.5 rounded-full ${user.is_active ? "bg-[#61d7a5]" : "bg-[#f18f75]"}`} />{user.is_active ? "Active" : "Suspended"}</span></td>
                  <td className="whitespace-nowrap text-right text-xs text-white/40">{new Date(user.date_joined).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="flex flex-col justify-between gap-3 border-t border-white/[0.07] px-4 py-3 sm:flex-row sm:items-center">
          <p className="text-xs text-white/40">Showing <span className="font-bold text-white/65">{start}–{end}</span> of <span className="font-bold text-white/65">{count.toLocaleString()}</span></p>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button type="button" disabled={offset === 0 || loading} onClick={() => setOffset((value) => Math.max(0, value - PAGE_SIZE))} aria-label="Previous page" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 transition hover:bg-white/5 disabled:opacity-30"><ChevronLeft size={16} /></button>
            <span className="min-w-16 text-center text-xs tabular-nums text-white/45">{Math.floor(offset / PAGE_SIZE) + 1} / {Math.max(1, Math.ceil(count / PAGE_SIZE))}</span>
            <button type="button" disabled={offset + PAGE_SIZE >= count || loading} onClick={() => setOffset((value) => value + PAGE_SIZE)} aria-label="Next page" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 transition hover:bg-white/5 disabled:opacity-30"><ChevronRight size={16} /></button>
          </div>
        </footer>
      </div>
    </div>
  );
}
