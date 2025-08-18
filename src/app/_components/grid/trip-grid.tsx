// components/TripGrid.tsx
import { TripDay } from '../../types';
import DaySquare from './day-square';
import WeekdayHeaders from './weekday-headers';

interface TripGridProps {
  days: TripDay[];
}

const TripGrid: React.FC<TripGridProps> = ({ days }) => {
  // Create grid starting from Monday, with Thursday as first trip day
  const createWeekGrid = () => {
    const grid: (TripDay | null)[][] = [];
    let currentWeek: (TripDay | null)[] = [];
    
    // Thursday is day 3 (0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday)
    const startDayOfWeek = 3;
    
    // Fill empty days at the beginning of first week (Mon, Tue, Wed)
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }
    
    // Add all trip days
    days.forEach((day) => {
      currentWeek.push(day);
      
      // If week is complete (7 days), start new week
      if (currentWeek.length === 7) {
        grid.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    // Fill remaining empty days in last week if needed
    while (currentWeek.length > 0 && currentWeek.length < 7) {
      currentWeek.push(null);
    }
    
    if (currentWeek.length > 0) {
      grid.push(currentWeek);
    }
    
    return grid;
  };

  const weekGrid = createWeekGrid();

  return (
    <div className="bg-white rounded-xl shadow-lg p-2">
      <WeekdayHeaders />
      
      <div className="space-y-1">
        {weekGrid.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((dayInfo, dayIndex) => (
              <DaySquare
                key={`${weekIndex}-${dayIndex}`}
                dayInfo={dayInfo?.frontmatter || undefined}
                isEmpty={!dayInfo}
                thumbnailSrc={`/thumbnails/${dayInfo?.frontmatter.date}.webp`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripGrid;