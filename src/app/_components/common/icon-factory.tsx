import Image from 'next/image';

// Base icon paths (location-independent)
const BASE_ICON_PATHS: Record<string, string> = {
  work: 'work.svg',
  music: 'music.svg',
  steps: 'steps.svg',
};

// Location-specific icon paths
const LOCATION_SPECIFIC_ICONS: Record<string, Record<string, string>> = {
  kimbap: {
    Seoul: 'kimbap.svg',
    Busan: 'kimbap.svg',
    Tokyo: 'sushi.svg',
    'Hong Kong': 'dimsum.svg',
    Taiwan: 'xiaolongbao.svg',
  },
  cultural: {
    Seoul: 'cultural.svg',
    Busan: 'cultural-korea.svg',
    Tokyo: 'cultural-japan.svg',
    'Hong Kong': 'cultural-hongkong.svg',
    Taiwan: 'cultural-taiwan.svg',
  },
};

// Default title maps - "info" mode (general description)
const TITLE_INFO_MAP: Record<string, string> = {
  work: 'Work',
  music: 'Music',
  cultural: 'Cultural Activity',
  kimbap: 'Food',
  steps: 'Walking',
};

// Default title maps - "stat" mode (measurable activity)
const TITLE_STAT_MAP: Record<string, string> = {
  work: 'Hours worked',
  music: 'Songs listened',
  cultural: 'Cultural sites visited',
  kimbap: 'Meals eaten',
  steps: 'Steps taken',
};

// Location-specific title overrides
const LOCATION_SPECIFIC_TITLES: Record<string, Record<string, { info: string; stat: string }>> = {
  kimbap: {
    Tokyo: {
      info: 'Sushi',
      stat: 'Sushi eaten',
    },
    'Hong Kong': {
      info: 'Dim Sum',
      stat: 'Dim sum eaten',
    },
    Taiwan: {
      info: 'Xiaolongbao',
      stat: 'Xiaolongbao eaten',
    },
  },
  // Add more location-specific overrides as needed
};

// Define preset sizes
const ICON_SIZES = {
  xs: { width: 16, height: 16, className: 'w-4 h-4' },
  sm: { width: 24, height: 24, className: 'w-6 h-6' },
  md: { width: 32, height: 32, className: 'w-8 h-8' },
  lg: { width: 40, height: 40, className: 'w-10 h-10' },
  xl: { width: 48, height: 48, className: 'w-12 h-12' },
} as const;

type IconSize = keyof typeof ICON_SIZES;
type BaseIconName = keyof typeof BASE_ICON_PATHS;
type LocationSpecificIconName = keyof typeof LOCATION_SPECIFIC_ICONS;
type IconName = BaseIconName | LocationSpecificIconName;
type TitleMode = 'info' | 'stat';
type Location = 'Seoul' | 'Busan' | 'Tokyo' | 'Hong Kong' | 'Taiwan';

interface IconFactoryProps {
  name: IconName;
  size?: IconSize;
  location?: Location;
  titleMode?: TitleMode;
  alt?: string;
  title?: string; // Custom title override
  className?: string;
  customWidth?: number;
  customHeight?: number;
}

export default function IconFactory({
  name,
  size = 'md',
  location,
  titleMode = 'info',
  alt,
  title,
  className,
  customWidth,
  customHeight,
}: IconFactoryProps) {
  // Get the appropriate icon path
  const getIconPath = (): string | null => {
    // Check if it's a location-specific icon and location is provided
    if (location && LOCATION_SPECIFIC_ICONS[name]) {
      const locationPath = LOCATION_SPECIFIC_ICONS[name][location];
      if (locationPath) return locationPath;
    }
    
    // Fall back to base icon
    if (BASE_ICON_PATHS[name]) {
      return BASE_ICON_PATHS[name];
    }
    
    return null;
  };

  // Get the appropriate title
  const getTitle = (): string => {
    // If custom title is provided, use it
    if (title) return title;

    // Check for location-specific title override
    if (location && LOCATION_SPECIFIC_TITLES[name]?.[location]) {
      const locationTitle = LOCATION_SPECIFIC_TITLES[name][location];
      return titleMode === 'stat' ? locationTitle.stat : locationTitle.info;
    }

    // Use default title based on mode
    const titleMap = titleMode === 'stat' ? TITLE_STAT_MAP : TITLE_INFO_MAP;
    return titleMap[name] || name;
  };

  const iconImage = getIconPath();
  const pathPrefix = "assets/blog/svg-icons/";
  const iconPath = pathPrefix + iconImage;
  
  // Check if icon exists
  if (!iconPath) {
    console.warn(`Icon "${name}" not found for location "${location}"`);
    return null;
  }

  // Use custom dimensions if provided, otherwise use preset size
  const dimensions = customWidth && customHeight 
    ? { width: customWidth, height: customHeight }
    : ICON_SIZES[size];

  // Get the base className (only exists for preset sizes)
  const baseClassName = 'className' in dimensions ? dimensions.className : '';
  
  // Combine size className with any custom className
  const finalClassName = className 
    ? `${baseClassName} ${className}` 
    : `${baseClassName} object-contain`;

  const finalTitle = getTitle();

  return (
    <Image
      src={iconPath}
      alt={alt || finalTitle}
      title={finalTitle}
      width={dimensions.width}
      height={dimensions.height}
      className={finalClassName}
    />
  );
}

// Export types and constants for use elsewhere
export type { IconName, IconSize, TitleMode, Location };
export { BASE_ICON_PATHS, LOCATION_SPECIFIC_ICONS, TITLE_INFO_MAP, TITLE_STAT_MAP };