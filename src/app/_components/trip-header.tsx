import { Calendar, MapPin, FileText, Star, Edit } from 'lucide-react';
import { GridSettings, TripDay } from '../types';

interface TripHeaderProps {
  settings: GridSettings;
  days: TripDay[];
}

const TripHeader: React.FC<TripHeaderProps> = ({ settings, days }) => {
  const endDate = new Date(settings.startDate.getTime() + (settings.totalDays - 1) * 24 * 60 * 60 * 1000);
  
  // Calculate stats
  const totalPosts = days.length;
  const publishedPosts = days.filter(day => !day.frontmatter.draft).length;
  const featuredPosts = days.filter(day => day.frontmatter.featured).length;
  const draftPosts = days.filter(day => day.frontmatter.draft).length;

  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
        <MapPin className="text-red-500" />
        My South Korea Adventure
      </h1>
    </div>
  );
};

export default TripHeader;