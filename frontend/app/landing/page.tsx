"use client";

import React, {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  ChevronDown,
  CircleDot,
  Gauge,
  Goal,
  LineChart,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

/* ============================================================================
   BASHIRI ELITE — CINEMATIC RESPONSIVE LANDING
   ============================================================================ */

type AnalysisAccent =
  | "gold"
  | "blue"
  | "green"
  | "purple"
  | "orange";

type AnalysisStep = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: AnalysisAccent;
};

const ANALYSIS_STEPS: AnalysisStep[] = [
  {
    id: "01",
    eyebrow: "AI TABIRI",
    title: "Tambua kwa ujasiri.",
    description:
      "Bashiri inachanganya fomu, nguvu ya timu, mabao yanayotarajiwa na ishara za uwezekano ili kubadilisha data mbichi ya soka kuwa wazo la mechi lililo wazi.",
    accent: "blue",
  },
  {
    id: "02",
    eyebrow: "SOKO LA VIDOKEZO",
    title: "Fuata vidokezo vilivyo na uthibitisho.",
    description:
      "Gundua vidokezo vilivyothibitishwa, linganisha watendaji wanaofanya vizuri na uone chaguzi bora kutoka kwa jamii kwa uwajibikaji wa kweli.",
    accent: "green",
  },
  {
    id: "03",
    eyebrow: "BASHIRI MIC",
    title: "Shiriki hisia za mechi.",
    description:
      "Tuma miitikio, klipu na matukio ya siku ya mechi ili kila mchezo muhimu uwe uzoefu wa kijamii zaidi ya alama tu.",
    accent: "gold",
  },
  {
    id: "04",
    eyebrow: "PULSE NA ISHARA ZA MOJA KWA MOJA",
    title: "Fuatilia mabadiliko ya moja kwa moja.",
    description:
      "Fuatilia viwango vya moja kwa moja, mabadiliko ya pulse na arifa za kasi kadri mechi inavyobadilika kwa wakati halisi.",
    accent: "purple",
  },
  {
    id: "05",
    eyebrow: "GAMIFICATION",
    title: "Jenga streaks na tuzo.",
    description:
      "Badilisha tabia za ubashiri kuwa streaks, ratiba za viongozi, beji na sababu yenye nguvu ya kurudi tena.",
    accent: "orange",
  },
];

/* ============================================================================
   HELPER FUNCTIONS
   ============================================================================ */

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(value: number) {
  const x = clamp(value);
  return 1 - Math.pow(1 - x, 3);
}

function safeViewportHeight() {
  return Math.max(
    window.innerHeight,
    document.documentElement.clientHeight || 0,
  );
}

/* ============================================================================
   HERO SECTION
   ============================================================================ */

function HeroSection() {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [verbIndex, setVerbIndex] = useState(0);

  const verbs = [
    "Ona picha kamili.",
    "Ona ishara.",
    "Elewa nambari.",
    "Pata faida.",
  ];

  useEffect(() => {
    const currentVerb = verbs[verbIndex];
    const typingSpeed = 80;
    const deletingSpeed = 40;
    const pauseAfterTyping = 1500;
    const pauseAfterDeleting = 500;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (text.length < currentVerb.length) {
          setText(currentVerb.slice(0, text.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseAfterTyping);
        }
      } else {
        if (text.length > 0) {
          setText(currentVerb.slice(0, text.length - 1));
        } else {
          setIsDeleting(false);
          setVerbIndex((current) => (current + 1) % verbs.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, verbIndex, verbs]);

  return (
    <section className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-[#0A1628]">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(/bashiri_new.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />

      {/* Overlay */}
      <div
        className="absolute inset-0 z-0 bg-[#05070B]/30"
        aria-hidden="true"
      />

      {/* Ambient effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      >
        <div className="absolute left-[4%] top-[16%] h-[280px] w-[280px] rounded-full bg-[#2563EB]/10 blur-[100px] sm:h-[380px] sm:w-[380px] sm:blur-[125px] lg:h-[420px] lg:w-[420px] lg:blur-[140px]" />
        <div className="absolute right-[-8%] top-[32%] h-[320px] w-[320px] rounded-full bg-[#D4A72C]/[0.06] blur-[110px] sm:h-[420px] sm:w-[420px] sm:blur-[140px] lg:h-[520px] lg:w-[520px] lg:blur-[160px]" />
        <div className="absolute bottom-[-12%] left-[28%] h-[300px] w-[300px] rounded-full bg-[#7C3AED]/[0.06] blur-[110px] lg:h-[480px] lg:w-[480px] lg:blur-[160px]" />
      </div>

      {/* Grid pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.028] z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1280px] flex-col justify-center px-4 pb-16 pt-24 sm:px-8 sm:pb-24 lg:px-12 lg:pb-28 lg:pt-40">
        <div className="max-w-5xl">
          <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-2 backdrop-blur-xl sm:mb-7 sm:px-4">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-50 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
            </span>
            <span className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-white/65 sm:text-[11px] sm:tracking-[0.18em]">
              Injini ya Bashiri
            </span>
          </div>

          <h1 className="max-w-5xl text-[clamp(42px,5vw,96px)] font-black leading-[0.9] tracking-[-0.065em] text-white drop-shadow-[0_18px_32px_rgba(0,0,0,0.28)]">
            <span className="block">Acha kukisia.</span>
            <span className="mt-3 block bg-gradient-to-r from-[#D4A72C] via-[#F3D56A] to-white bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(212,167,44,0.35)]">
              {text}
              <span className="inline-block w-0.5 h-[0.6em] bg-[#D4A72C] ml-1 animate-[cursorBlink_1s_infinite]" />
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-[15px] leading-7 text-white/55 sm:mt-8 sm:text-lg sm:leading-8">
            Bashiri inabadilisha data ya soka kuwa uelewa wa kimfumo — ikichanganya aina ya timu, nguvu za timu, miundo ya mabao, ishara za soko na hoja za AI katika mtazamo wa mechi mmoja ulio wazi.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:mt-9 sm:w-auto sm:flex-row">
            <a
              href="/login?tab=register"
              className="group inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#2563EB] px-6 text-sm font-bold text-white shadow-[0_18px_50px_rgba(37,99,235,.22)] transition-all hover:-translate-y-0.5 hover:bg-[#3474F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070B] sm:w-auto sm:px-7"
            >
              Fikia Bashiri
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>

            <a
              href="#intelligence"
              className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-6 text-sm font-bold text-white/80 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070B] sm:w-auto sm:px-7"
            >
              <Play className="h-4 w-4 fill-current" />
              Angalia jinsi inavyofanya kazi
            </a>
          </div>
        </div>

        {/* Floating metrics */}
        <div className="relative mt-14 hidden h-24 w-full lg:mt-16 lg:block">
          <FloatingMetric
            className="left-[2%] top-3 animate-[floatA_6s_ease-in-out_infinite]"
            icon={<Target className="h-4 w-4" />}
            label="Ujasiri"
            value="87%"
          />
          <FloatingMetric
            className="left-[24%] top-8 animate-[floatB_7s_ease-in-out_infinite]"
            icon={<TrendingUp className="h-4 w-4" />}
            label="Ishara ya modeli"
            value="Imara"
          />
          <FloatingMetric
            className="right-[26%] top-0 animate-[floatA_7s_ease-in-out_infinite_reverse]"
            icon={<Goal className="h-4 w-4" />}
            label="Mabao yanayotarajiwa"
            value="2.8"
          />
          <FloatingMetric
            className="right-[2%] top-10 animate-[floatB_6s_ease-in-out_infinite_reverse]"
            icon={<Gauge className="h-4 w-4" />}
            label="Hatari"
            value="Ndogo"
          />
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 z-15 h-20 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(5, 7, 11, 0.95))",
        }}
        aria-hidden="true"
      />

      {/* Scroll indicator */}
      <a
        href="#intelligence"
        aria-label="Sogeza hadi uelewa wa Bashiri"
        className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3 text-white/35 transition-colors hover:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-4 focus-visible:ring-offset-[#05070B] sm:bottom-7"
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Sogeza</span>
        <span className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
          <span className="h-2 w-1 rounded-full bg-white/60 animate-[scrollDot_1.7s_ease-in-out_infinite] motion-reduce:animate-none" />
        </span>
      </a>
    </section>
  );
}

function FloatingMetric({
  className,
  icon,
  label,
  value,
}: {
  className: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className={`absolute flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0C111B]/80 px-4 py-3 shadow-2xl backdrop-blur-xl ${className}`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#38BDF8]/10 text-[#67ceff]">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">{label}</div>
        <div className="mt-0.5 text-sm font-bold text-white">{value}</div>
      </div>
    </div>
  );
}

/* ============================================================================
   INTELLIGENCE TRACK
   ============================================================================ */

function IntelligenceTrack() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const wordsRef = useRef<HTMLUListElement | null>(null);

  const rafRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  const metricsRef = useRef({
    viewportWidth: 0,
    stageHeight: 0,
    tileSize: 160,
    sectionSpan: 1,
    wordStarts: [] as number[],
    wordDurations: [] as number[],
    wordEnterY: [] as number[],
  });

  const wordData = [
    { label: "Tabiri za AI", icon: <Brain />, className: "text-[#38BDF8]", iconClass: "bg-[#38BDF8] text-[#06131a]" },
    { label: "Soko la Vidokezo", icon: <Users />, className: "text-[#86EFAC]", iconClass: "bg-[#22C55E] text-[#052E16]" },
    { label: "Bashiri Mic", icon: <Play />, className: "text-[#F3D56A]", iconClass: "bg-[#D4A72C] text-[#17120A]" },
    { label: "Pulse na Ishara za Moja kwa Moja", icon: <TrendingUp />, className: "text-[#C4B5FD]", iconClass: "bg-[#7C3AED] text-white" },
    { label: "Gamification", icon: <Trophy />, className: "text-[#FDBA74]", iconClass: "bg-[#EA580C] text-white" },
  ];

  const cardPaths = [
    { sx: -0.94, sy: -0.62, rx: -0.08, ry: -0.18, z: 2 },
    { sx: -0.42, sy: -1.02, rx: 0.04, ry: -0.08, z: 5 },
    { sx: 0.02, sy: 0.94, rx: -0.06, ry: 0.02, z: 1 },
    { sx: 0.46, sy: 0.98, rx: 0.08, ry: 0.14, z: 4 },
    { sx: 0.82, sy: 0.64, rx: 0.12, ry: 0.18, z: 3 },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const headline = headlineRef.current;
    const cardsWrap = cardsRef.current;
    const wordList = wordsRef.current;

    if (!section || !stage || !headline || !cardsWrap || !wordList) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = media.matches;

    const words = Array.from(wordList.querySelectorAll<HTMLElement>("[data-track-word]"));
    const cards = Array.from(cardsWrap.querySelectorAll<HTMLElement>("[data-track-card]"));

    if (!words.length || !cards.length) return;

    if (media.matches) {
      section.classList.remove("is-armed");
      cards.forEach((card) => {
        card.style.opacity = "1";
        card.style.transform = "none";
      });
      words.forEach((word) => {
        word.style.opacity = "1";
        word.style.transform = "none";
      });
      return;
    }

    cards.forEach((card, index) => {
      card.style.zIndex = String(cardPaths[index].z);
      card.style.willChange = "transform, opacity";
    });

    words.forEach((word) => {
      word.style.willChange = "transform, opacity";
    });

    section.classList.add("is-armed");

    const state = metricsRef.current;

    const measure = () => {
      const viewportWidth = window.innerWidth;
      const stageHeight = stage.offsetHeight || safeViewportHeight();

      const isPhone = viewportWidth <= 640;
      const isTablet = viewportWidth > 640 && viewportWidth <= 1024;

      const tileWidthFactor = isPhone ? 0.62 : isTablet ? 0.36 : 0.42;
      const tileHeightFactor = isPhone ? 0.22 : isTablet ? 0.26 : 0.28;

      const tileSize = Math.round(
        Math.max(
          isPhone ? 112 : 126,
          Math.min(
            isPhone ? 154 : 210,
            cardsWrap.clientWidth * tileWidthFactor,
            stageHeight * tileHeightFactor,
          ),
        ),
      );

      state.viewportWidth = viewportWidth;
      state.stageHeight = stageHeight;
      state.tileSize = tileSize;

      section.style.setProperty("--bashiri-tile", `${tileSize}px`);

      const runwayVh = isPhone ? 330 : isTablet ? 365 : 440;
      section.style.height = `${Math.max(stageHeight * 2, (stageHeight * runwayVh) / 100)}px`;

      const span = Math.max(1, section.offsetHeight - stageHeight);
      state.sectionSpan = span;

      words.forEach((word) => {
        word.style.transform = "none";
      });

      const listTop = wordList.getBoundingClientRect().top;
      const listHeight = wordList.offsetHeight;

      const land = isPhone ? 0.58 : isTablet ? 0.56 : 0.55;
      const fall = isPhone ? 0.075 : isTablet ? 0.09 : 0.105;

      state.wordEnterY = [];
      state.wordStarts = [];
      state.wordDurations = [];

      words.forEach((word, index) => {
        const relativeTop = word.getBoundingClientRect().top - listTop;
        const enterY = (stageHeight + listHeight) / 2 - relativeTop + (isPhone ? 20 : 30);
        const duration = Math.max(0.07, Math.min(0.22, enterY / span));

        state.wordEnterY[index] = enterY;
        state.wordDurations[index] = duration;
        state.wordStarts[index] = land + index * fall - duration;
      });
    };

    const paint = () => {
      if (reducedMotionRef.current) return;

      const span = state.sectionSpan;
      if (!span) return;

      const progress = clamp(-section.getBoundingClientRect().top / span);

      const fly = easeOutCubic(clamp(progress / 0.4));
      const headlineExit = clamp((progress - 0.38) / 0.12);
      const stackExit = clamp((progress - 0.4) / 0.13);

      const isPhone = state.viewportWidth <= 640;
      const isTablet = state.viewportWidth > 640 && state.viewportWidth <= 1024;

      const headlineFloor = isPhone ? 0.72 : isTablet ? 0.66 : 0.48;

      headline.style.opacity = String(1 - headlineExit);

      const headlineScale = (1 - (1 - headlineFloor) * fly) * (1 - 0.3 * headlineExit);
      headline.style.transform = `translate3d(0, ${-42 * headlineExit}px, 0) scale(${headlineScale})`;

      const pileScale = 1 - 0.7 * stackExit;
      const verticalExit = isPhone ? 260 : isTablet ? 340 : 440;

      cards.forEach((card, index) => {
        const path = cardPaths[index];
        const fromX = path.sx * state.viewportWidth;
        const fromY = path.sy * state.stageHeight;

        const x = fromX + (path.rx * state.tileSize - fromX) * fly;
        const y = fromY + (path.ry * state.tileSize - fromY) * fly;

        card.style.opacity = String(1 - stackExit);
        card.style.transform = `
          translate3d(
            ${x * pileScale}px,
            ${y * pileScale - verticalExit * stackExit}px,
            0
          )
          scale(${(1.08 - 0.08 * fly) * pileScale})
        `;
      });

      words.forEach((word, index) => {
        const duration = state.wordDurations[index] ?? 0.1;
        const start = state.wordStarts[index] ?? 0;
        const enterY = state.wordEnterY[index] ?? 100;
        const progressForWord = clamp((progress - start) / duration);

        word.style.opacity = String(progressForWord > 0 ? 1 : 0);
        word.style.transform = `translate3d(0, ${enterY * (1 - progressForWord)}px, 0)`;
      });
    };

    const requestPaint = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        paint();
      });
    };

    let lastWidth = 0;
    let lastHeight = 0;

    const remeasure = (force = false) => {
      const width = window.innerWidth;
      const height = safeViewportHeight();

      if (!force && width === lastWidth && Math.abs(height - lastHeight) < 80) {
        return;
      }

      lastWidth = width;
      lastHeight = height;

      measure();
      requestPaint();
    };

    const onResize = () => {
      remeasure(false);
    };

    const onOrientationChange = () => {
      window.requestAnimationFrame(() => {
        remeasure(true);
      });
    };

    remeasure(true);

    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onOrientationChange, { passive: true });

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      window.removeEventListener("scroll", requestPaint);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientationChange);
    };
  }, []);

  return (
    <section id="intelligence" ref={sectionRef} className="bashiri-track relative w-full scroll-mt-24 bg-[#05070B]">
      <div ref={stageRef} className="bashiri-track-stage relative mx-auto flex min-h-[100svh] items-center justify-center overflow-hidden px-4 py-16 sm:px-8 lg:px-12">
        <h2 ref={headlineRef} className="bashiri-track-head relative z-[1] mx-auto mb-8 max-w-[10ch] text-center text-[clamp(44px,7vw,132px)] font-black leading-[0.82] tracking-[-0.07em] text-[#D4A72C]">
          Ona picha kamili.
        </h2>

        <div ref={cardsRef} className="pointer-events-none absolute inset-0 z-[3]" aria-hidden="true">
          <TrackTile data-track-card className="bg-[#1E3A8A] text-[#BFDBFE]" icon={<Brain />} label="AI TABIRI" main="Tambua kwa ujasiri." sub="Fomu, xG na ishara za uwezekano" />
          <TrackTile data-track-card className="bg-[#14532D] text-[#BBF7D0]" icon={<Users />} label="SOKO LA VIDOKEZO" main="Chaguzi zilizoathibitishwa" sub="Linganisha watendaji wakuu" />
          <TrackTile data-track-card className="bg-[#713F12] text-[#FEF08A]" icon={<Play />} label="BASHIRI MIC" main="Shiriki tukio" sub="Miitikio, klipu na sauti ya siku ya mechi" />
          <TrackTile data-track-card className="bg-[#4C1D95] text-[#DDD6FE]" icon={<TrendingUp />} label="PULSE NA ISHARA ZA MOJA KWA MOJA" main="Fuatilia mabadiliko" sub="Viwango, pulse na arifa za kasi" />
          <TrackTile data-track-card className="bg-[#7C2D12] text-[#FED7AA]" icon={<Trophy />} label="GAMIFICATION" main="Jenga streaks" sub="Beji, nafasi na tuzo" />
        </div>

        <ul ref={wordsRef} className="pointer-events-none relative z-[5] m-0 flex w-full max-w-[94vw] list-none flex-col items-center justify-center gap-2 p-0 sm:gap-3">
          {wordData.map((word) => (
            <li key={word.label} data-track-word className="flex w-full max-w-full items-center justify-center gap-2 opacity-0 sm:gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${word.iconClass}`}>
                <div className="h-4 w-4 sm:h-5 sm:w-5">{React.cloneElement(word.icon as React.ReactElement)}</div>
              </span>
              <span className={`max-w-[82vw] break-words text-center text-[clamp(28px,4.8vw,64px)] font-black leading-none tracking-[-0.055em] ${word.className}`}>
                {word.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TrackTile({
  className,
  icon,
  label,
  main,
  sub,
  ...props
}: {
  className: string;
  icon: ReactNode;
  label: string;
  main: string;
  sub: string;
  [key: string]: unknown;
}) {
  return (
    <div
      {...props}
      className={`bashiri-track-tile absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col justify-between overflow-hidden rounded-[20px] p-4 shadow-[0_24px_60px_rgba(0,0,0,.42)] sm:rounded-[28px] sm:p-6 ${className}`}
    >
      <div aria-hidden="true" className="absolute -bottom-10 -right-8 text-[100px] font-black leading-none opacity-[0.08] sm:text-[130px]">
        B
      </div>

      <div className="relative z-10 flex min-w-0 items-center gap-2 text-[9px] font-black tracking-[0.13em] opacity-75 sm:text-[10px] sm:tracking-[0.15em]">
        <div className="h-4 w-4 shrink-0">{React.cloneElement(icon as React.ReactElement)}</div>
        <span className="truncate">{label}</span>
      </div>

      <div className="relative z-10 min-w-0">
        <div className="truncate text-[clamp(16px,2vw,26px)] font-black tracking-[-0.04em]">{main}</div>
        <div className="mt-1 truncate text-[9px] font-semibold opacity-65 sm:text-xs">{sub}</div>
      </div>
    </div>
  );
}

/* ============================================================================
   INTELLIGENCE INTRO
   ============================================================================ */

function IntelligenceIntro() {
  return (
    <section className="relative bg-[#05070B] px-5 py-24 sm:px-8 sm:py-28 md:py-40">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-[9px] font-black uppercase tracking-[0.24em] text-[#D4A72C] sm:text-[10px]">
          INJINI YA BASHIRI
        </span>

        <h2 className="mt-5 text-[clamp(30px,4vw,58px)] font-black leading-[0.94] tracking-[-0.06em] text-white">
          Tabaka tano.
          <br />
          <span className="text-white/35">Uamuzi mmoja unaoeleweka.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-7 text-white/50 sm:mt-7 sm:text-lg sm:leading-8">
          Bashiri haulazii mechi kwa namba moja tu. Hujenga picha kutoka kwa ishara nyingi, kisha inabadilisha picha hiyo kuwa kitu unachoweza kuelewa kwa urahisi.
        </p>
      </div>
    </section>
  );
}

/* ============================================================================
   PINNED ANALYSIS DECK — CENTERED CARDS
   ============================================================================ */

function TypewriterText({ active, text }: { active: boolean; text: string }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (!active) {
      setDisplayText("");
      return;
    }

    let index = 0;
    const timer = setInterval(() => {
      setDisplayText(text.slice(0, index + 1));
      index += 1;

      if (index >= text.length) {
        clearInterval(timer);
      }
    }, 35);

    return () => clearInterval(timer);
  }, [active, text]);

  return (
    <span>
      {displayText}
      {active && displayText.length < text.length && (
        <span className="ml-0.5 inline-block h-[0.85em] w-[2px] animate-pulse bg-[#D4A72C] align-middle" />
      )}
    </span>
  );
}

function AnalysisDeck() {
  const [active, setActive] = useState(0);

  const activeStep = ANALYSIS_STEPS[active];

  const accentStyles = {
    blue: "from-[#38BDF8]/25 via-[#38BDF8]/10 to-transparent",
    green: "from-[#22C55E]/25 via-[#22C55E]/10 to-transparent",
    gold: "from-[#D4A72C]/25 via-[#D4A72C]/10 to-transparent",
    purple: "from-[#7C3AED]/25 via-[#7C3AED]/10 to-transparent",
    orange: "from-[#EA580C]/25 via-[#EA580C]/10 to-transparent",
  } as const;

  return (
    <section id="analysis" className="relative scroll-mt-24 overflow-hidden bg-[#05070B] px-4 py-20 sm:px-8 sm:py-28 md:py-40">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,167,44,0.08),transparent_38%),radial-gradient(circle_at_right,_rgba(37,99,235,0.12),transparent_42%)]"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[9px] font-black uppercase tracking-[0.24em] text-[#D4A72C] sm:text-[10px]">
            INJINI YA BASHIRI
          </span>

          <h2 className="mt-5 text-[clamp(30px,4vw,58px)] font-black leading-[0.94] tracking-[-0.06em] text-white">
            Tabaka tano.
            <br />
            <span className="text-white/35">Uamuzi mmoja unaoeleweka.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-7 text-white/50 sm:mt-7 sm:text-lg sm:leading-8">
            Bashiri haulazii mechi kwa namba moja tu. Hujenga picha kutoka kwa ishara nyingi, kisha inabadilisha picha hiyo kuwa kitu unachoweza kuelewa kwa urahisi.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-stretch">
          <div className="space-y-3">
            {ANALYSIS_STEPS.map((step, index) => {
              const isActive = active === index;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`group relative w-full overflow-hidden rounded-[22px] border p-4 text-left transition-all duration-300 sm:p-5 ${
                    isActive
                      ? "border-[#D4A72C]/40 bg-[#0F172A] shadow-[0_22px_50px_rgba(0,0,0,0.35)]"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  }`}
                >
                  <div
                    aria-hidden="true"
                    className={`absolute inset-0 opacity-0 transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "group-hover:opacity-100"
                    } bg-gradient-to-r ${accentStyles[step.accent]}`}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black tracking-[0.18em] text-[#D4A72C]">
                          {step.id}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/35">
                          {step.eyebrow}
                        </span>
                      </div>

                      {isActive && (
                        <span className="rounded-full border border-[#D4A72C]/35 bg-[#D4A72C]/10 px-2 py-1 text-[7px] font-black uppercase tracking-[0.14em] text-[#F3D56A]">
                          Moja kwa moja
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-xl font-black tracking-[-0.04em] text-white">
                      <TypewriterText active={isActive} text={step.title} />
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-white/45">
                      {step.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#0B1019] shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accentStyles[activeStep.accent]}`}
            />

            <div className="relative z-10 flex h-full min-h-[520px] flex-col">
              <div className="flex items-center justify-between border-b border-white/[0.08] bg-black/10 px-4 py-3.5 sm:px-6 sm:py-4">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#D4A72C] shadow-[0_0_16px_rgba(212,167,44,0.7)]" />
                  <div className="text-[8px] font-black uppercase tracking-[0.18em] text-white/45 sm:text-[9px]">
                    {activeStep.eyebrow}
                  </div>
                </div>
                <div className="text-[9px] font-black text-white/20 sm:text-[10px]">
                  {activeStep.id}/05
                </div>
              </div>

              <div className="border-b border-white/[0.06] bg-white/[0.015] px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">
                      Tabaka la sasa
                    </div>
                    <h3 className="mt-2 text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">
                      <TypewriterText active={true} text={activeStep.title} />
                    </h3>
                  </div>

                  <div className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-white/50">
                    Injini ya Bashiri
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden p-4 sm:p-6 md:p-8">
                {active === 0 && <FormPanel />}
                {active === 1 && <StrengthPanel />}
                {active === 2 && <GoalsPanel />}
                {active === 3 && <MarketsPanel />}
                {active === 4 && <VerdictPanel />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnalysisCard({
  step,
  index,
}: {
  step: AnalysisStep;
  index: number;
}) {
  const accentGlow =
    step.accent === "blue"
      ? "bg-[#2563EB]/20"
      : step.accent === "green"
        ? "bg-[#22C55E]/15"
        : step.accent === "gold"
          ? "bg-[#D4A72C]/20"
          : step.accent === "purple"
            ? "bg-[#7C3AED]/20"
            : "bg-[#EA580C]/20";

  return (
    <article data-analysis-card className="absolute left-1/2 top-1/2 h-full w-full max-w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-white/10 bg-[#0C111B] p-3 shadow-[0_30px_90px_rgba(0,0,0,.48)] sm:rounded-[28px] sm:p-5 md:p-7">
      <div data-analysis-copy className="absolute left-5 right-5 top-5 z-30 lg:hidden">
        <div className="text-[8px] font-black tracking-[0.18em] text-[#D4A72C] sm:text-[9px] sm:tracking-[0.2em]">
          {step.eyebrow}
        </div>
        <h3 className="mt-2 max-w-[86%] text-lg font-black tracking-[-0.04em] text-white sm:text-xl">
          {step.title}
        </h3>
      </div>

      <div className="relative flex h-full flex-col overflow-hidden rounded-[17px] border border-white/10 bg-[#080B12] sm:rounded-[22px]">
        <div aria-hidden="true" className={`pointer-events-none absolute -right-28 -top-28 h-64 w-64 rounded-full blur-[80px] sm:h-80 sm:w-80 sm:blur-[100px] ${accentGlow}`} />

        <div className="relative z-20 flex min-w-0 items-center justify-between border-b border-white/[0.08] px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="h-2 w-2 shrink-0 rounded-full bg-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,.6)]" />
            <span className="truncate text-[8px] font-bold uppercase tracking-[0.12em] text-white/35 sm:text-[9px] sm:tracking-[0.16em]">
              BASHIRI / UELEWA WA MECHI
            </span>
          </div>
          <span className="ml-3 shrink-0 text-[9px] font-black text-white/20 sm:text-[10px]">
            {step.id}/05
          </span>
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 items-center overflow-y-auto p-4 sm:p-7 md:p-8">
          {index === 0 && <FormPanel />}
          {index === 1 && <StrengthPanel />}
          {index === 2 && <GoalsPanel />}
          {index === 3 && <MarketsPanel />}
          {index === 4 && <VerdictPanel />}
        </div>
      </div>
    </article>
  );
}

/* ============================================================================
   ANALYSIS PANELS
   ============================================================================ */

function FormPanel() {
  return (
    <div className="w-full min-w-0">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#60A5FA] sm:text-[10px] sm:tracking-[0.2em]">
            Mwangaza wa Premier League
          </div>
          <div className="mt-2 break-words text-xl font-black tracking-[-0.04em] text-white sm:text-3xl">
            Manchester City
            <span className="mx-2 text-white/20 sm:mx-3">vs</span>
            Liverpool
          </div>
        </div>
        <div className="w-fit rounded-full border border-[#2563EB]/20 bg-[#2563EB]/10 px-3 py-1.5 text-[8px] font-bold text-[#60A5FA] sm:text-[9px]">
          ISHARA YA UBASHIRI
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <TeamForm team="Manchester City" form={["W", "W", "D", "W", "W"]} attack={92} defense={85} />
        <TeamForm team="Liverpool" form={["W", "W", "L", "W", "W"]} attack={88} defense={82} />
      </div>

      <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
        <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span className="text-white/40">Uamuzi wa modeli</span>
          <span className="font-bold text-[#60A5FA]">Manchester City kushinda</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA]" />
        </div>
      </div>
    </div>
  );
}

function TeamForm({
  team,
  form,
  attack,
  defense,
}: {
  team: string;
  form: string[];
  attack: number;
  defense: number;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
      <div className="break-words text-sm font-bold text-white">{team}</div>

      <div className="mt-4 flex gap-1.5">
        {form.map((result, index) => (
          <span
            key={`${result}-${index}`}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-black ${
              result === "W"
                ? "bg-[#22C55E]/15 text-[#86EFAC]"
                : result === "D"
                  ? "bg-[#D4A72C]/15 text-[#F3D56A]"
                  : "bg-[#EF4444]/15 text-[#FCA5A5]"
            }`}
          >
            {result}
          </span>
        ))}
      </div>

      <MiniBar label="Mashambulizi" value={attack} />
      <MiniBar label="Ulinzi" value={defense} />
    </div>
  );
}

function MiniBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-4">
      <div className="mb-1.5 flex justify-between text-[9px] font-bold uppercase tracking-wider">
        <span className="text-white/35">{label}</span>
        <span className="text-white/55">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function StrengthPanel() {
  return (
    <div className="w-full min-w-0">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#86EFAC] sm:text-[10px] sm:tracking-[0.2em]">
            Jamii iliyothibitishwa
          </div>
          <div className="mt-2 text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">
            Soko la Vidokezo
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-[8px] uppercase tracking-widest text-white/30">Chaguo la juu</div>
          <div className="text-lg font-black text-[#86EFAC]">+18% faida</div>
        </div>
      </div>

      <div className="space-y-4">
        <StrengthRow team="Aisha K." value={89} color="bg-[#22C55E]" />
        <StrengthRow team="Nando T." value={84} color="bg-[#2563EB]" />
        <StrengthRow team="Musa R." value={79} color="bg-[#D4A72C]" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 min-[400px]:grid-cols-3">
        <MetricBox label="Ufasaha wastani" value="82%" />
        <MetricBox label="Wafuasi" value="14.3K" />
        <MetricBox label="Chaguzi za moto" value="26" />
      </div>
    </div>
  );
}

function StrengthRow({ team, value, color }: { team: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="min-w-0 break-words font-semibold text-white/65">{team}</span>
        <span className="shrink-0 font-black text-white">{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/[0.07]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
      <div className="text-[8px] font-bold uppercase tracking-widest text-white/30">{label}</div>
      <div className="mt-1 text-sm font-black text-white">{value}</div>
    </div>
  );
}

function GoalsPanel() {
  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#F3D56A] sm:text-[10px] sm:tracking-[0.2em]">
            Bashiri Mic
          </div>
          <div className="mt-2 text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">
            Matukio ya mechi yanayoleta hisia.
          </div>
        </div>
        <div className="w-fit rounded-xl bg-[#D4A72C]/10 px-4 py-3 text-center">
          <div className="text-[8px] font-bold uppercase tracking-widest text-white/30">Video mpya</div>
          <div className="mt-1 text-2xl font-black text-[#F3D56A]">12</div>
        </div>
      </div>

      <div className="mt-7 grid gap-4 min-[430px]:grid-cols-2">
        <GoalProbability label="Alama ya hisia" value="92%" percentage={92} />
        <GoalProbability label="Ufikiaji wa miitikio" value="78%" percentage={78} />
      </div>

      <div className="mt-5 rounded-2xl border border-[#D4A72C]/15 bg-[#D4A72C]/[0.04] p-4 sm:p-5">
        <div className="flex flex-col gap-2 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between">
          <span className="text-xs font-semibold text-white/45">Mtiririko wa miitikio ya moja kwa moja</span>
          <span className="text-xl font-black text-[#F3D56A]">Tazama nguvu ya hadhira</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
          <div className="h-full w-[84%] rounded-full bg-[#D4A72C]" />
        </div>
      </div>
    </div>
  );
}

function GoalProbability({ label, value, percentage }: { label: string; value: string; percentage: number }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
      <div className="break-words text-xs font-semibold text-white/45">{label}</div>
      <div className="mt-2 text-3xl font-black text-white">{value}</div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="h-full rounded-full bg-[#D4A72C]" style={{ width: `${percentage}%` }} />
      </div>
      <div className="mt-2 text-[9px] font-bold text-white/30">MCHANGO WA MODELI {percentage}%</div>
    </div>
  );
}

function MarketsPanel() {
  const markets = [
    ["Viwango vya moja kwa moja", "1.85", "Imara"],
    ["Mtiririko", "64%", "Inakua"],
    ["Chaguo la thamani", "+18%", "Faida bora"],
    ["Arifa ya kucheza", "Mabao ya mapema", "Hatari kubwa"],
  ];

  return (
    <div className="w-full min-w-0">
      <div className="mb-6">
        <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#C4B5FD] sm:text-[10px] sm:tracking-[0.2em]">
          Pulse na ishara za moja kwa moja
        </div>
        <div className="mt-2 text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">
          Fuatilia mechi inavyosogea.
        </div>
      </div>

      <div className="space-y-2">
        {markets.map(([market, odds, movement]) => (
          <div key={market} className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-3.5 sm:px-4">
            <span className="min-w-0 break-words text-xs font-semibold text-white/65">{market}</span>
            <div className="flex shrink-0 items-center gap-3 sm:gap-5">
              <span className="text-sm font-black text-white">{odds}</span>
              <span
                className={`text-[10px] font-black ${
                  movement === "Imara" || movement === "Inakua" || movement === "Faida bora"
                    ? "text-[#86EFAC]"
                    : "text-[#FCA5A5]"
                }`}
              >
                {movement}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-[#7C3AED]/20 bg-[#7C3AED]/[0.06] p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#C4B5FD]" />
          <span className="text-xs font-bold leading-5 text-[#DDD6FE]">
            Ishara za moja kwa moja husaidia watumiaji kutambua mabadiliko kabla soko kubwa halijitikia.
          </span>
        </div>
      </div>
    </div>
  );
}

function VerdictPanel() {
  return (
    <div className="w-full min-w-0">
      <div className="text-center">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#FDBA74] sm:text-[10px] sm:tracking-[0.22em]">
          Gamification
        </div>
        <div className="mt-3 break-words text-[clamp(28px,4vw,44px)] font-black tracking-[-0.06em] text-white">
          Jenga streaks.
          <span className="mt-1 block text-[#FDBA74]">Panua kiwango.</span>
        </div>
      </div>

      <div className="mx-auto mt-7 grid max-w-xl grid-cols-1 gap-3 min-[400px]:grid-cols-3">
        <VerdictMetric label="Streak ya sasa" value="8 wins" />
        <VerdictMetric label="Pointi" value="1,240" />
        <VerdictMetric label="Nafasi" value="#12" />
      </div>

      <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-[#EA580C]/20 bg-[#EA580C]/[0.05] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Brain className="mt-0.5 h-5 w-5 shrink-0 text-[#FDBA74]" />
          <p className="text-sm leading-6 text-white/55">
            Bashiri inatupa motisha kwa uthabiti, inahimiza ushindani na kugeuza tabia za ubashiri kuwa uzoefu wa jamii wa muda mrefu.
          </p>
        </div>
      </div>
    </div>
  );
}

function VerdictMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-center">
      <div className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/30">{label}</div>
      <div className="mt-2 text-lg font-black text-white">{value}</div>
    </div>
  );
}

/* ============================================================================
   REMAINING SECTIONS
   ============================================================================ */

function TrackRecord() {
  const stats = [
    { value: "AI", label: "Tabiri", icon: <Brain /> },
    { value: "Tips", label: "Soko", icon: <Users /> },
    { value: "Mic", label: "Miitikio ya video", icon: <Play /> },
    { value: "Pulse", label: "Ishara za moja kwa moja", icon: <TrendingUp /> },
    { value: "Odds", label: "Masoko ya moja kwa moja", icon: <Target /> },
    { value: "XP", label: "Tuzo", icon: <Trophy /> },
  ];

  return (
    <section id="performance" className="relative scroll-mt-24 bg-[#070A10] px-4 py-20 sm:px-8 sm:py-28 md:py-40">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[9px] font-black uppercase tracking-[0.24em] text-[#D4A72C] sm:text-[10px] sm:tracking-[0.25em]">
            UTENDAJI
          </span>
          <h2 className="mt-5 text-[clamp(30px,4vw,56px)] font-black leading-[0.95] tracking-[-0.06em] text-white">
            Uelewa unaoweza kupimika.
          </h2>
          <p className="mt-5 text-[15px] leading-7 text-white/45 sm:mt-6 sm:text-lg">
            Bashiri imejengwa ili kufanya utendaji uonekane wazi: ubora wa ubashiri, ubora wa vidokezo vya jamii, ishara za moja kwa moja na ushirikiano wa siku ya mechi vyote viko mahali mmoja.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.08] min-[500px]:grid-cols-2 md:mt-16 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-[#0A0E16] p-6 text-center sm:p-8">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-[#D4A72C]">
                <div className="h-5 w-5">{React.cloneElement(stat.icon as React.ReactElement)}</div>
              </div>
              <div className="mt-5 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white/30 sm:text-[10px]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketsSection() {
  const markets = [
    { icon: <Target />, title: "AI Tabiri", text: "Pata maarifa ya mechi yenye uwezekano ulio wazi, yaliyojengwa kutoka kwa fomu, xG, nguvu za timu na ishara za moja kwa moja." },
    { icon: <Users />, title: "Soko la Vidokezo", text: "Fuata vidokezo vilivyothibitishwa, linganisha mitindo na ugundue chaguzi zinazotokana na jamii." },
    { icon: <Play />, title: "Bashiri Mic", text: "Shiriki miitikio ya video, matukio ya mechi na hisia za mashabiki karibu na kila mechi muhimu." },
    { icon: <TrendingUp />, title: "Pulse na Ishara za Moja kwa Moja", text: "Fuatilia mabadiliko ya mtiririko, harakati za bei na arifa za kucheza kwa wakati halisi." },
    { icon: <BarChart3 />, title: "Viwango vya Moja kwa Moja", text: "Pata bei za viwango za bookmaker kwa wakati halisi bila kuondoka kwenye flow ya Bashiri." },
    { icon: <LineChart />, title: "Rekodi ya Ufuatiliaji", text: "Tazama jinsi mapendekezo ya zamani, masoko na simu za AI zilivyofanya kwa muda." },
    { icon: <Trophy />, title: "Gamification", text: "Jenga streaks, fungua tuzo na ugeuze tabia za ubashiri kuwa changamoto kubwa zaidi." },
    { icon: <Sparkles />, title: "Bashiri Music", text: "Leta mazingira ya siku ya mechi kwa muziki, hisia na uzoefu wa mashabiki uliojaa zaidi." },
  ];

  return (
    <section id="markets" className="relative scroll-mt-24 overflow-hidden bg-[#05070B] px-4 py-20 sm:px-8 sm:py-28 md:py-40">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.07),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <span className="text-[9px] font-black uppercase tracking-[0.24em] text-[#60A5FA] sm:text-[10px] sm:tracking-[0.25em]">
            INJINI MOJA / MASOKO MENGI
          </span>
          <h2 className="mt-5 text-[clamp(30px,4vw,56px)] font-black leading-[0.95] tracking-[-0.06em] text-white">
            Jukwaa moja.
            <br />
            <span className="text-white/30">Njia nane za kufuatilia mchezo.</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {markets.map((market, index) => (
            <div key={market.title} className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-all duration-500 hover:-translate-y-1 hover:border-white/[0.15] hover:bg-white/[0.04] sm:p-6">
              <div aria-hidden="true" className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#2563EB]/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#60A5FA]">
                  <div className="h-5 w-5">{React.cloneElement(market.icon as React.ReactElement)}</div>
                </div>
                <div className="mt-6 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                  0{index + 1}
                </div>
                <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-white">
                  {market.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/40">{market.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="relative scroll-mt-24 bg-[#070A10] px-4 py-20 sm:px-8 sm:py-28 md:py-40">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[9px] font-black uppercase tracking-[0.24em] text-[#D4A72C] sm:text-[10px] sm:tracking-[0.25em]">
            UPATIKANAJI
          </span>
          <h2 className="mt-5 text-[clamp(30px,4vw,54px)] font-black leading-[0.95] tracking-[-0.06em] text-white">
            Anza ndani ya jukwaa.
            <br />
            <span className="text-white/30">Boresha wakati unapotaka uzoefu kamili wa Bashiri.</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-4 md:mt-14 md:grid-cols-3">
          <PricingCard
            name="Bure"
            price="TZS 0"
            description="Anza kwa misingi na uangalie uzoefu wa Bashiri."
            features={[
              "Tabiri za mechi za kila siku",
              "Ishara za AI za msingi",
              "Muhtasari wa form ya timu",
              "Ufikiaji mdogo wa rekodi ya ufuatiliaji",
            ]}
            button="Anza Bure"
            href="/login?tab=register"
          />

          <PricingCard
            name="Wiki 1"
            price="TZS 1,500"
            description="Fungua mpango wa ufikiaji wa Bashiri wa kila wiki unaotumika kwenye app."
            features={[
              "Kila kitu kilicho kwenye Bure",
              "Ufikiaji wa usajili wa kila wiki",
              "Uelewa kamili wa mechi",
              "Maarifa ya masoko ya premium",
            ]}
            button="Chagua Wiki"
            href="/subscribe?plan=weekly"
          />

          <PricingCard
            name="Mwezi 1"
            price="TZS 6,000"
            description="Fungua mpango kamili wa kila mwezi ambao tayari upo ndani ya Bashiri."
            features={[
              "Kila kitu kilicho kwenye Wiki 1",
              "Ufikiaji kamili wa kila mwezi",
              "Vipengele vya kipaumbele vya siku ya mechi",
              "Uzoefu kamili wa Bashiri PRO",
            ]}
            button="Chagua Mwezi"
            href="/subscribe?plan=monthly"
            featured
          />
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  button,
  href,
  featured = false,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  button: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-6 sm:p-9 ${
        featured
          ? "border-[#D4A72C]/35 bg-gradient-to-br from-[#D4A72C]/[0.08] to-[#0A0E16]"
          : "border-white/[0.08] bg-[#0A0E16]"
      }`}
    >
      {featured && (
        <div className="absolute right-4 top-4 rounded-full border border-[#D4A72C]/30 bg-[#D4A72C]/10 px-3 py-1 text-[8px] font-black uppercase tracking-[0.15em] text-[#F3D56A] sm:right-5 sm:top-5">
          Maarufu zaidi
        </div>
      )}

      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 sm:text-[10px]">
        {name}
      </div>

      <div className="mt-5 flex items-end gap-2">
        <span className="text-5xl font-black tracking-[-0.07em] text-white">{price}</span>
        {name !== "Bure" && (
          <span className="pb-2 text-xs text-white/30">/ mwezi</span>
        )}
      </div>

      <p className="mt-4 max-w-sm text-sm leading-6 text-white/40">{description}</p>

      <a
        href={href}
        className={`mt-7 flex min-h-12 w-full items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A72C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A10] ${
          featured
            ? "bg-[#D4A72C] text-[#17120A] hover:bg-[#E4B83C]"
            : "border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
        }`}
      >
        {button}
      </a>

      <div className="mt-8 space-y-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-3 text-sm leading-6 text-white/65">
            <Check className="mt-1 h-4 w-4 shrink-0 text-[#22C55E]" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  const faqs = [
    {
      q: "Bashiri inatengeneza tabiri vipi?",
      a: "Bashiri inachanganya uundaji wa takwimu, nguvu ya timu, fomu ya hivi majuzi, matarajio ya mabao na akili ya masoko ili kutoa uwezekano uliopangwa na ishara ya mwisho ya mechi.",
    },
    {
      q: "Bashiri inahakikisha ushindi wa beti?",
      a: "Hapana. Soka bado ni mchezo wa kutofautisha. Bashiri inatoa uwezekano na uelewa, si ahadi za ushindi. Utendaji unapaswa kutathminiwa kwa sampuli yenye maana badala ya mechi moja.",
    },
    {
      q: "Ni masoko gani yanayoegemezwa?",
      a: "Jukwaa limeundwa kuzunguka mshindi wa mechi, mabao, BTTS, double chance, correct score na akili ya ziada ya masoko.",
    },
    {
      q: "Naweza kuona kiwango cha ujasiri cha modeli?",
      a: "Ndiyo. Bashiri imeundwa kuonyesha ujasiri na ishara za msaada ili watumiaji kuelewa kwanini tabiri ilitolewa.",
    },
    {
      q: "Bashiri inafaa kwa wanaoanza?",
      a: "Ndiyo. Kiolesura kimeundwa kuonyesha ishara muhimu kwanza huku bado kikifungua fursa kwa watumiaji wa hali ya juu kupata uelewa wa kina wa mechi.",
    },
  ];

  return (
    <section className="bg-[#05070B] px-4 py-20 sm:px-8 sm:py-28 md:py-40">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="text-[9px] font-black uppercase tracking-[0.24em] text-[#D4A72C] sm:text-[10px] sm:tracking-[0.25em]">
            MASWALI
          </span>
          <h2 className="mt-5 text-[clamp(30px,4vw,52px)] font-black leading-[0.95] tracking-[-0.06em] text-white">
            Kabla ya kuingia.
          </h2>
        </div>

        <div className="mt-10 space-y-2 sm:mt-12">
          {faqs.map((faq, index) => {
            const isOpen = open === index;

            return (
              <div key={faq.q} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="flex min-h-16 w-full items-center justify-between gap-5 px-4 py-5 text-left transition-colors hover:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/25 sm:px-6"
                >
                  <span className="min-w-0 break-words text-sm font-bold leading-6 text-white sm:text-base">
                    {faq.q}
                  </span>

                  <ChevronDown
                    aria-hidden="true"
                    className={`h-5 w-5 shrink-0 text-white/30 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${
                    isOpen
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="border-t border-white/[0.08] px-4 py-5 text-sm leading-7 text-white/45 sm:px-6">
                      <TypewriterText active={isOpen} text={faq.a} />
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#05070B] px-4 pb-16 pt-6 sm:px-8 sm:pb-24 md:pb-32">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111A2A] via-[#0A0F19] to-[#11100A] px-5 py-16 text-center sm:rounded-[32px] sm:px-12 sm:py-20 md:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2563EB]/[0.08] blur-[110px] sm:h-[500px] sm:w-[700px] sm:blur-[140px]" />

        <div className="relative">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D4A72C]/20 bg-[#D4A72C]/10 text-[#F3D56A]">
            <Brain className="h-5 w-5" />
          </div>

          <h2 className="mx-auto mt-7 max-w-4xl text-[clamp(32px,5vw,72px)] font-black leading-[0.92] tracking-[-0.065em] text-white">
            Jiunge na app iliyojengwa kwa
            <span className="block text-[#D4A72C]">akili ya soka.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-7 text-white/45 sm:mt-7 sm:text-lg">
            Ingia ndani ya Bashiri na uone kinachotokea wakati soka linachanganuliwa
            kama data, uwezekano na akili.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-9 sm:flex-row">
            <a
              href="/login?tab=register"
              className="group inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#2563EB] px-7 text-sm font-black text-white shadow-[0_20px_60px_rgba(37,99,235,.22)] transition hover:-translate-y-0.5 hover:bg-[#3474F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111A2A] sm:w-auto sm:px-8"
            >
              Ingia Bashiri
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>

            <a
              href="/login"
              className="inline-flex min-h-14 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-7 text-sm font-bold text-white/75 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111A2A] sm:w-auto sm:px-8"
            >
              Ingia
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#05070B] px-4 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xl font-black tracking-[-0.04em] text-white">
            Bashiri<span className="text-[#D4A72C]">.</span>
          </div>
          <p className="mt-2 text-xs text-white/30">
            Uelewa wa soka unaoendeshwa na AI.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold text-white/35">
          <a href="#intelligence" className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
            Uelewa
          </a>
          <a href="#" className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
            Faragha
          </a>
          <a href="#" className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
            Masharti
          </a>
          <a href="#" className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
            Mawasiliano
          </a>
        </nav>

        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">
          © 2026 Bashiri
        </div>
      </div>
    </footer>
  );
}

/* ============================================================================
   MAIN PAGE
   ============================================================================ */

export default function LandingPage() {
  return (
    <main className="min-h-screen w-full max-w-full overflow-x-clip bg-[#05070B] text-white">
      <header
        className="sticky top-0 z-50 border-b border-white/10 shadow-[0_12px_42px_rgba(0,0,0,0.38)]"
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(18px) saturate(1.2)",
          WebkitBackdropFilter: "blur(18px) saturate(1.2)",
        }}
      >
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/bashiri-mark-gold.svg"
              alt="Bashiri"
              className="h-9 w-9 object-contain sm:h-10 sm:w-10"
            />
            <span className="text-xl font-bold text-white sm:text-2xl" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Bashiri
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#intelligence" className="text-sm text-white/70 transition-colors hover:text-white">Uelewa</a>
            <a href="#analysis" className="text-sm text-white/70 transition-colors hover:text-white">Uchambuzi</a>
            <a href="#markets" className="text-sm text-white/70 transition-colors hover:text-white">Masoko</a>
            <a href="#pricing" className="text-sm text-white/70 transition-colors hover:text-white">Bei</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/login"
              className="rounded-xl px-3 py-2 text-xs font-medium text-white/90 transition-colors hover:text-white sm:px-4 sm:text-sm"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              Ingia
            </a>
            <a
              href="/login?tab=register"
              className="rounded-xl px-3 py-2 text-xs font-bold text-black transition-all hover:scale-[1.02] sm:px-4 sm:text-sm"
              style={{
                background: "var(--color-gold, #D4A72C)",
              }}
            >
              Jisajili
            </a>
          </div>
        </div>
      </header>

      <HeroSection />
      <IntelligenceTrack />
      <AnalysisDeck />
      <TrackRecord />
      <MarketsSection />
      <PricingSection />
      <FAQSection />
      <FinalCTA />
      <Footer />

      <style jsx global>{`
        :root {
          color-scheme: dark;
        }

        html {
          scroll-behavior: smooth;
          scroll-padding-top: 88px;
          background: #05070b;
        }

        body {
          margin: 0;
          min-width: 320px;
          max-width: 100%;
          overflow-x: hidden;
          background: #05070b;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        img,
        svg,
        video,
        canvas {
          max-width: 100%;
          height: auto;
          display: block;
        }

        button,
        a {
          -webkit-tap-highlight-color: transparent;
        }

        ::selection {
          background: #d4a72c;
          color: #17120a;
        }

        .bashiri-track {
          min-height: 100svh;
          isolation: isolate;
        }

        .bashiri-track-stage {
          position: relative;
        }

        .bashiri-track-tile {
          width: var(--bashiri-tile, 180px);
          height: var(--bashiri-tile, 180px);
          opacity: 0;
          contain: layout paint style;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .bashiri-track.is-armed .bashiri-track-stage {
          position: sticky;
          top: 0;
          min-height: 100svh;
          height: 100svh;
        }

        .bashiri-deck {
          min-height: 100svh;
          isolation: isolate;
        }

        .bashiri-deck > div {
          overflow: hidden;
        }

        @keyframes scrollDot {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0;
          }
          30%,
          70% {
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 14px, 0);
            opacity: 0;
          }
        }

        @keyframes floatA {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -8px, 0);
          }
        }

        @keyframes floatB {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, 7px, 0);
          }
        }

        @keyframes cursorBlink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }

        @media (max-width: 1024px) {
          .bashiri-track-tile {
            border-radius: 20px;
          }
          .bashiri-deck > div {
            min-height: 100svh;
          }
        }

        @media (max-width: 640px) {
          html {
            scroll-behavior: smooth;
          }
          .bashiri-track-tile {
            border-radius: 18px;
          }
          .bashiri-track.is-armed .bashiri-track-stage {
            min-height: 100svh;
            height: 100svh;
          }
        }

        @media (max-width: 380px) {
          .bashiri-track.is-armed .bashiri-track-stage {
            padding-left: 12px;
            padding-right: 12px;
          }
          .bashiri-track-tile {
            border-radius: 17px;
          }
        }

        @supports (padding: max(0px)) {
          body {
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
          }
          .bashiri-track-stage {
            padding-bottom: max(1rem, env(safe-area-inset-bottom));
          }
        }

        @supports (height: 100dvh) {
          .bashiri-track-stage {
            min-height: 100dvh;
          }
          .bashiri-deck > div {
            min-height: 100dvh;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
          *,
          *::before,
          *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
          .bashiri-track {
            min-height: auto;
          }
          .bashiri-track-stage {
            position: relative !important;
            min-height: auto !important;
            height: auto !important;
            overflow: visible;
            padding-top: 7rem;
            padding-bottom: 7rem;
          }
          .bashiri-track-tile {
            display: none;
          }
          .bashiri-track-head {
            opacity: 1 !important;
            transform: none !important;
          }
          [data-track-word] {
            opacity: 1 !important;
            transform: none !important;
          }
          .bashiri-deck {
            min-height: auto;
          }
          .bashiri-deck > div {
            position: relative !important;
            top: auto !important;
            min-height: auto !important;
            height: auto !important;
            overflow: visible;
          }
        }
      `}</style>
    </main>
  );
}