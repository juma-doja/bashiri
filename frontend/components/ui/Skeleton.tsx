import { clsx } from "clsx";
import { motion } from "framer-motion";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div 
      className={clsx(
        "relative overflow-hidden rounded-2xl bg-white/5",
        "after:absolute after:inset-0 after:-translate-x-full",
        "after:animate-[shimmer_1.5s_infinite]",
        "after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent",
        className
      )} 
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-3xl p-5 space-y-4 transition-all duration-300" style={{ 
      background: "linear-gradient(135deg, rgba(212,175,55,0.08), rgba(207,175,123,0.04), var(--surface))", 
      border: "1px solid rgba(212,175,55,0.15)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 0 1px rgba(212,175,55,0.1)"
    }}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16 rounded-xl" />
        <Skeleton className="h-8 w-16 rounded-xl" />
      </div>
    </div>
  );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={clsx("h-4 rounded-lg", i === lines - 1 ? "w-2/3" : "w-full")} 
        />
      ))}
    </div>
  );
}

export function AvatarSkeleton() {
  return (
    <div className="relative">
      <Skeleton className="h-16 w-16 rounded-full" />
      <Skeleton className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full" />
    </div>
  );
}

// Sport-themed loading states
export function GoalPostLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className="relative w-24 h-16"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Goal post structure */}
        <div className="absolute bottom-0 left-0 w-1 h-16 bg-gradient-to-t from-[#D4AF37] to-[#CFAF7B] rounded-t-full" />
        <div className="absolute bottom-0 right-0 w-1 h-16 bg-gradient-to-t from-[#D4AF37] to-[#CFAF7B] rounded-t-full" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#CFAF7B] to-[#D4AF37] rounded-full" />
        
        {/* Ball animation */}
        <motion.div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-white to-gray-300"
          animate={{
            y: [0, -8, 0],
            rotate: [0, 360]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      <motion.p
        className="mt-4 text-sm font-medium"
        style={{ color: "rgba(255,255,255,0.6)" }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Inapakia...
      </motion.p>
    </div>
  );
}

export function BallBounceLoader() {
  return (
    <div className="flex items-center justify-center gap-2 p-8">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-4 h-4 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#CFAF7B]"
          animate={{
            y: [0, -12, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

export function TrophyLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{
          rotate: [-5, 5, -5],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        {/* Trophy cup */}
        <div className="w-16 h-12 bg-gradient-to-b from-[#D4AF37] to-[#CFAF7B] rounded-t-full relative" />
        <div className="w-4 h-6 bg-gradient-to-b from-[#CFAF7B] to-[#D4AF37] mx-auto" />
        <div className="w-12 h-2 bg-gradient-to-r from-[#D4AF37] via-[#CFAF7B] to-[#D4AF37] mx-auto rounded" />
        
        {/* Stars animation */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#D4AF37] rounded-full"
            style={{
              top: -8,
              left: 8 + (i * 12) - 12
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3
            }}
          />
        ))}
      </motion.div>
      <motion.p
        className="mt-4 text-sm font-medium"
        style={{ color: "rgba(255,255,255,0.6)" }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Inapakia...
      </motion.p>
    </div>
  );
}

export function FootballFieldLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className="w-20 h-12 border-2 border-[#D4AF37]/30 rounded-lg relative overflow-hidden"
        animate={{
          borderColor: ["rgba(212,175,55,0.3)", "rgba(212,175,55,0.6)", "rgba(212,175,55,0.3)"]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Field lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-px bg-[#D4AF37]/20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-px bg-[#D4AF37]/20" />
        </div>
        
        {/* Moving ball */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-white to-gray-300"
          animate={{
            x: [0, 68, 0],
            y: [0, 36, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      <motion.p
        className="mt-4 text-sm font-medium"
        style={{ color: "rgba(255,255,255,0.6)" }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Inapakia...
      </motion.p>
    </div>
  );
}