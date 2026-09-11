'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Check, Play } from 'lucide-react';

// ============================================
// HERO SECTION
// ============================================
const HeroSection = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#0A0A0A] via-[#111218] to-[#0A0A0A] pt-24 pb-20">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-12">
        {/* Hero Content */}
        <motion.div
          className="space-y-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.05)] px-4 py-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="h-2 w-2 rounded-full bg-[#D4AF37]" />
            <span className="text-sm font-medium text-[#D4AF37]">
              AI-Powered Intelligence
            </span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="space-y-4">
            <span className="block text-5xl md:text-7xl font-bold text-[#F8FAFC] leading-tight">
              See the Game
            </span>
            <span className="block text-5xl md:text-7xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] bg-clip-text text-transparent">
              Differently
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-[#A1A1AA] leading-relaxed">
            AI-driven football predictions powered by advanced statistical models.
            Real-time intelligence for Premier League, La Liga, Bundesliga, and Ligue 1.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <motion.button
              className="group relative px-8 py-4 rounded-lg font-semibold text-[#0A0A0A] overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#F5D77A]" />
              <div className="relative flex items-center gap-2">
                Get Started Free
                <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
              </div>
            </motion.button>

            <motion.button
              className="px-8 py-4 rounded-lg font-semibold text-[#D4AF37] border border-[rgba(212,175,55,0.5)] hover:border-[#D4AF37] transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </motion.button>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          className="mt-20 relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="relative rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[rgba(17,18,24,0.6)] p-1 backdrop-blur-xl overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl" />

            {/* Dashboard Content */}
            <div className="relative bg-gradient-to-b from-[rgba(212,175,55,0.05)] to-[rgba(0,0,0,0.3)] rounded-xl p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Match Card */}
                <div className="col-span-1 md:col-span-2 rounded-lg border border-[rgba(212,175,55,0.2)] bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-sm">
                  <div className="text-xs text-[#A1A1AA] uppercase tracking-wide mb-4">
                    Premier League
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-[#F8FAFC] mb-2">
                        Manchester City
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#87CEEB] to-[#4A90E2] mx-auto" />
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] font-bold text-lg">
                      VS
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-[#F8FAFC] mb-2">
                        Liverpool
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#EF2B2D] to-[#FF6B6B] mx-auto" />
                    </div>
                  </div>
                  <div className="border-t border-[rgba(212,175,55,0.1)] pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[#A1A1AA]">AI Prediction</span>
                      <span className="text-[#22C55E] font-bold">Manchester City Win</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[#A1A1AA]">Confidence</span>
                      <span className="text-[#D4AF37] font-bold">87%</span>
                    </div>
                  </div>
                </div>

                {/* Stats Column */}
                <div className="space-y-4">
                  <div className="rounded-lg border border-[rgba(212,175,55,0.2)] bg-[rgba(255,255,255,0.03)] p-4 backdrop-blur-sm">
                    <div className="text-xs text-[#A1A1AA] mb-2">Form Index</div>
                    <div className="text-3xl font-bold text-[#D4AF37]">91/100</div>
                  </div>
                  <div className="rounded-lg border border-[rgba(212,175,55,0.2)] bg-[rgba(255,255,255,0.03)] p-4 backdrop-blur-sm">
                    <div className="text-xs text-[#A1A1AA] mb-2">Expected Goals</div>
                    <div className="text-3xl font-bold text-[#F8FAFC]">2.8</div>
                  </div>
                  <div className="rounded-lg border border-[rgba(212,175,55,0.2)] bg-[rgba(255,255,255,0.03)] p-4 backdrop-blur-sm">
                    <div className="text-xs text-[#A1A1AA] mb-2">Risk Level</div>
                    <div className="text-lg font-bold text-[#22C55E]">Low</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-[#D4AF37]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================
// WHY SECTION
// ============================================
const WhySection = () => {
  const benefits = [
    {
      icon: '🎯',
      title: 'Advanced AI Models',
      description:
        'Dixon-Coles Poisson Regression algorithm analyzes 50+ data points per match',
    },
    {
      icon: '⚡',
      title: 'Real-Time Intelligence',
      description:
        'Live odds tracking, market movements, and instant confidence updates',
    },
    {
      icon: '📊',
      title: 'Transparent Performance',
      description: 'Track our 85%+ accuracy across all leagues and markets publicly',
    },
    {
      icon: '🏆',
      title: 'Multi-Market Coverage',
      description:
        'Winner, BTTS, Over/Under, Double Chance, Corners, and more in one platform',
    },
  ];

  return (
    <section className="relative py-20 md:py-32 w-full bg-[#0A0A0A]">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#F8FAFC] mb-6">
            Why Top Analysts Choose Bashiri Elite
          </h2>
          <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto">
            Built for professionals who demand accuracy, speed, and depth
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="group relative rounded-xl border border-[rgba(212,175,55,0.2)] bg-[rgba(17,18,24,0.6)] p-8 backdrop-blur-sm hover:border-[rgba(212,175,55,0.4)] transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Content */}
              <div className="relative z-10 space-y-4">
                <div className="text-4xl">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-[#F8FAFC]">
                  {benefit.title}
                </h3>
                <p className="text-[#A1A1AA] leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              {/* Decorative corner */}
              <motion.div
                className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#D4AF37]/20 to-transparent rounded-tl-xl opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// STACKED CARDS SECTION - THE HERO FEATURE
// ============================================
const StackedCardsSection = () => {
  const [activeCard, setActiveCard] = useState(0);

  const cards = [
    {
      id: 1,
      title: 'AI Match Intelligence',
      label: 'Premier League',
      matchUp: { home: 'Manchester City', away: 'Liverpool' },
      prediction: 'Manchester City Win',
      confidence: 87,
      risk: 'Low',
      model: 'Dixon-Coles v2.1',
    },
    {
      id: 2,
      title: 'Team Form & Stats',
      label: 'Form Analysis',
      homeTeam: 'Manchester City',
      homeForm: 'W W D W W',
      homeAttack: 9.2,
      homeDefense: 8.5,
      awayTeam: 'Liverpool',
      awayForm: 'W W L W W',
      awayAttack: 8.8,
      awayDefense: 8.2,
    },
    {
      id: 3,
      title: 'Odds Intelligence',
      label: 'Market Data',
      odds: [
        { market: 'Home Win', current: 1.85, change: '-8%' },
        { market: 'Draw', current: 3.4, change: '+3%' },
        { market: 'Away Win', current: 4.2, change: '+12%' },
      ],
      movement: 'Home Win odds dropped 8%',
    },
    {
      id: 4,
      title: 'Market Analysis',
      label: 'Available Markets',
      markets: [
        '✓ Match Winner (1X2)',
        '✓ Both Teams to Score',
        '✓ Over/Under 2.5 Goals',
        '✓ Double Chance',
        '✓ Correct Score',
        '✓ Corners Over/Under',
      ],
      xG: 2.8,
    },
    {
      id: 5,
      title: 'AI Verdict',
      label: 'Final Prediction',
      prediction: 'Manchester City to Win',
      confidence: 87,
      dataQuality: 'HIGH',
      value: '+18%',
      reasoning:
        'Strong home form combined with superior attacking metrics creates favorable probability profile',
    },
  ];

  return (
    <section className="relative py-20 md:py-32 w-full bg-[#0A0A0A]">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#F8FAFC] mb-4">
            Everything You Need to Read the Game
          </h2>
          <p className="text-[#A1A1AA] text-lg">
            Five layers of intelligent football analysis
          </p>
        </motion.div>

        {/* Card Navigation */}
        <div className="flex justify-center gap-4 mb-12">
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => setActiveCard(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCard === index
                  ? 'bg-[#D4AF37] text-[#0A0A0A]'
                  : 'bg-[rgba(212,175,55,0.1)] text-[#D4AF37] hover:bg-[rgba(212,175,55,0.2)]'
              }`}
            >
              {card.id}
            </button>
          ))}
        </div>

        {/* Active Card */}
        <motion.div
          key={activeCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-[rgba(212,175,55,0.3)] bg-gradient-to-br from-[rgba(17,18,24,0.95)] to-[rgba(11,11,16,0.9)] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
            {/* Card Glow Effect */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Card Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="mb-8">
                <div className="inline-block px-3 py-1 rounded-full bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.3)] mb-6">
                  <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wide">
                    {cards[activeCard].label}
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-[#F8FAFC]">
                  {cards[activeCard].title}
                </h3>
              </div>

              {/* Card-specific content */}
              {activeCard === 0 && (
                <CardContent1 card={cards[activeCard]} />
              )}
              {activeCard === 1 && (
                <CardContent2 card={cards[activeCard]} />
              )}
              {activeCard === 2 && (
                <CardContent3 card={cards[activeCard]} />
              )}
              {activeCard === 3 && (
                <CardContent4 card={cards[activeCard]} />
              )}
              {activeCard === 4 && (
                <CardContent5 card={cards[activeCard]} />
              )}
            </div>

            {/* Card number indicator */}
            <div className="absolute bottom-6 right-6 text-xs font-bold text-[#D4AF37] opacity-40">
              {cards[activeCard].id}/{cards.length}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Card content components
const CardContent1 = ({ card }: any) => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <div className="text-center flex-1">
        <div className="text-2xl font-bold text-[#F8FAFC] mb-2">
          {card.matchUp.home}
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#87CEEB] to-[#4A90E2] mx-auto" />
      </div>
      <div className="px-4 py-2 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] font-bold">
        vs
      </div>
      <div className="text-center flex-1">
        <div className="text-2xl font-bold text-[#F8FAFC] mb-2">
          {card.matchUp.away}
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#EF2B2D] to-[#FF6B6B] mx-auto" />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg bg-[rgba(212,175,55,0.1)] p-4">
        <div className="text-sm text-[#A1A1AA] mb-2">Prediction</div>
        <div className="text-lg font-bold text-[#D4AF37]">{card.prediction}</div>
      </div>
      <div className="rounded-lg bg-[rgba(34,197,94,0.1)] p-4">
        <div className="text-sm text-[#A1A1AA] mb-2">Confidence</div>
        <div className="text-lg font-bold text-[#22C55E]">{card.confidence}%</div>
      </div>
      <div className="rounded-lg bg-[rgba(34,197,94,0.1)] p-4">
        <div className="text-sm text-[#A1A1AA] mb-2">Risk</div>
        <div className="text-lg font-bold text-[#22C55E]">{card.risk}</div>
      </div>
    </div>
  </div>
);

const CardContent2 = ({ card }: any) => (
  <div className="grid grid-cols-2 gap-8">
    <div>
      <h4 className="text-lg font-semibold text-[#F8FAFC] mb-4">
        {card.homeTeam}
      </h4>
      <div className="space-y-3">
        <div>
          <div className="text-xs text-[#A1A1AA] mb-1">Last 5</div>
          <div className="text-sm font-mono text-[#D4AF37]">{card.homeForm}</div>
        </div>
        <div>
          <div className="text-xs text-[#A1A1AA] mb-1">Attack</div>
          <div className="w-full bg-[rgba(212,175,55,0.1)] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F5D77A]"
              style={{ width: `${(card.homeAttack / 10) * 100}%` }}
            />
          </div>
          <div className="text-xs text-[#A1A1AA] mt-1">{card.homeAttack}/10</div>
        </div>
        <div>
          <div className="text-xs text-[#A1A1AA] mb-1">Defense</div>
          <div className="w-full bg-[rgba(34,197,94,0.1)] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-[#22C55E]"
              style={{ width: `${(card.homeDefense / 10) * 100}%` }}
            />
          </div>
          <div className="text-xs text-[#A1A1AA] mt-1">{card.homeDefense}/10</div>
        </div>
      </div>
    </div>

    <div>
      <h4 className="text-lg font-semibold text-[#F8FAFC] mb-4">
        {card.awayTeam}
      </h4>
      <div className="space-y-3">
        <div>
          <div className="text-xs text-[#A1A1AA] mb-1">Last 5</div>
          <div className="text-sm font-mono text-[#D4AF37]">{card.awayForm}</div>
        </div>
        <div>
          <div className="text-xs text-[#A1A1AA] mb-1">Attack</div>
          <div className="w-full bg-[rgba(212,175,55,0.1)] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F5D77A]"
              style={{ width: `${(card.awayAttack / 10) * 100}%` }}
            />
          </div>
          <div className="text-xs text-[#A1A1AA] mt-1">{card.awayAttack}/10</div>
        </div>
        <div>
          <div className="text-xs text-[#A1A1AA] mb-1">Defense</div>
          <div className="w-full bg-[rgba(34,197,94,0.1)] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-[#22C55E]"
              style={{ width: `${(card.awayDefense / 10) * 100}%` }}
            />
          </div>
          <div className="text-xs text-[#A1A1AA] mt-1">{card.awayDefense}/10</div>
        </div>
      </div>
    </div>
  </div>
);

const CardContent3 = ({ card }: any) => (
  <div className="space-y-6">
    <div className="space-y-3">
      {card.odds.map((odd: any, idx: number) => (
        <div
          key={idx}
          className="flex items-center justify-between rounded-lg bg-[rgba(212,175,55,0.05)] p-4"
        >
          <span className="text-[#F8FAFC] font-semibold">{odd.market}</span>
          <div className="flex items-center gap-4">
            <span className="text-[#D4AF37] font-bold text-lg">{odd.current}</span>
            <span
              className={
                odd.change.includes('-')
                  ? 'text-[#22C55E]'
                  : 'text-[#EF4444]'
              }
            >
              {odd.change}
            </span>
          </div>
        </div>
      ))}
    </div>
    <div className="pt-4 border-t border-[rgba(212,175,55,0.2)]">
      <p className="text-sm text-[#A1A1AA]">{card.movement}</p>
      <p className="text-xs text-[#64748B] mt-2">Updated 2 minutes ago</p>
    </div>
  </div>
);

const CardContent4 = ({ card }: any) => (
  <div className="space-y-8">
    <div className="grid grid-cols-2 gap-3">
      {card.markets.map((market: string, idx: number) => (
        <div
          key={idx}
          className="flex items-center gap-3 rounded-lg bg-[rgba(34,197,94,0.05)] p-4"
        >
          <Check className="w-5 h-5 text-[#22C55E]" />
          <span className="text-[#F8FAFC] font-medium">{market.slice(2)}</span>
        </div>
      ))}
    </div>
    <div className="rounded-lg bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 p-6 border border-[rgba(212,175,55,0.3)]">
      <div className="text-sm text-[#A1A1AA] mb-2">Expected Goals</div>
      <div className="text-4xl font-bold text-[#D4AF37]">{card.xG}</div>
      <div className="text-xs text-[#A1A1AA] mt-2">
        Home: 1.6 | Away: 1.2
      </div>
    </div>
  </div>
);

const CardContent5 = ({ card }: any) => (
  <div className="space-y-8">
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg bg-[rgba(34,197,94,0.1)] p-6">
        <div className="text-xs text-[#A1A1AA] mb-2 uppercase tracking-wide">
          Prediction
        </div>
        <div className="text-2xl font-bold text-[#22C55E] leading-tight">
          {card.prediction}
        </div>
      </div>
      <div className="rounded-lg bg-[rgba(212,175,55,0.1)] p-6">
        <div className="text-xs text-[#A1A1AA] mb-2 uppercase tracking-wide">
          Confidence
        </div>
        <div className="text-2xl font-bold text-[#D4AF37]">
          {card.confidence}%
        </div>
      </div>
      <div className="rounded-lg bg-[rgba(59,130,246,0.1)] p-6">
        <div className="text-xs text-[#A1A1AA] mb-2 uppercase tracking-wide">
          Value
        </div>
        <div className="text-2xl font-bold text-[#3B82F6]">{card.value}</div>
      </div>
    </div>

    <div>
      <div className="text-sm text-[#A1A1AA] mb-3">Data Quality</div>
      <div className="inline-flex items-center gap-3 rounded-lg bg-[rgba(34,197,94,0.1)] px-4 py-2">
        <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
        <span className="text-[#22C55E] font-semibold">{card.dataQuality}</span>
      </div>
    </div>

    <p className="text-[#A1A1AA] leading-relaxed italic">
      "{card.reasoning}"
    </p>
  </div>
);

// ============================================
// SOCIAL PROOF SECTION
// ============================================
const SocialProofSection = () => {
  const stats = [
    { label: 'Prediction Accuracy', value: '85%+', icon: '🎯' },
    { label: 'Active Users', value: '50K+', icon: '👥' },
    { label: 'Leagues Covered', value: '4 Major', icon: '🏆' },
    { label: 'Platform Rating', value: '4.8/5', icon: '⭐' },
  ];

  return (
    <section className="py-20 md:py-32 w-full bg-[#0A0A0A]">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#F8FAFC] mb-6">
            Trusted by Football Analysts Worldwide
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-4xl mb-4">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">
                {stat.value}
              </div>
              <div className="text-[#A1A1AA]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// PRICING SECTION
// ============================================
const PricingSection = () => {
  const plans = [
    {
      name: 'Free',
      price: '0',
      period: 'forever',
      description: 'Get started with basic predictions',
      features: [
        'Daily match predictions',
        'Basic market coverage (1X2)',
        'Team form statistics',
        'Limited accuracy stats',
      ],
      cta: 'Start Free',
      highlighted: false,
    },
    {
      name: 'Premium',
      price: '29',
      period: 'per month',
      description: 'Full AI prediction intelligence',
      features: [
        'All free features included',
        'All markets (BTTS, Over/Under, etc)',
        'Expected goals (xG) analysis',
        'Live odds comparison',
        'Priority support',
      ],
      cta: 'Get Premium',
      highlighted: true,
    },
  ];

  return (
    <section className="py-20 md:py-32 w-full bg-gradient-to-b from-[#0A0A0A] to-[#111218]">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#F8FAFC] mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto">
            Start free. Upgrade when you're ready for the full intelligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`rounded-2xl border p-8 md:p-12 transition-all ${
                plan.highlighted
                  ? 'border-[#D4AF37] bg-gradient-to-br from-[rgba(212,175,55,0.1)] to-[rgba(17,18,24,0.6)] shadow-2xl'
                  : 'border-[rgba(212,175,55,0.2)] bg-[rgba(17,18,24,0.6)]'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {plan.highlighted && (
                <div className="inline-block mb-4 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]">
                  <span className="text-xs font-bold text-[#D4AF37] uppercase">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold text-[#F8FAFC] mb-2">
                {plan.name}
              </h3>
              <p className="text-[#A1A1AA] text-sm mb-6">{plan.description}</p>

              <div className="mb-8">
                <span className="text-4xl font-bold text-[#D4AF37]">
                  ${plan.price}
                </span>
                <span className="text-[#A1A1AA] text-sm ml-2">{plan.period}</span>
              </div>

              <button
                className={`w-full py-3 rounded-lg font-semibold mb-8 transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#0A0A0A] hover:shadow-lg hover:shadow-[#D4AF37]/30'
                    : 'border border-[rgba(212,175,55,0.5)] text-[#D4AF37] hover:border-[#D4AF37]'
                }`}
              >
                {plan.cta}
              </button>

              <div className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                    <span className="text-[#F8FAFC]">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// FAQ SECTION
// ============================================
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How accurate are the predictions?',
      a: 'Our AI model maintains 85%+ accuracy across all leagues. We publish weekly performance stats publicly so you can track our accuracy in real-time. Accuracy varies by league and market type.',
    },
    {
      q: 'Which football leagues do you cover?',
      a: 'We currently cover the Premier League, La Liga, Bundesliga, and Ligue 1. We are expanding coverage based on user demand. Custom league requests can be submitted through your account settings.',
    },
    {
      q: 'How does the AI model work?',
      a: 'Bashiri Elite uses the Dixon-Coles Poisson Regression model, an advanced statistical framework that analyzes team form, player performance, home/away advantage, and market data to generate predictions with confidence scores.',
    },
    {
      q: 'What prediction markets are available?',
      a: 'We offer Match Winner (1X2), Both Teams to Score (BTTS), Over/Under Goals, Double Chance, Correct Score, Corners, and more. Premium users get access to all markets simultaneously.',
    },
    {
      q: 'Is this suitable for beginners?',
      a: 'Absolutely! The platform is designed for everyone from casual fans to professional analysts. Free tier provides basic predictions and form data. Premium adds advanced analysis and market intelligence.',
    },
  ];

  return (
    <section className="py-20 md:py-32 w-full bg-[#0A0A0A]">
      <div className="mx-auto max-w-3xl px-6 md:px-12">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#F8FAFC] mb-6">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="rounded-lg border border-[rgba(212,175,55,0.2)] bg-[rgba(17,18,24,0.6)] overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full px-6 py-4 md:py-6 flex items-center justify-between hover:bg-[rgba(212,175,55,0.05)] transition-colors"
              >
                <span className="text-lg font-semibold text-[#F8FAFC] text-left">
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-[#D4AF37]" />
                </motion.div>
              </button>

              <motion.div
                initial={{ height: 0 }}
                animate={{ height: openIndex === index ? 'auto' : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4 md:pb-6 border-t border-[rgba(212,175,55,0.2)]">
                  <p className="text-[#A1A1AA] leading-relaxed">{faq.a}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// FINAL CTA SECTION
// ============================================
const FinalCTASection = () => {
  return (
    <section className="py-20 md:py-32 w-full bg-gradient-to-b from-[#0A0A0A] to-[#111218] relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.15) 0%, transparent 60%)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-[#F8FAFC]">
            Stop Guessing.
            <br />
            <span className="bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] bg-clip-text text-transparent">
              Start Reading the Game.
            </span>
          </h2>

          <p className="text-xl text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
            Join thousands of analysts making smarter predictions powered by AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <motion.button
              className="group relative px-12 py-4 rounded-lg font-bold text-[#0A0A0A] overflow-hidden text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#F5D77A]" />
              <div className="relative">Enter Bashiri Elite</div>
            </motion.button>

            <motion.button
              className="px-12 py-4 rounded-lg font-bold text-[#D4AF37] border-2 border-[#D4AF37] hover:bg-[rgba(212,175,55,0.1)] transition-colors text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Track Record
            </motion.button>
          </div>

          <p className="text-sm text-[#64748B] pt-4">
            Free forever tier available. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function LandingPage() {
  return (
    <main className="w-full bg-[#0A0A0A] overflow-hidden">
      <HeroSection />
      <WhySection />
      <StackedCardsSection />
      <SocialProofSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />

      {/* Footer */}
      <footer className="py-12 md:py-16 w-full border-t border-[rgba(212,175,55,0.2)] bg-[#0A0A0A]">
        <div className="mx-auto max-w-6xl px-6 md:px-12 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-[#D4AF37] mb-2">
              Bashiri Elite
            </h3>
            <p className="text-[#A1A1AA]">
              AI-Powered Football Intelligence
            </p>
          </div>
          <div className="flex items-center justify-center gap-6 mb-8 text-sm text-[#A1A1AA]">
            <a href="#" className="hover:text-[#D4AF37] transition">
              Privacy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-[#D4AF37] transition">
              Terms
            </a>
            <span>•</span>
            <a href="#" className="hover:text-[#D4AF37] transition">
              Contact
            </a>
          </div>
          <p className="text-xs text-[#64748B]">
            © 2024 Bashiri Elite. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}