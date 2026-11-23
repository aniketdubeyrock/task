import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rounded',
  ...props
}) => {
  const variantStyles = {
    rectangular: 'rounded-none',
    circular: 'rounded-full',
    rounded: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-slate-200/70 dark:bg-slate-800/80',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:animate-[shimmer_1.8s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-white/50 dark:before:via-white/10 before:to-transparent',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
};

