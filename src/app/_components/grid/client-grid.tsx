'use client';

import { TripDay } from '../../types';
import Legend from './legend';
import TripGrid from './trip-grid';

interface ClientGridProps {
  days: TripDay[];
}

export default function ClientGrid({ days }: ClientGridProps) {

  // Convert string dates back to Date objects for client-side use
  const processedDays = days.map(day => ({
    ...day,
    date: new Date(day.date as any)
  }));


  return (
    <div className="mt-4">
      <div className="max-w-6xl mx-auto">
        <Legend />
        <TripGrid days={processedDays} />
      </div>
    </div>
  );
}