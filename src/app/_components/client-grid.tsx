'use client';

import { useState } from 'react';
import { Camera } from 'lucide-react';
import { TripDay, GridSettings } from '../types';
import TripHeader from './trip-header';
import TripGrid from './trip-grid';

interface ClientGridProps {
  days: TripDay[];
  initialSettings: GridSettings;
}

export default function ClientGrid({ days, initialSettings }: ClientGridProps) {
  const [settings, setSettings] = useState<GridSettings>(initialSettings);



  // Convert string dates back to Date objects for client-side use
  const processedDays = days.map(day => ({
    ...day,
    date: new Date(day.date as any)
  }));

  const processedSettings = {
    ...settings,
    startDate: new Date(settings.startDate as any)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <TripHeader settings={processedSettings} days={processedDays} />

        
        <TripGrid days={processedDays} settings={processedSettings} />
      </div>
    </div>
  );
}