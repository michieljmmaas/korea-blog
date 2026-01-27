'use client';

import { GeoLocation } from '@/app/types';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import("@/app/_components/map/map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
      Loading map...
    </div>
  ),
});

interface MapWrapperProps {
  locations: GeoLocation[];
}

export default function MapWrapper({ locations }: MapWrapperProps) {
  return <MapComponent locations={locations} />;
}