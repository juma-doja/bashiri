"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, X, Check } from "lucide-react";
import { useState } from "react";
import { ResultRecapCard } from "./cards/ResultRecapCard";

interface ResultRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentRecaps: any[];
}

export function ResultRecapModal({ isOpen, onClose, recentRecaps }: ResultRecapModalProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDismiss = () => {
    onClose();
  };

  const calculateAccuracy = () => {
    if (recentRecaps.length === 0) return 0;
    const correct = recentRecaps.filter(r => r.data.was_correct).length;
    return Math.round((correct / recentRecaps.length) * 100);
  };

  const accuracy = calculateAccuracy();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.85)" }}
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl rounded-3xl p-6"
            style={{ 
              background: "linear-gradient(135deg, rgba(17, 17, 17, 0.95), rgba(30, 30, 40, 0.95))",
              border: "1px solid rgba(56, 189, 248, 0.3)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
            >
              <X size={20} style={{ color: "rgba(255,255,255,0.6)" }} />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", damping: 20 }}
                className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
                style={{ 
                  background: "linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(212, 175, 55, 0.2))",
                  border: "2px solid rgba(56, 189, 248, 0.3)"
                }}
              >
                <Trophy size={40} style={{ color: "#38BDF8" }} />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-white mb-2">
                Matokeo ya Hivi Karibuni
              </h3>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                Angalia performance ya Bashiri Pick kutoka mechi za hivi karibuni
              </p>
            </div>

            {/* Accuracy Badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mb-6"
            >
              <div 
                className="px-6 py-3 rounded-2xl flex items-center gap-3"
                style={{ 
                  background: "linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(212, 175, 55, 0.15))",
                  border: "1px solid rgba(56, 189, 248, 0.3)"
                }}
              >
                <TrendingUp size={20} style={{ color: "#38BDF8" }} />
                <div className="text-center">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Accuracy ya Hivi Karibuni</p>
                  <p className="text-2xl font-bold" style={{ color: "#38BDF8" }}>{accuracy}%</p>
                </div>
              </div>
            </motion.div>

            {/* Result Recap Cards */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
              {recentRecaps.slice(0, 5).map((recap, index) => (
                <motion.div
                  key={recap.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <ResultRecapCard matchId={recap.match_id} data={recap.data} />
                </motion.div>
              ))}
            </div>

            {/* Dismiss Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDismiss}
              className="w-full py-4 rounded-2xl font-bold transition-all"
              style={{ 
                background: "linear-gradient(135deg, #38BDF8, #D4AF37)",
                color: "#000"
              }}
            >
              Endelea Kuangalia Feed
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
