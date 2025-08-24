import { useState } from 'react';
import Link from 'next/link';
import { BlogPostFrontmatter } from '../../types';
import { getLocationColor } from '../../../../utils/locationColors';
import { CameraOff } from 'lucide-react';
import Image from 'next/image';
import workIcon from "../../../../public/assets/blog/svg-icons/work.svg";
import musicIcon from "../../../../public/assets/blog/svg-icons/music.svg";

interface DaySquareProps {
  dayInfo?: BlogPostFrontmatter;
  isEmpty?: boolean;
  thumbnailSrc?: string;
}

// Icon configuration type
interface IconConfig {
  src: string;
  alt: string;
  title: string;
  size?: number; // Size in pixels, defaults to 16
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
  const dateString = dayInfo.date;

  // Get the appropriate color based on location
  const locationColor = getLocationColor(dayInfo.location);

  // Function to determine which icons to show based on dayInfo
  const getIcons = (dayInfo: BlogPostFrontmatter): IconConfig[] => {
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

    // Add more icons based on other properties
    // Example: if (dayInfo.hasVideo) icons.push({ src: videoIcon, alt: "Video", title: "Has video content" });
    // Example: if (dayInfo.isSpecial) icons.push({ src: specialIcon, alt: "Special", title: "Special day" });

    return icons;
  };

  const icons = getIcons(dayInfo);

  const publishedToolTip = (
    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded text-sm whitespace-nowrap z-20 shadow-lg max-w-xs">
      <div className="font-medium">{dateString}</div>

      <div className="text-m text-gray-300 mt-1">
        {dayInfo.description}
      </div>
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

            {/* Icons overlay - positioned in top right */}
            {icons.length > 0 && (
              <div className="absolute top-1 right-1 flex items-center space-x-1">
                {icons.map((icon, index) => (
                  <Image
                    key={index}
                    src={icon.src}
                    alt={icon.alt}
                    title={icon.title}
                    width={icon.size || 16}
                    height={icon.size || 16}
                    className="flex-shrink-0 opacity-50"
                    style={{
                      width: `${icon.size || 16}px`,
                      height: `${icon.size || 16}px`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bottom banner with day number only */}
          <div className={`${locationColor} text-white text-left mx-px mb-px px-1`} style={{ height: '20px', display: 'flex', alignItems: 'center' }}>
            <span className="text-xs font-medium">
              {dayInfo.day}
            </span>
          </div>
        </div>
      </Link>

      {isHovered && publishedToolTip}
    </div>
  );
};

export default DaySquare;