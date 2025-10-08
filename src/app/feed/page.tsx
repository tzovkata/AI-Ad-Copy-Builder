// src/app/feed/page.tsx

"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import ShoppingFeedAI from '@/components/feed/ShoppingFeedAI';
import { ApiConfig } from '@/types';
import { getStoredConfig } from '@/lib/storage';
import { ArrowLeft } from 'lucide-react';

export default function FeedPage() {
  const router = useRouter();
  const [apiConfig, setApiConfig] = React.useState<ApiConfig>({ provider: 'gemini-2.5-flash', key: '' });
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const savedConfig = getStoredConfig();
    setApiConfig(savedConfig);
  }, []);

  const isConnected = !!apiConfig.provider && !!apiConfig.key;

  if (!isMounted) {
    return <div className="min-h-screen bg-gray-900" />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Bar */}
      <div className="bg-gray-800/50 border-b border-gray-700/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-4 py-2 text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to RSA Builder</span>
              </button>
              
              <div className="h-8 w-px bg-gray-700"></div>
              
              <div className="text-white font-bold text-lg tracking-widest">
                BYLT.MEDIA
              </div>
            </div>

            <div className="flex items-center gap-4">
              {!isConnected && (
                <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <span className="text-amber-400 text-sm font-medium">
                    ⚠️ Configure API key in RSA Builder to use AI features
                  </span>
                </div>
              )}
              {isConnected && (
                <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <span className="text-green-400 text-sm font-medium">
                    ✓ API Connected
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <ShoppingFeedAI apiConfig={apiConfig} isConnected={isConnected} />
    </div>
  );
}