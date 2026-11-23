import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface CustomDatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  label?: string;
  error?: string;
  minDate?: string;
  placeholder?: string;
  className?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  label,
  error,
  minDate,
  placeholder = 'Select deadline...',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize viewing month/year from current value or today
  const initialDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Close when clicking outside
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

  // Navigate months
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Quick preset setters
  const applyPreset = (preset: 'today' | 'tomorrow' | 'week' | 'month') => {
    const target = new Date();
    if (preset === 'today') {
      // today
    } else if (preset === 'tomorrow') {
      target.setDate(target.getDate() + 1);
    } else if (preset === 'week') {
      target.setDate(target.getDate() + 7);
    } else if (preset === 'month') {
      target.setMonth(target.getMonth() + 1);
      target.setDate(0); // last day of current month
    }
    const formatted = target.toISOString().split('T')[0];
    onChange(formatted);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
    setIsOpen(false);
  };

  // Generate day cells for calendar
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const handleSelectDay = (day: number) => {
    const selectedDate = new Date(viewYear, viewMonth, day);
    // Format as YYYY-MM-DD local
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    if (minDate && dateStr < minDate) {
      return; // Disabled
    }

    onChange(dateStr);
    setIsOpen(false);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const [vy, vm, vd] = value.split('-').map(Number);
    return vy === viewYear && vm === viewMonth + 1 && vd === day;
  };

  const isPast = (day: number) => {
    if (!minDate) return false;
    const yyyy = viewYear;
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}` < minDate;
  };

  const displayFormatted = value
    ? new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className={cn('relative w-full flex flex-col gap-1.5', className)} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide flex items-center justify-between">
          <span>{label}</span>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors font-medium"
            >
              Clear
            </button>
          )}
        </label>
      )}

      {/* Trigger Button Input */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all shadow-xs select-none',
          'bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-saffron-500/25',
          error
            ? 'border-rose-400 dark:border-rose-600 text-rose-700 dark:text-rose-300'
            : isOpen
            ? 'border-saffron-500 ring-2 ring-saffron-500/20 text-slate-900 dark:text-white'
            : 'border-slate-200 dark:border-slate-700 hover:border-saffron-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-100'
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon
            className={cn(
              'w-4 h-4 flex-shrink-0 transition-colors',
              value ? 'text-saffron-600 dark:text-amber-400' : 'text-slate-400'
            )}
          />
          <span className={value ? 'font-bold' : 'text-slate-400 font-normal'}>
            {displayFormatted || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {value && (
            <span className="w-1.5 h-1.5 rounded-full bg-saffron-500 shadow-[0_0_8px_#f97316]" />
          )}
        </div>
      </button>

      {error && <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{error}</span>}

      {/* Custom Theme Dropdown Calendar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-2 z-50 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-saffron-lg border border-saffron-200/90 dark:border-slate-800 p-3.5 text-slate-800 dark:text-slate-100 select-none overflow-hidden"
          >
            {/* Header: Month / Year with Navigation */}
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday Names */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {WEEKDAY_NAMES.map((wd) => (
                <span key={wd} className="text-[10px] font-bold text-slate-400 uppercase">
                  {wd}
                </span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Leading days from previous month */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div
                  key={`prev-${i}`}
                  className="w-8 h-8 flex items-center justify-center text-[11px] text-slate-300 dark:text-slate-700 cursor-not-allowed"
                >
                  {daysInPrevMonth - firstDayIndex + i + 1}
                </div>
              ))}

              {/* Current month days */}
              {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                const day = i + 1;
                const selected = isSelected(day);
                const today = isToday(day);
                const past = isPast(day);

                return (
                  <button
                    key={`day-${day}`}
                    type="button"
                    disabled={past}
                    onClick={() => handleSelectDay(day)}
                    className={cn(
                      'w-8 h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all',
                      selected
                        ? 'bg-gradient-to-tr from-saffron-500 to-amber-500 text-white font-extrabold shadow-saffron scale-105'
                        : past
                        ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed line-through'
                        : today
                        ? 'border border-saffron-500 text-saffron-600 dark:text-amber-400 font-bold hover:bg-saffron-50 dark:hover:bg-slate-800'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-saffron-50 dark:hover:bg-slate-800 hover:text-saffron-600 dark:hover:text-amber-400'
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Quick Presets Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Presets:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => applyPreset('today')}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-saffron-400 hover:text-saffron-600 transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('tomorrow')}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-saffron-400 hover:text-saffron-600 transition-colors"
                >
                  Tmrw
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('week')}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-saffron-400 hover:text-saffron-600 transition-colors"
                >
                  +1 Wk
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
