import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, Camera, MapPin } from 'lucide-react';
import { TripDay } from '../types';

interface DaySquareProps {
  dayInfo?: TripDay;
  isEmpty?: boolean;
  size: 'small' | 'medium' | 'large';
}

const sizeClasses = {
  small: 'w-full h-20 text-base',
  medium: 'w-20 h-20 text-base',
  large: 'w-24 h-24 text-lg'
};

// Function to get color based on location
const getLocationColor = (location: string, isWork: boolean): string => {
  if (isWork === true) {
    return 'bg-indigo-600';
  }

  if (!location) return 'bg-gray-600'; // default

  const loc = location.toLowerCase().trim();

  if (loc.includes('japan') || loc.includes('tokyo') || loc.includes('osaka') || loc.includes('kyoto')) {
    return 'bg-purple-600';
  }
  if (loc.includes('seoul')) {
    return 'bg-blue-600';
  }
  if (loc.includes('busan')) {
    return 'bg-red-600';
  }
  if (loc.includes('taiwan') || loc.includes('taipei')) {
    return 'bg-green-600';
  }
  if (loc.includes('hong kong')) {
    return 'bg-emerald-600';
  }
  if (loc.includes('nederland') || loc.includes('netherlands') || loc.includes('amsterdam') || loc.includes('rotterdam')) {
    return 'bg-orange-600';
  }

  // Default color if location doesn't match any of the above
  return 'bg-gray-600';
};

const DaySquare: React.FC<DaySquareProps> = ({ dayInfo, isEmpty = false, size }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (isEmpty) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 rounded-lg border border-gray-200`}>
      </div>
    );
  }

  if (!dayInfo) return null;

  const hasLocation = dayInfo.frontmatter.location && dayInfo.frontmatter.location.trim() !== '';
  const hasPhotos = dayInfo.frontmatter.photos && dayInfo.frontmatter.photos.length > 0;
  const isFeatured = dayInfo.frontmatter.featured;
  // const isDraft = dayInfo.frontmatter.draft;
  const isDraft = false;
  const isWork = dayInfo.frontmatter.work;

  // Get the appropriate color based on location
  const locationColor = getLocationColor(dayInfo.frontmatter.location, isWork);

  return (
    <div className="relative">
      {isDraft ? (
        <div
          className="block cursor-not-allowed"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`${sizeClasses[size]} ${isFeatured
              ? 'bg-yellow-500'
              : locationColor
            } rounded-lg shadow-sm cursor-not-allowed flex flex-col items-center justify-center text-white relative opacity-50 hover:opacity-60 hover:-translate-y-1 transition-all duration-200`}>
            {/* Day number */}
            <div className="font-semibold">
              {dayInfo.day}
            </div>

            {/* Date - only show on medium/large sizes */}
            {/* {size !== 'small' && ( */}
            <div className="text-xs opacity-80 mt-1">
              {dayInfo.formattedDate}
            </div>
            {/* )} */}
          </div>
        </div>
      ) : (
        <Link
          href={`/day/${dayInfo.frontmatter.date}`}
          className="block"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`${sizeClasses[size]} ${isFeatured
              ? 'bg-yellow-500'
              : locationColor
            } rounded-lg shadow-sm hover:shadow-md hover:scale-102 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-white relative`}>

            {/* Day number */}
            <div className="font-semibold">
              {dayInfo.day}
            </div>

            {/* Date - only show on medium/large sizes */}
            {size !== 'small' && (
              <div className="text-xs opacity-80 mt-1">
                {dayInfo.formattedDate}
              </div>
            )}

            {/* Simple featured indicator */}
            {isFeatured && (
              <div className="absolute top-1 right-1 text-yellow-200 text-xs">
                ★
              </div>
            )}
          </div>
        </Link>
      )}

      {/* Simple tooltip */}
      {isHovered && isDraft && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded text-sm whitespace-nowrap z-20 shadow-lg max-w-xs">
          <div className="font-medium">{dayInfo.fullDate}</div>
          <div className="text-xs text-gray-300 mt-1">
            Draft - No content yet
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}

      {/* Simple tooltip for published days */}
      {isHovered && !isDraft && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded text-sm whitespace-nowrap z-20 shadow-lg max-w-xs">
          <div className="font-medium">{dayInfo.fullDate}</div>
          {hasLocation && (
            <div className="text-xs text-gray-300 mt-1">
              {dayInfo.frontmatter.location}
            </div>
          )}
          {isWork && (
            <div className="text-xs text-blue-300 mt-1">
              Work day
            </div>
          )}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default DaySquare;