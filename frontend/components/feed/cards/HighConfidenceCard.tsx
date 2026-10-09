"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, Check, Clock3, Target, Trophy } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";

interface HighConfidenceCardData {
  match: { home_team: string; away_team: string; league: string; kickoff_at: string };
  prediction: { winner: "home" | "away"; team: string; confidence: number; market: string };
}

interface HighConfidenceCardProps {
  data: HighConfidenceCardData;
  matchId: number;
  isSelectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}

export function HighConfidenceCard({ data, matchId, isSelectMode = false, selected = false, onToggleSelect }: HighConfidenceCardProps) {
  const router = useRouter();
  const { match, prediction } = data;
  const confidence = Math.max(0, Math.min(100, Number(prediction?.confidence) || 0));
  const accent = confidence >= 80 ? "#61d7a5" : confidence >= 65 ? "#58b9ed" : "#e8bd5a";
  const kickoff = parseISO(match.kickoff_at);
  const kickoffIsValid = !Number.isNaN(kickoff.getTime());

  return (
    <article className={`h-full overflow-hidden rounded-xl border bg-[#101612] transition-colors ${selected ? "border-[#61d7a5]/55" : "border-white/[0.08] hover:border-white/15"}`}>
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.13em] text-white/40">{match.league}</p>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-white/50">
            <CalendarDays size={12} className="shrink-0 text-[#61d7a5]" />
            <span>{kickoffIsValid ? format(kickoff, "EEE, d MMM") : "Kickoff pending"}</span>
            {kickoffIsValid && <><span className="text-white/20">/</span><Clock3 size={12} className="shrink-0" /><span>{format(kickoff, "HH:mm")}</span></>}
          </div>
        </div>
        {isSelectMode ? (
          <button type="button" onClick={onToggleSelect} aria-pressed={selected} aria-label={selected ? "Deselect pick" : "Select pick"} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${selected ? "border-[#61d7a5]/40 bg-[#61d7a5]/15 text-[#61d7a5]" : "border-white/10 bg-white/[0.03] text-white/40 hover:text-white"}`}>
            {selected ? <Check size={16} /> : <span className="h-3.5 w-3.5 rounded border border-current" />}
          </button>
        ) : (
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5" style={{ borderColor: `${accent}35`, background: `${accent}12`, color: accent }}><Target size={13} /><span className="text-sm font-black tabular-nums">{confidence}%</span></div>
        )}
      </div>

      <div className="px-5 py-5">
        <h3 className="text-base font-extrabold leading-6 text-white sm:text-lg">{match.home_team}<span className="mx-2 text-white/25">vs</span>{match.away_team}</h3>
        <div className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-white/[0.06] bg-black/15 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${accent}15`, color: accent }}><Trophy size={15} /></span>
            <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/35">{prediction?.market || "1X2"} pick</p><p className="truncate text-sm font-bold text-white/90">{prediction?.team || "Prediction unavailable"}</p></div>
          </div>
          {!isSelectMode && <span className="shrink-0 text-xs font-extrabold tabular-nums" style={{ color: accent }}>{confidence}%</span>}
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><motion.div initial={{ width: 0 }} animate={{ width: `${confidence}%` }} transition={{ duration: 0.5, ease: "easeOut" }} className="h-full rounded-full" style={{ background: accent }} /></div>
        <button type="button" onClick={() => router.push(`/create/${matchId}/predict`)} className="mt-4 flex w-full items-center justify-between rounded-lg py-1 text-xs font-bold text-white/55 transition hover:text-[#61d7a5]"><span>Open full prediction</span><ArrowUpRight size={15} /></button>
      </div>
    </article>
  );
}
