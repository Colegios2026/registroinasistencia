import React from 'react';
import { LucideIcon, SearchX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon: Icon = SearchX,
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 bg-slate-50/50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100/50">
        <Icon className="w-10 h-10 text-slate-300" strokeWidth={1} />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2 tracking-tight">{title}</h3>
      {description && <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8 font-medium leading-relaxed">{description}</p>}
      {action}
    </div>
  );
};
