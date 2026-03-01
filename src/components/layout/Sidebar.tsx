import React from 'react';
import {  
  LayoutDashboard, 
  UserX, 
  ClipboardList, 
  ShieldAlert, 
  Users, 
  Settings,
  ChevronRight,
  X
} from 'lucide-react';
import { cn } from '../../utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  level: 'BASICA' | 'MEDIA';
  setLevel: (level: 'BASICA' | 'MEDIA') => void;
  isAuthenticated: boolean;
  isStaff: boolean;
  isSuperuser: boolean;
  roleLabel: string;
  userEmail?: string;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const menuItems = [
  { id: 'docente_public', label: 'Vista Docente', icon: LayoutDashboard },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inasistencias', label: 'Inasistencias', icon: UserX },
  { id: 'pruebas', label: 'Registro de Pruebas', icon: ClipboardList },
  { id: 'inspectoria', label: 'Atención Inspectoría', icon: ShieldAlert },
  { id: 'estudiantes', label: 'Estudiantes', icon: Users },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  level,
  setLevel,
  isAuthenticated,
  isStaff,
  isSuperuser,
  roleLabel,
  userEmail,
  onLoginClick,
  onLogoutClick
}) => {
  const visibleItems = menuItems.filter((item) => {
    if (!isStaff) return item.id === 'docente_public';
    if (item.id === 'docente_public') return false;
    if (!isSuperuser && item.id === 'configuracion') return false;
    return true;
  });

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        role="button"
        tabIndex={isOpen ? 0 : -1}
        aria-label="Cerrar menú lateral"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
          }
        }}
      />

      <div className={cn(
        "w-72 h-screen bg-white border-r border-slate-200/60 flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
              <span className="text-white font-bold text-xl tracking-tighter">R</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Registro Escolar</h1>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="bg-slate-50 p-1 rounded-2xl flex gap-1 border border-slate-200/50">
            <button 
              onClick={() => setLevel('BASICA')}
              className={cn(
                "flex-1 py-2 text-[11px] font-bold rounded-xl transition-all duration-200 tracking-wider",
                level === 'BASICA' ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" : "text-slate-400 hover:text-slate-600"
              )}
            >
              BÁSICA
            </button>
            <button 
              onClick={() => setLevel('MEDIA')}
              className={cn(
                "flex-1 py-2 text-[11px] font-bold rounded-xl transition-all duration-200 tracking-wider",
                level === 'MEDIA' ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" : "text-slate-400 hover:text-slate-600"
              )}
            >
              MEDIA
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-indigo-50/50 text-indigo-700 font-semibold" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={cn("w-5 h-5 transition-colors duration-200", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} strokeWidth={isActive ? 2 : 1.5} />
                  <span className="text-sm tracking-tight">{item.label}</span>
                </div>
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full" />
                )}
                {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-100/60">
          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Sesión</p>
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm border border-indigo-200/50">
                {(userEmail?.[0] || 'G').toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{isAuthenticated ? (userEmail || 'Usuario') : 'Invitado'}</p>
                <p className="text-[11px] text-slate-500 font-medium">{roleLabel}</p>
              </div>
            </div>
            <div className="mt-3">
              {isAuthenticated ? (
                <button
                  onClick={onLogoutClick}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cerrar sesión
                </button>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="w-full px-3 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Ingresar Staff
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
                  <div className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full" />
};
