import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme, setTheme } = useTheme();

  return (
    <div
      className="flex items-center p-1 rounded-2xl bg-slate-200/90 dark:bg-slate-800/90 border border-slate-300/80 dark:border-slate-700 shadow-inner select-none"
      role="group"
      aria-label="Theme toggle group"
    >
      <button
        onClick={toggleTheme}
        type="button"
        aria-label="Toggle theme"
        className="flex items-center gap-1 focus:outline-none"
      >
        <span
          onClick={(e) => {
            e.stopPropagation();
            setTheme('light');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            !isDark
              ? 'bg-white text-saffron-600 shadow-xs shadow-slate-300 font-extrabold border border-slate-200/60'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Switch to Light Mode"
        >
          <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-saffron-500 fill-saffron-500/20' : 'text-slate-400'}`} />
          <span>Light</span>
        </span>

        <span
          onClick={(e) => {
            e.stopPropagation();
            setTheme('dark');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            isDark
              ? 'bg-slate-900 text-amber-400 shadow-xs shadow-black/40 font-extrabold border border-slate-700/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Switch to Dark Mode"
        >
          <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400 fill-amber-400/20' : 'text-slate-500'}`} />
          <span>Dark</span>
        </span>
      </button>
    </div>
  );
};
