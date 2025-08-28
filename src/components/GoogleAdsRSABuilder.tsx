"use client";

import React from 'react';
import { AlertCircle, Download, Sparkles, Check, X, Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// --- Type Definitions ---
interface ActionButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  type?: 'input' | 'textarea';
}

interface PinnedInputProps {
    label: string;
    asset: AdAsset;
    onAssetChange: (asset: AdAsset) => void;
    maxLength: number;
    pinOptions: number[];
    isDescription?: boolean;
}

interface AlertProps {
  message: string;
  type: 'error' | 'success';
}

interface SectionProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface ApiConfig {
  provider: string;
  key: string;
}

interface CampaignData {
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

interface AdAsset {
    text: string;
    position: number | null;
}

interface AdGroupData {
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
    // New fields for CSV export
    maxCPC: string;
    maxCPM: string;
    targetCPV: string;
    targetCPM: string;
    campaignStatus: 'Active' | 'Paused';
    adGroupStatus: 'Active' | 'Paused';
}

interface Status {
  error: string;
  success: string;
  debugLogs: string[];
}

interface ApiConfigProps {
  config: ApiConfig;
  setConfig: React.Dispatch<React.SetStateAction<ApiConfig>>;
  isConnected: boolean;
  onClearConfig: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

interface CampaignDetailsProps {
  data: CampaignData;
  onChange: (field: keyof CampaignData, value: string) => void;
}

interface AdGroupProps {
    adGroup: AdGroupData;
    onUpdate: (id: string, field: keyof AdGroupData, value: any) => void;
    onRemove: (id: string) => void;
    onGenerate: (id: string) => void;
    onBulkImport: (adGroupId: string, lines: string[], type: 'headlines' | 'descriptions') => void;
    isConnected: boolean;
}

// --- Helper function for safe localStorage access ---
const getStoredConfig = (): ApiConfig => {
  const defaultConfig = { provider: 'gemini-2.5-flash', key: '' };
  
  try {
    const saved = localStorage.getItem('rsa_builder_api_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        provider: parsed.provider || defaultConfig.provider, 
        key: parsed.key || defaultConfig.key 
      };
    }
  } catch (error) {
    console.warn('Failed to load saved API config:', error);
  }
  
  return defaultConfig;
};

const shouldExpandConfig = (): boolean => {
  try {
    const saved = localStorage.getItem('rsa_builder_api_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return !parsed.key; // Collapsed if key exists, expanded if no key
    }
  } catch (error) {
    return true; // Expanded by default if error
  }
  return true; // Expanded by default
};

// --- Reusable UI Components ---

const ActionButton: React.FC<ActionButtonProps> = ({ 
  onClick, 
  isLoading = false, 
  disabled = false, 
  children, 
  className = '', 
  icon, 
  variant = 'primary' 
}) => {
  const baseClasses = "inline-flex items-center justify-center gap-3 px-6 py-3 font-semibold text-base rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
  
  const variantClasses = {
    primary: "bg-cyan-400 text-gray-900 hover:bg-cyan-300 shadow-cyan-400/20 hover:shadow-cyan-300/30",
    secondary: "bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 hover:shadow-cyan-400/20",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
          <span>Please wait...</span>
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
};

const TextInput: React.FC<TextInputProps> = ({ 
  label, 
  value, 
  onChange, 
  maxLength, 
  placeholder, 
  type = 'input' 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxLength) {
      onChange(e.target.value);
    }
  };

  const percentage = (value.length / maxLength) * 100;
  let colorClass = 'text-green-400 bg-green-500/10';
  if (percentage > 90) colorClass = 'text-amber-400 bg-amber-500/10';
  else if (percentage > 70) colorClass = 'text-amber-400 bg-amber-500/10';

  const commonProps = {
    value,
    onChange: handleChange,
    placeholder,
    className: "w-full px-4 py-3 pr-20 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200 placeholder-gray-500 backdrop-blur-sm",
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <div className="relative">
        {type === 'textarea' ? (
          <textarea {...commonProps} rows={3} className={`${commonProps.className} resize-none`} />
        ) : (
          <input type="text" {...commonProps} />
        )}
        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2.5 py-1 rounded-full ${colorClass}`}>
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
};

const PinnedInput: React.FC<PinnedInputProps> = ({ 
    label, 
    asset, 
    onAssetChange, 
    maxLength, 
    pinOptions, 
    isDescription = false 
}) => {
    const handleTextChange = (text: string) => {
        if (text.length <= maxLength) {
            onAssetChange({ ...asset, text });
        }
    };

    const handlePinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value === 'null' ? null : parseInt(e.target.value, 10);
        onAssetChange({ ...asset, position: value });
    };

    const percentage = (asset.text.length / maxLength) * 100;
    let colorClass = 'text-green-400 bg-green-500/10';
    if (percentage > 90) colorClass = 'text-amber-400 bg-amber-500/10';
    else if (percentage > 70) colorClass = 'text-amber-400 bg-amber-500/10';

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">{label}</label>
            <div className={`flex gap-2 ${isDescription ? 'items-start' : 'items-center'}`}>
                <div className="flex-1 relative">
                    {isDescription ? (
                         <textarea
                            value={asset.text}
                            onChange={(e) => handleTextChange(e.target.value)}
                            className="w-full h-24 p-3 pr-20 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200 placeholder-gray-500 backdrop-blur-sm resize-none"
                        />
                    ) : (
                        <input
                            type="text"
                            value={asset.text}
                            onChange={(e) => handleTextChange(e.target.value)}
                            className="w-full h-full px-4 py-3 pr-20 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200 placeholder-gray-500 backdrop-blur-sm"
                        />
                    )}
                    <span className={`absolute right-3 top-3 text-xs font-bold px-2.5 py-1 rounded-full ${colorClass}`}>
                        {asset.text.length}/{maxLength}
                    </span>
                </div>
                <div className="relative h-full">
                    <select
                        value={asset.position === null ? 'null' : asset.position}
                        onChange={handlePinChange}
                        className="appearance-none w-full sm:w-auto h-full px-3 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200"
                        title="Pin position"
                    >
                        <option value="null">Unpinned</option>
                        {pinOptions.map(p => <option key={p} value={p}>Pin {p}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

const Alert: React.FC<AlertProps> = ({ message, type }) => {
  if (!message) return null;

  const isError = type === 'error';
  const config = {
    bgColor: isError ? 'bg-red-500/10' : 'bg-green-500/10',
    borderColor: isError ? 'border-red-500' : 'border-green-500',
    textColor: isError ? 'text-red-400' : 'text-green-400',
    Icon: isError ? AlertCircle : Check,
  };

  return (
    <div className={`${config.bgColor} border-l-4 ${config.borderColor} ${config.textColor} p-4 my-6 rounded-md backdrop-blur-sm`}>
      <div className="flex items-center">
        <config.Icon className="mr-3" size={22} />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

// --- Manual Import Component ---
const ManualImport: React.FC<{
  isExpanded: boolean;
  onToggle: () => void;
  onImport: (lines: string[], type: 'headlines' | 'descriptions') => void;
}> = ({ isExpanded, onToggle, onImport }) => {
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
      {/* Collapsible Header */}
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

      {/* Collapsible Content */}
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

// --- Core Logic & State Management ---

const createNewAdGroup = (name: string): AdGroupData => ({
    id: uuidv4(),
    name,
    finalUrl: '',
    productInfo: '',
    headlines: Array(15).fill(null).map(() => ({ text: '', position: null })),
    descriptions: Array(4).fill(null).map(() => ({ text: '', position: null })),
    path1: '',
    path2: '',
    isGenerating: false,
    isExpanded: true,
    isManualImportExpanded: false,
    // Default values for new fields
    maxCPC: '0.01',
    maxCPM: '0.01',
    targetCPV: '0.01',
    targetCPM: '0.01',
    campaignStatus: 'Active',
    adGroupStatus: 'Active',
});

const useAdBuilder = () => {
  const [isMounted, setIsMounted] = React.useState(false);
  const [apiConfig, setApiConfig] = React.useState<ApiConfig>({ provider: 'gemini-2.5-flash', key: '' });
  const [campaignData, setCampaignData] = React.useState<CampaignData>({
      name: '',
      status: 'Active',
      budget: '50 Daily',
      networks: 'Google search',
      bidStrategyType: 'Manual CPC',
      broadMatch: 'Off',
      aiMax: 'Disabled',
      languages: 'All',
      adRotation: 'Optimize for clicks',
      targetingMethod: 'Location of presence',
      exclusionMethod: 'Location of presence',
      campaignType: 'new',
  });
  const [adGroups, setAdGroups] = React.useState<AdGroupData[]>([createNewAdGroup('Ad Group 1')]);
  const [status, setStatus] = React.useState<Status>({ error: '', success: '', debugLogs: [] });
  const [isApiConfigExpanded, setIsApiConfigExpanded] = React.useState<boolean>(true);

  React.useEffect(() => { setIsMounted(true); const savedConfig = getStoredConfig(); setApiConfig(savedConfig); const shouldExpand = shouldExpandConfig(); setIsApiConfigExpanded(shouldExpand); }, []);

  const addDebugLog = React.useCallback((message: string) => { const timestamp = new Date().toLocaleTimeString(); const logMessage = `[${timestamp}] ${message}`; setStatus(prev => ({ ...prev, debugLogs: [...prev.debugLogs.slice(-19), logMessage] })); console.log(logMessage); }, []);

  const isConnected = !!apiConfig.provider && !!apiConfig.key;

  React.useEffect(() => { if (isMounted) { try { localStorage.setItem('rsa_builder_api_config', JSON.stringify(apiConfig)); } catch (error) { console.warn('Failed to save API config:', error); } } }, [apiConfig, isMounted]);

  const handleCampaignChange = (field: keyof CampaignData, value: string) => { setCampaignData(prev => ({ ...prev, [field]: value })); };
  const addAdGroup = () => { setAdGroups(prev => [...prev, createNewAdGroup(`Ad Group ${prev.length + 1}`)]); setStatus(s => ({ ...s, success: 'New Ad Group added!', error: '' })); };
  const removeAdGroup = (id: string) => { setAdGroups(prev => prev.filter(ag => ag.id !== id)); setStatus(s => ({ ...s, success: 'Ad Group removed!', error: '' })); };
  const updateAdGroup = (id: string, field: keyof AdGroupData, value: any) => { setAdGroups(prev => prev.map(ag => ag.id === id ? { ...ag, [field]: value } : ag)); };
  
  const handleBulkImport = React.useCallback((adGroupId: string, lines: string[], type: 'headlines' | 'descriptions') => {
    setAdGroups(prev => prev.map(ag => {
        if (ag.id === adGroupId) {
            const newAg = { ...ag };
            if (type === 'headlines') {
                const newHeadlines: AdAsset[] = JSON.parse(JSON.stringify(newAg.headlines));
                lines.forEach((line, index) => { if (index < 15) newHeadlines[index] = { text: line.substring(0, 30), position: null }; });
                newAg.headlines = newHeadlines;
            } else {
                const newDescriptions: AdAsset[] = JSON.parse(JSON.stringify(newAg.descriptions));
                lines.forEach((line, index) => { if (index < 4) newDescriptions[index] = { text: line.substring(0, 90), position: null }; });
                newAg.descriptions = newDescriptions;
            }
            return newAg;
        }
        return ag;
    }));
    setStatus(prev => ({ ...prev, success: `Successfully imported ${lines.length} ${type} into ${adGroups.find(ag => ag.id === adGroupId)?.name}!`, error: '' }));
  }, [adGroups]);

  const generateAdCopy = React.useCallback(async (adGroupId: string) => {
    const adGroup = adGroups.find(ag => ag.id === adGroupId);
    if (!adGroup) { setStatus(s => ({ ...s, error: 'Ad Group not found.', success: '' })); return; }
    if (!isConnected) { setStatus(s => ({ ...s, error: 'API connection required. Please enter your key.', success: '' })); return; }
    if (!adGroup.productInfo.trim()) { setStatus(s => ({ ...s, error: `Product information is required for ${adGroup.name}.`, success: '' })); return; }
    
    updateAdGroup(adGroupId, 'isGenerating', true);
    setStatus({ ...status, error: '', success: `Starting generation for ${adGroup.name}...` });
    addDebugLog(`🚀 [${adGroup.name}] Starting ad copy generation...`);
    
    try {
        let generatedContent;
        const systemMessage = `You are an expert Google Ads copywriter specializing in high-converting RSA (Responsive Search Ads) copy. Create Google Ads RSA copy in JSON format.

CRITICAL REQUIREMENTS:
- Headlines 1-4: MUST be highly focused on the main product (include product name)
- Headlines 5-15: Can be more varied (features, benefits, offers, CTAs)
- All copy must be conversion-focused and specific
- Use actual product details provided by the user

HEADLINE STRATEGY:
Headlines 1-4 (Product-Focused):
• Each MUST include the product name
• At least one must highlight a key feature (e.g., 4K, Battery Life, Wireless)
• At least one must emphasize a core benefit (e.g., Easy Install, 24/7 Security)
• If pricing available, include it naturally (e.g., From £199, 30% Off)

Headlines 5-15 (Supporting):
• Strong CTAs (Shop Now, Order Today, Get Yours)
• Unique selling points and differentiators
• Offers and guarantees (Free Shipping, Money Back)
• Emotional triggers and urgency

DESCRIPTIONS (1-4):
• Each must combine features + benefits together
• Include pricing if available
• End with compelling CTAs
• Focus on conversion drivers

CHARACTER LIMITS:
- Headlines: Maximum 30 characters each
- Descriptions: Maximum 90 characters each
- Paths: Maximum 15 characters each

OUTPUT FORMAT:
Return ONLY valid JSON in this exact structure:
{"headlines": ["text1", "text2", "text3", "text4", "text5", "text6", "text7", "text8", "text9", "text10", "text11", "text12", "text13", "text14", "text15"], "descriptions": ["desc1", "desc2", "desc3", "desc4"], "paths": ["path1", "path2"]}

STYLE GUIDELINES:
• Persuasive and conversion-focused
• Specific claims with actual features/benefits
• Clear value propositions
• Strong calls-to-action
• Avoid vague or generic language`;

        let userMessage = `PRODUCT DETAILS:
${adGroup.productInfo}

CAMPAIGN INFO:
Campaign Name: ${campaignData.name || 'Product Campaign'}
Ad Group: ${adGroup.name}
Landing Page: ${adGroup.finalUrl || 'Not specified'}

INSTRUCTIONS:
Create 15 headlines, 4 descriptions, and 2 display paths following the strategy above.

HEADLINES 1-4 FOCUS:
- Each must include the main product name
- Highlight key features and benefits
- Include pricing if mentioned in product details
- Keep product-centric and specific

HEADLINES 5-15 STRATEGY:
- Strong CTAs and action words
- Unique selling points
- Offers, guarantees, shipping details
- Emotional appeals and urgency

DESCRIPTIONS FOCUS:
- Combine features + benefits in each description
- Include pricing and offers naturally
- End with compelling CTAs
- Maximum conversion impact

DISPLAY PATHS FOCUS:
- Create two paths, each max 15 characters.
- Use keywords from the product details.
- Should be readable and relevant (e.g., /Solar-Cameras, /Free-Shipping).

Extract the main product name from the details above and ensure headlines 1-4 prominently feature it. Use specific features, benefits, and pricing mentioned in the product information.`;

        addDebugLog(`[${adGroup.name}] 📤 Prepared messages...`);

        if (apiConfig.provider === 'gemini-2.5-flash') {
          addDebugLog(`[${adGroup.name}] 🤖 Using Gemini API...`);
          setStatus(s => ({ ...s, success: `[${adGroup.name}] Sending request to Gemini AI...` }));
          
          const requestBody = {
            contents: [{ parts: [{ text: systemMessage + '\n\n' + userMessage }] }],
            generationConfig: {
              temperature: 0.7, topP: 0.8, topK: 40, maxOutputTokens: 2048, responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                properties: {
                  headlines: { type: "array", items: { type: "string" }, maxItems: 15 },
                  descriptions: { type: "array", items: { type: "string" }, maxItems: 4 },
                  paths: { type: "array", items: { type: "string" }, maxItems: 2 }
                },
                required: ["headlines", "descriptions", "paths"]
              }
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
            ]
          };
          
          const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
            method: 'POST',
            headers: { 'x-goog-api-key': apiConfig.key, 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });
          
          addDebugLog(`[${adGroup.name}] 📡 API Response received - Status: ${response.status} ${response.statusText}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error (${response.status}): ${errorText}`);
          }
          
          const geminiData = await response.json();
          if (!geminiData.candidates || geminiData.candidates.length === 0) {
            if (geminiData.promptFeedback) addDebugLog(`[${adGroup.name}] 🛡️ Prompt feedback: ${JSON.stringify(geminiData.promptFeedback)}`);
            throw new Error('No candidates returned from Gemini API - check debug log for details');
          }
          
          const candidate = geminiData.candidates[0];
          if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
              if (candidate.safetyRatings) addDebugLog(`[${adGroup.name}] 🛡️ Safety ratings: ${JSON.stringify(candidate.safetyRatings)}`);
              throw new Error('No content in Gemini API response - possibly safety filtered.');
          }
          const text = candidate.content.parts[0].text;
          addDebugLog(`[${adGroup.name}] 📝 Generated text received...`);
          
          if (!text) throw new Error('Empty text response from Gemini API');
          
          generatedContent = JSON.parse(text);

        } 
        else if (apiConfig.provider === 'claude-sonnet-4') {
          addDebugLog(`[${adGroup.name}] 🧠 Using Claude API...`);
          setStatus(s => ({ ...s, success: `[${adGroup.name}] Sending request to Claude AI...` }));
          
          const requestBody = {
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1500,
            system: systemMessage,
            messages: [{ role: 'user', content: userMessage }]
          };
          
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'x-api-key': apiConfig.key, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });
          
          addDebugLog(`[${adGroup.name}] 📡 API Response received - Status: ${response.status} ${response.statusText}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Claude API error (${response.status}): ${errorText}`);
          }
          
          const claudeData = await response.json();
          if (!claudeData.content || !claudeData.content[0]) throw new Error('Invalid response format from Claude API');
          
          const text = claudeData.content[0].text;
          addDebugLog(`[${adGroup.name}] 📝 Generated text received...`);

          try {
            generatedContent = JSON.parse(text);
          } catch (parseError) {
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[1]) {
              generatedContent = JSON.parse(jsonMatch[1]);
            } else {
              throw parseError;
            }
          }
        } 
        else {
          throw new Error('Unsupported provider selected.');
        }
        
        const headlines = Array.isArray(generatedContent.headlines) ? generatedContent.headlines : [];
        const descriptions = Array.isArray(generatedContent.descriptions) ? generatedContent.descriptions : [];
        const paths = Array.isArray(generatedContent.paths) ? generatedContent.paths : [];
        
        const newHeadlines = [...Array(15)].map((_, i) => ({
            text: String(headlines[i] || '').substring(0, 30),
            position: null
        }));
        const newDescriptions = [...Array(4)].map((_, i) => ({
            text: String(descriptions[i] || '').substring(0, 90),
            position: null
        }));

        setAdGroups(prev => prev.map(ag => ag.id === adGroupId ? {
            ...ag,
            headlines: newHeadlines,
            descriptions: newDescriptions,
            path1: String(paths[0] || '').substring(0, 15),
            path2: String(paths[1] || '').substring(0, 15),
        } : ag));
        
        addDebugLog(`[${adGroup.name}] ✅ Ad copy applied successfully!`);
        setStatus(prev => ({ ...prev, error: '', success: `🎉 Ad copy generated for ${adGroup.name}!` }));
        
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      addDebugLog(`[${adGroup.name}] ❌ Generation error: ${errorMessage}`);
      setStatus(prev => ({ ...prev, error: `Error for ${adGroup.name}: ${errorMessage}`, success: '' }));
    } finally {
      updateAdGroup(adGroupId, 'isGenerating', false);
    }
  }, [isConnected, campaignData, adGroups, addDebugLog, status]);

  const clearAllFields = React.useCallback(() => {
    setAdGroups([createNewAdGroup('Ad Group 1')]);
    setCampaignData(prev => ({ 
        ...prev, 
        name: '',
        status: 'Active',
        budget: '50 Daily',
        networks: 'Google search',
        broadMatch: 'Off',
        aiMax: 'Disabled',
        campaignType: 'new',
    }));
    setStatus({ error: '', success: 'All ad groups and fields cleared!', debugLogs: [] });
  }, []);

  const clearApiConfig = React.useCallback(() => {
    setApiConfig({ provider: 'gemini-2.5-flash', key: '' });
    if (isMounted) { try { localStorage.removeItem('rsa_builder_api_config'); } catch (error) { console.warn('Failed to clear API config:', error); } }
    setStatus({ error: '', success: 'API configuration cleared!', debugLogs: [] });
  }, [isMounted]);

  // --- [FIXED] CSV export functions with proper Google Ads format ---
  const exportToCSV = React.useCallback(() => {
    // Validate that all ad groups have final URLs
    const missingUrls = adGroups.filter(ag => !ag.finalUrl.trim());
    if (missingUrls.length > 0) {
      setStatus(s => ({ 
        ...s, 
        error: `Final URL is required for all ad groups. Missing URLs in: ${missingUrls.map(ag => ag.name).join(', ')}`, 
        success: '' 
      }));
      return;
    }

    // Simple CSV cell formatter - quotes if necessary
    const formatCell = (value: any): string => {
      const str = String(value || '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    let csvLines: string[] = [];

    if (campaignData.campaignType === 'new') {
      // Headers for a new campaign structure (134 columns total)
      const headerRow = [
        'Campaign', 'Labels', 'Campaign Type', 'Networks', 'Budget', 'Budget type', 'Standard conversion goals', 'Customer acquisition',
        'Languages', 'Bid Strategy Type', 'Bid Strategy Name', 'Ad location', 'Target impression share', 'Maximum CPC bid limit',
        'Start Date', 'End Date', 'Broad match keywords', 'Ad Schedule', 'Ad rotation', 'Content exclusions', 'Targeting method',
        'Exclusion method', 'Audience targeting', 'Flexible Reach', 'AI Max', 'Text customization', 'Final URL expansion',
        'Ad Group', 'Max CPC', 'Max CPM', 'Target CPA', 'Max CPV', 'Target CPV', 'Percent CPC', 'Target CPM', 'Target ROAS',
        'Target CPC', 'Desktop Bid Modifier', 'Mobile Bid Modifier', 'Tablet Bid Modifier', 'TV Screen Bid Modifier',
        'Display Network Custom Bid Type', 'Optimized targeting', 'Strict age and gender targeting', 'Search term matching',
        'Ad Group Type', 'Channels', 'Audience name', 'Age demographic', 'Gender demographic', 'Income demographic', 'Parental status demographic',
        'Remarketing audience segments', 'Interest categories', 'Life events', 'Custom audience segments', 'Detailed demographics',
        'Remarketing audience exclusions', 'Tracking template', 'Final URL suffix', 'Custom parameters', 'ID', 'Location',
        'Reach', 'Location groups', 'Radius', 'Unit', 'Bid Modifier', 'Account keyword type', 'Keyword', 'Criterion Type',
        'Final URL', 'Final mobile URL', 'Link source', 'Business name', 'Ad type',
        'Headline 1', 'Headline 1 position', 'Headline 2', 'Headline 2 position', 'Headline 3', 'Headline 3 position',
        'Headline 4', 'Headline 4 position', 'Headline 5', 'Headline 5 position', 'Headline 6', 'Headline 6 position',
        'Headline 7', 'Headline 7 position', 'Headline 8', 'Headline 8 position', 'Headline 9', 'Headline 9 position',
        'Headline 10', 'Headline 10 position', 'Headline 11', 'Headline 11 position', 'Headline 12', 'Headline 12 position',
        'Headline 13', 'Headline 13 position', 'Headline 14', 'Headline 14 position', 'Headline 15', 'Headline 15 position',
        'Description 1', 'Description 1 position', 'Description 2', 'Description 2 position',
        'Description 3', 'Description 3 position', 'Description 4', 'Description 4 position',
        'Path 1', 'Path 2', 'Shared set name', 'Shared set type', 'Keyword count', 'Link Text',
        'Description Line 1', 'Description Line 2', 'Upgraded extension', 'Source', 'Callout text', 'Phone Number',
        'Country of Phone', 'Conversion Action', 'Campaign Status', 'Ad Group Status', 'Status', 'Approval Status',
        'Ad strength', 'Comment'
      ];
      csvLines.push(headerRow.map(formatCell).join(','));

      // --- Row 1: Campaign Row ---
      const campaignRow = [
        campaignData.name, // Campaign
        '', // Labels
        'Search', // Campaign Type
        campaignData.networks, // Networks
        campaignData.budget.replace(' Daily', ''), // Budget
        'Daily', // Budget type
        'Account-level', // Standard conversion goals
        'Bid equally', // Customer acquisition
        campaignData.languages, // Languages
        campaignData.bidStrategyType, // Bid Strategy Type
        '', '', '', '', '', '', // Bid strat name -> End date
        campaignData.broadMatch === 'On' ? 'On' : 'Off', // Broad match
        '[]', // Ad Schedule
        campaignData.adRotation, // Ad rotation
        '[]', // Content exclusions
        campaignData.targetingMethod, // Targeting method
        campaignData.exclusionMethod, // Exclusion method
        'Audience segments', // Audience targeting
        'Audience segments', // Flexible Reach
        campaignData.aiMax, // AI Max
        'Disabled', // Text customization
        'Disabled' // Final URL expansion
      ];
      // Pad row to match header count, setting Campaign Status at the correct index
      const campaignRowPadded = Array(headerRow.length).fill('');
      campaignRow.forEach((val, i) => campaignRowPadded[i] = val);
      campaignRowPadded[128] = campaignData.status === 'Active' ? 'Enabled' : 'Paused'; // Campaign Status (Col 129)
      csvLines.push(campaignRowPadded.map(formatCell).join(','));

      // --- Rows for each Ad Group ---
      adGroups.forEach(ag => {
        // --- Row 2: Ad Group Settings Row ---
        const agSettingsRow = [
          campaignData.name, // Campaign
          '', '', '', '', '', '', '', // Labels -> Customer acq.
          'All', // Languages
          '', '', '', '', '', '', '', '', '', '', '', '', // Bid strat -> Excl method
          'Audience segments', // Audience targeting
          'Audience segments;Genders;Ages;Parental status;Household incomes', // Flexible Reach
          '', '', '', // AI Max -> Final URL exp
          ag.name, // Ad Group
          ag.maxCPC, ag.maxCPM, '', ag.targetCPV, '', ag.targetCPM, '', '', '', '', '', '', // Bids
          'None', 'Disabled', 'Disabled', 'Enabled', 'Standard', '[]' // Other settings
        ];
        const agSettingsRowPadded = Array(headerRow.length).fill('');
        agSettingsRow.forEach((val, i) => agSettingsRowPadded[i] = val);
        agSettingsRowPadded[128] = ag.campaignStatus === 'Active' ? 'Enabled' : 'Paused'; // Campaign Status
        agSettingsRowPadded[129] = ag.adGroupStatus === 'Active' ? 'Enabled' : 'Paused'; // Ad Group Status
        csvLines.push(agSettingsRowPadded.map(formatCell).join(','));
        
        // --- Row 3: RSA Ad Row ---
        const rsaAdRow = Array(headerRow.length).fill('');
        // Basic Info
        rsaAdRow[0] = campaignData.name; // Campaign
        rsaAdRow[27] = ag.name; // Ad Group
        
        // Ad Assets
        rsaAdRow[71] = ag.finalUrl; // Final URL (Col 72)
        rsaAdRow[75] = 'Responsive search ad'; // Ad type (Col 76)

        // Headlines (Cols 77-106)
        ag.headlines.forEach((headline, i) => {
            const baseIndex = 76 + (i * 2);
            rsaAdRow[baseIndex] = headline.text;
            rsaAdRow[baseIndex + 1] = headline.position ? String(headline.position) : '';
        });

        // Descriptions (Cols 107-114)
        ag.descriptions.forEach((desc, i) => {
            const baseIndex = 106 + (i * 2);
            rsaAdRow[baseIndex] = desc.text;
            rsaAdRow[baseIndex + 1] = desc.position ? String(desc.position) : '';
        });

        // Paths (Cols 115-116)
        rsaAdRow[114] = ag.path1;
        rsaAdRow[115] = ag.path2;

        // Statuses (Cols 129-134)
        rsaAdRow[128] = 'Enabled'; // Campaign Status
        rsaAdRow[129] = 'Enabled'; // Ad Group Status
        rsaAdRow[130] = 'Enabled'; // Status
        
        csvLines.push(rsaAdRow.map(formatCell).join(','));
      });

    } else {
      // Existing campaign format (this logic appears correct)
      const headerRow = [
        'Campaign', 'Ad Group', 'Ad type', 'Labels',
        'Headline 1', 'Headline 1 position', 'Headline 2', 'Headline 2 position',
        'Headline 3', 'Headline 3 position', 'Headline 4', 'Headline 4 position',
        'Headline 5', 'Headline 5 position', 'Headline 6', 'Headline 6 position',
        'Headline 7', 'Headline 7 position', 'Headline 8', 'Headline 8 position',
        'Headline 9', 'Headline 9 position', 'Headline 10', 'Headline 10 position',
        'Headline 11', 'Headline 11 position', 'Headline 12', 'Headline 12 position',
        'Headline 13', 'Headline 13 position', 'Headline 14', 'Headline 14 position',
        'Headline 15', 'Headline 15 position',
        'Description 1', 'Description 1 position', 'Description 2', 'Description 2 position',
        'Description 3', 'Description 3 position', 'Description 4', 'Description 4 position',
        'Path 1', 'Path 2', 'Final URL', 'Final mobile URL', 'Tracking template',
        'Final URL suffix', 'Custom parameters', 'Campaign Status', 'Ad Group Status',
        'Status', 'Approval Status', 'Ad strength', 'Comment'
      ];
      csvLines.push(headerRow.map(formatCell).join(','));

      adGroups.forEach(ag => {
        const agRow = [];
        agRow.push(campaignData.name);
        agRow.push(ag.name);
        agRow.push('Responsive search ad');
        agRow.push(''); // Labels
        
        for (let i = 0; i < 15; i++) {
          agRow.push(ag.headlines[i]?.text || '');
          agRow.push(ag.headlines[i]?.position ? String(ag.headlines[i].position) : '');
        }
        
        for (let i = 0; i < 4; i++) {
          agRow.push(ag.descriptions[i]?.text || '');
          agRow.push(ag.descriptions[i]?.position ? String(ag.descriptions[i].position) : '');
        }
        
        agRow.push(ag.path1 || '');
        agRow.push(ag.path2 || '');
        agRow.push(ag.finalUrl);
        agRow.push(''); // Final mobile URL
        agRow.push(''); // Tracking template
        agRow.push(''); // Final URL suffix
        agRow.push(''); // Custom parameters
        agRow.push(ag.campaignStatus === 'Active' ? 'Enabled' : 'Paused');
        agRow.push(ag.adGroupStatus === 'Active' ? 'Enabled' : 'Paused');
        agRow.push('Enabled'); // Status
        agRow.push(''); // Approval Status
        agRow.push(''); // Ad strength
        agRow.push(''); // Comment
        
        csvLines.push(agRow.map(formatCell).join(','));
      });
    }

    const csvContent = csvLines.join('\n');
    const BOM = '\uFEFF'; // Byte Order Mark for UTF-8
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `RSA_${campaignData.campaignType === 'new' ? 'New' : 'Existing'}_Export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    setStatus(s => ({ ...s, success: 'CSV exported successfully with the corrected format!', error: '' }));
  }, [campaignData, adGroups]);

  return { apiConfig, setApiConfig, campaignData, handleCampaignChange, adGroups, addAdGroup, removeAdGroup, updateAdGroup, status, isConnected, generateAdCopy, clearAllFields, clearApiConfig, isApiConfigExpanded, setIsApiConfigExpanded, isMounted, exportToCSV, handleBulkImport };
};

// --- Debug Log, Section, ApiConfig Components ---
const DebugLog: React.FC<{ logs: string[] }> = ({ logs }) => {
  if (logs.length === 0) return null;
  return ( <Section title="Debug Log" subtitle="Real-time debugging information." className="animate-fade-in-up" style={{animationDelay: '400ms'}}> <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto"> <div className="font-mono text-sm space-y-1"> {logs.map((log, index) => ( <div key={index} className={`${ log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : 'text-gray-300' }`}> {log} </div> ))} </div> </div> </Section> );
};
const Section: React.FC<SectionProps> = ({ title, subtitle, children, className = '', style }) => ( <div className={`quantum-section mb-12 ${className}`} style={style}> <div className="glass-card glow-effect rounded-2xl p-8"> <div className="section-title-container mb-6"> <h2 className="text-2xl font-bold text-white mb-1">{title}</h2> <div className="title-accent-line"></div> </div> <p className="text-gray-400 mb-6">{subtitle}</p> {children} </div> </div> );
const ApiConfig: React.FC<ApiConfigProps> = ({ config, setConfig, isConnected, onClearConfig, isExpanded, onToggleExpanded }) => ( <div className={`quantum-section mb-12 animate-fade-in-up`} style={{animationDelay: '100ms'}}> <div className="glass-card glow-effect rounded-2xl transition-all duration-300"> <div className="flex items-center justify-between p-6 cursor-pointer" onClick={onToggleExpanded}> <div className="flex items-center gap-4"> <div className="section-title-container"> <h2 className="text-2xl font-bold text-white mb-1">API Configuration</h2> <div className="title-accent-line"></div> </div> <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${ isConnected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400' }`}> {isConnected ? <Check size={14} /> : <X size={14} />} {isConnected ? 'Connected' : 'Not Connected'} </span> </div> <div className="flex items-center gap-3"> <span className="text-gray-400 text-sm"> {isExpanded ? 'Click to collapse' : 'Click to expand'} </span> <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}> <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="text-gray-400"> <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /> </svg> </div> </div> </div> <div className={`overflow-hidden transition-all duration-300 ease-in-out ${ isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0' }`}> <div className="px-6 pb-6 border-t border-gray-700/30"> <p className="text-gray-400 mb-6 mt-4">Connect to your preferred AI model provider.</p> <div className="space-y-6"> <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center p-6 rounded-xl border border-gray-700/50 bg-gray-800/30 backdrop-blur-sm"> <select value={config.provider} onChange={(e) => setConfig(prev => ({ ...prev, provider: e.target.value }))} className="w-full px-4 py-3 bg-gray-800/80 border-2 border-gray-700 rounded-lg focus:border-cyan-400"> <option value="gemini-2.5-flash">Google Gemini 2.5 Flash</option> <option value="openai">OpenAI GPT</option> <option value="claude-sonnet-4">Anthropic Claude Sonnet 4</option> </select> <div className="md:col-span-2"> <input type="password" value={config.key} onChange={(e) => setConfig(prev => ({ ...prev, key: e.target.value }))} placeholder="Enter your API key..." className="w-full px-4 py-3 bg-gray-800/80 border-2 border-gray-700 rounded-lg focus:border-cyan-400"/> </div> <div className="flex items-center justify-center md:justify-start"> {isConnected && ( <button onClick={(e) => { e.stopPropagation(); onClearConfig(); }} className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"> Clear Config </button> )} </div> </div> {isConnected && ( <div className="flex justify-between items-center p-4 rounded-lg bg-green-500/5 border border-green-500/20"> <div className="flex items-center gap-3"> <Check className="text-green-400" size={20} /> <span className="text-green-400 font-medium">API key saved locally and ready to use</span> </div> </div> )} <div className="text-sm text-gray-500 p-4 rounded-lg bg-gray-800/20 border border-gray-700/30"> <p className="mb-2"><strong>🔒 Security:</strong> Your API key is stored locally.</p> <p><strong>🔑 Get API Keys:</strong> <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 ml-1 hover:underline">Gemini</a> • <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-cyan-400 ml-1 hover:underline">OpenAI</a> • <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-cyan-400 ml-1 hover:underline">Claude</a> </p> </div> </div> </div> </div> </div> </div> );

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ data, onChange }) => (
    <Section title="Campaign Details" subtitle="Provide the basic information and settings for your ad campaign." className="animate-fade-in-up" style={{animationDelay: '200ms'}}>
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-3">Campaign Type</label>
            <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                        type="radio" 
                        value="new" 
                        checked={data.campaignType === 'new'} 
                        onChange={(e) => onChange('campaignType', e.target.value)} 
                        className="w-4 h-4 text-cyan-400 bg-gray-800 border-gray-600 focus:ring-cyan-400 focus:ring-2" 
                    />
                    <span className="text-gray-300 font-medium">New Campaign</span>
                    <span className="text-gray-500 text-sm">(Full campaign structure)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                        type="radio" 
                        value="existing" 
                        checked={data.campaignType === 'existing'} 
                        onChange={(e) => onChange('campaignType', e.target.value)} 
                        className="w-4 h-4 text-cyan-400 bg-gray-800 border-gray-600 focus:ring-cyan-400 focus:ring-2" 
                    />
                    <span className="text-gray-300 font-medium">Existing Campaign</span>
                    <span className="text-gray-500 text-sm">(Ad groups only)</span>
                </label>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput label="Campaign Name" value={data.name} onChange={(val) => onChange('name', val)} maxLength={100} placeholder="e.g., Summer Sale Campaign" />
            <TextInput label="Budget" value={data.budget} onChange={(val) => onChange('budget', val)} maxLength={50} placeholder="e.g., 50 Daily" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Campaign Status</label>
                <select value={data.status} onChange={(e) => onChange('status', e.target.value)} className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400">
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Networks</label>
                <select value={data.networks} onChange={(e) => onChange('networks', e.target.value)} className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400">
                    <option value="Google search">Google search</option>
                    <option value="Search partners">Search partners</option>
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Broad Match</label>
                <select value={data.broadMatch} onChange={(e) => onChange('broadMatch', e.target.value)} className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400">
                    <option value="Off">Off</option>
                    <option value="On">On</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">AI MAX</label>
                <select value={data.aiMax} onChange={(e) => onChange('aiMax', e.target.value)} className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400">
                    <option value="Disabled">Disabled</option>
                    <option value="Enabled">Enabled</option>
                </select>
            </div>
        </div>
    </Section>
);

const AdGroup: React.FC<AdGroupProps> = ({ adGroup, onUpdate, onRemove, onGenerate, onBulkImport, isConnected }) => {
    
    const handleAssetUpdate = (index: number, type: 'headlines' | 'descriptions', newAsset: AdAsset) => {
        const currentAssets: AdAsset[] = JSON.parse(JSON.stringify(adGroup[type]));
        currentAssets[index] = newAsset;
        onUpdate(adGroup.id, type, currentAssets);
    };

    const handleLocalBulkImport = (lines: string[], type: 'headlines' | 'descriptions') => {
        onBulkImport(adGroup.id, lines, type);
    };

    return (
        <div className="glass-card glow-effect rounded-2xl mb-8 transition-all duration-300">
            {/* Collapsible Header */}
            <div 
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-800/20 transition-colors rounded-t-2xl"
                onClick={() => onUpdate(adGroup.id, 'isExpanded', !adGroup.isExpanded)}
            >
                <div className="flex-1 min-w-0">
                    <input
                        type="text"
                        value={adGroup.name}
                        onChange={(e) => onUpdate(adGroup.id, 'name', e.target.value)}
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
                            onRemove(adGroup.id);
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

            {/* Collapsible Content */}
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
                                        onChange={(e) => onUpdate(adGroup.id, 'maxCPC', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200"
                                        placeholder="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Max CPM</label>
                                    <input
                                        type="text"
                                        value={adGroup.maxCPM}
                                        onChange={(e) => onUpdate(adGroup.id, 'maxCPM', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200"
                                        placeholder="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Target CPV</label>
                                    <input
                                        type="text"
                                        value={adGroup.targetCPV}
                                        onChange={(e) => onUpdate(adGroup.id, 'targetCPV', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200"
                                        placeholder="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Target CPM</label>
                                    <input
                                        type="text"
                                        value={adGroup.targetCPM}
                                        onChange={(e) => onUpdate(adGroup.id, 'targetCPM', e.target.value)}
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
                                        onChange={(e) => onUpdate(adGroup.id, 'campaignStatus', e.target.value)}
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
                                        onChange={(e) => onUpdate(adGroup.id, 'adGroupStatus', e.target.value)}
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
                                onChange={(val) => onUpdate(adGroup.id, 'finalUrl', val)}
                                maxLength={2048}
                                placeholder="https://example.com/product-for-this-ad-group"
                            />
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-white mb-3">Product Information & Prompt</h3>
                            <textarea
                                value={adGroup.productInfo}
                                onChange={(e) => onUpdate(adGroup.id, 'productInfo', e.target.value)}
                                placeholder={`Describe the product/service for this specific ad group...`}
                                className="w-full h-48 px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-0 transition-colors text-gray-200 placeholder-gray-500 backdrop-blur-sm resize-none"
                            />
                        </div>

                        <div className="text-center flex gap-4 justify-center flex-wrap">
                            <ActionButton
                                onClick={() => onGenerate(adGroup.id)}
                                isLoading={adGroup.isGenerating}
                                disabled={!isConnected || !adGroup.productInfo.trim()}
                                icon={<Sparkles size={20} />}
                            >
                                Generate Ad Copy for this Group
                            </ActionButton>
                             <ActionButton
                                onClick={() => onUpdate(adGroup.id, 'isManualImportExpanded', !adGroup.isManualImportExpanded)}
                                disabled={adGroup.isGenerating}
                                icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 011-1h8a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V4zM7 6v1h6V6H7zm0 3v1h6V9H7zm0 3v1h6v-1H7z"/></svg>}
                                variant="secondary"
                            >
                                Manual Import
                            </ActionButton>
                        </div>

                        <div className="mb-8">
                           <ManualImport
                                isExpanded={adGroup.isManualImportExpanded}
                                onToggle={() => onUpdate(adGroup.id, 'isManualImportExpanded', !adGroup.isManualImportExpanded)}
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
                                    onChange={(val) => onUpdate(adGroup.id, 'path1', val)} 
                                    maxLength={15} 
                                />
                                <TextInput 
                                    label="Path 2" 
                                    value={adGroup.path2} 
                                    onChange={(val) => onUpdate(adGroup.id, 'path2', val)} 
                                    maxLength={15} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---

const GoogleAdsRSABuilder: React.FC = () => {
  const {
    apiConfig, setApiConfig, campaignData, handleCampaignChange,
    adGroups, addAdGroup, removeAdGroup, updateAdGroup,
    status, isConnected, generateAdCopy, clearAllFields, clearApiConfig,
    isApiConfigExpanded, setIsApiConfigExpanded, isMounted, exportToCSV, handleBulkImport
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

          <CampaignDetails data={campaignData} onChange={handleCampaignChange} />

          <Section title="Ad Groups" subtitle="Create and manage multiple ad groups within your campaign. Each ad group has its own prompt and ad copy.">
            <div className="space-y-6">
                {adGroups.map(ag => (
                    <AdGroup
                        key={ag.id}
                        adGroup={ag}
                        onUpdate={updateAdGroup}
                        onRemove={removeAdGroup}
                        onGenerate={generateAdCopy}
                        onBulkImport={handleBulkImport}
                        isConnected={isConnected}
                    />
                ))}
            </div>
             <div className="mt-8 flex gap-4 justify-center">
                <ActionButton onClick={addAdGroup} icon={<Plus size={20} />}>
                    Add Ad Group
                </ActionButton>
                <ActionButton onClick={clearAllFields} icon={<X size={20} />} variant="secondary">
                    Clear All Ad Groups
                </ActionButton>
            </div>
          </Section>

          {status.debugLogs.length > 0 && (
            <DebugLog logs={status.debugLogs} />
          )}
          
          <footer className="text-center pt-10 mt-8 border-t border-gray-800">
            <div className="space-y-4">
              <div className="text-gray-400 text-sm">
                {campaignData.campaignType === 'new'
                  ? 'Export includes full campaign structure with settings and ad groups'
                  : 'Export includes ad groups for existing campaign import'
                }
              </div>
              <div className="flex gap-4 justify-center flex-wrap">
                <ActionButton
                  onClick={exportToCSV}
                  icon={<Download size={20} />}
                  variant="primary"
                  disabled={adGroups.length === 0}
                >
                  Export CSV
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
