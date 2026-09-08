/**
 * components/profile/MarketMasteryHeatmap.tsx
 *
 * Market mastery heatmap visualization
 * Shows user's performance across different prediction markets
 */

import { motion } from 'framer-motion';

interface MarketData {
  market: string;
  accuracy: number | null;
  predictions: number;
}

interface MarketMasteryHeatmapProps {
  data: MarketData[];
}

export const MarketMasteryHeatmap: React.FC<MarketMasteryHeatmapProps> = ({ data }) => {
  const getHeatColor = (accuracy: number) => {
    if (accuracy >= 80) return 'from-[#D4AF37]/80 to-[#CFAF7B]/70'; // Gold - reduced opacity for better text readability
    if (accuracy >= 70) return 'from-[#4CAF50]/80 to-[#81C784]/70'; // Green
    if (accuracy >= 60) return 'from-[#2196F3]/80 to-[#64B5F6]/70'; // Blue
    if (accuracy >= 50) return 'from-[#FF9800]/80 to-[#FFB74D]/70'; // Orange
    return 'from-[#F44336]/80 to-[#EF5350]/70'; // Red
  };

  const getIntensity = (accuracy: number) => {
    return Math.min(accuracy / 100, 1);
  };

  const getTextColor = (accuracy: number) => {
    // Use darker text for gold to improve readability
    if (accuracy >= 80) return 'text-[#1a1a1a]'; // Dark text for gold
    return 'text-white'; // White text for other colors
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {data.map((item, index) => (
          <motion.div
            key={item.market}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            className="relative group"
          >
            <div
              className={`rounded-xl p-3 transition-all duration-300 sm:p-4 ${item.accuracy === null ? 'bg-white/5' : `bg-gradient-to-br ${getHeatColor(item.accuracy)}`}`}
              style={{
                opacity: item.accuracy === null ? 1 : 0.3 + (getIntensity(item.accuracy) * 0.7),
              }}
            >
              <div className="relative z-10">
                <p className={`mb-1 break-words text-[11px] font-bold sm:text-xs ${item.accuracy === null ? 'text-white/60' : getTextColor(item.accuracy)}`}>{item.market}</p>
                <p className={`text-xl font-black sm:text-2xl ${item.accuracy === null ? 'text-white/50' : getTextColor(item.accuracy)}`}>{item.accuracy === null ? "—" : `${item.accuracy.toFixed(1)}%`}</p>
                <p className="text-[10px] mt-1 text-white/50">{item.predictions} picks</p>
              </div>
              
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            </div>
            
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              <div className="px-3 py-2 rounded-lg bg-black/90 backdrop-blur-sm border border-white/20">
                <p className="text-xs font-bold text-white">{item.accuracy === null ? "No data" : `${item.accuracy.toFixed(1)}% Accuracy`}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#F44336] to-[#EF5350]" />
          <span className="text-[10px] text-white/40">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#FF9800] to-[#FFB74D]" />
          <span className="text-[10px] text-white/40">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#2196F3] to-[#64B5F6]" />
          <span className="text-[10px] text-white/40">Good</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#4CAF50] to-[#81C784]" />
          <span className="text-[10px] text-white/40">Great</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#CFAF7B]" />
          <span className="text-[10px] text-white/40">Elite</span>
        </div>
      </div>
    </div>
  );
};
