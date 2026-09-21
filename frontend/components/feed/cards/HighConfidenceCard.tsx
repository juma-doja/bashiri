"use client";
import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface HighConfidenceCardProps {
  data: any;
  matchId: number;
}

export function HighConfidenceCard({ data, matchId }: HighConfidenceCardProps) {
  const router = useRouter();
  const { match, prediction } = data;
  
  // Color based on confidence percentage
  const confidence = prediction.confidence || 0;
  let teamColor: string;
  let bgColor: string;
  let borderColor: string;
  
  if (confidence >= 81) {
    // 81-100: Green
    teamColor = "#00FF87";
    bgColor = "rgba(0,255,135,0.08)";
    borderColor = "rgba(0,255,135,0.2)";
  } else if (confidence >= 71) {
    // 71-80: Gold
    teamColor = "#D4AF37";
    bgColor = "rgba(212,175,55,0.08)";
    borderColor = "rgba(212,175,55,0.2)";
  } else if (confidence >= 61) {
    // 61-70: Blue (Sea blue)
    teamColor = "#38BDF8";
    bgColor = "rgba(56,189,248,0.08)";
    borderColor = "rgba(56,189,248,0.2)";
  } else {
    // 50-60: Red
    teamColor = "#FF6464";
    bgColor = "rgba(255,100,100,0.08)";
    borderColor = "rgba(255,100,100,0.2)";
  }

  const handleCardClick = () => {
    router.push(`/create/${matchId}/predict`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${bgColor}` }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className="w-full rounded-3xl cursor-pointer overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${bgColor} 0%, rgba(17, 17, 17, 0.95) 100%)`,
        border: `1px solid ${borderColor}`,
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: bgColor, border: `1px solid ${borderColor}` }}
            >
              <Target size={18} style={{ color: teamColor }} />
            </motion.div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: teamColor }}>
                High Confidence
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                {prediction.market} Market
              </p>
            </div>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="px-3 py-1.5 rounded-full"
            style={{ background: bgColor, border: `1px solid ${borderColor}` }}
          >
            <p className="text-lg font-bold" style={{ color: teamColor }}>
              {prediction.confidence}%
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5">
        {/* Match Info */}
        <div className="text-center mb-4">
          <p className="text-xl font-bold text-white mb-2">
            {match.home_team} <span style={{ color: "rgba(255,255,255,0.4)" }}>vs</span> {match.away_team}
          </p>
          <div className="flex items-center justify-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            <Calendar size={12} />
            <span>{new Date(match.kickoff_at).toLocaleDateString()}</span>
            <Clock size={12} />
            <span>{new Date(match.kickoff_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Prediction */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: teamColor }}
              >
                <Trophy size={20} color="#000" />
              </motion.div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Predicted Winner
                </p>
                <p className="text-lg font-bold text-white">{prediction.team}</p>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-right"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                Confidence
              </p>
              <p className="text-3xl font-black" style={{ color: teamColor }}>
                {prediction.confidence}%
              </p>
            </motion.div>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl font-bold transition-all"
          style={{
            background: `linear-gradient(135deg, ${teamColor}, ${confidence >= 81 ? '#00C878' : confidence >= 71 ? '#CFAF7B' : confidence >= 61 ? '#0EA5E9' : '#FF4040'})`,
            color: "#000",
          }}
        >
          View Full Prediction
        </motion.button>
      </div>
    </motion.div>
  );
}
