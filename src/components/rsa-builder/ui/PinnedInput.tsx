// src/components/rsa-builder/ui/PinnedInput.tsx

import React from 'react';
import { PinnedInputProps } from '@/types';

const PinnedInput: React.FC<PinnedInputProps> = ({
  label,
  asset,
  onAssetChange,
  maxLength,
  pinOptions,
  isDescription = false
}) => {
  const handleTextChange = (text: string) => {
    if (text.length <= maxLength) {
      onAssetChange({ ...asset, text });
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === 'null' ? null : parseInt(e.target.value, 10);
    onAssetChange({ ...asset, position: value });
  };

  const percentage = (asset.text.length / maxLength) * 100;
  let colorClass = 'text-green-400 bg-green-500/10';
  if (percentage > 90) colorClass = 'text-amber-400 bg-amber-500/10';
  else if (percentage > 70) colorClass = 'text-amber-400 bg-amber-500/10';

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-400">{label}</label>
      <div className={`flex gap-2 ${isDescription ? 'items-start' : 'items-center'}`}>
        <div className="flex-1 relative">
          {isDescription ? (
            <textarea
              value={asset.text}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full h-24 p-3 pr-20 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200 placeholder-gray-500 backdrop-blur-sm resize-none"
            />
          ) : (
            <input
              type="text"
              value={asset.text}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full h-full px-4 py-3 pr-20 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200 placeholder-gray-500 backdrop-blur-sm"
            />
          )}
          <span className={`absolute right-3 top-3 text-xs font-bold px-2.5 py-1 rounded-full ${colorClass}`}>
            {asset.text.length}/{maxLength}
          </span>
        </div>
        <div className="relative h-full">
          <select
            value={asset.position === null ? 'null' : asset.position}
            onChange={handlePinChange}
            className="appearance-none w-full sm:w-auto h-full px-3 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200"
            title="Pin position"
          >
            <option value="null">Unpinned</option>
            {pinOptions.map(p => <option key={p} value={p}>Pin {p}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default PinnedInput;