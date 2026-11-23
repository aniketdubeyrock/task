import React from 'react';
import { motion } from 'framer-motion';

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
        className={`${sizeMap[size]} rounded-full border-slate-200 border-t-current ${color}`}
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
          className="w-12 h-12 rounded-2xl bg-saffron-50 border border-saffron-200/90 flex items-center justify-center text-saffron-600 shadow-saffron"
          animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Spinner size="md" color="text-saffron-600" />
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-2xl bg-saffron-500/20 blur-md -z-10"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      {text && <p className="text-xs font-bold text-slate-500 tracking-wide uppercase">{text}</p>}
    </div>
  );
};

export const FullScreenLoader: React.FC<{ message?: string }> = ({ message = 'Initializing TaskFlow...' }) => {
  return (
    <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-saffron-500 via-amber-500 to-saffron-600 flex items-center justify-center text-white font-black text-2xl shadow-saffron mb-6">
          TF
        </div>
        <Spinner size="lg" color="text-saffron-400" />
        <p className="mt-4 text-sm font-semibold text-slate-300">{message}</p>
      </motion.div>
    </div>
  );
};
