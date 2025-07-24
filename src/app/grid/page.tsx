"use client"

import { useState } from 'react';
import { Camera } from 'lucide-react';
import TripHeader from '../_components/trip-header';
import TripGrid from '../_components/trip-grid';
import { GridSettings, TripDay } from '../types';

export default function TripGridPage() {
  const [settings, setSettings] = useState<GridSettings>({
    squareSize: 'small',
    totalDays: 70,
    startDate: new Date('2024-03-07') // Thursday - adjust to your actual start date
  });
  
  // Generate array of days
  const days: TripDay[] = Array.from({ length: settings.totalDays }, (_, index) => {
    const dayNumber = index + 1;
    const currentDate = new Date(settings.startDate);
    currentDate.setDate(settings.startDate.getDate() + index);
    
    return {
      day: dayNumber,
      date: currentDate,
      formattedDate: currentDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      fullDate: currentDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric' 
      })
    };
  });



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <TripHeader settings={settings} />
        
        <TripGrid days={days} settings={settings} />

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" />
            Click on any day to view photos and stories from that adventure
          </p>
        </div>
      </div>
    </div>
  );
}