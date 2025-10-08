// src/hooks/useFeedOptimiser.ts
// REPLACE THE ENTIRE FILE WITH THIS UPDATED VERSION

"use client";

import React from 'react';
import { FeedRow, OptimisationSettings, FeedState } from '@/types/feed';
import { parseTSV, exportToTSV } from '@/lib/feedParser';
import { ApiConfig } from '@/types';

export const useFeedOptimiser = (apiConfig: ApiConfig) => {
  const [feedState, setFeedState] = React.useState<FeedState>({
    rows: [],
    headers: [],
    isLoading: false,
    optimisingRows: new Set(),
    selectedRows: new Set(),
  });

  const [status, setStatus] = React.useState({ error: '', success: '' });

  const handleFileUpload = React.useCallback((file: File) => {
    setFeedState(prev => ({ ...prev, isLoading: true }));
    setStatus({ error: '', success: '' });

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const { headers, rows } = parseTSV(content);
        
        setFeedState(prev => ({
          ...prev,
          headers,
          rows,
          isLoading: false,
          selectedRows: new Set(),
        }));
        
        setStatus({ error: '', success: `Successfully loaded ${rows.length} products` });
      } catch (err) {
        setStatus({ error: 'Failed to parse file. Please ensure it\'s a valid TSV file.', success: '' });
        setFeedState(prev => ({ ...prev, isLoading: false }));
      }
    };

    reader.onerror = () => {
      setStatus({ error: 'Failed to read file', success: '' });
      setFeedState(prev => ({ ...prev, isLoading: false }));
    };

    reader.readAsText(file);
  }, []);

  const updateRow = React.useCallback((rowId: string, field: string, value: string) => {
    setFeedState(prev => ({
      ...prev,
      rows: prev.rows.map(row => 
        row.id === rowId ? { ...row, [field]: value } : row
      ),
    }));
  }, []);

  const optimiseTitle = React.useCallback(async (rowId: string, settings: OptimisationSettings) => {
    const row = feedState.rows.find(r => r.id === rowId);
    if (!row) return;

    setFeedState(prev => ({
      ...prev,
      optimisingRows: new Set(prev.optimisingRows).add(rowId),
    }));

    try {
      const attributeData = settings.selectedAttributes
        .map(attr => {
          const value = row[attr] || 'N/A';
          const displayName = attr.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return `${displayName}: ${value}`;
        })
        .join('\n');

      const systemMessage = `You are a Google Merchant Centre feed optimisation specialist.
The current product titles in my feed are just the raw product names and must be rewritten into fully optimised titles that follow Google's best practices.

CRITICAL RULES FOR TITLE OPTIMISATION:
1. Begin with the Brand name
2. Add the Product type (T-Shirt, Trainers, Laptop, etc.) IF it is not already present in the current title
3. Include Key Attributes in this order: Gender/Age Group → Colour → Size → Material → Style/Fit → Special Features
4. Write in natural language (no keyword stuffing, no | or /, use dashes " - " between attributes)
5. Keep titles ideally under 70 characters (but maximum 150)
6. Each variant must have its own unique title (different sizes/colours = different titles)
7. Exclude generic or filler words like "clothing," "item," or "sale"

Example:
Current title: Nike Air Zoom Pegasus
Optimised title: Nike Men's Air Zoom Pegasus Running Shoes - Black - Size 10 - Lightweight

OUTPUT FORMAT:
Return ONLY valid JSON: {"title": "optimised title here"}`;

      const userMessage = `CURRENT TITLE: ${row.title}

AVAILABLE PRODUCT ATTRIBUTES:
${attributeData}

Please rewrite this title following the rules above. Use the available attributes to create a complete, optimised title.`;

      let optimisedData;

      if (apiConfig.provider === 'gemini-2.5-flash') {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
          method: 'POST',
          headers: { 'x-goog-api-key': apiConfig.key, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemMessage + '\n\n' + userMessage }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
              responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                properties: {
                  title: { type: "string" }
                },
                required: ["title"]
              }
            }
          })
        });

        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        optimisedData = JSON.parse(text);
      } else if (apiConfig.provider === 'claude-sonnet-4') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiConfig.key,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            system: systemMessage,
            messages: [{ role: 'user', content: userMessage }]
          })
        });

        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        const text = data.content[0].text;
        optimisedData = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
      } else {
        throw new Error('Unsupported provider');
      }

      setFeedState(prev => ({
        ...prev,
        rows: prev.rows.map(r => 
          r.id === rowId ? { ...r, title: optimisedData.title } : r
        ),
      }));

      setStatus({ error: '', success: 'Title optimised successfully!' });
    } catch (err) {
      setStatus({ error: `Failed to optimise title: ${err instanceof Error ? err.message : 'Unknown error'}`, success: '' });
    } finally {
      setFeedState(prev => {
        const newOptimising = new Set(prev.optimisingRows);
        newOptimising.delete(rowId);
        return { ...prev, optimisingRows: newOptimising };
      });
    }
  }, [feedState.rows, apiConfig]);

  const optimiseDescription = React.useCallback(async (rowId: string, settings: OptimisationSettings) => {
    const row = feedState.rows.find(r => r.id === rowId);
    if (!row) return;

    setFeedState(prev => ({
      ...prev,
      optimisingRows: new Set(prev.optimisingRows).add(rowId),
    }));

    try {
      const attributeData = settings.selectedAttributes
        .map(attr => {
          const value = row[attr] || 'N/A';
          const displayName = attr.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return `${displayName}: ${value}`;
        })
        .join('\n');

      const systemMessage = `You are a Google Merchant Centre feed optimisation specialist.
The current product descriptions in my feed are either missing, too short, or only repeat the product name. Rewrite them into fully optimised descriptions that follow Google's best practices.

CRITICAL RULES FOR DESCRIPTION OPTIMISATION:
1. Minimum 500 characters (aim for 500–1,000 characters)
2. Must be unique for each product
3. Clearly describe the Product type (and add it if it's not already in the current description)
4. Highlight key attributes: Gender/Age Group, Colour, Size, Material, Style/Fit, Special Features, Use Case
5. Add benefits and selling points (comfort, durability, versatility, performance, premium material, etc.)
6. Write in natural sentences, not keyword-stuffed or bullet-heavy
7. Avoid promotional phrases like "best price," "sale," or "discount"
8. Use UTF-8 formatting with no broken characters
9. Maximum 5000 characters

Example:
Current description: Nike Air Zoom Pegasus
Optimised description: "The Nike Men's Air Zoom Pegasus Running Shoes are built for comfort and speed, making them the ideal choice for both daily runs and long-distance training. Crafted in lightweight black mesh with responsive cushioning, they provide breathable support and a smooth ride. The durable rubber sole ensures traction on different surfaces, while the classic Pegasus design offers a sleek, modern look. Available in multiple sizes, these trainers are perfect for athletes who want performance and style in one shoe."

OUTPUT FORMAT:
Return ONLY valid JSON: {"description": "optimised description here"}`;

      const userMessage = `CURRENT DESCRIPTION: ${row.description}

AVAILABLE PRODUCT ATTRIBUTES:
${attributeData}

Please rewrite this description following the rules above. Use the available attributes to create a complete, detailed, optimised description of 500-1000 characters.`;

      let optimisedData;

      if (apiConfig.provider === 'gemini-2.5-flash') {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
          method: 'POST',
          headers: { 'x-goog-api-key': apiConfig.key, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemMessage + '\n\n' + userMessage }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
              responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                properties: {
                  description: { type: "string" }
                },
                required: ["description"]
              }
            }
          })
        });

        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        optimisedData = JSON.parse(text);
      } else if (apiConfig.provider === 'claude-sonnet-4') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiConfig.key,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            system: systemMessage,
            messages: [{ role: 'user', content: userMessage }]
          })
        });

        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        const text = data.content[0].text;
        optimisedData = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
      } else {
        throw new Error('Unsupported provider');
      }

      setFeedState(prev => ({
        ...prev,
        rows: prev.rows.map(r => 
          r.id === rowId ? { ...r, description: optimisedData.description } : r
        ),
      }));

      setStatus({ error: '', success: 'Description optimised successfully!' });
    } catch (err) {
      setStatus({ error: `Failed to optimise description: ${err instanceof Error ? err.message : 'Unknown error'}`, success: '' });
    } finally {
      setFeedState(prev => {
        const newOptimising = new Set(prev.optimisingRows);
        newOptimising.delete(rowId);
        return { ...prev, optimisingRows: newOptimising };
      });
    }
  }, [feedState.rows, apiConfig]);

  const toggleRowSelection = React.useCallback((rowId: string) => {
    setFeedState(prev => {
      const newSelected = new Set(prev.selectedRows);
      if (newSelected.has(rowId)) {
        newSelected.delete(rowId);
      } else {
        newSelected.add(rowId);
      }
      return { ...prev, selectedRows: newSelected };
    });
  }, []);

  const selectAllRows = React.useCallback(() => {
    setFeedState(prev => ({
      ...prev,
      selectedRows: new Set(prev.rows.map(r => r.id)),
    }));
  }, []);

  const deselectAllRows = React.useCallback(() => {
    setFeedState(prev => ({
      ...prev,
      selectedRows: new Set(),
    }));
  }, []);

  const exportFeed = React.useCallback(() => {
    const tsvContent = exportToTSV(feedState.headers, feedState.rows);
    const blob = new Blob(['\uFEFF' + tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `optimised_feed_${new Date().toISOString().split('T')[0]}.tsv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    setStatus({ error: '', success: 'Feed exported successfully!' });
  }, [feedState.headers, feedState.rows]);

  return {
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
  };
};