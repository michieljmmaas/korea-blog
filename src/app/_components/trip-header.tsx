// components/TripHeader.tsx
import { Calendar, MapPin } from 'lucide-react';
import { GridSettings } from '../types';

interface TripHeaderProps {
  settings: GridSettings;
}

const TripHeader: React.FC<TripHeaderProps> = ({ settings }) => {
  const endDate = new Date(settings.startDate.getTime() + (settings.totalDays - 1) * 24 * 60 * 60 * 1000);

  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
        <MapPin className="text-red-500" />
        My South Korea Adventure
      </h1>
      <p className="text-xl text-gray-600 mb-2">{settings.totalDays} Days of Discovery</p>
      <div className="flex items-center justify-center gap-2 text-gray-500">
        <Calendar className="w-5 h-5" />
        <span>
          {settings.startDate.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric',
            year: 'numeric' 
          })} - {endDate.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric',
            year: 'numeric' 
          })}
        </span>
      </div>
    </div>
  );
};

export default TripHeader;