import { TripDay } from '../../types';
import { DaySearchHit } from '@/lib/daySearch';
import DaySquare from './day-square';
import WeekdayHeaders from './weekday-headers';
import { motion, AnimatePresence } from 'motion/react';

interface GridDay {
  day: TripDay;
  passes: boolean;
  hit?: DaySearchHit;
}

interface TripGridProps {
  days: GridDay[];
  isOrderedMode: boolean;
}

type CellData =
  | { kind: 'empty'; key: string }
  | { kind: 'day'; key: string; day: TripDay; isDimmed: boolean; hit?: DaySearchHit };

function buildDefaultModeCells(days: GridDay[]): CellData[] {
  const THURSDAY_OFFSET = 3;
  const leadingBlanks: CellData[] = Array.from(
    { length: THURSDAY_OFFSET },
    (_, i) => ({ kind: 'empty' as const, key: `empty-${i}` })
  );
  const dayCells: CellData[] = days.map(({ day, passes, hit }) => ({
    kind: 'day' as const,
    key: day.frontmatter.date,
    day,
    isDimmed: !passes,
    hit,
  }));
  return [...leadingBlanks, ...dayCells];
}

function buildOrderedModeCells(days: GridDay[]): CellData[] {
  return days.map(({ day, hit }) => ({
    kind: 'day' as const,
    key: day.frontmatter.date,
    day,
    isDimmed: false,
    hit,
  }));
}

function EmptyCell() {
  return <div className="w-full h-20 bg-gray-100 rounded-sm border border-gray-200" />;
}

const TripGrid: React.FC<TripGridProps> = ({ days, isOrderedMode }) => {
  let cells: CellData[];

  if (isOrderedMode) {
    cells = buildOrderedModeCells(days.filter((d) => d.passes));
  } else {
    cells = buildDefaultModeCells(days);
  }

  return (
    <div>
      {!isOrderedMode && <WeekdayHeaders />}

      <div className="bg-white border border-border rounded-lg p-2">
        <div className="grid grid-cols-7 gap-1">
          <AnimatePresence mode="popLayout" initial={false}>
            {cells.map((cell) => (
              <motion.div
                key={cell.key}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{
                  opacity: cell.kind === 'day' && cell.isDimmed ? 0.6 : 1,
                  scale: 1,
                }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.7 }}
              >
                {cell.kind === 'empty' ? (
                  <EmptyCell />
                ) : (
                  <DaySquare
                    dayInfo={cell.day.frontmatter}
                    isEmpty={false}
                    thumbnailSrc={`/thumbnails/days/${cell.day.frontmatter.date}.webp`}
                    isDimmed={cell.isDimmed}
                    searchHit={cell.hit}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TripGrid;
