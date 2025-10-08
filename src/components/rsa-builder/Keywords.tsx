// src/components/rsa-builder/Keywords.tsx

import React from 'react';
import { Sparkles, Plus, Trash2, UploadCloud } from 'lucide-react';
import { Keyword, KeywordOptions } from '@/types';
import ActionButton from './ui/ActionButton';

interface KeywordsProps {
  campaignId: string;
  adGroupId: string;
  keywords: Keyword[];
  isExpanded: boolean;
  isGenerating: boolean;
  onToggle: () => void;
  onGenerate: (campaignId: string, adGroupId: string, options: KeywordOptions) => void;
  onAdd: (campaignId: string, adGroupId: string) => void;
  onUpdate: (campaignId: string, adGroupId: string, keywordId: string, keyword: Keyword) => void;
  onRemove: (campaignId: string, adGroupId: string, keywordId: string) => void;
  isConnected: boolean;
  onBulkKeywordImport: (campaignId: string, adGroupId: string, keywords: string, matchType: Keyword['matchType']) => void;
}

const Keywords: React.FC<KeywordsProps> = ({
  campaignId,
  adGroupId,
  keywords,
  isExpanded,
  isGenerating,
  onToggle,
  onGenerate,
  onAdd,
  onUpdate,
  onRemove,
  isConnected,
  onBulkKeywordImport,
}) => {
  const [options, setOptions] = React.useState<KeywordOptions>({
    prompt: '',
    numKeywords: 10,
    matchTypes: { 
        exact: true, 
        phrase: true, 
        broad: false,
        negativePhrase: false,
        negativeExact: false,
        campaignNegativePhrase: false,
        campaignNegativeExact: false,
    },
  });

  const [bulkKeywords, setBulkKeywords] = React.useState('');
  const [bulkMatchType, setBulkMatchType] = React.useState<Keyword['matchType']>('Broad');

  const handleGenerate = () => {
    onGenerate(campaignId, adGroupId, options);
  };

  const handleBulkImport = () => {
    onBulkKeywordImport(campaignId, adGroupId, bulkKeywords, bulkMatchType);
    setBulkKeywords('');
  };

  return (
    <div className="glass-card glow-effect rounded-2xl mt-8">
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-800/20 transition-colors rounded-t-2xl"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold text-white">Keywords</h3>
           <div className="title-accent-line !w-1/4"></div>
        </div>
        <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
           <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="text-gray-400">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </div>
      </div>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-8 border-t border-gray-700/30">
          <div className="mt-6 space-y-8">
            {/* AI Keyword Generation */}
            <div>
              <h4 className="text-xl font-semibold text-white mb-3">Generate Keywords with AI</h4>
              <textarea
                value={options.prompt}
                onChange={(e) => setOptions(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Enter a prompt to generate keywords. For example: 'Generate keywords for a new brand of wireless headphones, and also some negative keywords like 'cheap' or 'refurbished''"
                className="w-full h-24 px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200 placeholder-gray-500 backdrop-blur-sm resize-none"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Number of Keywords</label>
                  <input
                    type="number"
                    value={options.numKeywords}
                    onChange={(e) => setOptions(prev => ({ ...prev, numKeywords: parseInt(e.target.value, 10) }))}
                    className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Match Types to Generate</label>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={options.matchTypes.exact} onChange={(e) => setOptions(prev => ({ ...prev, matchTypes: { ...prev.matchTypes, exact: e.target.checked } }))} className="w-4 h-4 text-cyan-400 bg-gray-800 border-gray-600 focus:ring-cyan-400" />
                      <span>Exact</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={options.matchTypes.phrase} onChange={(e) => setOptions(prev => ({ ...prev, matchTypes: { ...prev.matchTypes, phrase: e.target.checked } }))} className="w-4 h-4 text-cyan-400 bg-gray-800 border-gray-600 focus:ring-cyan-400" />
                      <span>Phrase</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={options.matchTypes.broad} onChange={(e) => setOptions(prev => ({ ...prev, matchTypes: { ...prev.matchTypes, broad: e.target.checked } }))} className="w-4 h-4 text-cyan-400 bg-gray-800 border-gray-600 focus:ring-cyan-400" />
                      <span>Broad</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-red-400">
                      <input type="checkbox" checked={options.matchTypes.negativePhrase} onChange={(e) => setOptions(prev => ({ ...prev, matchTypes: { ...prev.matchTypes, negativePhrase: e.target.checked } }))} className="w-4 h-4 text-red-400 bg-gray-800 border-gray-600 focus:ring-red-400" />
                      <span>Negative Phrase</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-red-400">
                      <input type="checkbox" checked={options.matchTypes.negativeExact} onChange={(e) => setOptions(prev => ({ ...prev, matchTypes: { ...prev.matchTypes, negativeExact: e.target.checked } }))} className="w-4 h-4 text-red-400 bg-gray-800 border-gray-600 focus:ring-red-400" />
                      <span>Negative Exact</span>
                    </label>
                     <label className="flex items-center gap-2 cursor-pointer text-red-400">
                      <input type="checkbox" checked={options.matchTypes.campaignNegativePhrase} onChange={(e) => setOptions(prev => ({ ...prev, matchTypes: { ...prev.matchTypes, campaignNegativePhrase: e.target.checked } }))} className="w-4 h-4 text-red-400 bg-gray-800 border-gray-600 focus:ring-red-400" />
                      <span>Campaign Negative Phrase</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-red-400">
                      <input type="checkbox" checked={options.matchTypes.campaignNegativeExact} onChange={(e) => setOptions(prev => ({ ...prev, matchTypes: { ...prev.matchTypes, campaignNegativeExact: e.target.checked } }))} className="w-4 h-4 text-red-400 bg-gray-800 border-gray-600 focus:ring-red-400" />
                      <span>Campaign Negative Exact</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                 <ActionButton onClick={handleGenerate} isLoading={isGenerating} disabled={!isConnected || !options.prompt.trim()} icon={<Sparkles size={20} />}>
                  Generate Keywords
                </ActionButton>
              </div>
            </div>

            {/* Manual Keyword Input */}
            <div>
              <h4 className="text-xl font-semibold text-white mb-3">Manual Keyword Entry</h4>
              
              <div className="p-4 rounded-lg bg-gray-800/20 border border-gray-700/30 space-y-4 mb-6">
                <label className="block text-sm font-medium text-gray-400">Paste keywords (one per line)</label>
                 <textarea
                  value={bulkKeywords}
                  onChange={(e) => setBulkKeywords(e.target.value)}
                  placeholder="keyword one&#x0a;keyword two&#x0a;keyword three"
                  className="w-full h-24 px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400"
                />
                <div className="flex items-center gap-4">
                  <select value={bulkMatchType} onChange={(e) => setBulkMatchType(e.target.value as Keyword['matchType'])} className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400">
                    <option value="Broad">Broad</option>
                    <option value="Phrase">Phrase</option>
                    <option value="Exact">Exact</option>
                    <option value="Negative Phrase">Negative Phrase</option>
                    <option value="Negative Exact">Negative Exact</option>
                    <option value="Campaign Negative Phrase">Campaign Negative Phrase</option>
                    <option value="Campaign Negative Exact">Campaign Negative Exact</option>
                  </select>
                  <ActionButton onClick={handleBulkImport} disabled={!bulkKeywords.trim()} icon={<UploadCloud size={20} />}>
                    Import
                  </ActionButton>
                </div>
              </div>


              <h5 className="text-lg font-semibold text-white mb-3">Keyword List</h5>
              <div className="space-y-4">
                {keywords.map((kw, index) => (
                  <div key={kw.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <input
                      type="text"
                      value={kw.text}
                      onChange={(e) => onUpdate(campaignId, adGroupId, kw.id, { ...kw, text: e.target.value })}
                      className="md:col-span-2 w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400"
                      placeholder={`Keyword ${index + 1}`}
                    />
                    <div className="flex items-center gap-2">
                      <select value={kw.matchType} onChange={(e) => onUpdate(campaignId, adGroupId, kw.id, { ...kw, matchType: e.target.value as Keyword['matchType'] })} className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400">
                        <option>Broad</option>
                        <option>Phrase</option>
                        <option>Exact</option>
                        <option>Negative Phrase</option>
                        <option>Negative Exact</option>
                        <option>Campaign Negative Phrase</option>
                        <option>Campaign Negative Exact</option>
                      </select>
                       <button onClick={() => onRemove(campaignId, adGroupId, kw.id)} className="p-2 text-gray-500 hover:text-red-400"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
                 {keywords.length === 0 && <p className="text-gray-500">No keywords added yet.</p>}
              </div>
               <div className="mt-6">
                <ActionButton onClick={() => onAdd(campaignId, adGroupId)} icon={<Plus size={20} />} variant="secondary">
                  Add Keyword Manually
                </ActionButton>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Keywords;