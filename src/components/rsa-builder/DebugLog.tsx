// src/components/rsa-builder/DebugLog.tsx

import React from 'react';
import Section from './ui/Section';

interface DebugLogProps {
  logs: string[];
}

const DebugLog: React.FC<DebugLogProps> = ({ logs }) => {
  if (logs.length === 0) return null;

  return (
    <Section title="Debug Log" subtitle="Real-time debugging information." className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
      <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
        <div className="font-mono text-sm space-y-1">
          {logs.map((log, index) => (
            <div key={index} className={`${log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : 'text-gray-300'}`}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default DebugLog;