import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, X, CheckCircle2, AlertCircle, Info, ExternalLink, BookOpen, MessageSquare, LifeBuoy } from 'lucide-react';
import { Badge, Button, Modal } from '../ui';
import { cn } from '../../utils';

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
  isAuthenticated: boolean;
  roleLabel: string;
  userEmail?: string;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning';
  time: string;
  read: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  onMenuClick,
  isAuthenticated,
  roleLabel,
  userEmail,
  onLoginClick,
  onLogoutClick
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Nueva Inasistencia',
      description: 'Se ha registrado una inasistencia para Juan Pérez (4° Medio A).',
      type: 'info',
      time: 'Hace 5 min',
      read: false
    },
    {
      id: '2',
      title: 'Prueba Afectada',
      description: 'La inasistencia de María Soto afecta la prueba de Matemáticas de mañana.',
      type: 'warning',
      time: 'Hace 15 min',
      read: false
    },
    {
      id: '3',
      title: 'Reporte Generado',
      description: 'El reporte mensual de convivencia ha sido generado exitosamente.',
      type: 'success',
      time: 'Hace 1 hora',
      read: true
    }
  ]);

  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 md:px-10 sticky top-0 z-20">
      <div className="flex items-center gap-5">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all duration-200 active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight truncate max-w-[200px] md:max-w-none">{title}</h2>
      </div>

      <div className="flex items-center gap-3 md:gap-8">
        <div className="relative hidden lg:block group">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200" strokeWidth={2} />
          <input 
            type="text" 
            placeholder="Buscar en la plataforma..." 
            className="pl-11 pr-5 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white w-64 xl:w-80 transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "p-2.5 rounded-2xl transition-all duration-200 relative active:scale-95",
                showNotifications ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <Bell className="w-5 h-5" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white border border-slate-200/60 rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden z-50">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <h3 className="font-bold text-slate-900 text-sm">Notificaciones</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                      >
                        Marcar todo
                      </button>
                    )}
                  </div>
                  <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <Bell className="w-6 h-6 text-slate-300" strokeWidth={1} />
                        </div>
                        <p className="text-sm font-medium text-slate-400">Sin notificaciones</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button 
                          type="button"
                          key={n.id} 
                          className={cn(
                            "w-full text-left p-5 hover:bg-slate-50/80 transition-colors cursor-pointer relative group",
                            !n.read && "bg-indigo-50/20"
                          )}
                          onClick={() => markAsRead(n.id)}
                        >
                          <div className="flex gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border",
                              n.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                              n.type === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100/50' :
                              'bg-indigo-50 text-indigo-600 border-indigo-100/50'
                            )}>
                              {n.type === 'success' ? <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} /> :
                               n.type === 'warning' ? <AlertCircle className="w-5 h-5" strokeWidth={1.5} /> :
                               <Info className="w-5 h-5" strokeWidth={1.5} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className={cn("text-sm font-bold truncate tracking-tight", !n.read ? 'text-slate-900' : 'text-slate-600')}>
                                  {n.title}
                                </p>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{n.time}</span>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                {n.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="p-4 border-t border-slate-100 text-center bg-slate-50/30">
                    <button className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors">
                      Ver historial completo
                    </button>
                  </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-slate-200/60 mx-1 hidden sm:block"></div>

          <div className="flex items-center gap-3 pl-1">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-900 leading-none mb-1">{isAuthenticated ? (userEmail || 'Usuario') : 'Invitado'}</p>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">{roleLabel}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 font-bold text-sm shadow-sm">
              {(userEmail?.[0] || 'G').toUpperCase()}
            </div>
            {isAuthenticated ? (
              <button
                onClick={onLogoutClick}
                className="hidden md:block px-3 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Salir
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                className="hidden md:block px-3 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Ingresar Staff
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
