'use client';

import { fetchLocations } from '@/app/actions/get-locations';
import { GeoLocation } from '@/app/types';
import { useState, useEffect } from 'react';
import MapWrapper from './map-wrapper';

interface MapWithDataProps {
  date: string;
}

export default function MapWithData({ date }: MapWithDataProps) {
  const [locations, setLocations] = useState<GeoLocation[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMapData = async () => {
      try {
        const data = await fetchLocations(date);
        setLocations(data);
      } catch (error) {
        console.error('Failed to load locations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, [date]);

  if (loading) {
    return (
      <div className="w-full h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
        Loading map data...
      </div>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <div className="w-full h-[200px] bg-gray-100 rounded-lg flex items-center justify-center">
        No location data available
      </div>
    );
  }

  return <MapWrapper locations={locations} />;
}