import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertCircle, RefreshCw, Wrench, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface ServerErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  endpoint?: string;
  errorMessage?: string;
}

export const ServerErrorModal: React.FC<ServerErrorModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  endpoint,
  errorMessage,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retrySuccess, setRetrySuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsRetrying(false);
      setRetrySuccess(false);
    }
  }, [isOpen]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetrySuccess(false);
    try {
      if (onRetry) {
        await onRetry();
      } else {
        // Default retry delay simulation
        await new Promise((r) => setTimeout(r, 1200));
      }
      setRetrySuccess(true);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch {
      // Retrying failed
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex flex-col items-center text-center py-2">
        {/* Animated Icon Illustration */}
        <div className="relative mb-6">
          {/* Pulsing Ambient Halo */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-saffron-500/30 to-rose-500/20 blur-xl absolute inset-0 animate-pulse" />

          {/* Icon Box */}
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-50 to-saffron-100 dark:from-slate-800 dark:to-slate-850 border-2 border-saffron-300 dark:border-saffron-500/50 flex items-center justify-center shadow-lg shadow-saffron-500/20">
            <motion.div
              animate={{
                rotate: [0, 15, -15, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Wrench className="w-10 h-10 text-saffron-600 dark:text-amber-400" />
            </motion.div>

            {/* Micro badge */}
            <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-rose-500/40 animate-bounce">
              500
            </div>
          </div>
        </div>

        {/* Heading & Context */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Automated Recovery Active</span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          We&apos;re Working On It!
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-sm leading-relaxed">
          Our backend service encountered a temporary glitch while processing this request. The team is on it, and cloud self-healing is retrying automatically.
        </p>

        {/* Animated Interactive Waiting Progress Bar */}
        <div className="w-full max-w-sm mt-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-left">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Re-syncing with Cloud Cluster...
            </span>
            <span className="text-saffron-600 dark:text-amber-400">Processing</span>
          </div>

          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-saffron-500 via-amber-400 to-saffron-600 rounded-full"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ width: '60%' }}
            />
          </div>

          {endpoint && (
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400 dark:text-slate-500 truncate font-mono">
              Target: <span className="text-slate-600 dark:text-slate-300">{endpoint}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full max-w-sm mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isRetrying}
          >
            Dismiss
          </Button>

          <Button
            variant="primary"
            className="flex-1 shadow-md shadow-saffron-500/25"
            onClick={handleRetry}
            isLoading={isRetrying}
            leftIcon={
              retrySuccess ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <RefreshCw className="w-4 h-4 text-white" />
              )
            }
          >
            {retrySuccess ? 'Resolved!' : 'Try Again'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
