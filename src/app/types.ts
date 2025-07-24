// types.ts
export interface TripDay {
  day: number;
  date: Date;
  formattedDate: string;
  fullDate: string;
}

export interface GridSettings {
  squareSize: 'small';
  totalDays: number;
  startDate: Date;
}