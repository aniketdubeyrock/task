import React from 'react';
import { cn } from '../../utils/cn';
import { TaskStatus, TaskPriority } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'saffron';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const variants = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 font-bold',
    saffron: 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-extrabold shadow-xs',
    success: 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-extrabold shadow-xs',
    warning: 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-extrabold shadow-xs',
    danger: 'bg-rose-100/80 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 font-extrabold shadow-xs',
    info: 'bg-sky-100/80 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700 font-bold',
    purple: 'bg-violet-100/80 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 border-violet-300 dark:border-violet-700 font-bold',
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5 rounded-md gap-1.5',
    md: 'text-xs px-3 py-1 rounded-lg gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center border tracking-wide select-none',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TaskStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm',
}) => {
  switch (status) {
    case 'TODO':
      return (
        <Badge variant="default" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>To Do</span>
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge variant="saffron" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>In Progress</span>
        </Badge>
      );
    case 'DONE':
      return (
        <Badge variant="success" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Done</span>
        </Badge>
      );
  }
};

export const PriorityBadge: React.FC<{ priority: TaskPriority; size?: 'sm' | 'md' }> = ({
  priority,
  size = 'sm',
}) => {
  switch (priority) {
    case 'LOW':
      return (
        <Badge variant="default" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>Low</span>
        </Badge>
      );
    case 'MEDIUM':
      return (
        <Badge variant="saffron" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Medium</span>
        </Badge>
      );
    case 'HIGH':
      return (
        <Badge variant="danger" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>High</span>
        </Badge>
      );
  }
};
