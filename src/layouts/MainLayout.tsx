import React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  level: 'BASICA' | 'MEDIA';
  setLevel: (level: 'BASICA' | 'MEDIA') => void;
  title: string;
  isAuthenticated: boolean;
  isStaff: boolean;
  isSuperuser: boolean;
  roleLabel: string;
  userEmail?: string;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
  level,
  setLevel,
  title,
  isAuthenticated,
  isStaff,
  isSuperuser,
  roleLabel,
  userEmail,
  onLoginClick,
  onLogoutClick
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        level={level}
        setLevel={setLevel}
        isAuthenticated={isAuthenticated}
        isStaff={isStaff}
        isSuperuser={isSuperuser}
        roleLabel={roleLabel}
        userEmail={userEmail}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
      />
      
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col relative overflow-y-auto">
        <Topbar 
          title={title} 
          onMenuClick={() => setIsSidebarOpen(true)}
          isAuthenticated={isAuthenticated}
          roleLabel={roleLabel}
          userEmail={userEmail}
          onLoginClick={onLoginClick}
          onLogoutClick={onLogoutClick}
        />
        
        <div className="flex-1 p-6 md:p-10 lg:p-12">
          <div className="max-w-screen-2xl mx-auto space-y-10">
            {children}
          </div>
        </div>

        <footer className="px-6 md:px-10 lg:px-12 py-10 border-t border-slate-200/60 bg-white/50 backdrop-blur-sm text-center">
          <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
            © 2026 Sistema de Gestión de Convivencia Escolar • Registro Institucional • Versión 1.0.0
          </p>
        </footer>
      </main>
    </div>
  );
};
