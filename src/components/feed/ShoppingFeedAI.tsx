// src/components/feed/ShoppingFeedAI.tsx
// REPLACE ENTIRE FILE - FIXES COLUMN SELECTOR

"use client";

import React from 'react';
import { Upload, Download, Settings, Sparkles, CheckSquare, Square, X, FileText, Type } from 'lucide-react';
import { useFeedOptimiser } from '@/hooks/useFeedOptimiser';
import { OptimisationSettings } from '@/types/feed';
import { ApiConfig } from '@/types';
import ActionButton from '@/components/rsa-builder/ui/ActionButton';
import Alert from '@/components/rsa-builder/ui/Alert';

interface ShoppingFeedAIProps {
  apiConfig: ApiConfig;
  isConnected: boolean;
}

const ShoppingFeedAI: React.FC<ShoppingFeedAIProps> = ({ apiConfig, isConnected }) => {
  const {
    feedState,
    status,
    handleFileUpload,
    updateRow,
    optimiseTitle,
    optimiseDescription,
    toggleRowSelection,
    selectAllRows,
    deselectAllRows,
    exportFeed,
  } = useFeedOptimiser(apiConfig);

  const [showSettings, setShowSettings] = React.useState(false);
  const [optimisationSettings, setOptimisationSettings] = React.useState<OptimisationSettings>({
    selectedAttributes: ['brand', 'color', 'size', 'material'],
    includeInTitle: true,
    includeInDescription: true,
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleOptimiseSelectedTitles = async () => {
    if (!isConnected) return;
    const selectedIds = Array.from(feedState.selectedRows);
    for (const rowId of selectedIds) {
      await optimiseTitle(rowId, optimisationSettings);
    }
  };

  const handleOptimiseSelectedDescriptions = async () => {
    if (!isConnected) return;
    const selectedIds = Array.from(feedState.selectedRows);
    for (const rowId of selectedIds) {
      await optimiseDescription(rowId, optimisationSettings);
    }
  };

  const toggleAttribute = (attr: string) => {
    setOptimisationSettings(prev => ({
      ...prev,
      selectedAttributes: prev.selectedAttributes.includes(attr)
        ? prev.selectedAttributes.filter(a => a !== attr)
        : [...prev.selectedAttributes, attr]
    }));
  };

  const allSelected = feedState.rows.length > 0 && feedState.selectedRows.size === feedState.rows.length;

  // Get ALL column names normalized - THIS IS THE FIX
  const allColumns = feedState.headers.map(h => 
    h.toLowerCase().replace(/[()]/g, '').replace(/\s+/g, '_')
  );

  // Filter out columns we don't want in the selector
  const selectableColumns = allColumns.filter(col => 
    !['id', 'unpaid_clicks', 'item_group_id', 'additional_image_link', 'image_link', 'link'].includes(col)
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        <header className="text-center mb-12">
          <div className="main-header">
            <h1 className="text-5xl font-extrabold mb-2" style={{ color: '#B8FFFA', textShadow: '0 0 20px rgba(184, 255, 250, 0.3)' }}>
              Shopping Feed AI
            </h1>
            <p className="text-gray-400 text-lg">Optimise Your Product Feed with AI</p>
          </div>
        </header>

        <Alert message={status.error} type="error" />
        <Alert message={status.success} type="success" />

        {feedState.rows.length === 0 && (
          <div className="glass-card glow-effect rounded-2xl p-12 text-center mb-8 max-w-4xl mx-auto">
            <div className="max-w-2xl mx-auto">
              <Upload className="mx-auto mb-6 text-cyan-400" size={64} />
              <h2 className="text-3xl font-bold text-white mb-4">Upload Your Product Feed</h2>
              <p className="text-gray-400 mb-8">
                Upload a TSV file from Google Merchant Centre to start optimising your product titles and descriptions with AI.
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".tsv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <ActionButton
                onClick={() => fileInputRef.current?.click()}
                icon={<Upload size={20} />}
                disabled={feedState.isLoading}
                isLoading={feedState.isLoading}
              >
                {feedState.isLoading ? 'Processing...' : 'Upload TSV File'}
              </ActionButton>

              <div className="mt-8 text-sm text-gray-500">
                <p className="mb-2">📋 Supported format: Tab-separated values (.tsv)</p>
                <p>💡 Your file should include columns like title, description, brand, price, color, size, etc.</p>
              </div>
            </div>
          </div>
        )}

        {feedState.rows.length > 0 && (
          <>
            <div className="glass-card glow-effect rounded-2xl p-6 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">
                    {feedState.rows.length} products | {feedState.selectedRows.size} selected
                  </span>
                  
                  <button
                    onClick={allSelected ? deselectAllRows : selectAllRows}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"
                  >
                    {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                  >
                    <Settings size={16} />
                    Column Selector
                  </button>

                  <ActionButton
                    onClick={handleOptimiseSelectedTitles}
                    disabled={feedState.selectedRows.size === 0 || !isConnected}
                    icon={<Type size={20} />}
                    variant="primary"
                  >
                    Optimise Titles ({feedState.selectedRows.size})
                  </ActionButton>

                  <ActionButton
                    onClick={handleOptimiseSelectedDescriptions}
                    disabled={feedState.selectedRows.size === 0 || !isConnected}
                    icon={<FileText size={20} />}
                    variant="primary"
                  >
                    Optimise Descriptions ({feedState.selectedRows.size})
                  </ActionButton>

                  <ActionButton
                    onClick={exportFeed}
                    icon={<Download size={20} />}
                    variant="secondary"
                  >
                    Export Feed
                  </ActionButton>

                  <button
                    onClick={() => {
                      if (confirm('Are you sure? All unsaved changes will be lost.')) {
                        window.location.reload();
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <X size={16} />
                    New File
                  </button>
                </div>
              </div>

              {showSettings && (
                <div className="pt-6 border-t border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-2">Select Columns for AI Optimisation</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Choose which columns the AI should use when creating optimised titles and descriptions. 
                    Recommended: brand, color, size, material, gender, product_type
                  </p>
                  
                  {/* FIXED: Show ALL selectable columns */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {selectableColumns.map(normalizedCol => {
                      // Find the original header name for display
                      const originalHeader = feedState.headers.find(h => 
                        h.toLowerCase().replace(/[()]/g, '').replace(/\s+/g, '_') === normalizedCol
                      ) || normalizedCol;
                      
                      const isSelected = optimisationSettings.selectedAttributes.includes(normalizedCol);
                      
                      return (
                        <button
                          key={normalizedCol}
                          onClick={() => toggleAttribute(normalizedCol)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-cyan-400/20 text-cyan-400 border-2 border-cyan-400'
                              : 'bg-gray-800 text-gray-400 border-2 border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          {originalHeader}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-cyan-400/5 border border-cyan-400/20">
                    <p className="text-sm text-cyan-400">
                      ✨ Selected ({optimisationSettings.selectedAttributes.length}): {optimisationSettings.selectedAttributes.join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card glow-effect rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase sticky left-0 bg-gray-800/90 z-10 min-w-[50px]">
                        <button onClick={allSelected ? deselectAllRows : selectAllRows}>
                          {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase min-w-[80px]">Image</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase min-w-[400px]">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase min-w-[500px]">Description</th>
                      {/* Show ALL columns */}
                      {allColumns
                        .filter(col => !['id', 'title', 'description', 'image_link', 'additional_image_link'].includes(col))
                        .map(col => {
                          const originalHeader = feedState.headers.find(h => 
                            h.toLowerCase().replace(/[()]/g, '').replace(/\s+/g, '_') === col
                          ) || col;
                          return (
                            <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase min-w-[120px]">
                              {originalHeader}
                            </th>
                          );
                        })
                      }
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase min-w-[200px] sticky right-0 bg-gray-800/90 z-10">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {feedState.rows.map((row) => {
                      const isSelected = feedState.selectedRows.has(row.id);
                      const isOptimising = feedState.optimisingRows.has(row.id);
                      
                      return (
                        <tr key={row.id} className={`hover:bg-gray-800/30 transition-colors ${isSelected ? 'bg-cyan-400/5' : ''}`}>
                          <td className="px-4 py-3 sticky left-0 bg-gray-900/95 z-10">
                            <button onClick={() => toggleRowSelection(row.id)}>
                              {isSelected ? <CheckSquare size={20} className="text-cyan-400" /> : <Square size={20} className="text-gray-600" />}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            {row.image_link && (
                              <img src={row.image_link} alt={row.title} className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <textarea value={row.title} onChange={(e) => updateRow(row.id, 'title', e.target.value)}
                              className="w-full min-h-[60px] px-3 py-2 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none text-sm text-gray-200 resize-y"
                              maxLength={150}
                            />
                            <div className="mt-1 text-xs text-gray-500">{row.title.length}/150</div>
                          </td>
                          <td className="px-4 py-3">
                            <textarea value={row.description} onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                              className="w-full min-h-[80px] px-3 py-2 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none text-sm text-gray-200 resize-y"
                              maxLength={5000}
                            />
                            <div className="mt-1 text-xs text-gray-500">{row.description.length}/5000</div>
                          </td>
                          {allColumns
                            .filter(col => !['id', 'title', 'description', 'image_link', 'additional_image_link'].includes(col))
                            .map(col => (
                              <td key={col} className="px-4 py-3 text-sm text-gray-300">
                                {row[col] || '-'}
                              </td>
                            ))
                          }
                          <td className="px-4 py-3 text-center sticky right-0 bg-gray-900/95 z-10">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => optimiseTitle(row.id, optimisationSettings)}
                                disabled={!isConnected || isOptimising}
                                className={`inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                                  isConnected && !isOptimising
                                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                {isOptimising ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent" />
                                    <span>Processing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Type size={14} />
                                    <span>Optimise Title</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => optimiseDescription(row.id, optimisationSettings)}
                                disabled={!isConnected || isOptimising}
                                className={`inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                                  isConnected && !isOptimising
                                    ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                {isOptimising ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent" />
                                    <span>Processing...</span>
                                  </>
                                ) : (
                                  <>
                                    <FileText size={14} />
                                    <span>Optimise Desc</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Instructions Panel */}
            <div className="glass-card glow-effect rounded-2xl p-6 mt-6">
              <h3 className="text-xl font-semibold text-white mb-4">📖 AI Optimisation Instructions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-purple-400 mb-2 flex items-center gap-2">
                    <Type size={20} />
                    Title Optimisation Rules
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ Begin with Brand name</li>
                    <li>✓ Add Product type if missing</li>
                    <li>✓ Include: Gender → Colour → Size → Material</li>
                    <li>✓ Use natural language (dashes between attributes)</li>
                    <li>✓ Keep under 70 chars (max 150)</li>
                    <li>✓ Unique title for each variant</li>
                    <li>✗ No "sale", "clothing", or filler words</li>
                  </ul>
                  <div className="mt-3 p-2 bg-gray-900/50 rounded text-xs text-gray-400">
                    <strong>Example:</strong><br/>
                    Nike Men's Air Zoom - Black - Size 10 - Lightweight
                  </div>
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                    <FileText size={20} />
                    Description Optimisation Rules
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ Minimum 500 characters (aim 500-1000)</li>
                    <li>✓ Must be unique for each product</li>
                    <li>✓ Describe product type clearly</li>
                    <li>✓ Highlight all key attributes</li>
                    <li>✓ Add benefits & selling points</li>
                    <li>✓ Natural sentences (not keyword-stuffed)</li>
                    <li>✗ No "best price" or promotional phrases</li>
                  </ul>
                  <div className="mt-3 p-2 bg-gray-900/50 rounded text-xs text-gray-400">
                    <strong>Example:</strong><br/>
                    The Nike Men's Air Zoom... built for comfort and speed...
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .main-header {
          background: linear-gradient(135deg, rgba(17, 24, 39, 0.9), rgba(30, 41, 59, 0.8));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(184, 255, 250, 0.1);
          border-radius: 24px;
          padding: 2rem;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
        }
        .main-header:before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(184, 255, 250, 0.6), transparent);
        }
        .glass-card {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(184, 255, 250, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .glow-effect:hover {
          box-shadow: 0 0 20px rgba(184, 255, 250, 0.2);
        }
      `}</style>
    </div>
  );
};

export default ShoppingFeedAI;