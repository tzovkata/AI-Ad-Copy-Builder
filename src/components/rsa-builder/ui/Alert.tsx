// src/components/rsa-builder/ui/Alert.tsx

import React from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { AlertProps } from '@/types';

const Alert: React.FC<AlertProps> = ({ message, type }) => {
  if (!message) return null;

  const isError = type === 'error';
  const config = {
    bgColor: isError ? 'bg-red-500/10' : 'bg-green-500/10',
    borderColor: isError ? 'border-red-500' : 'border-green-500',
    textColor: isError ? 'text-red-400' : 'text-green-400',
    Icon: isError ? AlertCircle : Check,
  };

  return (
    <div className={`${config.bgColor} border-l-4 ${config.borderColor} ${config.textColor} p-4 my-6 rounded-md backdrop-blur-sm`}>
      <div className="flex items-center">
        <config.Icon className="mr-3" size={22} />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

export default Alert;