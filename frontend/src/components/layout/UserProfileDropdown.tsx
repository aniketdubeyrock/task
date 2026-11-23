import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  User as UserIcon,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';

interface UserProfileDropdownProps {
  onNavigate?: (path: string) => void;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ onNavigate }) => {
  const { user, isSuperAdmin, logout, login } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const handleQuickSwitch = async (email: string, pass: string) => {
    try {
      setIsSwitching(true);
      await login(email, pass);
      setIsOpen(false);
      if (onNavigate) onNavigate('/dashboard');
    } catch {
      // Ignore
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-2xl hover:bg-saffron-50/70 dark:hover:bg-slate-800 border border-transparent hover:border-saffron-200 dark:hover:border-slate-700 transition-all duration-200 focus:outline-none group"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-saffron-500 to-amber-400 p-[1.5px] shadow-sm">
          <div className="w-full h-full rounded-[10px] bg-white dark:bg-slate-900 flex items-center justify-center text-saffron-700 dark:text-amber-400 font-bold text-xs">
            {initials}
          </div>
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-saffron-700 dark:group-hover:text-amber-400">
            {user.name}
          </span>
          <span className="text-[10px] text-slate-400 font-medium leading-none">
            {isSuperAdmin ? 'Superadmin' : 'Team Member'}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-saffron-600 dark:text-amber-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-saffron-lg border border-saffron-200/80 dark:border-slate-800 z-50 overflow-hidden"
          >
            {/* User Profile Header */}
            <div className="p-4 bg-gradient-to-br from-saffron-50/80 via-amber-50/40 to-white dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-saffron-500 to-amber-500 p-[2px] shadow-md flex-shrink-0">
                <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center text-saffron-700 dark:text-amber-400 font-extrabold text-sm">
                  {initials}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</h4>
                  {isSuperAdmin && (
                    <span className="bg-saffron-500/15 text-saffron-700 dark:text-amber-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border border-saffron-300/40 dark:border-amber-500/30">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            {/* Quick Demo Switcher */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2 flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3 text-saffron-500" />
                Quick Role Switcher
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  disabled={isSwitching || user.email === 'superadmin@taskflow.dev'}
                  onClick={() => handleQuickSwitch('superadmin@taskflow.dev', 'SuperAdmin123!')}
                  className={`text-[11px] font-semibold py-1.5 px-2.5 rounded-xl border text-center transition-all ${
                    user.email === 'superadmin@taskflow.dev'
                      ? 'bg-saffron-50 dark:bg-amber-950/40 border-saffron-300 dark:border-amber-600 text-saffron-800 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-saffron-200 dark:hover:border-slate-600'
                  }`}
                >
                  Super Admin
                </button>
                <button
                  disabled={isSwitching || user.email === 'jane@taskflow.dev'}
                  onClick={() => handleQuickSwitch('jane@taskflow.dev', 'Password123!')}
                  className={`text-[11px] font-semibold py-1.5 px-2.5 rounded-xl border text-center transition-all ${
                    user.email === 'jane@taskflow.dev'
                      ? 'bg-saffron-50 dark:bg-amber-950/40 border-saffron-300 dark:border-amber-600 text-saffron-800 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-saffron-200 dark:hover:border-slate-600'
                  }`}
                >
                  Jane Dev
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
