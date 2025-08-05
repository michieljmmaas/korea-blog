import { useState } from 'react';
import Link from 'next/link';
import { TripDay } from '../types';
import { getLocationColor } from '../../../utils/locationColors';
import { ImageKitProvider, Image } from '@imagekit/next';

interface DaySquareProps {
  dayInfo?: TripDay;
  isEmpty?: boolean;
  size: 'small';
}

const sizeClasses = {
  small: 'w-full h-20 text-base',
};


const DaySquare: React.FC<DaySquareProps> = ({ dayInfo, isEmpty = false, size }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (isEmpty) {
    return (
      <div className={`w-full h-20 text-base bg-gray-100 rounded-sm border border-gray-200`}>
      </div>
    );
  }

  if (!dayInfo) return null;

  const hasLocation = dayInfo.frontmatter.location && dayInfo.frontmatter.location.trim() !== '';
  const hasPhotos = dayInfo.frontmatter.photos && dayInfo.frontmatter.photos.length > 0;
  const isDraft = dayInfo.frontmatter.draft;
  // const isDraft = false;
  const isWork = dayInfo.frontmatter.work;

  const imageLocation = "/" + dayInfo.date.toISOString().split('T')[0] + "/thumb.heic";

  // Get the appropriate color based on location
  const locationColor = getLocationColor(dayInfo.frontmatter.location, isWork);


  const publishedToolTip = (
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
  );

  const draftTooltip = (
    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded text-sm whitespace-nowrap z-20 shadow-lg max-w-xs">
      <div className="font-medium">{dayInfo.fullDate}</div>
      <div className="text-xs text-gray-300 mt-1">
        Draft - No content yet
      </div>
      {/* Tooltip arrow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
    </div>
  );




  const hasImage = !isDraft;

  const renderImage = () => {
    if (!hasImage) return null;

    return (
      <ImageKitProvider urlEndpoint="https://ik.imagekit.io/yyahqsrfe">
        <Image
          src={imageLocation}
          width={400}
          height={400}
          alt={`Day ${dayInfo.day} - ${dayInfo.frontmatter.location || 'Travel day'}`}
          transformation={[{ named: 'travel_grid_thumb' }]}
          className="w-full h-full object-cover rounded-sm"
          loading="lazy"
        />
      </ImageKitProvider>
    );
  };

  return (
    <div className="relative">
      <Link
        href={isDraft ? '#' : `/day/${dayInfo.frontmatter.date}`}
        className="block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={isDraft ? (e) => e.preventDefault() : undefined}
        aria-disabled={isDraft}
      >
        <div className={`
        ${sizeClasses[size]} 
        ${locationColor} 
        rounded-sm 
        shadow-sm 
        relative 
        overflow-hidden
        transition-all 
        duration-200
        ${isDraft
            ? 'opacity-50 hover:opacity-60 cursor-not-allowed'
            : 'hover:shadow-md hover:scale-102 cursor-pointer'
          }
        hover:-translate-y-1
        ${hasImage ? 'p-1' : 'flex flex-col items-center justify-center'}
      `}>

          {hasImage ? (
            <>
              {/* Image with colored border */}
              <div className="w-full h-full relative rounded-sm overflow-hidden">
                {renderImage()}

                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                {/* Text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
                  <div className="font-bold text-lg drop-shadow-lg">
                    {dayInfo.day}
                  </div>
                  {size !== 'small' && (
                    <div className="text-xs opacity-90 mt-1 drop-shadow-md font-medium">
                      {dayInfo.formattedDate}
                    </div>
                  )}
                </div>

                {/* Featured star */}
                {dayInfo.frontmatter.featured && (
                  <div className="absolute top-2 right-2 text-yellow-300 text-sm z-20 drop-shadow-lg">
                    ★
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* No image - original solid color design */}
              <div className="font-semibold text-white">
                {dayInfo.day}
              </div>
              <div className="text-xs opacity-80 mt-1 text-white">
                {dayInfo.formattedDate}
              </div>
              {dayInfo.frontmatter.featured && (
                <div className="absolute top-1 right-1 text-yellow-200 text-xs">
                  ★
                </div>
              )}
            </>
          )}
        </div>
      </Link>

      {/* Conditional tooltips on hover only */}
      {isHovered && isDraft && draftTooltip}
      {isHovered && !isDraft && publishedToolTip}
    </div>
  );
};

export default DaySquare;