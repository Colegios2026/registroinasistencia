import React from 'react';
import { cn } from '../../utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className }) => {
  const variants = {
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-100/50',
    secondary: 'bg-slate-100 text-slate-600 border-slate-200/50',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100/50',
    warning: 'bg-amber-50 text-amber-700 border-amber-100/50',
    danger: 'bg-rose-50 text-rose-700 border-rose-100/50',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-100/50',
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wider",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};
