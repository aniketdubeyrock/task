import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { AppNotification } from '../../types';
import { formatDistanceToNow } from 'date-fns';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/notifications');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setNotifications(res.data.data);
      }
    } catch {
      // Quiet fail to avoid UI blocking
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, []);

  // Click outside to close
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Ignore
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-saffron-600 dark:hover:text-amber-400 hover:bg-saffron-50 dark:hover:bg-slate-800 transition-all duration-200 border border-transparent hover:border-saffron-200 dark:hover:border-slate-700 focus:outline-none"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full text-[10px] font-bold bg-saffron-500 text-white px-1 shadow-sm leading-none py-0.5">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-saffron-lg border border-saffron-200/80 dark:border-slate-800 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-saffron-50/70 via-amber-50/50 to-white dark:from-slate-800 dark:via-slate-850 dark:to-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-saffron-500/10 dark:bg-amber-400/10 flex items-center justify-center text-saffron-600 dark:text-amber-400 font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Notifications</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-saffron-600 dark:text-amber-400 hover:text-saffron-700 bg-saffron-100/60 dark:bg-slate-800 hover:bg-saffron-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading && notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-saffron-50 dark:bg-slate-800 flex items-center justify-center text-saffron-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No notifications yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
                    When teammates assign you tasks or update deadlines, alerts will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 transition-colors flex items-start gap-3 hover:bg-saffron-50/40 dark:hover:bg-slate-800/60 cursor-pointer ${
                      !n.isRead ? 'bg-saffron-50/20 dark:bg-slate-850' : 'opacity-80'
                    }`}
                    onClick={(e) => handleMarkAsRead(n.id, e)}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        !n.isRead ? 'bg-saffron-500 ring-4 ring-saffron-100 dark:ring-slate-700' : 'bg-transparent'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{n.title}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {(() => {
                            try {
                              return formatDistanceToNow(new Date(n.createdAt), { addSuffix: true });
                            } catch {
                              return 'recently';
                            }
                          })()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed break-words">{n.message}</p>
                      {n.actor && (
                        <span className="inline-block mt-1 text-[10px] font-medium text-saffron-700 dark:text-amber-400 bg-saffron-100/80 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          by {n.actor.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">TaskFlow Notification Center</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
