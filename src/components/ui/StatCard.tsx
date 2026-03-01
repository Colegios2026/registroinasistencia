import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'emerald' | 'amber' | 'rose';
}

const colorMap = {
  blue: 'bg-indigo-50 text-indigo-600 border-indigo-100/50',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100/50',
  amber: 'bg-amber-50 text-amber-600 border-amber-100/50',
  rose: 'bg-rose-50 text-rose-600 border-rose-100/50',
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
  return (
    <div className="card p-6 group hover:border-indigo-200/50">
      <div className="flex items-start justify-between mb-5">
        <div className={cn("p-2.5 rounded-xl border transition-colors duration-200", colorMap[color])}>
          <Icon className="w-5 h-5" strokeWidth={1.5} />
        </div>
        {trend && (
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-tight",
            trend.isPositive 
              ? "bg-emerald-50 text-emerald-700 border-emerald-100/50" 
              : "bg-rose-50 text-rose-700 border-rose-100/50"
          )}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-200">{value}</h3>
      </div>
    </div>
  );
};
