// src/components/rsa-builder/ui/Section.tsx

import React from 'react';
import { SectionProps } from '@/types';

const Section: React.FC<SectionProps> = ({ title, subtitle, children, className = '', style }) => (
  <div className={`quantum-section mb-12 ${className}`} style={style}>
    <div className="glass-card glow-effect rounded-2xl p-8">
      <div className="section-title-container mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
        <div className="title-accent-line"></div>
      </div>
      <p className="text-gray-400 mb-6">{subtitle}</p>
      {children}
    </div>
  </div>
);

export default Section;