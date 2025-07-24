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
      <p className="text-xl text-gray-600 mb-4">{settings.totalDays} Days of Discovery</p>
      
      <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
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

      {/* Blog Stats */}
      <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          <span>{publishedPosts} Published</span>
        </div>
        {draftPosts > 0 && (
          <div className="flex items-center gap-1">
            <Edit className="w-4 h-4" />
            <span>{draftPosts} Drafts</span>
          </div>
        )}
        {featuredPosts > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            <span>{featuredPosts} Featured</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripHeader;