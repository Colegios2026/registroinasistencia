import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  filters?: React.ReactNode;
  breadcrumbs?: { label: string; active?: boolean }[];
}

const EMPTY_BREADCRUMBS: { label: string; active?: boolean }[] = [];

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  action, 
  filters,
  breadcrumbs = EMPTY_BREADCRUMBS
}) => {
  return (
    <div className="space-y-8 mb-10">
      <div className="space-y-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-2 hover:text-indigo-600 transition-colors cursor-pointer">
            <Home className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </div>
          {breadcrumbs.map((crumb) => (
            <React.Fragment key={`crumb-${crumb.label}-${crumb.active ? 'active' : 'inactive'}`}>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <span className={crumb.active ? "text-indigo-600" : "hover:text-indigo-600 transition-colors cursor-pointer"}>
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
          {breadcrumbs.length === 0 && (
            <>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <span className="text-indigo-600">{title}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">{title}</h1>
            {description && <p className="text-slate-500 text-base font-medium max-w-2xl">{description}</p>}
          </div>
          {action && <div className="flex items-center gap-3 shrink-0 pb-1">{action}</div>}
        </div>
      </div>

      {filters && (
        <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm shadow-slate-200/20">
          {filters}
        </div>
      )}
    </div>
  );
};
