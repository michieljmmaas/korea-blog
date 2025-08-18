import { useState } from 'react';
import Link from 'next/link';
import { BlogPostFrontmatter } from '../../types';
import { getLocationColor } from '../../../../utils/locationColors';
import { CameraOff } from 'lucide-react';
import Image from 'next/image';

interface DaySquareProps {
  dayInfo?: BlogPostFrontmatter;
  isEmpty?: boolean;
  thumbnailSrc?: string; // Add this prop
}

const DaySquare: React.FC<DaySquareProps> = ({ dayInfo, thumbnailSrc, isEmpty = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (isEmpty) {
    return (
      <div className={`w-full h-20 text-base bg-gray-100 rounded-sm border border-gray-200`}>
      </div>
    );
  }

  if (!dayInfo) return null;

  const isDraft = dayInfo.draft;
  const isWork = dayInfo.work;

  const dateString = dayInfo.date

  // Get the appropriate color based on location
  const locationColor = getLocationColor(dayInfo.location);


  const publishedToolTip = (
    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded text-sm whitespace-nowrap z-20 shadow-lg max-w-xs">
      <div className="font-medium">{dateString}</div>

      <div className="text-m text-gray-300 mt-1">
        {dayInfo.description}
      </div>
      {isWork && (
        <div className="text-xs text-blue-300 mt-1">
          Work day
        </div>
      )}
      {/* Tooltip arrow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
    </div>
  );

  const hasImage = !isDraft && thumbnailSrc;

  const renderImage = () => {
    if (!hasImage) return null;

    return (
      <Image
        src={thumbnailSrc}
        width={400}
        height={400}
        alt={`Day ${dayInfo.day} - ${dayInfo.location || 'Travel day'}`}
        className="w-full h-full object-cover rounded-sm"
        loading="lazy"
      />
    );
  };

  return (
    <div className="relative">
      <Link
        href={isDraft ? '#' : `/day/${dayInfo.date}`}
        className="block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={isDraft ? (e) => e.preventDefault() : undefined}
        aria-disabled={isDraft}
      >
        <div className={`
        w-full h-20
        ${locationColor}
        rounded-sm 
        shadow-sm 
        p-0.5
        flex 
        flex-col
        overflow-hidden
        ${isDraft
            ? 'opacity-50 hover:opacity-60 cursor-not-allowed'
            : 'transition-all duration-200 hover:shadow-md hover:scale-102 hover:-translate-y-1 cursor-pointer'
          }
      `}>

          {hasImage ? (
            <>
              {/* Image area */}
              <div className="flex-1 rounded-t-sm overflow-hidden">
                {renderImage()}
              </div>
            </>
          ) : (
            <>
              {/* Placeholder area with icon */}
              <div className="flex-1 bg-gray-200 rounded-t-sm flex items-center justify-center">
                <CameraOff fill="black" />
              </div>
            </>
          )}

          {/* Bottom banner with day info */}
          <div className={`${locationColor} text-white text-left m-px`}>
            <div className="text-sm">
              {dayInfo.day}
            </div>
          </div>
        </div>
      </Link>

      {isHovered && publishedToolTip}
    </div>
  );
};

export default DaySquare;