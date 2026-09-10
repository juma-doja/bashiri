'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Zap,
  Users,
  Share2,
  Target,
  Award,
  Star,
  Flame,
  Copy,
  Check,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import {
  getUserProgress,
  getDailyChallenges,
  generateReferralCode,
  recordSocialShare,
  type UserProgressResponse,
  type ChallengesResponse,
} from '@/lib/api/gamification';

const achievementLabels: Record<string, { label: string; icon: any; color: string }> = {
  FIRST_WIN: { label: 'Mshindi wa Kwanza', icon: Trophy, color: 'text-[#F5D98B]' },
  STREAK_5: { label: 'Streak ya 5', icon: Flame, color: 'text-orange-400' },
  STREAK_10: { label: 'Streak ya 10', icon: Flame, color: 'text-red-400' },
  DERBY_SPECIALIST: { label: 'Derby Specialist', icon: Star, color: 'text-violet-400' },
  WEEKLY_CHAMPION: { label: 'Mshindi wa Wiki', icon: Award, color: 'text-sky-400' },
  MONTHLY_CHAMPION: { label: 'Mshindi wa Mwezi', icon: Award, color: 'text-emerald-400' },
  CENTURY_TIPSTER: { label: 'Tipster wa 100', icon: Target, color: 'text-cyan-400' },
  PERFECT_WEEK: { label: 'Wiki Bora', icon: Star, color: 'text-pink-400' },
  AI_MASTER: { label: 'AI Master', icon: Zap, color: 'text-indigo-400' },
  EARLY_BIRD: { label: 'Early Bird', icon: Sun, color: 'text-amber-400' },
  SOCIAL_BUTTERFLY: { label: 'Social Butterfly', icon: Share2, color: 'text-rose-400' },
  REFERRAL_HERO: { label: 'Referral Hero', icon: Users, color: 'text-emerald-400' },
};

function Sun(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

export default function GamificationPage() {
  const { user } = useAuthStore();
  const [progress, setProgress] = useState<UserProgressResponse | null>(null);
  const [challenges, setChallenges] = useState<ChallengesResponse | null>(null);
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralLink, setReferralLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [progressData, challengesData] = await Promise.all([
        getUserProgress(),
        getDailyChallenges(),
      ]);
      setProgress(progressData);
      setChallenges(challengesData);
    } catch (error) {
      console.error('Failed to load gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReferral = async () => {
    try {
      const data = await generateReferralCode();
      setReferralCode(data.referral_code);
      setReferralLink(data.referral_link);
    } catch (error) {
      console.error('Failed to generate referral code:', error);
    }
  };

  const handleCopyReferral = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async (contentType: string, contentId: number) => {
    try {
      const actualContentId = contentType === 'profile' ? user?.id : contentId;
      await recordSocialShare('WHATSAPP', contentType, actualContentId || 0);
      loadData();
    } catch (error) {
      console.error('Failed to record share:', error);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-dvh overflow-hidden bg-[#0A0A0A] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.18),transparent_28%)]" />
        <div className="relative mx-auto flex min-h-dvh max-w-7xl items-center justify-center px-4">
          <div className="w-full max-w-md rounded-[28px] border border-[#D4AF37]/20 bg-[#111218]/90 p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10">
              <Award className="h-7 w-7 text-[#F5D98B]" />
            </div>
            <p className="text-xl font-bold tracking-tight text-white">Inapakia...</p>
            <p className="mt-2 text-sm text-white/60">Tunajenga data ya gamification kwa dakika chache.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#0A0A0A] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.14),transparent_24%)]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#F5D98B]">
              <Award className="h-3.5 w-3.5" />
              Bashiri Rewards
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">Gamification</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">
            Pata XP, badges, na tuzo zako zote kwenye moja kwa moja kwenye app yetu.
          </p>
        </motion.div>

        {progress && (
          <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 rounded-[28px] border border-[#D4AF37]/20 bg-[linear-gradient(135deg,rgba(212,175,55,0.2),rgba(20,24,31,0.96),rgba(27,93,160,0.18))] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.35)] sm:p-6 lg:p-7"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="w-full lg:max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                    <Award className="h-6 w-6 text-[#F5D98B]" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white sm:text-3xl">Level {progress.progress.level}</div>
                    <div className="text-sm text-white/70">{progress.progress.experience_points} XP</div>
                  </div>
                </div>

                <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.progress.level_progress}%` }}
                    className="h-full rounded-full bg-[linear-gradient(90deg,#F5D98B,#D4AF37)]"
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="mt-2 text-xs text-white/60 sm:text-sm">
                  {progress.progress.current_level_xp} / {progress.progress.next_level_xp} XP hadi level inayofuata
                </div>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:max-w-[540px]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
                  <Flame className="mx-auto mb-2 h-6 w-6 text-orange-400" />
                  <div className="text-xl font-black text-white">{progress.progress.current_streak}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">Streak</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
                  <Trophy className="mx-auto mb-2 h-6 w-6 text-[#F5D98B]" />
                  <div className="text-xl font-black text-white">{progress.progress.longest_streak}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">Bora</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
                  <Target className="mx-auto mb-2 h-6 w-6 text-emerald-400" />
                  <div className="text-xl font-black text-white">{progress.progress.total_tips_created}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">Tips</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
                  <Star className="mx-auto mb-2 h-6 w-6 text-sky-400" />
                  <div className="text-xl font-black text-white">{progress.progress.ai_agreement_score}%</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">AI Score</div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {progress && progress.achievements.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-[28px] border border-white/10 bg-[#111218]/80 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6"
          >
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
              <Trophy className="h-6 w-6 text-[#F5D98B]" />
              Badges Zako
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {progress.achievements.map((achievement, index) => {
                const config = achievementLabels[achievement.achievement_type] || {
                  label: achievement.achievement_type,
                  icon: Award,
                  color: 'text-gray-400',
                };
                const Icon = config.icon;

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-2xl border border-white/10 bg-[#181B22] p-4 text-center transition-colors hover:border-[#D4AF37]/30"
                  >
                    <Icon className={`mx-auto mb-2 h-10 w-10 ${config.color}`} />
                    <div className="text-sm font-semibold text-white">{config.label}</div>
                    <div className="mt-1 text-[11px] text-white/50">
                      {new Date(achievement.earned_at).toLocaleDateString('sw-KE')}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {challenges && challenges.challenges.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-[28px] border border-white/10 bg-[#111218]/80 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6"
          >
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
              <Target className="h-6 w-6 text-emerald-400" />
              Changamoto za Leo
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {challenges.challenges.map((challenge) => {
                const userChallenge = challenges.user_progress.find((uc) => uc.challenge.id === challenge.id);
                const progressValue = userChallenge ? (userChallenge.current_value / challenge.target_value) * 100 : 0;
                const completed = userChallenge?.completed || false;

                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`rounded-2xl border p-4 sm:p-5 ${
                      completed ? 'border-emerald-500/60 bg-emerald-500/5' : 'border-white/10 bg-[#181B22]'
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-white">{challenge.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-white/60">{challenge.description}</p>
                      </div>
                      {completed && (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15">
                          <Check className="h-4 w-4 text-emerald-400" />
                        </div>
                      )}
                    </div>

                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="text-sm text-white/80">
                        {userChallenge?.current_value || 0} / {challenge.target_value}
                      </div>
                      <div className="text-sm font-semibold text-[#F5D98B]">+{challenge.reward_xp} XP</div>
                    </div>

                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progressValue, 100)}%` }}
                        className={`h-full rounded-full ${completed ? 'bg-emerald-400' : 'bg-[#3B82F6]'}`}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-[28px] border border-[#22C55E]/30 bg-[linear-gradient(135deg,rgba(34,197,94,0.22),rgba(13,148,136,0.12),rgba(17,18,24,0.96))] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.35)] sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white sm:text-2xl">Mwaliko wa Marafiki</h2>
                <p className="text-sm text-white/70">Pata 100 XP kwa kila rafiki anayewasilisha.</p>
              </div>
            </div>
          </div>

          {!referralCode ? (
            <button
              onClick={handleGenerateReferral}
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#0f172a] transition hover:bg-white/90 sm:w-auto"
            >
              Tengeneza Msimbo wa Mwaliko
            </button>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/60">Msimbo wako</div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <code className="break-all text-base font-mono font-bold text-white sm:text-xl">{referralCode}</code>
                  <button
                    onClick={handleCopyReferral}
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/10 p-2.5 text-white transition hover:bg-white/20"
                    aria-label="Copy referral link"
                  >
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-white/80">
                <span className="font-semibold text-white">Share link:</span>{' '}
                <span className="break-all font-mono text-white/90">{referralLink}</span>
              </div>
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] border border-white/10 bg-[#111218]/80 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6"
        >
          <h2 className="mb-3 flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
            <Share2 className="h-6 w-6 text-pink-400" />
            Share na Pata XP
          </h2>
          <p className="mb-4 text-sm text-white/60">Share tips zako kwa marafiki na uongeze XP kwenye profile yako.</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              onClick={() => handleShare('profile', 0)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#22C55E] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#16a34a] sm:flex-none"
            >
              <Share2 className="h-4 w-4" />
              WhatsApp
            </button>
            <button
              onClick={() => handleShare('profile', 0)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#2563EB] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#1d4ed8] sm:flex-none"
            >
              <Share2 className="h-4 w-4" />
              Facebook
            </button>
            <button
              onClick={() => handleShare('profile', 0)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0EA5E9] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#0284c7] sm:flex-none"
            >
              <Share2 className="h-4 w-4" />
              Twitter
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
