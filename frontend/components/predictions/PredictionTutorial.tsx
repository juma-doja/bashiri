"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle,
  CircleHelp,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";

interface PredictionTutorialProps {
  onClose: () => void;
}

const CONFIDENCE_GUIDE = [
  ["80–100%", "Uhakika mkubwa sana"],
  ["65–79%", "Uhakika mzuri"],
  ["50–64%", "Wastani; angalia kwa makini"],
  ["Chini ya 50%", "Uhakika mdogo"],
];

export function PredictionTutorial({ onClose }: PredictionTutorialProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(onClose, 600);
  }, [isClosing, onClose]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [handleClose]);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) handleClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-2xl"
          style={{ perspective: "2000px" }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="prediction-tutorial-title"
            initial={{ rotateY: -90 }}
            animate={{ rotateY: isClosing ? -90 : 0 }}
            exit={{ rotateY: -90 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#111111] sm:max-h-[calc(100dvh-3rem)]"
            style={{ transformStyle: "preserve-3d", transformOrigin: "left center" }}
          >
            <div className="absolute bottom-0 left-0 top-0 z-10 w-1 rounded-l-3xl bg-gradient-to-b from-[var(--brand-primary)] via-[var(--brand-accent)] to-[var(--brand-primary)]" />

            <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#111111] p-4 sm:p-5">
              <div className="flex min-w-0 items-center gap-3">
                <motion.div
                  initial={{ rotate: -180 }}
                  animate={{ rotate: 0 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                >
                  <BookOpen size={24} className="text-[var(--brand-primary)]" />
                </motion.div>
                <div className="min-w-0">
                  <motion.h2
                    id="prediction-tutorial-title"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="truncate text-lg font-semibold text-white sm:text-xl"
                  >
                    Mwongozo wa Bashiri
                  </motion.h2>
                  <p className="text-xs text-white/45">Jifunze prediction, matokeo na ligi</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Funga mwongozo"
                onClick={handleClose}
                className="ml-2 rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </header>

            <div
              className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 pr-3 [scrollbar-color:rgba(255,255,255,0.24)_transparent] [scrollbar-width:thin] sm:space-y-5 sm:p-6"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="rounded-2xl bg-white/5 p-4 sm:p-5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-primary)] text-black"><Sparkles size={19} /></span>
                  <h3 className="font-semibold text-white">1. AI inakadiria nini?</h3>
                </div>
                <p className="text-sm leading-relaxed text-white/70">
                  Bashiri hutumia modeli ya adaptive Poisson na takwimu za timu/mechi zilizopo kukadiria matokeo yanayowezekana. Markets nyingi hutokana na score matrix hiyo hiyo. Asilimia ni uwezekano uliokadiriwa na modeli—si ahadi, uhakika wa matokeo, wala pendekezo la kuweka pesa.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {CONFIDENCE_GUIDE.map(([range, label]) => (
                    <div key={range} className="flex items-center gap-2 rounded-xl bg-black/20 px-3 py-2 text-xs text-white/65">
                      <CheckCircle size={14} className="shrink-0 text-green-400" />
                      <span><strong className="text-white">{range}</strong> · {label}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-white/45">
                  Confidence inaonyesha nguvu ya ishara ya modeli, si uwezekano wa kushinda kwa uhakika. Top Pick huonyesha chaguo linaloongoza kwa mechi; wakati mwingine hakuna ishara iliyo imara vya kutosha.
                </p>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="rounded-2xl bg-white/5 p-4 sm:p-5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-primary)] text-black"><TrendingUp size={19} /></span>
                  <h3 className="font-semibold text-white">2. Markets na selections</h3>
                </div>
                <p className="text-sm leading-relaxed text-white/70">
                  Market ni swali kuhusu mechi; selection ni jibu unalochagua. Sio kila market inapatikana kwa kila mechi—tumia zilizoonyeshwa kwenye app.
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/60">
                  <li><strong className="text-white">1X2:</strong> ushindi wa timu ya nyumbani (1), sare (X), au ushindi wa ugenini (2).</li>
                  <li><strong className="text-white">Double Chance:</strong> unachagua matokeo mawili kati ya matatu.</li>
                  <li><strong className="text-white">Over/Under:</strong> jumla ya magoli iwe juu au chini ya mstari ulioonyeshwa.</li>
                  <li><strong className="text-white">BTTS:</strong> je, timu zote mbili zitafunga? Markets nyingine zinaweza kujumuisha magoli ya timu moja au score halisi.</li>
                </ul>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="rounded-2xl bg-white/5 p-4 sm:p-5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-primary)] text-black"><Target size={19} /></span>
                  <h3 className="font-semibold text-white">3. Hifadhi na fuatilia</h3>
                </div>
                <p className="text-sm leading-relaxed text-white/70">
                  Tumia alama ya bookmark kwenye mechi au market inapopatikana ili urudi kuiona. Mechi ikiisha, Bashiri hulinganisha pick na score ya mwisho; iliyosubiri bado haijatatuliwa, na mechi iliyofutwa au kuahirishwa inaweza kuhesabiwa void. Angalia takwimu za matokeo kwa kipindi na market husika—historia si dhamana ya matokeo yajayo.
                </p>
                <div className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-white/50">
                  <BarChart3 size={15} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" />
                  <span>Accuracy huhesabiwa kwenye picks zilizopata matokeo; picks pending na void si ushindi wala kushindwa.</span>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="rounded-2xl bg-white/5 p-4 sm:p-5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-primary)] text-black"><Trophy size={19} /></span>
                  <h3 className="font-semibold text-white">4. Prediction Leagues</h3>
                </div>
                <p className="text-sm leading-relaxed text-white/70">
                  Tengeneza ligi ya siku 7, 30 au 90, kisha shiriki invite link na marafiki. Kila mshiriki anaweza kuweka pick moja kwa mechi kabla ya kickoff. Pick sahihi hupata pointi 3; isiyo sahihi au void hupata 0. Jedwali husasishwa matokeo halisi yanapopatikana.
                </p>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="rounded-2xl bg-white/5 p-4 sm:p-5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-primary)] text-black"><Share2 size={19} /></span>
                  <h3 className="font-semibold text-white">5. Shiriki, jifunze, jadili</h3>
                </div>
                <p className="text-sm leading-relaxed text-white/70">
                  Reels hukuwezesha kushiriki picha au video fupi za michezo na kuingiliana kupitia likes, comments na shares. Tumia maudhui haya kujadili mpira na kubadilishana mawazo; usichukulie post ya mtu kama uthibitisho wa matokeo.
                </p>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="rounded-2xl border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/5 p-4 sm:p-5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <CircleHelp size={20} className="text-[var(--brand-primary)]" />
                  <h3 className="font-semibold text-[var(--brand-primary)]">Kumbuka kucheza kwa uwajibikaji</h3>
                </div>
                <ul className="space-y-2 text-sm leading-relaxed text-white/70">
                  <li>• Utabiri ni makadirio tu; hakuna matokeo yanayohakikishwa.</li>
                  <li>• Tumia Bashiri kwa taarifa na burudani—si ushauri wa kifedha au kamari.</li>
                  <li>• Usikimbilie kufidia hasara, na usihatarishe pesa usizoweza kumudu kupoteza.</li>
                  <li>• Unaweza kujifunza na kushiriki kwenye ligi bila kuweka pesa.</li>
                </ul>
              </motion.section>
            </div>

            <footer className="shrink-0 border-t border-white/10 bg-[#111111] p-4 sm:p-5">
              <button
                type="button"
                onClick={handleClose}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)] font-semibold text-black transition hover:brightness-110"
              >
                Nimeelewa, endelea <Activity size={17} />
              </button>
            </footer>
          </motion.section>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
