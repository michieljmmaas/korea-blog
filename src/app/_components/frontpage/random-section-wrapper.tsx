'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface RandomSectionWrapperProps {
  children: React.ReactNode;
  title: string;
  linkComponent: React.ReactNode;
}

export default function RandomSectionWrapper({ 
  children, 
  title, 
  linkComponent 
}: RandomSectionWrapperProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={handleRefresh}
          disabled={isPending}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Loading...' : '🔄 New'}
        </button>
      </div>
      <div className="flex-1">
        {children}
      </div>
      <div className="pt-4 mt-auto">
        {linkComponent}
      </div>
    </div>
  );
}