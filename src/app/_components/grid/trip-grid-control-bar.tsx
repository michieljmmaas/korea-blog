'use client'

import { cn } from '@/lib/utils';
import { CityLocation } from '@/app/types';
import { Tag, Search, X, ArrowUp, ArrowDown } from 'lucide-react';
import { getLocationColor } from '../../../../utils/locationColors';
import IconFactory from '../common/icon-factory';

export type SortMetric = 'kimbap' | 'worked' | 'cultural' | 'steps' | 'photos' | 'description' | 'score' | null;
export type SortDirection = 'asc' | 'desc';

export const ALL_LOCATIONS: CityLocation[] = [
  'Netherlands',
  'Macau',
  'Seoul',
  'Tokyo',
  'Taiwan',
  'Hong Kong',
];

export const ALL_TAGS: string[] = [
  'k-pop',
  'work',
  '30K-day',
  'Adventure',
  'MAP',
  'TWICE',
  'Social',
  'Travel',
  'MAMA',
  'SHORT',
];

const ACTIVE =
  'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white';
const INACTIVE =
  'bg-transparent text-neutral-400 border-neutral-200 hover:text-neutral-900 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-400 dark:hover:text-white opacity-60 hover:opacity-100';

interface ControlButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

function ControlButton({ active, onClick, children, className }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 border rounded-md text-xs font-mono uppercase tracking-wide transition-all',
        active ? ACTIVE : INACTIVE,
        className
      )}
    >
      {children}
    </button>
  );
}

interface TripGridControlBarProps {
  // search
  searchQuery: string;
  onSearchChange: (q: string) => void;
  // tags
  allTags: string[];
  tagFilters: Map<string, 'include' | 'exclude'>;
  onTagToggle: (tag: string) => void;
  // locations
  activeLocations: Set<CityLocation>;
  onLocationToggle: (loc: CityLocation) => void;
  // sort
  sortMetric: SortMetric;
  sortDirection: SortDirection;
  onSortMetricClick: (metric: Exclude<SortMetric, null>) => void;
  onClearSort: () => void;
}

export function TripGridControlBar({
  searchQuery,
  onSearchChange,
  allTags,
  tagFilters,
  onTagToggle,
  activeLocations,
  onLocationToggle,
  sortMetric,
  sortDirection,
  onSortMetricClick,
  onClearSort,
}: TripGridControlBarProps) {
  const SORT_OPTIONS = [
    { label: 'Score', value: 'score' as const },
    { label: 'Snacks', value: 'kimbap' as const },
    { label: 'Hours Worked', value: 'worked' as const },
    { label: 'Cultural Sights', value: 'cultural' as const },
    { label: 'Steps taken', value: 'steps' as const },
    { label: 'Photos', value: 'photos' as const },
    { label: 'Text length', value: 'description' as const },
  ];

  return (
    <div className="flex flex-col gap-2 mb-1 p-2 bg-card bg-white border border-border sticky top-0 z-10">
      {/* Locations + Icons row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Locations */}
        <div className="flex flex-wrap gap-2">
          {ALL_LOCATIONS.map((location) => {
            const isActive = activeLocations.has(location);
            return (
              <button
                key={location}
                onClick={() => onLocationToggle(location)}
                className={cn(
                  'flex items-center gap-2 px-2.5 py-1 border rounded-md text-xs font-sans uppercase tracking-wide transition-all',
                  isActive
                    ? 'border-neutral-200 text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800'
                    : 'border-neutral-200/50 text-neutral-400 opacity-40 hover:opacity-60 dark:border-neutral-700/50'
                )}
              >
                <div className={cn('w-2.5 h-2.5 shrink-0 rounded-sm', getLocationColor(location))} />
                {location}
              </button>
            );
          })}
        </div>

      </div>

      <div className="border-t border-border" />

      {/* Tags */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-neutral-400 shrink-0">
          <Tag className="w-3.5 h-3.5" />
          Tags
        </span>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const filterMode = tagFilters.get(tag);
            const isWorkTag = tag === 'work';
            const isKpopTag = tag === 'k-pop';
            const isInclude = filterMode === 'include';
            const isExclude = filterMode === 'exclude';

            return (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 border rounded-md text-xs font-mono uppercase tracking-wide transition-all',
                  isInclude
                    ? ACTIVE
                    : isExclude
                      ? 'text-neutral-600 border-neutral-300 dark:text-neutral-400 dark:border-neutral-700'
                      : INACTIVE
                )}
                style={isExclude ? {
                  backgroundImage: 'repeating-linear-gradient(45deg, #f5f5f5, #f5f5f5 10px, #e5e5e5 10px, #e5e5e5 20px)',
                  backgroundPosition: '0 0'
                } : undefined}
                title={isExclude ? 'Excluded (click to remove)' : isInclude ? 'Included (click to exclude)' : 'Unselected (click to include)'}
              >
                {isWorkTag && <IconFactory name="work" size="xs" titleMode="info" />}
                {isKpopTag && <IconFactory name="music" size="xs" titleMode="info" />}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Sort */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 shrink-0">
          Sort
        </span>
        <div className="flex items-center gap-1 flex-wrap">
          {SORT_OPTIONS.map((opt) => (
            <ControlButton
              key={opt.value}
              active={sortMetric === opt.value}
              onClick={() => onSortMetricClick(opt.value)}
            >
              {opt.label}
              {sortMetric === opt.value && (
                sortDirection === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />
              )}
            </ControlButton>
          ))}
        </div>
        {sortMetric && (
          <button
            onClick={onClearSort}
            className="ml-auto text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            title="Back to default view"
          >
            ✕ Default
          </button>
        )}
      </div>

      <div className="border-t border-border" />

      {/* Search */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search descriptions..."
          className={cn(
            'w-full pl-8 pr-8 py-1.5 text-xs font-mono uppercase tracking-wide',
            'bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-md',
            'text-neutral-900 dark:text-white placeholder:text-neutral-400 placeholder:normal-case placeholder:tracking-normal',
            'focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors'
          )}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
