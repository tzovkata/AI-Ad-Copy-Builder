// src/components/rsa-builder/ApiConfig.tsx

import React from 'react';
import { Check, X } from 'lucide-react';
import { ApiConfigProps } from '@/types';

const ApiConfig: React.FC<ApiConfigProps> = ({ config, setConfig, isConnected, onClearConfig, isExpanded, onToggleExpanded }) => (
  <div className={`quantum-section mb-12 animate-fade-in-up`} style={{ animationDelay: '100ms' }}>
    <div className="glass-card glow-effect rounded-2xl transition-all duration-300">
      <div className="flex items-center justify-between p-6 cursor-pointer" onClick={onToggleExpanded}>
        <div className="flex items-center gap-4">
          <div className="section-title-container">
            <h2 className="text-2xl font-bold text-white mb-1">API Configuration</h2>
            <div className="title-accent-line"></div>
          </div>
          <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${isConnected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {isConnected ? <Check size={14} /> : <X size={14} />} {isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">{isExpanded ? 'Click to collapse' : 'Click to expand'}</span>
          <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="text-gray-400">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6 border-t border-gray-700/30">
          <p className="text-gray-400 mb-6 mt-4">Connect to your preferred AI model provider.</p>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center p-6 rounded-xl border border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
              <select value={config.provider} onChange={(e) => setConfig(prev => ({ ...prev, provider: e.target.value }))} className="w-full px-4 py-3 bg-gray-800/80 border-2 border-gray-700 rounded-lg focus:border-cyan-400">
                <option value="gemini-2.5-flash">Google Gemini 2.5 Flash</option>
                <option value="openai">OpenAI GPT</option>
                <option value="claude-sonnet-4">Anthropic Claude Sonnet 4</option>
              </select>
              <div className="md:col-span-2">
                <input type="password" value={config.key} onChange={(e) => setConfig(prev => ({ ...prev, key: e.target.value }))} placeholder="Enter your API key..." className="w-full px-4 py-3 bg-gray-800/80 border-2 border-gray-700 rounded-lg focus:border-cyan-400"/>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                {isConnected && (
                  <button onClick={(e) => { e.stopPropagation(); onClearConfig(); }} className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg">Clear Config</button>
                )}
              </div>
            </div>
            {isConnected && (
              <div className="flex justify-between items-center p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <Check className="text-green-400" size={20} />
                  <span className="text-green-400 font-medium">API key saved locally and ready to use</span>
                </div>
              </div>
            )}
            <div className="text-sm text-gray-500 p-4 rounded-lg bg-gray-800/20 border border-gray-700/30">
              <p className="mb-2"><strong>🔒 Security:</strong> Your API key is stored locally.</p>
              <p><strong>🔑 Get API Keys:</strong> <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 ml-1 hover:underline">Gemini</a> • <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-cyan-400 ml-1 hover:underline">OpenAI</a> • <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-cyan-400 ml-1 hover:underline">Claude</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ApiConfig;