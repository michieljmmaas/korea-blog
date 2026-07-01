import { GeoLocation } from '@/app/types';
import MapWrapper from './map-wrapper';

interface MapWithDataProps {
  locations: GeoLocation[];
}

export default function MapWithData({ locations }: MapWithDataProps) {
  if (locations.length === 0) {
    return (
      <div className="w-full h-[200px] bg-gray-100 rounded-lg flex items-center justify-center">
        No location data available
      </div>
    );
  }

  return <MapWrapper locations={locations} />;
}
