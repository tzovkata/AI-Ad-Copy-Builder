// src/components/rsa-builder/ManualImport.tsx

"use client";

import React from 'react';
import { X } from 'lucide-react';
import ActionButton from './ui/ActionButton';

interface ManualImportProps {
  isExpanded: boolean;
  onToggle: () => void;
  onImport: (lines: string[], type: 'headlines' | 'descriptions') => void;
}

const ManualImport: React.FC<ManualImportProps> = ({ isExpanded, onToggle, onImport }) => {
  const [importText, setImportText] = React.useState('');
  const [importType, setImportType] = React.useState<'headlines' | 'descriptions'>('headlines');
  const [previewLines, setPreviewLines] = React.useState<string[]>([]);

  React.useEffect(() => {
    const lines = importText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, importType === 'headlines' ? 15 : 4);
    setPreviewLines(lines);
  }, [importText, importType]);

  const handleImport = () => {
    if (previewLines.length > 0) {
      onImport(previewLines, importType);
      setImportText('');
      setPreviewLines([]);
      onToggle(); // Close the expanded section
    }
  };

  const maxLength = importType === 'headlines' ? 30 : 90;
  const maxItems = importType === 'headlines' ? 15 : 4;

  return (
    <div className="border border-gray-700/50 rounded-xl bg-gray-800/20 backdrop-blur-sm">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/30 transition-colors rounded-t-xl"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-purple-400">
              <path d="M4 2a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V2zm2 2v1h4V4H6zm0 3v1h4V7H6zm0 3v1h4v-1H6z"/>
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-300">Manual Ad Copy Import</h4>
            <p className="text-sm text-gray-500">Paste multiple lines and auto-populate fields</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">
            {isExpanded ? 'Click to collapse' : 'Click to expand'}
          </span>
          <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-gray-400">
              <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-6 border-t border-gray-700/30 space-y-6">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="headlines" checked={importType === 'headlines'} onChange={(e) => setImportType(e.target.value as 'headlines' | 'descriptions')} className="w-4 h-4 text-cyan-400 bg-gray-800 border-gray-600 focus:ring-cyan-400 focus:ring-2" />
              <span className="text-gray-300">Headlines (max 30 chars, up to 15 items)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="descriptions" checked={importType === 'descriptions'} onChange={(e) => setImportType(e.target.value as 'headlines' | 'descriptions')} className="w-4 h-4 text-cyan-400 bg-gray-800 border-gray-600 focus:ring-cyan-400 focus:ring-2" />
              <span className="text-gray-300">Descriptions (max 90 chars, up to 4 items)</span>
            </label>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">Paste your {importType} below (one per line):</label>
            <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={`Paste your ${importType} here...`} className="w-full h-32 px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200 placeholder-gray-500 backdrop-blur-sm resize-none" rows={6} />
          </div>
          {previewLines.length > 0 && ( <div className="space-y-3"> <h5 className="text-sm font-medium text-gray-400">Preview ({previewLines.length}/{maxItems} {importType}):</h5> <div className="grid gap-2 max-h-32 overflow-y-auto"> {previewLines.map((line, index) => ( <div key={index} className={`flex items-center justify-between p-2 rounded-lg text-sm ${ line.length > maxLength ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30' }`}> <span className={`flex-1 ${ line.length > maxLength ? 'text-red-400' : 'text-green-400' }`}> {index + 1}. {line} </span> <span className={`text-xs font-bold px-2 py-1 rounded ${ line.length > maxLength ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400' }`}> {line.length}/{maxLength} </span> </div> ))} </div> {previewLines.some(line => line.length > maxLength) && ( <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"> <div className="flex items-center gap-2"> <div className="text-amber-400 text-sm">⚠️</div> <span className="text-amber-400 text-sm font-medium">Some lines exceed the character limit and will be truncated when imported.</span> </div> </div> )} </div> )}
          <div className="flex gap-3 pt-2">
            <ActionButton onClick={handleImport} disabled={previewLines.length === 0} variant="primary" icon={ <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"> <path d="M8.75 2.75a.75.75 0 00-1.5 0v5.69L5.03 6.22a.75.75 0 00-1.06 1.06l3.5 3.5a.75.75 0 001.06 0l3.5-3.5a.75.75 0 00-1.06-1.06L8.75 8.44V2.75z"/> <path d="M3.5 9.75a.75.75 0 00-1.5 0v1.5A2.75 2.75 0 004.75 14h6.5A2.75 2.75 0 0014 11.25v-1.5a.75.75 0 00-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5z"/> </svg> }> Import {previewLines.length} {importType} </ActionButton>
            <ActionButton onClick={() => { setImportText(''); setPreviewLines([]); }} variant="secondary" disabled={importText.length === 0} icon={<X size={16} />}> Clear </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualImport;