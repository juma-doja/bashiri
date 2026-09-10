'use client'

import { useEffect, useState } from 'react'
import { Trophy, Medal, Crown, Star, TrendingUp, Flame, Target, Award, Zap } from 'lucide-react'
import { getTipLeaderboard } from '@/lib/api/tips'

interface Tipster {
  rank: number
  user: {
    id: number
    username: string
    avatar_url?: string
    tipster_score?: number
    verified_tipster?: boolean
  }
  total_tips: number
  accuracy_percentage: number
  current_streak: number
  best_streak: number
  recent_form_correct: number
  recent_form_tips: number
  level?: number
  experience_points?: number
  ai_agreement_score?: number
  achievement_count?: number
}

export function TipstersLeaderboard() {
  const [tipsters, setTipsters] = useState<Tipster[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'all' | 'week' | 'month'>('all')

  useEffect(() => {
    loadLeaderboard()
  }, [period])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('period', period)
      params.append('limit', '50')
      const data = await getTipLeaderboard(params)
      setTipsters(data.results || [])
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={20} className="text-yellow-400" />
      case 2:
        return <Medal size={20} className="text-gray-300" />
      case 3:
        return <Medal size={20} className="text-amber-600" />
      default:
        return <span className="text-sm font-bold text-white/60">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-[#15130e] border-[#D4AF37]/35 shadow-lg shadow-[#D4AF37]/10'
      case 2:
        return 'bg-[#121315] border-white/20 shadow-lg shadow-white/5'
      case 3:
        return 'bg-[#15120f] border-amber-500/30 shadow-lg shadow-amber-600/10'
      case 4:
        return 'bg-[#10151b] border-blue-400/25 shadow-md shadow-blue-500/10'
      case 5:
        return 'bg-[#14121b] border-purple-400/25 shadow-md shadow-purple-500/10'
      default:
        return 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white/50">Loading top tipsters...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Trophy size={20} className="text-[#D4AF37] sm:size-24" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Top Tipsters</h2>
            <p className="text-xs sm:text-sm text-white/50">Best performers based on accuracy, tips count & streak</p>
          </div>
        </div>
        
        {/* Period Filter */}
        <div className="flex gap-2">
          {(['all', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                period === p
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#CFAF7B] text-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2 sm:space-y-3">
        {tipsters.map((tipster) => (
          <div
            key={tipster.user.id}
            className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border transition-all hover:-translate-y-0.5 ${getRankBadge(tipster.rank)}`}
          >
            {/* Header - Rank and User Info */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Rank */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0">
                {getRankIcon(tipster.rank)}
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#CFAF7B] flex items-center justify-center overflow-hidden">
                    {tipster.user.avatar_url ? (
                      <img
                        src={tipster.user.avatar_url}
                        alt={tipster.user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm sm:text-lg font-bold text-black">
                        {tipster.user.username[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {tipster.user.verified_tipster && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-[#D4AF37] rounded-full p-0.5 sm:p-1">
                      <Award size={8} className="text-black sm:size-10" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-sm font-bold text-white truncate">@{tipster.user.username}</p>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                    {tipster.user.tipster_score && tipster.user.tipster_score >= 90 && (
                      <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 bg-[#D4AF37]/20 rounded-full border border-[#D4AF37]/30">
                        <Star size={6} className="text-[#D4AF37] sm:size-8" />
                        <span className="text-[10px] sm:text-[10px] font-bold text-[#D4AF37]">{tipster.user.tipster_score}</span>
                      </div>
                    )}
                    {tipster.current_streak >= 3 && (
                      <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 bg-orange-500/20 rounded-full border border-orange-500/30">
                        <Flame size={6} className="text-orange-400 sm:size-8" />
                        <span className="text-[10px] sm:text-[10px] font-bold text-orange-400">{tipster.current_streak} streak</span>
                      </div>
                    )}
                    {tipster.level !== undefined && (
                      <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 bg-purple-500/20 rounded-full border border-purple-500/30">
                        <Zap size={6} className="text-purple-400 sm:size-8" />
                        <span className="text-[10px] sm:text-[10px] font-bold text-purple-400">Lvl {tipster.level}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats - Full width on mobile, row on desktop */}
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <p className="text-[11px] sm:text-xs font-semibold text-[#D4AF37]">Accuracy</p>
                <p className="text-lg sm:text-xl font-black text-white">{tipster.accuracy_percentage}%</p>
              </div>
              <div className="flex-1 sm:flex-none">
                <p className="text-[11px] sm:text-xs font-semibold text-white/50">Tips</p>
                <p className="text-lg sm:text-xl font-black text-white">{tipster.total_tips}</p>
              </div>
              <div className="flex-1 sm:flex-none">
                <p className="text-[11px] sm:text-xs font-semibold text-white/50">Best Streak</p>
                <p className="text-lg sm:text-xl font-black text-white">{tipster.best_streak}</p>
              </div>
              {/* Gamification Stats */}
              {tipster.level !== undefined && (
                <>
                  <div className="flex-1 sm:flex-none hidden sm:block">
                    <p className="text-[11px] sm:text-xs font-semibold text-purple-400">Level</p>
                    <p className="text-lg sm:text-xl font-black text-white">{tipster.level}</p>
                  </div>
                  {tipster.achievement_count !== undefined && tipster.achievement_count > 0 && (
                    <div className="flex-1 sm:flex-none hidden sm:block">
                      <p className="text-[11px] sm:text-xs font-semibold text-yellow-400">Badges</p>
                      <p className="text-lg sm:text-xl font-black text-white">{tipster.achievement_count}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {tipsters.length === 0 && (
        <div className="text-center py-12 rounded-xl bg-gray-900/20 border border-gray-700/20">
          <Trophy size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-sm text-white/50">No tipsters found</p>
        </div>
      )}
    </div>
  )
}
