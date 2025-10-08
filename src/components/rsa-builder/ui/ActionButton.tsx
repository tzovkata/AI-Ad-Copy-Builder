// src/components/rsa-builder/ui/ActionButton.tsx

import React from 'react';
import { ActionButtonProps } from '@/types';

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  children,
  className = '',
  icon,
  variant = 'primary'
}) => {
  const baseClasses = "inline-flex items-center justify-center gap-3 px-6 py-3 font-semibold text-base rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";

  const variantClasses = {
    primary: "bg-cyan-400 text-gray-900 hover:bg-cyan-300 shadow-cyan-400/20 hover:shadow-cyan-300/30",
    secondary: "bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 hover:shadow-cyan-400/20",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
          <span>Please wait...</span>
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
};

export default ActionButton;