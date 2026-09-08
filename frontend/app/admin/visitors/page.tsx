"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Activity, CalendarDays, Globe2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { getVisitorAnalytics } from "@/lib/api/admin";

type VisitorAnalytics = {
  today: { registered: number; guests: number };
  month: { registered: number; guests: number };
  all_time: { registered: number; guests: number };
  daily: { date: string; registered: number; guests: number }[];
  recent: { id: number; visitor_type: "registered" | "guest"; user: string | null; path: string; visited_at: string }[];
};

export default function AdminVisitorsPage() {
  const router = useRouter();
  const [data, setData] = useState<VisitorAnalytics | null>(null);

  useEffect(() => {
    getVisitorAnalytics<VisitorAnalytics>().then(setData).catch(() => setData(null));
  }, []);

  if (!data) return <p className="text-white/50">Inapakia visitor analytics...</p>;

  const cards = [
    { label: "Wageni leo", value: data.today.guests, icon: Globe2, color: "#58A6FF" },
    { label: "Users leo", value: data.today.registered, icon: UserRound, color: "#00FF87" },
    { label: "Wageni mwezi huu", value: data.month.guests, icon: CalendarDays, color: "#F5C542" },
    { label: "Users mwezi huu", value: data.month.registered, icon: Activity, color: "#FF715B" },
  ];
  const maxValue = Math.max(1, ...data.daily.map((day) => day.guests + day.registered));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} aria-label="Rudi nyuma"><ArrowLeft size={20} className="text-white/60" /></button>
        <div>
          <h1 className="text-2xl font-black text-white">Visitors & Traffic</h1>
          <p className="text-sm text-white/45">Watu waliotembelea Bashiri, accounts na guests</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Icon size={19} style={{ color }} />
            <p className="mt-4 text-2xl font-black text-white">{value.toLocaleString()}</p>
            <p className="mt-1 text-xs text-white/45">{label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white">Traffic ya siku 30 zilizopita</h2>
          <span className="text-xs text-white/40">Guests + Users</span>
        </div>
        <div className="flex items-end gap-1.5 h-48">
          {data.daily.map((day) => {
            const registeredHeight = (day.registered / maxValue) * 100;
            const guestHeight = (day.guests / maxValue) * 100;
            return (
              <div key={day.date} className="flex-1 h-full flex items-end gap-px" title={`${day.date}: ${day.guests} guests, ${day.registered} users`}>
                <div className="flex-1 rounded-t bg-[#58A6FF]" style={{ height: `${Math.max(guestHeight, day.guests ? 3 : 0)}%` }} />
                <div className="flex-1 rounded-t bg-[#00FF87]" style={{ height: `${Math.max(registeredHeight, day.registered ? 3 : 0)}%` }} />
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex justify-between text-[10px] text-white/35"><span>{data.daily[0]?.date}</span><span>{data.daily.at(-1)?.date}</span></div>
      </section>

      <section className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="p-5 border-b border-white/10"><h2 className="font-bold text-white">Recent visits</h2></div>
        <div className="divide-y divide-white/5">
          {data.recent.slice(0, 25).map((visit) => (
            <div key={visit.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div className="min-w-0"><p className="truncate text-white">{visit.user || "Guest visitor"}</p><p className="truncate text-xs text-white/40">{visit.path}</p></div>
              <div className="shrink-0 text-right"><p className={visit.visitor_type === "guest" ? "text-[#58A6FF]" : "text-[#00FF87]"}>{visit.visitor_type === "guest" ? "Guest" : "Account"}</p><p className="text-[10px] text-white/35">{new Date(visit.visited_at).toLocaleString()}</p></div>
            </div>
          ))}
          {!data.recent.length && <p className="p-5 text-sm text-white/45">Bado hakuna visits zilizorekodiwa.</p>}
        </div>
      </section>
    </div>
  );
}