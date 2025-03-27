'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AnalyzeTab } from './va-components/AnalyzeTab';
import { WatchTab } from './va-components/WatchTab';

const Page = () => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'watch'>('analyze');
  const [watchUrl, setWatchUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleError = (errorMessage: string | null) => {
    setError(errorMessage);
  };

  const handleWatchUrlChange = (url: string) => {
    setWatchUrl(url);
  };

  return (
    <div className='flex h-screen flex-col bg-gray-900'>
      <div className='flex justify-center space-x-4 bg-gray-800/60 p-4 backdrop-blur-sm'>
        <Button
          variant={activeTab === 'analyze' ? 'default' : 'outline'}
          onClick={() => setActiveTab('analyze')}
          className='px-8'
        >
          Analyze
        </Button>
        <Button
          variant={activeTab === 'watch' ? 'default' : 'outline'}
          onClick={() => setActiveTab('watch')}
          className='px-8'
        >
          Watch
        </Button>
      </div>
      {activeTab === 'analyze' && (
        <div className='flex-1 overflow-hidden p-4'>
          <AnalyzeTab 
            onError={handleError} 
            onWatchUrlChange={handleWatchUrlChange} 
          />
        </div>
      )}

      {activeTab === 'watch' && (
        <div className='flex-1 p-4'>
          <WatchTab watchUrl={watchUrl} />
        </div>
      )}
    </div>
  );
};

export default Page;