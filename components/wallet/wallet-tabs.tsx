'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const tabs = ['Tokens', 'Activity', 'Governance'];

export function WalletTabs() {
  const [activeTab, setActiveTab] = useState('Tokens');

  return (
    <div className="border-b mb-6">
      <div className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'py-4 relative',
              activeTab === tab
                ? 'text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600'
                : 'text-gray-500'
            )}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}