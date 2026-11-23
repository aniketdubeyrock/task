import React from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from './AnimatedLoader';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'saffron';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

    const variants = {
      primary:
        'btn-saffron-primary bg-[#f97316] bg-gradient-to-r from-saffron-500 via-amber-500 to-saffron-600 hover:from-saffron-600 hover:via-amber-600 hover:to-saffron-700 text-white font-bold shadow-saffron hover:shadow-saffron-lg focus:ring-saffron-400 border border-saffron-400/50',
      saffron:
        'btn-saffron-primary bg-[#f97316] bg-gradient-to-r from-saffron-500 to-amber-600 hover:from-saffron-600 hover:to-amber-700 text-white font-bold shadow-saffron hover:shadow-saffron-lg focus:ring-saffron-400 border border-saffron-400/50',
      secondary:
        'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white shadow-crisp focus:ring-slate-700 border border-slate-700/50 font-bold',
      outline:
        'bg-white dark:bg-slate-800 hover:bg-saffron-50/70 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 hover:text-saffron-700 dark:hover:text-amber-400 border-2 border-slate-200 dark:border-slate-700 hover:border-saffron-400 dark:hover:border-amber-500 shadow-xs focus:ring-saffron-400 font-bold',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 focus:ring-rose-500 font-bold',
      ghost:
        'bg-transparent hover:bg-saffron-50/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-saffron-700 dark:hover:text-amber-400 focus:ring-saffron-300 font-bold',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Spinner size="sm" color={variant === 'outline' || variant === 'ghost' ? 'text-saffron-600' : 'text-white'} />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
