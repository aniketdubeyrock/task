import React from 'react';
import { cn } from '../../utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, children, id, ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(2, 9);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'w-full bg-white dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-white transition-all duration-200',
            'py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-saffron-500/25 focus:border-saffron-500 shadow-xs cursor-pointer',
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-saffron-300 dark:hover:border-saffron-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs text-rose-600 font-semibold">{error}</span>}
        {helperText && !error && <span className="text-xs text-slate-500">{helperText}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
