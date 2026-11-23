import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  className,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const maxWidthMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="min-h-screen px-4 text-center flex items-center justify-center py-6">
            {/* Backdrop with modern blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
              onClick={onClose}
            />

            {/* Modal Dialog with Spring physics & saffron ambient header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={cn(
                'relative inline-block w-full text-left align-middle bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-saffron-100/90 dark:border-slate-800 overflow-visible p-6 sm:p-7 z-10 before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-gradient-to-r before:from-saffron-500 before:via-amber-400 before:to-saffron-600 before:rounded-t-3xl',
                maxWidthMap[maxWidth],
                className
              )}
            >
              {(title || description) && (
                <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                  <div>
                    {title && (
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        {title}
                      </h3>
                    )}
                    {description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-saffron-600 dark:hover:text-amber-400 rounded-xl p-1.5 hover:bg-saffron-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(modalContent, document.body);
};
