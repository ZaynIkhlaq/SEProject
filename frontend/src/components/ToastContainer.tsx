import React, { useEffect } from 'react';
import { useToast, ToastType } from '../context/ToastContext';

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'bg-ramp-green-500 text-white';
    case 'error':
      return 'bg-ramp-red-500 text-white';
    case 'warning':
      return 'bg-ramp-orange-500 text-white';
    case 'info':
      return 'bg-ramp-blue-500 text-white';
  }
};

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'OK';
    case 'error':
      return 'ERR';
    case 'warning':
      return '!';
    case 'info':
      return 'i';
  }
};

const ToastItem: React.FC<{ toast: any; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`${getToastStyles(
        toast.type
      )} rounded-lg p-4 shadow-lg flex items-center gap-3 animate-slide-in-left max-w-sm`}
    >
      <span className="text-lg font-bold flex-shrink-0">{getToastIcon(toast.type)}</span>
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-2 opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
      >
        Close
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
};
