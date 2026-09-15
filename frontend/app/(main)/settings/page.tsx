"use client";
import { useRouter } from "next/navigation";
import { ChevronRight, Star, Bell, Globe, Heart, MessageSquare, HelpCircle, LogOut, Shield, Settings as SettingsIcon, ShieldAlert, Phone, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import { PremiumButton } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { useState, useRef, useEffect } from "react";

const SETTINGS_ITEMS = [
  { 
    label: "Timu Ninazopenda", 
    href: "/settings/teams",
    icon: Star,
    description: "Manage your favorite teams",
    adminOnly: false
  },
  { 
    label: "Ligi Ninazopenda", 
    href: "/settings/leagues",
    icon: Heart,
    description: "Select your preferred leagues",
    adminOnly: false
  },
  { 
    label: "Notifications", 
    href: "/settings/notifications",
    icon: Bell,
    description: "Configure notification settings",
    adminOnly: false
  },
  { 
    label: "Lugha (SW/EN)", 
    href: "/settings/language",
    icon: Globe,
    description: "Change app language",
    adminOnly: false
  },
  { 
    label: "Wasiliana Nasi", 
    href: "/contact",
    icon: Phone,
    description: "Contact Bashiri team",
    adminOnly: false
  },
  { 
    label: "Msaada na Maoni", 
    href: "/settings/support",
    icon: HelpCircle,
    description: "Get help or send feedback",
    adminOnly: false
  },
  { 
    label: "Admin Panel", 
    href: "/admin/login",
    icon: ShieldAlert,
    description: "Access admin dashboard",
    adminOnly: true
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isExploding, setIsExploding] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number }>>([]);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleMouseDown = () => {
    setIsHolding(true);
    setHoldProgress(0);
    
    // Progress animation
    progressIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current!);
          return 100;
        }
        return prev + 3.33; // 100% / 3 seconds = ~33.33% per second, / 10 for 100ms intervals
      });
    }, 100);

    // Hold timer for 3 seconds
    holdTimerRef.current = setTimeout(() => {
      clearInterval(progressIntervalRef.current!);
      triggerExplosion();
    }, 3000);
  };

  const handleMouseUp = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const triggerExplosion = () => {
    setIsExploding(true);
    
    // Create particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20,
    }));
    setParticles(newParticles);

    // Logout after explosion animation
    setTimeout(() => {
      handleLogout();
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-safe pt-10 sm:px-6 lg:px-8" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 32px)" }}>
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => router.back()} aria-label="Rudi nyuma">
            <ArrowLeft size={20} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Settings
            </h1>
            <p className="mt-1 text-sm text-white/50">Personalize your experience</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          {SETTINGS_ITEMS.filter(item => !item.adminOnly || user?.is_staff).map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + (index * 0.05) }}
              className="h-full"
            >
              <GlassCard hover className="h-full p-4">
                <button
                  onClick={() => router.push(item.href)}
                  className="w-full text-left"
                >
                  <div className="flex h-full flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${item.adminOnly ? 'border-[#38BDF8]/30 bg-[#38BDF8]/10' : 'border-[#F5A623]/20 bg-[#F5A623]/10'}`}>
                        <item.icon size={18} className={item.adminOnly ? 'text-[#38BDF8]' : 'text-[#F5A623]'} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-white">{item.label}</span>
                        <span className="mt-1 block text-xs text-white/50">{item.description}</span>
                      </div>
                      <ChevronRight size={16} className="mt-1 shrink-0 text-white/35" />
                    </div>
                  </div>
                </button>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <GlassCard className="p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--brand-accent)]/30 bg-[var(--brand-accent)]/10">
                <Shield size={16} className="text-[var(--brand-accent)]" />
              </div>
              <p className="text-sm font-bold text-white">Account Information</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Phone</p>
                <p className="truncate text-sm font-bold text-white">{user?.phone_number || 'N/A'}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Username</p>
                <p className="truncate text-sm font-bold text-white">@{user?.username || 'User'}</p>
              </div>

              <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-3 sm:col-span-2">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Status</p>
                <p className="text-sm font-bold text-green-400">✓ Active</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <div className="relative">
            <AnimatePresence>
              {isHolding && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 3, opacity: 0 }}
                      exit={{ scale: 3, opacity: 0 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeOut"
                      }}
                      className="absolute inset-0 rounded-full border-2 border-red-500/50"
                      style={{ width: '100%', height: '100%' }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            <motion.button
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              disabled={isExploding}
              whileHover={{ scale: isHolding ? 1 : 1.05 }}
              whileTap={{ scale: isHolding ? 0.95 : 0.95 }}
              animate={{
                scale: isExploding ? 0 : 1,
                opacity: isExploding ? 0 : 1
              }}
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #ef4444, #dc2626, #991b1b)',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 0 40px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.3)',
              }}
              className="relative flex flex-col items-center justify-center gap-1 overflow-hidden"
            >
              <svg className="absolute inset-0 h-full w-full -rotate-90" style={{ width: '140px', height: '140px' }}>
                <circle
                  cx="70"
                  cy="70"
                  r="65"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="3"
                />
                <motion.circle
                  cx="70"
                  cy="70"
                  r="65"
                  fill="none"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="408"
                  strokeDashoffset={408 - (408 * holdProgress / 100)}
                  animate={{ strokeDashoffset: 408 - (408 * holdProgress / 100) }}
                  transition={{ duration: 0.1 }}
                  style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5))' }}
                />
              </svg>

              <motion.div
                animate={{
                  scale: isHolding ? [1, 1.15, 1] : 1,
                  rotate: isHolding ? [0, -8, 8, 0] : 0
                }}
                transition={{
                  duration: isHolding ? 0.4 : 0.3,
                  repeat: isHolding ? Infinity : 0
                }}
              >
                <ShieldAlert size={36} style={{ color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
              </motion.div>

              <span className="text-lg font-black tracking-widest" style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                LOGOUT
              </span>

              <motion.span
                animate={{ opacity: isHolding ? 0 : 1 }}
                className="text-[11px] font-semibold"
                style={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
              >
                Hold 3s
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {isExploding && particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  initial={{
                    x: particle.x,
                    y: particle.y,
                    scale: 1,
                    opacity: 1
                  }}
                  animate={{
                    x: particle.x + particle.vx * 50,
                    y: particle.y + particle.vy * 50,
                    scale: 0,
                    opacity: 0
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute h-3 w-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                  style={{
                    left: particle.x,
                    top: particle.y,
                  }}
                />
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {isExploding && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="pointer-events-none fixed inset-0 z-50 bg-red-500"
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <div className="px-3 pb-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-white/40"
        >
          Hold the LOGOUT button for 3 seconds to logout
        </motion.p>
      </div>

      <p className="px-3 pb-8 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
        Created by Lastmateru
      </p>
    </div>
  );
}