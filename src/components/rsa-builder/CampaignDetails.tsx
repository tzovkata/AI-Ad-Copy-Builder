// src/components/rsa-builder/CampaignDetails.tsx

import React from 'react';
import { CampaignDetailsProps } from '@/types';
import Section from './ui/Section';
import TextInput from './ui/TextInput';

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ data, onChange }) => (
  <Section title="Campaign Details" subtitle="Provide the basic information and settings for your ad campaign." className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
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

export default CampaignDetails;