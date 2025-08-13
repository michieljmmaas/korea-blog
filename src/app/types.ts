// types.ts
export interface TripDay {
  day: number;
  date: Date;
  formattedDate: string;
  fullDate: string;
  frontmatter: BlogPostFrontmatter;
  content: string;
  fileName: string;
}

export interface GridSettings {
  totalDays: number;
  startDate: Date;
}

export interface BlogPostFrontmatter {
  title: string;
  date: string;
  day: number;
  dayOfWeek: string;
  location: string;
  photos: number[];
  tags: string[];
  draft: boolean;
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
  stats: {
    kimbap: number;
    commits: number;
    cultural: number;
    steps: number;
  }
  work: boolean;
}


export interface WeekData {
  index: number;
  title: string;
  publishdate: string;
  photos: number[];
  tags: string[];
  draft: boolean;
  days: string[];
  content: string;
  slug: string; // week-0, week-1, etc.
}

export interface PostLinkInfo {
  slug: string; 
  title: string;
}