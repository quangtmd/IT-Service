
import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

const icons = {
  success: 'fas fa-check-circle',
  error: 'fas fa-times-circle',
  info: 'fas fa-info-circle',
  warning: 'fas fa-exclamation-triangle',
};

const colors = {
  success: 'border-green-500 text-green-600 bg-green-50',
  error: 'border-red-500 text-red-600 bg-red-50',
  info: 'border-blue-500 text-blue-600 bg-blue-50',
  warning: 'border-yellow-500 text-yellow-600 bg-yellow-50',
};

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div
      className={`flex items-center w-full max-w-sm p-4 mb-3 text-gray-500 bg-white rounded-lg shadow-lg border-l-4 transition-all duration-500 ease-in-out transform translate-x-0 opacity-100 ${colors[type]}`}
      role="alert"
    >
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${type === 'success' ? 'text-green-500' : type === 'error' ? 'text-red-500' : type === 'warning' ? 'text-yellow-500' : 'text-blue-500'}`}>
        <i className={`${icons[type]} text-xl`}></i>
      </div>
      <div className="ml-3 text-sm font-medium text-gray-800">{message}</div>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 items-center justify-center"
        aria-label="Close"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Toast;
