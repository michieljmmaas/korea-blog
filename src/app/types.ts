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
  squareSize: 'small';
  totalDays: number;
  startDate: Date;
}

export interface BlogPostFrontmatter {
  title: string;
  date: string;
  day: number;
  dayOfWeek: string;
  location: string;
  photos: string[];
  tags: string[];
  draft: boolean;
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
  work: boolean;
}