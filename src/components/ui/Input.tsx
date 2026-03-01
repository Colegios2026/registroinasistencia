import React from 'react';
import { cn } from '../../utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">{label}</label>}
        <div className="relative group">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "input-base",
              icon && "pl-11",
              error && "border-rose-500 focus:ring-rose-500/10 focus:border-rose-500",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-medium text-rose-500 ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
