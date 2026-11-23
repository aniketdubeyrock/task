import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion, AnimatePresence } from 'framer-motion';

interface AppLayoutProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPath: propCurrentPath,
  onNavigate: propOnNavigate,
  title,
  subtitle,
  actions,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = propCurrentPath || location.pathname;
  const onNavigate = propOnNavigate || navigate;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-64 h-full z-10"
            >
              <Sidebar
                currentPath={currentPath}
                onNavigate={onNavigate}
                onCloseMobile={() => setMobileOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onNavigate={onNavigate}
          actions={actions}
        />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAF9F6] dark:bg-slate-950 transition-colors duration-200">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

