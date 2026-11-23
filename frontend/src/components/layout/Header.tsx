import React from 'react';
import { Menu } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { UserProfileDropdown } from './UserProfileDropdown';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu: () => void;
  onNavigate?: (path: string) => void;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenMobileMenu,
  onNavigate,
  actions,
}) => {
  return (
    <header className="h-16 px-5 sm:px-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-saffron-100/80 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
      {/* Title & Mobile trigger */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-saffron-600 dark:hover:text-saffron-400 rounded-xl hover:bg-saffron-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-400 font-medium hidden sm:block truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Actions & Dropdowns */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {actions}

        {/* Theme Toggle (Dark / Light Mode) */}
        <ThemeToggle />

        {/* Notification Bell Dropdown */}
        <NotificationDropdown />

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block mx-0.5" />

        {/* User Profile Dropdown */}
        <UserProfileDropdown onNavigate={onNavigate} />
      </div>
    </header>
  );
};
