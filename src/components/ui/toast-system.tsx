import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface ToastType {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const toastStyles = {
  success: 'bg-toast-success',
  error: 'bg-toast-error',
  info: 'bg-toast-info',
};

let toastId = 0;
const listeners: ((toasts: ToastType[]) => void)[] = [];
let toasts: ToastType[] = [];

const addToast = (toast: Omit<ToastType, 'id'>) => {
  const newToast: ToastType = {
    ...toast,
    id: (++toastId).toString(),
    duration: toast.duration || 5000,
  };
  
  toasts = [...toasts, newToast];
  listeners.forEach(listener => listener(toasts));
  
  // Auto remove after duration
  setTimeout(() => {
    removeToast(newToast.id);
  }, newToast.duration);
};

const removeToast = (id: string) => {
  toasts = toasts.filter(toast => toast.id !== id);
  listeners.forEach(listener => listener(toasts));
};

export const toast = {
  success: (title: string, description?: string) => 
    addToast({ type: 'success', title, description }),
  error: (title: string, description?: string) => 
    addToast({ type: 'error', title, description }),
  info: (title: string, description?: string) => 
    addToast({ type: 'info', title, description }),
};

export const ToastContainer: React.FC = () => {
  const [currentToasts, setCurrentToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    const listener = (newToasts: ToastType[]) => {
      setCurrentToasts(newToasts);
    };
    
    listeners.push(listener);
    
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {currentToasts.map((toast) => {
        const Icon = toastIcons[toast.type];
        const bgColor = toastStyles[toast.type];
        
        return (
          <div
            key={toast.id}
            className={`${bgColor} text-white p-4 rounded-lg shadow-lg max-w-sm animate-slide-in-right flex items-start space-x-3`}
          >
            <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">{toast.title}</h4>
              {toast.description && (
                <p className="text-sm opacity-90 mt-1">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white hover:text-gray-200 transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};