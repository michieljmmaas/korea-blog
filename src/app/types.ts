// types.ts
export interface TripDay {
  day: number;
  date: Date;
  formattedDate: string;
  fullDate: string;
  frontmatter: DayFrontmatter;
  content: string;
  fileName: string;
}

export interface DayFrontmatter {
  title: string;
  date: string;
  day: number;
  icon: string;
  dayOfWeek: string;
  location: CityLocation;
  photos: string[];
  tags: string[];
  description: string;
  draft: boolean;
  thumbnail: string;
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
  stats: {
    kimbap: number;
    commits: number;
    cultural: number;
    worked: number;
    steps: number;
  }
  work: boolean;
}


export interface WeekData {
  index: number;
  title: string;
  thumb: string;
  publishdate: string;
  photos: string[];
  tags: string[];
  location: CityLocation;
  draft: boolean;
  days: string[];
  content: string;
  slug: string;
  icons: string[];
}

export interface PostLinkInfo {
  slug: string; 
  title: string;
}

export interface WeekLinkInfo {
  week: number; 
  slug: string, 
  isDraft: boolean;
}

export type CityLocation = 'Netherlands' | 'Seoul' | 'Busan' | 'Tokyo' | 'Hong Kong' | 'Taiwan' | 'Macau';

export interface BlogPostFrontmatter {
  slug: string;
  title: string;
  description: string;
  publishdate: string;
  draft: boolean;
  tags: string[];
  photos: string[];
  thumb: string;
}

export interface BlogPost {
  frontmatter: BlogPostFrontmatter;
  content: string;
  fileName: string;
  slug: string;
}

export interface Food {
  name: string;
  tried: boolean;
  description: string;
  rating: number;
  image: string;
  location: string;
}