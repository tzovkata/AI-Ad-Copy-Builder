// src/lib/storage.ts

import { ApiConfig } from '@/types';

// Helper function for safe localStorage access
export const getStoredConfig = (): ApiConfig => {
  const defaultConfig = { provider: 'gemini-2.5-flash', key: '' };

  try {
    const saved = localStorage.getItem('rsa_builder_api_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        provider: parsed.provider || defaultConfig.provider,
        key: parsed.key || defaultConfig.key,
      };
    }
  } catch (error) {
    console.warn('Failed to load saved API config:', error);
  }

  return defaultConfig;
};

export const shouldExpandConfig = (): boolean => {
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