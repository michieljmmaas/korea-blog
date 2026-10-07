import { useRef, useState } from 'react';
import Link from 'next/link';
import { DayFrontmatter } from '../../types';
import { DaySearchHit } from '@/lib/daySearch';
import DayHoverCard from './day-hover-card';
import { getLocationColor } from '../../../../utils/locationColors';
import { CameraOff } from 'lucide-react';
import Image from '../common/app-image';
import workIcon from "../../../../public/assets/blog/svg-icons/work.svg";
import musicIcon from "../../../../public/assets/blog/svg-icons/music.svg";

interface DaySquareProps {
  dayInfo?: DayFrontmatter;
  isEmpty?: boolean;
  thumbnailSrc?: string;
  isDimmed?: boolean;
  searchHit?: DaySearchHit;
}

// Icon configuration type
interface IconConfig {
  src: string;
  alt: string;
  title: string;
  size?: number; // Size in pixels, defaults to 16
}

const DaySquare: React.FC<DaySquareProps> = ({ dayInfo, thumbnailSrc, isEmpty = false, isDimmed = false, searchHit }) => {
  const [isHovered, setIsHovered] = useState(false);
  const squareRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (isEmpty) {
    return (
      <div className={`w-full h-20 text-base bg-gray-100 rounded-sm border border-gray-200`}>
      </div>
    );
  }

  if (!dayInfo) return null;

  const isDraft = dayInfo.draft;

  // Get the appropriate color based on location
  const locationColor = getLocationColor(dayInfo.location);

  // Function to determine which icons to show based on dayInfo
  const getIcons = (dayInfo: DayFrontmatter): IconConfig[] => {
    const icons: IconConfig[] = [];

    // Add work icon if it's a work day
    if (dayInfo.work) {
      icons.push({
        src: workIcon,
        alt: "Work day",
        title: "Work day",
        size: 16
      });
    }

    if (dayInfo.icon === "music") {
      icons.push({
        src: musicIcon,
        alt: "Kpop",
        title: "Kpop",
        size: 16
      });
    }

    return icons;
  };

  const icons = getIcons(dayInfo);

  const renderIcons = () => {
    if (icons.length === 0) return null;

    const iconClasses = `flex-shrink-0 ${!isDraft ? 'opacity-100 brightness-0' : 'opacity-50'}`;

    return (
      <div className="absolute top-1 right-1 flex items-center space-x-1 z-10">
        {icons.map((icon, index) => (
          <Image
            key={index}
            src={icon.src}
            alt={icon.alt}
            title={icon.title}
            width={icon.size || 16}
            height={icon.size || 16}
            className={iconClasses}
            style={{
              width: `${icon.size || 16}px`,
              height: `${icon.size || 16}px`,
            }}
          />
        ))}
      </div>
    );
  };

  const hasImage = !isDraft && thumbnailSrc;

  const renderImage = () => {
    if (!hasImage) return null;

    return (
      <div className="relative w-full h-full">
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-t-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />
          </div>
        )}

        {/* Actual image */}
        <Image
          src={thumbnailSrc}
          width={400}
          height={400}
          alt={`Day ${dayInfo.day} - ${dayInfo.location || 'Travel day'}`}
          className={`w-full h-full object-cover rounded-sm transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
      </div>
    );
  };

  return (
    <div className="relative" ref={squareRef}>
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
        ${isDraft ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isDimmed ? 'opacity-50 grayscale' : isDraft ? '' : 'transition-all duration-200 hover:shadow-md hover:scale-102 hover:-translate-y-1'}
      `}>

          {/* Main content area with relative positioning for overlay icons */}
          <div className="relative" style={{ height: 'calc(100% - 20px)' }}>
            {hasImage ? (
              <>
                {/* Image area */}
                <div className="h-full rounded-t-sm overflow-hidden">
                  {renderImage()}
                </div>
              </>
            ) : (
              <>
                {/* Placeholder area with icon */}
                <div className="h-full bg-gray-200 rounded-t-sm flex items-center justify-center">
                  <CameraOff fill="black" />
                </div>
              </>
            )}
            {renderIcons()}
          </div>

          {/* Bottom banner with day number only */}
          <div className={`${locationColor} text-white text-left mx-px mb-px px-1`} style={{ height: '20px', display: 'flex', alignItems: 'center' }}>
            <span className="text-xs font-medium">
              {dayInfo.day}
            </span>
          </div>
        </div>
      </Link>

      {isHovered && !isDimmed && (
        <DayHoverCard frontmatter={dayInfo} anchorRef={squareRef} searchHit={searchHit} />
      )}
    </div>
  );
};

export default DaySquare;