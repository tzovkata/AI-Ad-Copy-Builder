"use client";

import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ApiConfig, Campaign, AdGroupData, Status, AdAsset, UseAdBuilderReturn, Keyword, KeywordOptions } from '@/types';
import { getStoredConfig, shouldExpandConfig } from '@/lib/storage';

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
    maxCPC: '0.01',
    maxCPM: '0.01',
    targetCPV: '0.01',
    targetCPM: '0.01',
    campaignStatus: 'Active',
    adGroupStatus: 'Active',
    keywords: [],
    isKeywordsExpanded: false,
    isGeneratingKeywords: false,
});

const createNewCampaign = (name: string): Campaign => ({
    id: uuidv4(),
    name,
    isExpanded: true,
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
    adGroups: [createNewAdGroup('Ad Group 1')],
});


export const useAdBuilder = (): UseAdBuilderReturn => {
  const [isMounted, setIsMounted] = React.useState(false);
  const [apiConfig, setApiConfig] = React.useState<ApiConfig>({ provider: 'gemini-2.5-flash', key: '' });
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([createNewCampaign('Campaign 1')]);
  const [status, setStatus] = React.useState<Status>({ error: '', success: '', debugLogs: [] });
  const [isApiConfigExpanded, setIsApiConfigExpanded] = React.useState<boolean>(true);

  React.useEffect(() => {
    setIsMounted(true);
    const savedConfig = getStoredConfig();
    setApiConfig(savedConfig);
    const shouldExpand = shouldExpandConfig();
    setIsApiConfigExpanded(shouldExpand);
  }, []);

  const addDebugLog = React.useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setStatus(prev => ({ ...prev, debugLogs: [...prev.debugLogs.slice(-19), logMessage] }));
    console.log(logMessage);
  }, []);

  const isConnected = !!apiConfig.provider && !!apiConfig.key;

  React.useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('rsa_builder_api_config', JSON.stringify(apiConfig));
      } catch (error) {
        console.warn('Failed to save API config:', error);
      }
    }
  }, [apiConfig, isMounted]);

  // --- Campaign Management ---
  const addCampaign = () => {
    setCampaigns(prev => [...prev, createNewCampaign(`Campaign ${prev.length + 1}`)]);
    setStatus(prev => ({ ...prev, success: 'New Campaign added!', error: '' }));
  };

  const removeCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    setStatus(prev => ({ ...prev, success: 'Campaign removed!', error: '' }));
  };

  const updateCampaign = (campaignId: string, field: keyof Campaign, value: any) => {
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, [field]: value } : c));
  };

  // --- Ad Group Management (requires campaignId) ---
  const addAdGroup = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => {
        if (c.id === campaignId) {
            const newAdGroup = createNewAdGroup(`Ad Group ${c.adGroups.length + 1}`);
            return { ...c, adGroups: [...c.adGroups, newAdGroup] };
        }
        return c;
    }));
     setStatus(prev => ({ ...prev, success: 'New Ad Group added!', error: '' }));
  };
  
  const removeAdGroup = (campaignId: string, adGroupId: string) => {
    setCampaigns(prev => prev.map(c => {
        if (c.id === campaignId) {
            return { ...c, adGroups: c.adGroups.filter(ag => ag.id !== adGroupId) };
        }
        return c;
    }));
    setStatus(prev => ({ ...prev, success: 'Ad Group removed!', error: '' }));
  };

  const updateAdGroup = (campaignId: string, adGroupId: string, field: keyof AdGroupData, value: any) => {
      setCampaigns(prev => prev.map(c => {
          if (c.id === campaignId) {
              const updatedAdGroups = c.adGroups.map(ag => 
                  ag.id === adGroupId ? { ...ag, [field]: value } : ag
              );
              return { ...c, adGroups: updatedAdGroups };
          }
          return c;
      }));
  };

  const clearAdGroup = (campaignId: string, adGroupId: string) => {
    setCampaigns(prev => prev.map(c => {
        if (c.id === campaignId) {
            const updatedAdGroups = c.adGroups.map(ag => {
                if (ag.id === adGroupId) {
                    return {
                        ...ag,
                        finalUrl: '',
                        productInfo: '',
                        headlines: Array(15).fill(null).map(() => ({ text: '', position: null })),
                        descriptions: Array(4).fill(null).map(() => ({ text: '', position: null })),
                        path1: '',
                        path2: '',
                    };
                }
                return ag;
            });
            return { ...c, adGroups: updatedAdGroups };
        }
        return c;
    }));
    setStatus(prev => ({ ...prev, success: `Ad Group content cleared!`, error: '' }));
  };
  
  const handleBulkImport = React.useCallback((campaignId: string, adGroupId: string, lines: string[], type: 'headlines' | 'descriptions') => {
    setCampaigns(prev => prev.map(c => {
        if (c.id === campaignId) {
            const updatedAdGroups = c.adGroups.map(ag => {
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
            });
            return { ...c, adGroups: updatedAdGroups };
        }
        return c;
    }));
    setStatus(prev => ({ ...prev, success: `Successfully imported ${lines.length} ${type}!`, error: '' }));
  }, []);

  const generateAdCopy = React.useCallback(async (campaignId: string, adGroupId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    const adGroup = campaign?.adGroups.find(ag => ag.id === adGroupId);

    if (!campaign || !adGroup) { setStatus(prev => ({ ...prev, error: 'Campaign or Ad Group not found.', success: '' })); return; }
    if (!isConnected) { setStatus(prev => ({ ...prev, error: 'API connection required. Please enter your key.', success: '' })); return; }
    if (!adGroup.productInfo.trim()) { setStatus(prev => ({ ...prev, error: `Product information is required for ${adGroup.name}.`, success: '' })); return; }

    updateAdGroup(campaignId, adGroupId, 'isGenerating', true);
    setStatus(prev => ({ ...prev, error: '', success: `Starting generation for ${adGroup.name}...` }));
    addDebugLog(`🚀 [${campaign.name}/${adGroup.name}] Starting ad copy generation...`);

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

        const userMessage = `PRODUCT DETAILS:
${adGroup.productInfo}

CAMPAIGN INFO:
Campaign Name: ${campaign.name || 'Product Campaign'}
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

        } else if (apiConfig.provider === 'claude-sonnet-4') {
            addDebugLog(`[${adGroup.name}] 🧠 Using Claude API...`);
            setStatus(s => ({ ...s, success: `[${adGroup.name}] Sending request to Claude AI...` }));
            
            const requestBody = {
                model: 'claude-3-sonnet-20240229',
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
        } else {
          throw new Error('Unsupported provider selected.');
        }
        
        const { headlines, descriptions, paths } = generatedContent;
        
        const newHeadlines = [...Array(15)].map((_, i) => ({ text: String(headlines[i] || '').substring(0, 30), position: null }));
        const newDescriptions = [...Array(4)].map((_, i) => ({ text: String(descriptions[i] || '').substring(0, 90), position: null }));

        setCampaigns(prev => prev.map(c => {
          if (c.id === campaignId) {
              const updatedAdGroups = c.adGroups.map(ag => 
                  ag.id === adGroupId ? { 
                      ...ag, 
                      headlines: newHeadlines,
                      descriptions: newDescriptions,
                      path1: String(paths[0] || '').substring(0, 15),
                      path2: String(paths[1] || '').substring(0, 15),
                  } : ag
              );
              return { ...c, adGroups: updatedAdGroups };
          }
          return c;
      }));
        
        addDebugLog(`[${adGroup.name}] ✅ Ad copy applied successfully!`);
        setStatus(prev => ({ ...prev, error: '', success: `🎉 Ad copy generated for ${adGroup.name}!` }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      addDebugLog(`[${adGroup.name}] ❌ Generation error: ${errorMessage}`);
      setStatus(prev => ({ ...prev, error: `Error for ${adGroup.name}: ${errorMessage}`, success: '' }));
    } finally {
      updateAdGroup(campaignId, adGroupId, 'isGenerating', false);
    }
  }, [isConnected, campaigns, apiConfig, addDebugLog]);

  const clearAllFields = React.useCallback(() => {
    setCampaigns([createNewCampaign('Campaign 1')]);
    setStatus({ error: '', success: 'All campaigns and fields cleared!', debugLogs: [] });
  }, []);

  const clearApiConfig = React.useCallback(() => {
    setApiConfig({ provider: 'gemini-2.5-flash', key: '' });
    if (isMounted) { try { localStorage.removeItem('rsa_builder_api_config'); } catch (error) { console.warn('Failed to clear API config:', error); } }
    setStatus({ error: '', success: 'API configuration cleared!', debugLogs: [] });
  }, [isMounted]);

  const exportToCSV = React.useCallback(() => {
    const allCampaignsMissingUrls = campaigns.some(c => c.adGroups.some(ag => !ag.finalUrl.trim()));
    if (allCampaignsMissingUrls) {
        setStatus(prev => ({ ...prev, error: 'A Final URL is required for every ad group in every campaign before exporting.', success: '' }));
        return;
    }

    const formatCell = (value: any): string => {
        const str = String(value || '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    let csvLines: string[] = [];
    let isNewCampaignFormat = false; // Check if at least one campaign is 'new'
    
    campaigns.forEach(campaign => {
        if(campaign.campaignType === 'new') isNewCampaignFormat = true;
    });

    if (isNewCampaignFormat) {
        // Use the comprehensive 134-column header for new campaign structures
        const headerRow = [ 'Campaign', 'Labels', 'Campaign Type', 'Networks', 'Budget', 'Budget type', 'Standard conversion goals', 'Customer acquisition', 'Languages', 'Bid Strategy Type', 'Bid Strategy Name', 'Ad location', 'Target impression share', 'Maximum CPC bid limit', 'Start Date', 'End Date', 'Broad match keywords', 'Ad Schedule', 'Ad rotation', 'Content exclusions', 'Targeting method', 'Exclusion method', 'Audience targeting', 'Flexible Reach', 'AI Max', 'Text customization', 'Final URL expansion', 'Ad Group', 'Max CPC', 'Max CPM', 'Target CPA', 'Max CPV', 'Target CPV', 'Percent CPC', 'Target CPM', 'Target ROAS', 'Target CPC', 'Desktop Bid Modifier', 'Mobile Bid Modifier', 'Tablet Bid Modifier', 'TV Screen Bid Modifier', 'Display Network Custom Bid Type', 'Optimized targeting', 'Strict age and gender targeting', 'Search term matching', 'Ad Group Type', 'Channels', 'Audience name', 'Age demographic', 'Gender demographic', 'Income demographic', 'Parental status demographic', 'Remarketing audience segments', 'Interest categories', 'Life events', 'Custom audience segments', 'Detailed demographics', 'Remarketing audience exclusions', 'Tracking template', 'Final URL suffix', 'Custom parameters', 'ID', 'Location', 'Reach', 'Location groups', 'Radius', 'Unit', 'Bid Modifier', 'Account keyword type', 'Keyword', 'Criterion Type', 'Final URL', 'Final mobile URL', 'Link source', 'Business name', 'Ad type', 'Headline 1', 'Headline 1 position', 'Headline 2', 'Headline 2 position', 'Headline 3', 'Headline 3 position', 'Headline 4', 'Headline 4 position', 'Headline 5', 'Headline 5 position', 'Headline 6', 'Headline 6 position', 'Headline 7', 'Headline 7 position', 'Headline 8', 'Headline 8 position', 'Headline 9', 'Headline 9 position', 'Headline 10', 'Headline 10 position', 'Headline 11', 'Headline 11 position', 'Headline 12', 'Headline 12 position', 'Headline 13', 'Headline 13 position', 'Headline 14', 'Headline 14 position', 'Headline 15', 'Headline 15 position', 'Description 1', 'Description 1 position', 'Description 2', 'Description 2 position', 'Description 3', 'Description 3 position', 'Description 4', 'Description 4 position', 'Path 1', 'Path 2', 'Shared set name', 'Shared set type', 'Keyword count', 'Link Text', 'Description Line 1', 'Description Line 2', 'Upgraded extension', 'Source', 'Callout text', 'Phone Number', 'Country of Phone', 'Conversion Action', 'Campaign Status', 'Ad Group Status', 'Status', 'Approval Status', 'Ad strength', 'Comment' ];
        csvLines.push(headerRow.map(formatCell).join(','));
    } else {
        // Use the simpler header for existing campaigns
        const headerRow = [ 'Campaign', 'Ad Group', 'Ad type', 'Labels', 'Headline 1', 'Headline 1 position', 'Headline 2', 'Headline 2 position', 'Headline 3', 'Headline 3 position', 'Headline 4', 'Headline 4 position', 'Headline 5', 'Headline 5 position', 'Headline 6', 'Headline 6 position', 'Headline 7', 'Headline 7 position', 'Headline 8', 'Headline 8 position', 'Headline 9', 'Headline 9 position', 'Headline 10', 'Headline 10 position', 'Headline 11', 'Headline 11 position', 'Headline 12', 'Headline 12 position', 'Headline 13', 'Headline 13 position', 'Headline 14', 'Headline 14 position', 'Headline 15', 'Headline 15 position', 'Description 1', 'Description 1 position', 'Description 2', 'Description 2 position', 'Description 3', 'Description 3 position', 'Description 4', 'Description 4 position', 'Path 1', 'Path 2', 'Final URL', 'Final mobile URL', 'Tracking template', 'Final URL suffix', 'Custom parameters', 'Campaign Status', 'Ad Group Status', 'Status', 'Approval Status', 'Ad strength', 'Comment', 'Keyword', 'Criterion Type' ];
        csvLines.push(headerRow.map(formatCell).join(','));
    }

    campaigns.forEach(campaign => {
        if (campaign.campaignType === 'new') {
            const campaignRow = Array(134).fill('');
            campaignRow[0] = campaign.name;
            campaignRow[2] = 'Search';
            campaignRow[3] = campaign.networks;
            campaignRow[4] = campaign.budget.replace(' Daily', '');
            campaignRow[5] = 'Daily';
            campaignRow[8] = campaign.languages;
            campaignRow[9] = campaign.bidStrategyType;
            campaignRow[16] = campaign.broadMatch === 'On' ? 'On' : 'Off';
            campaignRow[18] = campaign.adRotation;
            campaignRow[20] = campaign.targetingMethod;
            campaignRow[21] = campaign.exclusionMethod;
            campaignRow[24] = campaign.aiMax;
            campaignRow[128] = campaign.status === 'Active' ? 'Enabled' : 'Paused';
            csvLines.push(campaignRow.map(formatCell).join(','));

            campaign.adGroups.forEach(ag => {
                const agSettingsRow = Array(134).fill('');
                agSettingsRow[0] = campaign.name;
                agSettingsRow[27] = ag.name;
                agSettingsRow[28] = ag.maxCPC;
                agSettingsRow[29] = ag.maxCPM;
                agSettingsRow[31] = ag.targetCPV;
                agSettingsRow[34] = ag.targetCPM;
                agSettingsRow[128] = ag.campaignStatus === 'Active' ? 'Enabled' : 'Paused';
                agSettingsRow[129] = ag.adGroupStatus === 'Active' ? 'Enabled' : 'Paused';
                csvLines.push(agSettingsRow.map(formatCell).join(','));

                const rsaAdRow = Array(134).fill('');
                rsaAdRow[0] = campaign.name;
                rsaAdRow[27] = ag.name;
                rsaAdRow[71] = ag.finalUrl;
                rsaAdRow[75] = 'Responsive search ad';
                ag.headlines.forEach((h, i) => {
                    rsaAdRow[76 + i * 2] = h.text;
                    rsaAdRow[77 + i * 2] = h.position || '';
                });
                ag.descriptions.forEach((d, i) => {
                    rsaAdRow[106 + i * 2] = d.text;
                    rsaAdRow[107 + i * 2] = d.position || '';
                });
                rsaAdRow[114] = ag.path1;
                rsaAdRow[115] = ag.path2;
                rsaAdRow[128] = 'Enabled';
                rsaAdRow[129] = 'Enabled';
                rsaAdRow[130] = 'Enabled';
                csvLines.push(rsaAdRow.map(formatCell).join(','));

                ag.keywords.forEach(kw => {
                    const keywordRow = Array(134).fill('');
                    keywordRow[0] = campaign.name;
                    keywordRow[69] = kw.text; // Keyword column
                    keywordRow[70] = kw.matchType; // Criterion Type column
                    
                    if (kw.matchType.startsWith('Campaign Negative')) {
                        keywordRow[27] = ''; // BLANK Ad Group for Campaign Negatives
                    } else {
                        keywordRow[27] = ag.name; // INCLUDE Ad Group for all other types
                    }
                    csvLines.push(keywordRow.map(formatCell).join(','))
                });
            });
        } else {
            campaign.adGroups.forEach(ag => {
                const row = [];
                row.push(campaign.name, ag.name, 'Responsive search ad', '');
                ag.headlines.forEach(h => row.push(h.text, h.position || ''));
                ag.descriptions.forEach(d => row.push(d.text, d.position || ''));
                row.push(ag.path1, ag.path2, ag.finalUrl, '', '', '', '');
                row.push(ag.campaignStatus === 'Active' ? 'Enabled' : 'Paused');
                row.push(ag.adGroupStatus === 'Active' ? 'Enabled' : 'Paused');
                row.push('Enabled', '', '', '');
                csvLines.push(row.map(formatCell).join(','));
                 ag.keywords.forEach(kw => {
                    const keywordRow = Array(56).fill('');
                    keywordRow[0] = campaign.name;
                    keywordRow[54] = kw.text; // Keyword
                    keywordRow[55] = kw.matchType; // Criterion Type
                    
                     if (kw.matchType.startsWith('Campaign Negative')) {
                        keywordRow[1] = ''; // BLANK Ad Group for Campaign Negatives
                    } else {
                        keywordRow[1] = ag.name; // INCLUDE Ad Group for all other types
                    }
                    csvLines.push(keywordRow.map(formatCell).join(','))
                });
            });
        }
    });

    const csvContent = csvLines.join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `RSA_Campaign_Export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    setStatus(prev => ({ ...prev, success: 'CSV exported successfully!', error: '' }));
  }, [campaigns]);
    const addKeyword = (campaignId: string, adGroupId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const updatedAdGroups = c.adGroups.map(ag => {
          if (ag.id === adGroupId) {
            const newKeyword: Keyword = { id: uuidv4(), text: '', matchType: 'Broad' };
            return { ...ag, keywords: [...ag.keywords, newKeyword] };
          }
          return ag;
        });
        return { ...c, adGroups: updatedAdGroups };
      }
      return c;
    }));
  };

  const updateKeyword = (campaignId: string, adGroupId: string, keywordId: string, updatedKeyword: Keyword) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const updatedAdGroups = c.adGroups.map(ag => {
          if (ag.id === adGroupId) {
            const updatedKeywords = ag.keywords.map(kw => kw.id === keywordId ? updatedKeyword : kw);
            return { ...ag, keywords: updatedKeywords };
          }
          return ag;
        });
        return { ...c, adGroups: updatedAdGroups };
      }
      return c;
    }));
  };

  const removeKeyword = (campaignId: string, adGroupId: string, keywordId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const updatedAdGroups = c.adGroups.map(ag => {
          if (ag.id === adGroupId) {
            const updatedKeywords = ag.keywords.filter(kw => kw.id !== keywordId);
            return { ...ag, keywords: updatedKeywords };
          }
          return ag;
        });
        return { ...c, adGroups: updatedAdGroups };
      }
      return c;
    }));
  };

  const generateKeywords = React.useCallback(async (campaignId: string, adGroupId: string, options: KeywordOptions) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    const adGroup = campaign?.adGroups.find(ag => ag.id === adGroupId);

    if (!campaign || !adGroup) {
      setStatus(prev => ({ ...prev, error: 'Campaign or Ad Group not found.', success: '' }));
      return;
    }
    if (!isConnected) {
      setStatus(prev => ({ ...prev, error: 'API connection required. Please enter your key.', success: '' }));
      return;
    }
    if (!options.prompt.trim()) {
      setStatus(prev => ({ ...prev, error: 'A prompt is required to generate keywords.', success: '' }));
      return;
    }

    updateAdGroup(campaignId, adGroupId, 'isGeneratingKeywords', true);
    setStatus(prev => ({ ...prev, error: '', success: `Generating keywords for ${adGroup.name}...` }));
    addDebugLog(`🚀 [${adGroup.name}] Starting keyword generation...`);

    try {
      const wantsNegative = options.matchTypes.negativeExact || options.matchTypes.negativePhrase || options.matchTypes.campaignNegativeExact || options.matchTypes.campaignNegativePhrase;
      const systemMessage = `You are a Google Ads keyword expert. Generate a JSON object with two keys: "positive" and "negative". Each key should contain an array of keyword strings. "positive" keywords are for targeting, and "negative" keywords are for exclusion.`;
      const userMessage = `Generate up to ${options.numKeywords} total keywords for the following prompt: "${options.prompt}". ${wantsNegative ? "Include relevant negative keywords in your response." : "Do not include negative keywords."}`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
        method: 'POST',
        headers: { 'x-goog-api-key': apiConfig.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemMessage}\n\n${userMessage}` }] }],
          generationConfig: { 
              responseMimeType: "application/json",
               responseSchema: {
                type: "object",
                properties: {
                  positive: { type: "array", items: { type: "string" } },
                  negative: { type: "array", items: { type: "string" } }
                },
                required: ["positive", "negative"]
              }
            }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const geminiData = await response.json();
      const text = geminiData.candidates[0].content.parts[0].text;
      const { positive, negative } = JSON.parse(text);

      const newKeywords: Keyword[] = [];

      // Process positive keywords
      if (Array.isArray(positive)) {
        positive.forEach((kwText: string) => {
          if (options.matchTypes.exact) newKeywords.push({ id: uuidv4(), text: kwText, matchType: 'Exact' });
          if (options.matchTypes.phrase) newKeywords.push({ id: uuidv4(), text: kwText, matchType: 'Phrase' });
          if (options.matchTypes.broad) newKeywords.push({ id: uuidv4(), text: kwText, matchType: 'Broad' });
        });
      }

      // Process negative keywords
      if (Array.isArray(negative)) {
        negative.forEach((kwText: string) => {
          if (options.matchTypes.negativeExact) newKeywords.push({ id: uuidv4(), text: kwText, matchType: 'Negative Exact' });
          if (options.matchTypes.negativePhrase) newKeywords.push({ id: uuidv4(), text: kwText, matchType: 'Negative Phrase' });
          if (options.matchTypes.campaignNegativeExact) newKeywords.push({ id: uuidv4(), text: kwText, matchType: 'Campaign Negative Exact' });
          if (options.matchTypes.campaignNegativePhrase) newKeywords.push({ id: uuidv4(), text: kwText, matchType: 'Campaign Negative Phrase' });
        });
      }

      setCampaigns(prev => prev.map(c => {
        if (c.id === campaignId) {
          const updatedAdGroups = c.adGroups.map(ag =>
            ag.id === adGroupId ? { ...ag, keywords: [...ag.keywords, ...newKeywords] } : ag
          );
          return { ...c, adGroups: updatedAdGroups };
        }
        return c;
      }));

      addDebugLog(`[${adGroup.name}] ✅ Keywords generated successfully!`);
      setStatus(prev => ({ ...prev, success: `🎉 Keywords generated for ${adGroup.name}!` }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addDebugLog(`[${adGroup.name}] ❌ Keyword generation error: ${errorMessage}`);
      setStatus(prev => ({ ...prev, error: `Keyword generation error for ${adGroup.name}: ${errorMessage}`, success: '' }));
    } finally {
      updateAdGroup(campaignId, adGroupId, 'isGeneratingKeywords', false);
    }
  }, [isConnected, campaigns, apiConfig, addDebugLog]);
    
      const handleBulkKeywordImport = React.useCallback((campaignId: string, adGroupId: string, keywords: string, matchType: Keyword['matchType']) => {
    const keywordLines = keywords.split('\n').map(k => k.trim()).filter(Boolean);
    if (keywordLines.length === 0) {
      setStatus(prev => ({ ...prev, error: 'No keywords to import.', success: '' }));
      return;
    }

    const newKeywords: Keyword[] = keywordLines.map(text => ({
      id: uuidv4(),
      text,
      matchType,
    }));

    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const updatedAdGroups = c.adGroups.map(ag => {
          if (ag.id === adGroupId) {
            return { ...ag, keywords: [...ag.keywords, ...newKeywords] };
          }
          return ag;
        });
        return { ...c, adGroups: updatedAdGroups };
      }
      return c;
    }));

    setStatus(prev => ({ ...prev, success: `Successfully imported ${keywordLines.length} keywords as ${matchType}!`, error: '' }));
  }, []);
  
  return { 
      apiConfig, setApiConfig, campaigns, addCampaign, removeCampaign, updateCampaign,
      addAdGroup, removeAdGroup, updateAdGroup, clearAdGroup,
      status, isConnected, generateAdCopy, clearAllFields, clearApiConfig, 
      isApiConfigExpanded, setIsApiConfigExpanded, isMounted, exportToCSV, handleBulkImport,
      generateKeywords,
      addKeyword,
      updateKeyword,
      removeKeyword,
      handleBulkKeywordImport
    };
};