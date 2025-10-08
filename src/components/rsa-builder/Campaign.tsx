"use client";

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CampaignProps, CampaignData } from '@/types';

import Section from './ui/Section';
import ActionButton from './ui/ActionButton';
import CampaignDetails from './CampaignDetails';
import AdGroup from './AdGroup';

const CampaignComponent: React.FC<CampaignProps> = ({
    campaign,
    onUpdate,
    onRemove,
    onAddAdGroup,
    onUpdateAdGroup,
    onRemoveAdGroup,
    onClearAdGroup,
    onGenerateAdCopy,
    onBulkImport,
    isConnected,
    onGenerateKeywords, 
    onAddKeyword, 
    onUpdateKeyword, 
    onRemoveKeyword,
    onBulkKeywordImport, // This was missing
}) => {
    
    const handleDetailsChange = (field: keyof CampaignData, value: string | boolean) => {
        onUpdate(campaign.id, field, value);
    };

    return (
        <div className="glass-card glow-effect rounded-2xl mb-12 transition-all duration-300">
            {/* Collapsible Header */}
            <div
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-800/20 transition-colors rounded-t-2xl"
                onClick={() => onUpdate(campaign.id, 'isExpanded', !campaign.isExpanded)}
            >
                <div className="flex-1 min-w-0">
                     <input
                        type="text"
                        value={campaign.name}
                        onChange={(e) => onUpdate(campaign.id, 'name', e.target.value)}
                        placeholder="Enter Campaign Name"
                        className="text-3xl font-bold text-white bg-transparent border-none focus:ring-0 p-0 w-full truncate"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="title-accent-line !w-1/3"></div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(campaign.id);
                        }}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                        aria-label="Remove Campaign"
                    >
                        <Trash2 size={20} />
                    </button>
                    <div className={`transform transition-transform duration-300 ${campaign.isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                        <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" className="text-gray-400">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Collapsible Content */}
            <div className={`overflow-hidden transition-all duration-700 ease-in-out ${
                campaign.isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
                <div className="px-2 sm:px-6 pb-8 border-t border-gray-700/30">
                    <div className="mt-6 space-y-8">
                        <CampaignDetails data={campaign} onChange={handleDetailsChange} />
                        
                        <Section title="Ad Groups" subtitle="Manage ad groups for this campaign.">
                            <div className="space-y-6">
                                {campaign.adGroups.map(ag => (
                                    <AdGroup
                                        key={ag.id}
                                        campaignId={campaign.id}
                                        adGroup={ag}
                                        onUpdate={onUpdateAdGroup}
                                        onRemove={onRemoveAdGroup}
                                        onClearAdGroup={onClearAdGroup}
                                        onGenerate={onGenerateAdCopy}
                                        onBulkImport={onBulkImport}
                                        isConnected={isConnected}
                                        onGenerateKeywords={onGenerateKeywords}
                                        onAddKeyword={onAddKeyword}
                                        onUpdateKeyword={onUpdateKeyword}
                                        onRemoveKeyword={onRemoveKeyword}
                                        onBulkKeywordImport={onBulkKeywordImport} // Now passing it down
                                    />
                                ))}
                            </div>
                            <div className="mt-8 flex gap-4 justify-center">
                                <ActionButton onClick={() => onAddAdGroup(campaign.id)} icon={<Plus size={20} />}>
                                    Add Ad Group to Campaign
                                </ActionButton>
                            </div>
                        </Section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignComponent;