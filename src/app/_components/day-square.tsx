// components/DaySquare.tsx
import { useState } from 'react';
import Link from 'next/link';
import { Camera } from 'lucide-react';
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

const DaySquare: React.FC<DaySquareProps> = ({ dayInfo, isEmpty = false, size }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (isEmpty) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 rounded-lg border-2 border-dashed border-gray-300`}>
      </div>
    );
  }

  if (!dayInfo) return null;

  return (
    <div className="relative">
      <Link
        href={`/day/${dayInfo.day}`}
        className="group relative block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer flex flex-col items-center justify-center text-white relative overflow-hidden`}>
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
          
          {/* Camera icon */}
          <Camera className="absolute bottom-1 right-1 w-3 h-3 opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg"></div>
        </div>
        
        {/* Tooltip */}
        {isHovered && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded text-sm whitespace-nowrap z-20 shadow-lg">
            {dayInfo.fullDate}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </Link>
    </div>
  );
};

export default DaySquare;