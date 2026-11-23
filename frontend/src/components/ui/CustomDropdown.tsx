import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
  direction?: 'up' | 'down';
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select option...',
  className,
  size = 'md',
  direction = 'down',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn('relative flex flex-col gap-1.5', className)} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between text-left rounded-xl border text-xs font-semibold transition-all select-none shadow-xs',
          'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100',
          size === 'sm' ? 'py-1.5 px-3' : 'py-2.5 px-3.5',
          isOpen
            ? 'border-saffron-500 ring-2 ring-saffron-500/20'
            : 'border-slate-200 dark:border-slate-700 hover:border-saffron-300 dark:hover:border-slate-600'
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="flex-shrink-0 text-saffron-600 dark:text-amber-400">
              {selectedOption.icon}
            </span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-md border',
                selectedOption.badgeColor ||
                  'bg-saffron-50 text-saffron-700 dark:bg-amber-950/50 dark:text-amber-300 border-saffron-200 dark:border-amber-800'
              )}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1.5',
            isOpen && 'rotate-180 text-saffron-600 dark:text-amber-400'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: direction === 'up' ? -4 : 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === 'up' ? -4 : 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 w-full min-w-[160px] bg-white dark:bg-slate-900 rounded-2xl shadow-saffron-lg border border-saffron-200/90 dark:border-slate-800 p-1.5 select-none overflow-hidden',
              direction === 'up' ? 'bottom-full left-0 mb-1.5' : 'top-full left-0 mt-1.5'
            )}
          >
            <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                      isSelected
                        ? 'bg-saffron-50 dark:bg-amber-950/50 text-saffron-800 dark:text-amber-300 font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-saffron-600 dark:hover:text-amber-400'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.icon && (
                        <span className="flex-shrink-0 text-slate-400 group-hover:text-saffron-500">
                          {opt.icon}
                        </span>
                      )}
                      <span className="truncate">{opt.label}</span>
                      {opt.badge && (
                        <span
                          className={cn(
                            'text-[9px] font-bold px-1.5 py-0.5 rounded border',
                            opt.badgeColor || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          )}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-saffron-600 dark:text-amber-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
