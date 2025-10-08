"use client";

import React from 'react';
import { Sparkles, Trash2, X } from 'lucide-react';
import { AdGroupProps, AdAsset, Keyword, KeywordOptions } from '@/types';
import ActionButton from './ui/ActionButton';
import TextInput from './ui/TextInput';
import PinnedInput from './ui/PinnedInput';
import ManualImport from './ManualImport';
import Keywords from './Keywords';

const AdGroup: React.FC<AdGroupProps> = ({ campaignId, adGroup, onUpdate, onRemove, onClearAdGroup, onGenerate, onBulkImport, isConnected, onGenerateKeywords, onAddKeyword, onUpdateKeyword, onRemoveKeyword, onBulkKeywordImport }) => {

  const handleAssetUpdate = (index: number, type: 'headlines' | 'descriptions', newAsset: AdAsset) => {
    const currentAssets: AdAsset[] = JSON.parse(JSON.stringify(adGroup[type]));
    currentAssets[index] = newAsset;
    onUpdate(campaignId, adGroup.id, type, currentAssets);
  };

  const handleLocalBulkImport = (lines: string[], type: 'headlines' | 'descriptions') => {
    onBulkImport(campaignId, adGroup.id, lines, type);
  };

  return (
    <div className="glass-card glow-effect rounded-2xl mb-8 transition-all duration-300">
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-800/20 transition-colors rounded-t-2xl"
        onClick={() => onUpdate(campaignId, adGroup.id, 'isExpanded', !adGroup.isExpanded)}
      >
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={adGroup.name}
            onChange={(e) => onUpdate(campaignId, adGroup.id, 'name', e.target.value)}
            placeholder="Enter Ad Group Name"
            className="text-2xl font-bold text-white bg-transparent border-none focus:ring-0 p-0 w-full truncate"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="title-accent-line !w-1/4"></div>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(campaignId, adGroup.id);
            }}
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
            aria-label="Remove Ad Group"
          >
            <Trash2 size={18} />
          </button>
          <div className={`transform transition-transform duration-300 ${adGroup.isExpanded ? 'rotate-180' : 'rotate-0'}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="text-gray-400">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
        adGroup.isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pb-8 border-t border-gray-700/30">
          <div className="mt-6 space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Ad Group Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Max CPC</label>
                  <input
                    type="text"
                    value={adGroup.maxCPC}
                    onChange={(e) => onUpdate(campaignId, adGroup.id, 'maxCPC', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200"
                    placeholder="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Max CPM</label>
                  <input
                    type="text"
                    value={adGroup.maxCPM}
                    onChange={(e) => onUpdate(campaignId, adGroup.id, 'maxCPM', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200"
                    placeholder="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Target CPV</label>
                  <input
                    type="text"
                    value={adGroup.targetCPV}
                    onChange={(e) => onUpdate(campaignId, adGroup.id, 'targetCPV', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200"
                    placeholder="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Target CPM</label>
                  <input
                    type="text"
                    value={adGroup.targetCPM}
                    onChange={(e) => onUpdate(campaignId, adGroup.id, 'targetCPM', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200"
                    placeholder="0.01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Campaign Status</label>
                  <select
                    value={adGroup.campaignStatus}
                    onChange={(e) => onUpdate(campaignId, adGroup.id, 'campaignStatus', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200"
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Ad Group Status</label>
                  <select
                    value={adGroup.adGroupStatus}
                    onChange={(e) => onUpdate(campaignId, adGroup.id, 'adGroupStatus', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200"
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Ad Group Destination</h3>
              <TextInput
                label="Final URL"
                value={adGroup.finalUrl}
                onChange={(val) => onUpdate(campaignId, adGroup.id, 'finalUrl', val)}
                maxLength={2048}
                placeholder="https://example.com/product-for-this-ad-group"
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Product Information & Prompt</h3>
              <textarea
                value={adGroup.productInfo}
                onChange={(e) => onUpdate(campaignId, adGroup.id, 'productInfo', e.target.value)}
                placeholder={`Describe the product/service for this specific ad group...`}
                className="w-full h-48 px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200 placeholder-gray-500 backdrop-blur-sm resize-none"
              />
            </div>

            <div className="text-center flex gap-4 justify-center flex-wrap">
              <ActionButton
                onClick={() => onGenerate(campaignId, adGroup.id)}
                isLoading={adGroup.isGenerating}
                disabled={!isConnected || !adGroup.productInfo.trim()}
                icon={<Sparkles size={20} />}
              >
                Generate Ad Copy
              </ActionButton>
              <ActionButton
                onClick={() => onUpdate(campaignId, adGroup.id, 'isManualImportExpanded', !adGroup.isManualImportExpanded)}
                disabled={adGroup.isGenerating}
                icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 011-1h8a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V4zM7 6v1h6V6H7zm0 3v1h6V9H7zm0 3v1h6v-1H7z"/></svg>}
                variant="secondary"
              >
                Manual Import
              </ActionButton>
              <ActionButton
                onClick={() => onClearAdGroup(campaignId, adGroup.id)}
                disabled={adGroup.isGenerating}
                icon={<X size={20} />}
                variant="secondary"
              >
                Clear Ad Group
              </ActionButton>
            </div>

            <div className="mb-8">
              <ManualImport
                isExpanded={adGroup.isManualImportExpanded}
                onToggle={() => onUpdate(campaignId, adGroup.id, 'isManualImportExpanded', !adGroup.isManualImportExpanded)}
                onImport={handleLocalBulkImport}
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-300 mb-4">Headlines</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {adGroup.headlines.map((asset, i) => (
                  <PinnedInput
                    key={i}
                    label={`H${i + 1}`}
                    asset={asset}
                    onAssetChange={(newAsset) => handleAssetUpdate(i, 'headlines', newAsset)}
                    maxLength={30}
                    pinOptions={[1, 2, 3]}
                  />
                ))}
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-300 mb-4">Descriptions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {adGroup.descriptions.map((asset, i) => (
                  <PinnedInput
                    key={i}
                    label={`D${i + 1}`}
                    asset={asset}
                    onAssetChange={(newAsset) => handleAssetUpdate(i, 'descriptions', newAsset)}
                    maxLength={90}
                    pinOptions={[1, 2]}
                    isDescription
                  />
                ))}
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-300 mb-4">Display Paths (Max 15 Chars)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput
                  label="Path 1"
                  value={adGroup.path1}
                  onChange={(val) => onUpdate(campaignId, adGroup.id, 'path1', val)}
                  maxLength={15}
                />
                <TextInput
                  label="Path 2"
                  value={adGroup.path2}
                  onChange={(val) => onUpdate(campaignId, adGroup.id, 'path2', val)}
                  maxLength={15}
                />
              </div>
            </div>
          </div>
        </div>
        <Keywords
                    campaignId={campaignId}
                    adGroupId={adGroup.id}
                    keywords={adGroup.keywords}
                    isExpanded={adGroup.isKeywordsExpanded}
                    isGenerating={adGroup.isGeneratingKeywords}
                    onToggle={() => onUpdate(campaignId, adGroup.id, 'isKeywordsExpanded', !adGroup.isKeywordsExpanded)}
                    onGenerate={onGenerateKeywords}
                    onAdd={onAddKeyword}
                    onUpdate={onUpdateKeyword}
                    onRemove={onRemoveKeyword}
                    isConnected={isConnected}
                    onBulkKeywordImport={onBulkKeywordImport}
                />
      </div>
    </div>
  );
};

export default AdGroup;