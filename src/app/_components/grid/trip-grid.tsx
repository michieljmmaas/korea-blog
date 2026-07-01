import { TripDay } from '../../types';
import DaySquare from './day-square';
import WeekdayHeaders from './weekday-headers';
import { motion, AnimatePresence } from 'motion/react';

interface TripGridProps {
  days: { day: TripDay; passes: boolean }[];
  isOrderedMode: boolean;
}

type CellData =
  | { kind: 'empty'; key: string }
  | { kind: 'day'; key: string; day: TripDay; isDimmed: boolean };

function buildDefaultModeCells(days: { day: TripDay; passes: boolean }[]): CellData[] {
  const THURSDAY_OFFSET = 3;
  const leadingBlanks: CellData[] = Array.from(
    { length: THURSDAY_OFFSET },
    (_, i) => ({ kind: 'empty' as const, key: `empty-${i}` })
  );
  const dayCells: CellData[] = days.map(({ day, passes }) => ({
    kind: 'day' as const,
    key: day.frontmatter.date,
    day,
    isDimmed: !passes,
  }));
  return [...leadingBlanks, ...dayCells];
}

function buildOrderedModeCells(days: TripDay[]): CellData[] {
  return days.map((day) => ({
    kind: 'day' as const,
    key: day.frontmatter.date,
    day,
    isDimmed: false,
  }));
}

function EmptyCell() {
  return <div className="w-full h-20 bg-gray-100 rounded-sm border border-gray-200" />;
}

const TripGrid: React.FC<TripGridProps> = ({ days, isOrderedMode }) => {
  let cells: CellData[];

  if (isOrderedMode) {
    const orderedDays = days.filter((d) => d.passes).map((d) => d.day);
    cells = buildOrderedModeCells(orderedDays);
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
