// src/components/rsa-builder/ui/TextInput.tsx

import React from 'react';
import { TextInputProps } from '@/types';

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  type = 'input'
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxLength) {
      onChange(e.target.value);
    }
  };

  const percentage = (value.length / maxLength) * 100;
  let colorClass = 'text-green-400 bg-green-500/10';
  if (percentage > 90) colorClass = 'text-amber-400 bg-amber-500/10';
  else if (percentage > 70) colorClass = 'text-amber-400 bg-amber-500/10';

  const commonProps = {
    value,
    onChange: handleChange,
    placeholder,
    className: "w-full px-4 py-3 pr-20 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200 placeholder-gray-500 backdrop-blur-sm",
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <div className="relative">
        {type === 'textarea' ? (
          <textarea {...commonProps} rows={3} className={`${commonProps.className} resize-none`} />
        ) : (
          <input type="text" {...commonProps} />
        )}
        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2.5 py-1 rounded-full ${colorClass}`}>
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
};

export default TextInput;