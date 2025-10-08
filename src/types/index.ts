import React from 'react';

// --- (Keep all existing types from ActionButtonProps to SectionProps) ---

export interface ActionButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  type?: 'input' | 'textarea';
}

export interface PinnedInputProps {
  label: string;
  asset: AdAsset;
  onAssetChange: (asset: AdAsset) => void;
  maxLength: number;
  pinOptions: number[];
  isDescription?: boolean;
}

export interface AlertProps {
  message: string;
  type: 'error' | 'success';
}

export interface SectionProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}


// --- (Update the component props below) ---

export interface ApiConfigProps {
  config: ApiConfig;
  setConfig: React.Dispatch<React.SetStateAction<ApiConfig>>;
  isConnected: boolean;
  onClearConfig: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export interface CampaignDetailsProps {
  data: CampaignData;
  onChange: (field: keyof CampaignData, value: string | boolean) => void;
}

export interface CampaignProps {
    campaign: Campaign;
    onUpdate: (id: string, field: keyof Campaign, value: any) => void;
    onRemove: (id: string) => void;
    onAddAdGroup: (campaignId: string) => void;
    onUpdateAdGroup: (campaignId: string, adGroupId: string, field: keyof AdGroupData, value: any) => void;
    onRemoveAdGroup: (campaignId: string, adGroupId: string) => void;
    onClearAdGroup: (campaignId: string, adGroupId: string) => void;
    onGenerateAdCopy: (campaignId: string, adGroupId: string) => void;
    onBulkImport: (campaignId: string, adGroupId: string, lines: string[], type: 'headlines' | 'descriptions') => void;
    isConnected: boolean;
    onGenerateKeywords: (campaignId: string, adGroupId: string, options: KeywordOptions) => void;
    onAddKeyword: (campaignId: string, adGroupId: string) => void;
    onUpdateKeyword: (campaignId: string, adGroupId: string, keywordId: string, keyword: Keyword) => void;
    onRemoveKeyword: (campaignId: string, adGroupId: string, keywordId: string) => void;
    onBulkKeywordImport: (campaignId: string, adGroupId: string, keywords: string, matchType: Keyword['matchType']) => void;
}

export interface AdGroupProps {
  campaignId: string;
  adGroup: AdGroupData;
  onUpdate: (campaignId: string, adGroupId: string, field: keyof AdGroupData, value: any) => void;
  onRemove: (campaignId: string, adGroupId: string) => void;
  onClearAdGroup: (campaignId: string, adGroupId: string) => void;
  onGenerate: (campaignId: string, adGroupId: string) => void;
  onBulkImport: (campaignId: string, adGroupId: string, lines: string[], type: 'headlines' | 'descriptions') => void;
  isConnected: boolean;
  onGenerateKeywords: (campaignId: string, adGroupId: string, options: KeywordOptions) => void;
  onAddKeyword: (campaignId: string, adGroupId: string) => void;
  onUpdateKeyword: (campaignId: string, adGroupId: string, keywordId: string, keyword: Keyword) => void;
  onRemoveKeyword: (campaignId: string, adGroupId: string, keywordId: string) => void;
  onBulkKeywordImport: (campaignId: string, adGroupId: string, keywords: string, matchType: Keyword['matchType']) => void;
}

// --- (Keep all existing data structure types) ---

export interface ApiConfig {
  provider: string;
  key: string;
}

export interface AdAsset {
  text: string;
  position: number | null;
}

export interface CampaignData {
  name: string;
  status: 'Active' | 'Paused';
  budget: string;
  networks: string;
  bidStrategyType: string;
  broadMatch: 'On' | 'Off';
  aiMax: 'Enabled' | 'Disabled';
  languages: string;
  adRotation: string;
  targetingMethod: string;
  exclusionMethod: string;
  campaignType: 'new' | 'existing';
}

export interface Campaign extends CampaignData {
    id: string;
    isExpanded: boolean;
    adGroups: AdGroupData[];
}

export interface AdGroupData {
  id: string;
  name: string;
  finalUrl: string;
  productInfo: string;
  headlines: AdAsset[];
  descriptions: AdAsset[];
  path1: string;
  path2: string;
  isGenerating: boolean;
  isExpanded: boolean;
  isManualImportExpanded: boolean;
  maxCPC: string;
  maxCPM: string;
  targetCPV: string;
  targetCPM: string;
  campaignStatus: 'Active' | 'Paused';
  adGroupStatus: 'Active' | 'Paused';
  keywords: Keyword[];
  isKeywordsExpanded: boolean;
  isGeneratingKeywords: boolean;
}

export interface Status {
  error: string;
  success: string;
  debugLogs: string[];
}


// --- ADD THIS NEW TYPE AT THE END OF THE FILE ---

export interface UseAdBuilderReturn {
  apiConfig: ApiConfig;
  setApiConfig: React.Dispatch<React.SetStateAction<ApiConfig>>;
  campaigns: Campaign[];
  addCampaign: () => void;
  removeCampaign: (campaignId: string) => void;
  updateCampaign: (campaignId: string, field: keyof Campaign, value: any) => void;
  addAdGroup: (campaignId: string) => void;
  removeAdGroup: (campaignId: string, adGroupId: string) => void;
  updateAdGroup: (campaignId: string, adGroupId: string, field: keyof AdGroupData, value: any) => void;
  clearAdGroup: (campaignId: string, adGroupId: string) => void;
  status: Status;
  isConnected: boolean;
  generateAdCopy: (campaignId: string, adGroupId: string) => Promise<void>;
  clearAllFields: () => void;
  clearApiConfig: () => void;
  isApiConfigExpanded: boolean;
  setIsApiConfigExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  isMounted: boolean;
  exportToCSV: () => void;
  handleBulkImport: (campaignId: string, adGroupId: string, lines: string[], type: 'headlines' | 'descriptions') => void;
  generateKeywords: (campaignId: string, adGroupId: string, options: KeywordOptions) => Promise<void>;
  addKeyword: (campaignId: string, adGroupId: string) => void;
  updateKeyword: (campaignId: string, adGroupId: string, keywordId: string, keyword: Keyword) => void;
  removeKeyword: (campaignId: string, adGroupId: string, keywordId: string) => void;
  handleBulkKeywordImport: (campaignId: string, adGroupId: string, keywords: string, matchType: Keyword['matchType']) => void;
}
export interface Keyword {
  id: string;
  text: string;
  matchType: 'Exact' | 'Phrase' | 'Broad' | 'Campaign Negative Exact' | 'Campaign Negative Phrase' | 'Negative Exact' | 'Negative Phrase';
}

export interface KeywordOptions {
  prompt: string;
  numKeywords: number;
  matchTypes: {
    exact: boolean;
    phrase: boolean;
    broad: boolean;
    negativePhrase: boolean;
    negativeExact: boolean;
    campaignNegativePhrase: boolean;
    campaignNegativeExact: boolean;
  };
}

// src/types/feed.ts
// Add these to your existing src/types/index.ts file

export interface FeedRow {
  id: string;
  title: string;
  price: string;
  condition: string;
  availability: string;
  channel: string;
  feed_label: string;
  language: string;
  additional_image_link: string;
  adult: string;
  all_clicks: string;
  brand: string;
  custom_label_0: string;
  custom_label_1: string;
  description: string;
  google_product_category: string;
  image_link: string;
  item_group_id: string;
  link: string;
  mpn: string;
  product_type: string;
  rating_average: string;
  rating_count: string;
  shipping_country: string;
  [key: string]: string; // Allow dynamic columns
}

export interface OptimisationSettings {
  selectedAttributes: string[];
  includeInTitle: boolean;
  includeInDescription: boolean;
}

export interface FeedState {
  rows: FeedRow[];
  headers: string[];
  isLoading: boolean;
  optimisingRows: Set<string>;
  selectedRows: Set<string>;
}