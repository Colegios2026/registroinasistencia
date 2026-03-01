import React, { createContext, useContext, useCallback, useState } from 'react';
import { TOAST_TYPES, type ToastType } from '../constants';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms, default 4000
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 4000 };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove after duration
    if (newToast.duration) {
      setTimeout(() => removeToast(id), newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toasts }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe estar dentro de <ToastProvider>');
  }
  return context;
};
