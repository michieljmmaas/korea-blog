import { useState } from 'react';
import Link from 'next/link';
import { Camera, MapPin, Sun, Cloud, CloudRain } from 'lucide-react';
import { TripDay } from '../types';

interface DaySquareProps {
  dayInfo?: TripDay;
  isEmpty?: boolean;
  size: 'small' | 'medium' | 'large';
}

const sizeClasses = {
  small: 'w-16 h-16 text-sm',
  medium: 'w-20 h-20 text-base',
  large: 'w-24 h-24 text-lg'
};

const getWeatherIcon = (weather: string) => {
  const weatherLower = weather.toLowerCase();
  if (weatherLower.includes('sun') || weatherLower.includes('clear')) {
    return <Sun className="w-3 h-3" />;
  }
  if (weatherLower.includes('rain') || weatherLower.includes('storm')) {
    return <CloudRain className="w-3 h-3" />;
  }
  if (weatherLower.includes('cloud') || weatherLower.includes('overcast')) {
    return <Cloud className="w-3 h-3" />;
  }
  return null;
};

const DaySquare: React.FC<DaySquareProps> = ({ dayInfo, isEmpty = false, size }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (isEmpty) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 rounded-lg border-2 border-dashed border-gray-300`}>
      </div>
    );
  }

  if (!dayInfo) return null;

  const hasLocation = dayInfo.frontmatter.location && dayInfo.frontmatter.location.trim() !== '';
  const hasWeather = dayInfo.frontmatter.weather && dayInfo.frontmatter.weather.trim() !== '';
  const hasPhotos = dayInfo.frontmatter.photos && dayInfo.frontmatter.photos.length > 0;
  const isFeatured = dayInfo.frontmatter.featured;
  const isDraft = dayInfo.frontmatter.draft;

  return (
    <div className="relative">
      <Link
        href={`/day/${dayInfo.day}`}
        className="group relative block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`${sizeClasses[size]} ${
          isDraft 
            ? 'bg-gradient-to-br from-gray-400 to-gray-500' 
            : isFeatured 
              ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
        } rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer flex flex-col items-center justify-center text-white relative overflow-hidden`}>
          
          {/* Background pattern */}
          <div className="absolute inset-0 bg-white bg-opacity-10 transform rotate-45 scale-150 group-hover:rotate-90 transition-transform duration-500"></div>
          
          {/* Day number */}
          <div className="relative z-10 font-bold mb-1">
            {dayInfo.day}
          </div>
          
          {/* Date - only show on medium/large sizes */}
          {size !== 'small' && (
            <div className="relative z-10 text-xs opacity-90">
              {dayInfo.formattedDate}
            </div>
          )}
          
          {/* Status indicators */}
          <div className="absolute top-1 left-1 flex flex-col space-y-1 z-10">
            {hasLocation && <MapPin className="w-3 h-3 opacity-70" />}
            {hasWeather && (
              <div className="opacity-70">
                {getWeatherIcon(dayInfo.frontmatter.weather)}
              </div>
            )}
          </div>
          
          {/* Photo indicator */}
          {hasPhotos && (
            <Camera className="absolute bottom-1 right-1 w-3 h-3 opacity-60" />
          )}
          
          {/* Draft indicator */}
          {isDraft && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full opacity-80"></div>
          )}
          
          {/* Featured star */}
          {isFeatured && !isDraft && (
            <div className="absolute top-1 right-1 text-yellow-300 opacity-80">
              ⭐
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg"></div>
        </div>
        
        {/* Enhanced Tooltip */}
        {isHovered && (
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded text-sm whitespace-nowrap z-20 shadow-lg max-w-xs">
            <div className="font-semibold">{dayInfo.fullDate}</div>
            {hasLocation && (
              <div className="text-xs opacity-90">📍 {dayInfo.frontmatter.location}</div>
            )}
            {hasWeather && (
              <div className="text-xs opacity-90">🌤️ {dayInfo.frontmatter.weather}</div>
            )}
            {dayInfo.frontmatter.highlights.length > 0 && (
              <div className="text-xs opacity-90">✨ {dayInfo.frontmatter.highlights.length} highlights</div>
            )}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </Link>
    </div>
  );
};

export default DaySquare;