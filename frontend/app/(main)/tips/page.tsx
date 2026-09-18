'use client'

import { useEffect, useState } from 'react'
import { useTipsStore } from '@/stores/tips.store'
import { useFetchTips } from '@/hooks/useTips'
import { TipCard } from '@/components/tips/TipCard'
import { TrophyLoader } from '@/components/ui/Skeleton'
import { TipFilter } from '@/components/tips/TipFilter'
import { TipstersLeaderboard } from '@/components/tips/TipstersLeaderboard'
import { useRouter } from 'next/navigation'
import { Loader, ArrowLeft, Plus, TrendingUp, Flame, Brain, Users, Target, Zap, Clock, Sparkles, Trophy, ChevronDown, ChevronUp, Filter, Star } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'

export default function TipsPage() {
  const router = useRouter()
  const { tips, filters, isLoading, error } = useTipsStore()
  const { fetchTips } = useFetchTips(filters)
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'trending' | 'ai_aligned' | 'hot_form' | 'pending'>('all')
  const [showMoreTabs, setShowMoreTabs] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchTips()
  }, [filters, activeTab])

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    const newFilters = { ...filters }
    
    switch (tab) {
      case 'following':
        newFilters.following = true
        newFilters.user = undefined
        newFilters.status = undefined
        break
      case 'trending':
        newFilters.sort = 'engagement'
        newFilters.following = undefined
        newFilters.status = undefined
        break
      case 'ai_aligned':
        newFilters.sort = 'ai_agrees'
        newFilters.following = undefined
        newFilters.status = undefined
        break
      case 'hot_form':
        newFilters.sort = 'recent_form'
        newFilters.following = undefined
        newFilters.status = undefined
        break
      case 'pending':
        newFilters.status = 'PENDING'
        newFilters.following = undefined
        newFilters.sort = undefined
        break
      default:
        newFilters.sort = undefined
        newFilters.user = undefined
        newFilters.following = undefined
        newFilters.status = undefined
    }
    
    useTipsStore.getState().setFilters(newFilters)
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'all': return null
      case 'following': return Users
      case 'trending': return TrendingUp
      case 'ai_aligned': return Brain
      case 'hot_form': return Flame
      case 'pending': return Clock
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-32 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200"
              style={{ border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <ArrowLeft size={20} className="text-[#D4AF37]" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Tips Marketplace
              </h1>
              <p className="text-sm sm:text-base text-white/60" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Discover predictions from verified tipsters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/tips/tip-stars')}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition-all duration-200"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}
            >
              <Star size={18} />
              <span className="hidden sm:inline">Tip Stars</span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200"
              style={{
                background: showFilters ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)',
                border: showFilters ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                color: showFilters ? '#D4AF37' : 'rgba(255,255,255,0.7)'
              }}
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filters</span>
            </button>

            {user && (
              <button
                onClick={() => router.push('/matches')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #CFAF7B 100%)',
                  color: '#0a0a0a'
                }}
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Create Tip</span>
              </button>
            )}
          </div>
        </div>

        {/* Discovery Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* Primary Tabs */}
            {[
              { key: 'all', label: 'All Tips', icon: null },
              { key: 'following', label: 'Following', icon: Users },
              { key: 'trending', label: 'Trending', icon: TrendingUp },
            ].map((tab) => {
              const TabIcon = getTabIcon(tab.key)
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm sm:text-base font-semibold whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'shadow-lg'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    background: activeTab === tab.key
                      ? 'linear-gradient(135deg, #D4AF37 0%, #CFAF7B 100%)'
                      : 'rgba(255,255,255,0.05)',
                    color: activeTab === tab.key ? '#0a0a0a' : 'rgba(255,255,255,0.7)',
                    border: activeTab === tab.key ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  {TabIcon && <TabIcon size={16} />}
                  {tab.label}
                </button>
              )
            })}

            {/* More Tabs Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMoreTabs(!showMoreTabs)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm sm:text-base font-semibold whitespace-nowrap transition-all duration-200 ${
                  showMoreTabs ? 'shadow-lg' : 'hover:scale-105'
                }`}
                style={{
                  background: showMoreTabs
                    ? 'linear-gradient(135deg, #D4AF37 0%, #CFAF7B 100%)'
                    : 'rgba(255,255,255,0.05)',
                  color: showMoreTabs ? '#0a0a0a' : 'rgba(255,255,255,0.7)',
                  border: showMoreTabs ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <Filter size={16} />
                More
                <ChevronDown size={16} style={{ transform: showMoreTabs ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {showMoreTabs && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-xl z-10" style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.3)' }}>
                  {[
                    { key: 'ai_aligned', label: 'AI Aligned', icon: Brain },
                    { key: 'hot_form', label: 'Hot Form', icon: Flame },
                    { key: 'pending', label: 'Pending', icon: Clock },
                  ].map((tab) => {
                    const TabIcon = getTabIcon(tab.key)
                    return (
                      <button
                        key={tab.key}
                        onClick={() => {
                          handleTabChange(tab.key as any)
                          setShowMoreTabs(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:scale-[1.02]"
                        style={{
                          background: activeTab === tab.key ? 'rgba(212,175,55,0.15)' : 'transparent',
                          color: activeTab === tab.key ? '#D4AF37' : 'rgba(255,255,255,0.7)'
                        }}
                      >
                        {TabIcon && <TabIcon size={16} />}
                        <span className="text-sm font-semibold">{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 rounded-[24px] border border-[#D4AF37]/20 bg-[#111218]/85 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.22)] sm:p-5">
            <TipFilter />
          </div>
        )}

        {/* Tipsters Leaderboard - Collapsible */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="flex w-full items-center justify-between rounded-[22px] border border-[#D4AF37]/20 bg-[#111218]/80 p-3 transition-all duration-200 hover:scale-[1.01] sm:p-4"
              style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(212,175,55,0.22)'
              }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg" style={{ background: 'rgba(212,175,55,0.15)' }}>
                  <Trophy size={16} className="text-[#D4AF37] sm:size-20" />
                </div>
                <div className="text-left">
                  <span className="text-sm sm:text-base font-bold text-white block">Top 50 Tipsters</span>
                  <span className="text-[10px] sm:text-xs text-white/50 block">Professional ranking based on accuracy, tips count & streak</span>
                </div>
              </div>
              {showLeaderboard ? <ChevronUp size={20} className="text-[#D4AF37] sm:size-24" /> : <ChevronDown size={20} className="text-white/50 sm:size-24" />}
            </button>
            <button
              onClick={() => router.push('/tips/leaderboard')}
              className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-2 text-xs font-semibold text-[#F5D98B] transition-all duration-200 hover:bg-[#D4AF37]/15 sm:text-sm"
              style={{
                background: 'rgba(212,175,55,0.1)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: '#D4AF37'
              }}
            >
              View Full
            </button>
          </div>
          
          {showLeaderboard && (
            <div className="mt-4 rounded-[24px] border border-white/10 bg-[#0D0F13]/80 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.22)] sm:p-4">
              <TipstersLeaderboard />
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20">
            <TrophyLoader />
          </div>
        )}

        {/* Tips Grid */}
        {!isLoading && tips.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-white/50">
              <span className="flex items-center gap-2">
                <Target size={16} className="text-[#D4AF37]" />
                <span>{tips.length} tips found</span>
              </span>
              {activeTab !== 'all' && (
                <button
                  onClick={() => handleTabChange('all')}
                  className="text-[#D4AF37] hover:text-[#CFAF7B] transition-colors duration-200 font-semibold"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
              {tips.map((tip) => (
                <TipCard
                  key={tip.id}
                  tip={tip}
                  onClick={() => router.push(`/tips/${tip.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && tips.length === 0 && (
          <div className="text-center py-16 sm:py-20">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <Target size={40} className="text-[#D4AF37] sm:size-48" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              No tips found
            </h3>
            <p className="text-sm sm:text-base text-white/50 mb-6 max-w-md mx-auto" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {activeTab === 'following' 
                ? "You're not following any tipsters yet"
                : activeTab === 'pending'
                ? "No pending tips available"
                : "Try adjusting your filters or check back later"
              }
            </p>
            <button
              onClick={() => {
                useTipsStore.getState().resetFilters()
                handleTabChange('all')
              }}
              className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #CFAF7B 100%)',
                color: '#0a0a0a'
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}