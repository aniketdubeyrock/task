import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Database, ShieldCheck, Zap } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '', color = 'text-saffron-600' }) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeMap[size]} rounded-full border-slate-200/40 border-t-current ${color}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export const PulseGlowLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="relative">
        <motion.div
          className="w-12 h-12 rounded-2xl bg-saffron-50 dark:bg-slate-800 border border-saffron-200/90 dark:border-slate-700 flex items-center justify-center text-saffron-600 dark:text-amber-400 shadow-saffron"
          animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Spinner size="md" color="text-saffron-600 dark:text-amber-400" />
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-2xl bg-saffron-500/20 blur-md -z-10"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      {text && <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">{text}</p>}
    </div>
  );
};

export const FullScreenLoader: React.FC<{ message?: string }> = ({
  message = 'Connecting to TaskFlow Workspace...',
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Dynamic Ambient Background Glows */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-saffron-500 via-amber-500 to-rose-500 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center px-4 max-w-sm text-center">
        {/* Orbital Concentric Rotating Tech Rings with Glowing Center Emblem */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-8">
          {/* Outer Orbital Ring with Glowing Dot */}
          <motion.div
            className="absolute inset-0 rounded-full border border-saffron-500/30 border-dashed"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b]" />
          </motion.div>

          {/* Inner Counter-Rotating Ring */}
          <motion.div
            className="absolute inset-3 rounded-full border border-amber-400/20 border-dotted"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          >
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-saffron-500 shadow-[0_0_10px_#ea580c]" />
          </motion.div>

          {/* Floating Central TF Emblem */}
          <motion.div
            animate={{
              y: [-2, 3, -2],
              scale: [1, 1.04, 1],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-saffron-500 via-amber-500 to-saffron-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-saffron-500/40 border border-amber-300/40 relative z-10"
          >
            TF
          </motion.div>
        </div>

        {/* Brand Tag & Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-saffron-400 text-xs font-bold mb-3 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span>TaskFlow Cloud Workspace</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {message}
          </h3>

          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            Authenticating JWT credentials and pulling real-time sprint data from Neon PostgreSQL.
          </p>

          {/* High-Tech Animated Laser Progress Bar */}
          <div className="w-64 mt-6 p-1 rounded-full bg-slate-900 border border-slate-800/80 overflow-hidden shadow-inner">
            <div className="relative w-full h-1.5 rounded-full overflow-hidden bg-slate-800">
              <motion.div
                className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-saffron-500 via-amber-400 to-saffron-600 shadow-[0_0_12px_#f97316]"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </div>

          {/* Telemetry Micro-Pill */}
          <div className="mt-5 flex items-center gap-3 text-[11px] font-semibold text-slate-500">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Neon Postgres Active</span>
            </span>
            <span className="text-slate-700">&bull;</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-saffron-400" />
              <span>TLS / SSL Secure</span>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

