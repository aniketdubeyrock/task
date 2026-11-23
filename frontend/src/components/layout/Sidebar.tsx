import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  MailCheck,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, onCloseMobile }) => {
  const { user, isSuperAdmin, logout } = useAuth();

  const handleNav = (path: string) => {
    onNavigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  ];

  const adminNavItems = [
    { label: 'Email Templates', path: '/admin/email-templates', icon: MailCheck },
  ];

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <aside className="w-64 h-full bg-navy-900 border-r border-slate-800/90 flex flex-col justify-between text-slate-300 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-saffron-500 via-amber-500 to-saffron-600 flex items-center justify-center text-white font-black text-sm shadow-saffron">
              TF
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-extrabold text-base tracking-tight block">TaskFlow</span>
                <Sparkles className="w-3 h-3 text-saffron-400" />
              </div>
              <span className="text-[10px] text-saffron-400 font-semibold tracking-wider uppercase">
                Enterprise
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="px-3 py-6 flex flex-col gap-6">
          <div>
            <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              Workspace
            </span>
            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentPath === item.path ||
                  (item.path === '/projects' && currentPath.startsWith('/projects'));
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-saffron-500 to-amber-600 text-white shadow-saffron'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/70 hover:translate-x-0.5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 opacity-90" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Superadmin Menu Section */}
          {isSuperAdmin && (
            <div>
              <div className="px-3 flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-saffron-400 uppercase tracking-wider block">
                  Superadmin
                </span>
                <span className="bg-saffron-500/20 text-saffron-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-saffron-500/30">
                  ADMIN
                </span>
              </div>
              <nav className="flex flex-col gap-1.5">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-saffron-500 to-amber-600 text-white shadow-saffron'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/70 hover:translate-x-0.5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-saffron-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 opacity-90" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* User Footer Card */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-800/60 rounded-2xl p-3 flex items-center justify-between mb-2 border border-slate-700/60 shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-saffron-500 to-amber-400 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white truncate block">{user?.name}</span>
              <span className="text-[10px] text-slate-400 truncate block">{user?.email}</span>
            </div>
          </div>
          {isSuperAdmin && (
            <ShieldCheck className="w-4 h-4 text-saffron-400 flex-shrink-0" />
          )}
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
