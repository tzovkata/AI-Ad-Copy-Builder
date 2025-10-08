"use client";

import React from 'react';
import { Download, Plus, X, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAdBuilder } from '@/hooks/useAdBuilder';

// UI Components
import ActionButton from './ui/ActionButton';
import Alert from './ui/Alert';

// Feature Components
import ApiConfig from './ApiConfig';
import CampaignComponent from './Campaign';
import DebugLog from './DebugLog';

const GoogleAdsRSABuilder: React.FC = () => {
  const router = useRouter();
  const {
    apiConfig, setApiConfig, campaigns, addCampaign, removeCampaign, updateCampaign,
    addAdGroup, removeAdGroup, updateAdGroup, clearAdGroup,
    status, isConnected, generateAdCopy, clearAllFields, clearApiConfig,
    isApiConfigExpanded, setIsApiConfigExpanded, isMounted, exportToCSV, handleBulkImport,
    generateKeywords, addKeyword, updateKeyword, removeKeyword, handleBulkKeywordImport
  } = useAdBuilder();

  if (!isMounted) {
    return <div className="min-h-screen bg-gray-900" />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 font-sans p-4 sm:p-6 lg:p-8 overflow-hidden relative">
      <div className="modern-bg">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="quantum-grid-animation"></div>
        <div className="absolute top-0 left-0 text-white font-bold text-lg tracking-widest z-20">
            BYLT.MEDIA
        </div>

        <header className="text-center my-16 pt-8 relative z-20">
          <div className="main-header">
            <h1
              className="text-5xl font-extrabold mb-2"
              style={{ color: '#B8FFFA', textShadow: '0 0 20px rgba(184, 255, 250, 0.3)' }}
            >
              AI-Powered RSA Builder
            </h1>
            <p className="text-gray-400 text-lg">INTERFACE ACTIVE // We Build Digital Futures</p>

                {/* ADD THIS ENTIRE SECTION: */}
            <div className="mt-6">
              <button
                onClick={() => router.push('/feed')}
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <ShoppingCart size={20} />
                <span>Go to Shopping Feed AI</span>
              </button>
            </div>
            {/* END OF ADDED SECTION */}
          </div>
        </header>
        
        <main className="relative z-10">
          <ApiConfig
            config={apiConfig}
            setConfig={setApiConfig}
            isConnected={isConnected}
            onClearConfig={clearApiConfig}
            isExpanded={isApiConfigExpanded}
            onToggleExpanded={() => setIsApiConfigExpanded(!isApiConfigExpanded)}
          />
          
          <Alert message={status.error} type="error" />
          <Alert message={status.success} type="success" />

          {campaigns.map(campaign => (
            <CampaignComponent
                key={campaign.id}
                campaign={campaign}
                onUpdate={updateCampaign}
                onRemove={removeCampaign}
                onAddAdGroup={addAdGroup}
                onUpdateAdGroup={updateAdGroup}
                onRemoveAdGroup={removeAdGroup}
                onClearAdGroup={clearAdGroup}
                onGenerateAdCopy={generateAdCopy}
                onBulkImport={handleBulkImport}
                isConnected={isConnected}
                onGenerateKeywords={generateKeywords}
                onAddKeyword={addKeyword}
                onUpdateKeyword={updateKeyword}
                onRemoveKeyword={removeKeyword}
                onBulkKeywordImport={handleBulkKeywordImport}
            />
          ))}

            <div className="mt-8 flex gap-4 justify-center">
                <ActionButton onClick={addCampaign} icon={<Plus size={20} />}>
                    Add New Campaign
                </ActionButton>
                <ActionButton onClick={clearAllFields} icon={<X size={20} />} variant="secondary">
                    Clear All Campaigns
                </ActionButton>
            </div>

          {status.debugLogs.length > 0 && (
            <DebugLog logs={status.debugLogs} />
          )}
          
          <footer className="text-center pt-10 mt-8 border-t border-gray-800">
            <div className="space-y-4">
              <div className="flex gap-4 justify-center flex-wrap">
                <ActionButton
                  onClick={exportToCSV}
                  icon={<Download size={20} />}
                  variant="primary"
                  disabled={campaigns.length === 0}
                >
                  Export All Campaigns to CSV
                </ActionButton>
              </div>
            </div>
          </footer>
        </main>
      </div>
      
      <style jsx>{`
        body { background-color: #111827; }
        .modern-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #111827 100%); }
        .floating-orb { position: absolute; border-radius: 50%; filter: blur(1px); animation: float 6s ease-in-out infinite; }
        .orb-1 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%); top: 10%; left: 10%; animation-delay: 0s; }
        .orb-2 { width: 200px; height: 200px; background: radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%); top: 60%; right: 15%; animation-delay: -2s; }
        .orb-3 { width: 150px; height: 150px; background: radial-gradient(circle, rgba(184, 255, 250, 0.06) 0%, transparent 70%); bottom: 20%; left: 30%; animation-delay: -4s; }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 25% { transform: translateY(-20px) rotate(90deg); } 50% { transform: translateY(-10px) rotate(180deg); } 75% { transform: translateY(-30px) rotate(270deg); } }
        .quantum-grid-animation { position: absolute; inset: 0; background-image: linear-gradient(rgba(184, 255, 250, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(184, 255, 250, 0.03) 1px, transparent 1px); background-size: 80px 80px; animation: gridMove 40s linear infinite; z-index: 1; }
        @keyframes gridMove { from { background-position: 0 0; } to { background-position: 80px 80px; } }
        .glass-card { background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(184, 255, 250, 0.1); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1); }
        .glow-effect { position: relative; }
        .glow-effect:hover { box-shadow: 0 0 20px rgba(184, 255, 250, 0.2); }
        .section-title-container { position: relative; display: inline-block; }
        .title-accent-line { height: 3px; width: 50%; background: linear-gradient(90deg, #B8FFFA, #06B6D4); margin-top: 0.5rem; border-radius: 2px; box-shadow: 0 0 15px rgba(184, 255, 250, 0.5); }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; opacity: 0; }
        .main-header { background: linear-gradient(135deg, rgba(17, 24, 39, 0.9), rgba(30, 41, 59, 0.8)); backdrop-filter: blur(20px); border: 1px solid rgba(184, 255, 250, 0.1); border-radius: 24px; padding: 2rem; margin-bottom: 2rem; position: relative; overflow: hidden; }
        .main-header:before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(184, 255, 250, 0.6), transparent); }
      `}</style>
    </div>
  );
};

export default GoogleAdsRSABuilder;