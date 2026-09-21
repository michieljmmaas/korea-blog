'use client';

import { useMemo, useState } from 'react';
import { TripDay, CityLocation } from '../../types';
import { createDaySearch, DaySearchHit } from '@/lib/daySearch';
import TripGrid from './trip-grid';
import { TripGridControlBar, SortMetric, SortDirection, ALL_LOCATIONS, ALL_TAGS } from './trip-grid-control-bar';
import { useReduxMode } from '../providers/redux-mode-provider';

interface ClientGridProps {
  days: TripDay[];
}

type SortMetricType = Exclude<SortMetric, null>;

function passesFilters(
  day: TripDay,
  tagFilters: Map<string, 'include' | 'exclude'>,
  locations: Set<CityLocation>
): boolean {
  const fm = day.frontmatter;

  // Collect include and exclude tags (normalized to lowercase)
  const includeTags = Array.from(tagFilters.entries())
    .filter(([, mode]) => mode === 'include')
    .map(([tag]) => tag.toLowerCase());
  const excludeTags = Array.from(tagFilters.entries())
    .filter(([, mode]) => mode === 'exclude')
    .map(([tag]) => tag.toLowerCase());

  // Include filter: if any include tags, day must have at least one (case-insensitive)
  const passesInclude = includeTags.length === 0 || fm.tags?.some((t) => includeTags.includes(t.toLowerCase()));

  // Exclude filter: day must not have any exclude tags (case-insensitive)
  const passesExclude = excludeTags.length === 0 || !fm.tags?.some((t) => excludeTags.includes(t.toLowerCase()));

  const passesLocation = locations.has(fm.location);

  return passesInclude && passesExclude && passesLocation;
}

function getMetricValue(day: TripDay, metric: SortMetricType, hits: Map<string, DaySearchHit>): number {
  switch (metric) {
    case 'kimbap':
    case 'worked':
    case 'cultural':
    case 'steps':
      return day.frontmatter.stats[metric];
    case 'photos':
      return day.frontmatter.photos?.length ?? 0;
    case 'description':
      return day.frontmatter.description?.length ?? 0;
    case 'score':
      return day.frontmatter.score ?? 0;
    case 'relevance':
      return hits.get(day.frontmatter.date)?.score ?? 0;
  }
}

function compareByMetric(metric: SortMetricType, direction: SortDirection, hits: Map<string, DaySearchHit>) {
  return (a: TripDay, b: TripDay) => {
    const diff = getMetricValue(a, metric, hits) - getMetricValue(b, metric, hits);
    const primary = direction === 'desc' ? -diff : diff;
    return primary !== 0 ? primary : a.day - b.day;
  };
}

export default function ClientGrid({ days }: ClientGridProps) {
  const { hasNotHappenedYet } = useReduxMode();

  // Convert string dates back to Date objects for client-side use
  const processedDays = useMemo(
    () => days.map((day) => ({ ...day, date: new Date(day.date as any) })),
    [days]
  );

  // Filter/sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilters, setTagFilters] = useState<Map<string, 'include' | 'exclude'>>(new Map());
  const [activeLocations, setActiveLocations] = useState<Set<CityLocation>>(
    new Set(ALL_LOCATIONS)
  );
  const [sortMetric, setSortMetric] = useState<SortMetric>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Derive additional tags from the days (those not in ALL_TAGS, case-insensitive)
  const allTagsWithExtra = useMemo(() => {
    const allTagsSetLower = new Set(ALL_TAGS.map((t) => t.toLowerCase()));
    const extraTags = new Set<string>();
    processedDays.forEach((day) => {
      day.frontmatter.tags?.forEach((tag) => {
        if (!allTagsSetLower.has(tag.toLowerCase())) {
          extraTags.add(tag);
        }
      });
    });
    return [...ALL_TAGS, ...Array.from(extraTags).sort()];
  }, [processedDays]);

  // Full-text index over titles, descriptions, locations, tags and post bodies
  const daySearch = useMemo(() => createDaySearch(processedDays), [processedDays]);
  const hasQuery = searchQuery.trim() !== '';
  const searchHits = useMemo(() => daySearch.search(searchQuery), [daySearch, searchQuery]);

  // "Relevance" only exists while there's a query; without one, fall back to the default view
  const effectiveSortMetric = sortMetric === 'relevance' && !hasQuery ? null : sortMetric;

  // Main filtering and sorting pipeline
  const { visibleDays, isOrderedMode } = useMemo(() => {
    const isOrdered = effectiveSortMetric !== null;
    const withPassFlag = processedDays.map((d) => ({
      day: d,
      hit: searchHits.get(d.frontmatter.date),
      passes:
        (!hasQuery || searchHits.has(d.frontmatter.date)) &&
        passesFilters(d, tagFilters, activeLocations) &&
        !hasNotHappenedYet(d.frontmatter.date),
    }));

    if (!isOrdered) {
      // Default mode: keep all days, mark non-matching (including "hasn't happened yet") as dimmed
      return { visibleDays: withPassFlag, isOrderedMode: false };
    }

    // Ordered mode: filter out non-matching, then sort
    const compare = compareByMetric(effectiveSortMetric, sortDirection, searchHits);
    const sorted = withPassFlag.filter((x) => x.passes).sort((a, b) => compare(a.day, b.day));
    return { visibleDays: sorted, isOrderedMode: true };
  }, [processedDays, searchHits, hasQuery, tagFilters, activeLocations, effectiveSortMetric, sortDirection, hasNotHappenedYet]);

  function handleLocationToggle(location: CityLocation) {
    setActiveLocations((prev) => {
      const next = new Set(prev);
      next.has(location) ? next.delete(location) : next.add(location);
      return next;
    });
  }

  function handleTagToggle(tag: string) {
    setTagFilters((prev) => {
      const next = new Map(prev);
      const current = next.get(tag);
      if (current === 'include') {
        next.set(tag, 'exclude');
      } else if (current === 'exclude') {
        next.delete(tag);
      } else {
        next.set(tag, 'include');
      }
      return next;
    });
  }

  function handleSortMetricClick(metric: Exclude<SortMetric, null>) {
    if (sortMetric === metric) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortMetric(metric);
      setSortDirection('desc');
    }
  }

  function handleClearSort() {
    setSortMetric(null);
    setSortDirection('desc');
  }

  return (
    <div className="max-w-6xl mx-auto">
      <TripGridControlBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        allTags={allTagsWithExtra}
        tagFilters={tagFilters}
        onTagToggle={handleTagToggle}
        activeLocations={activeLocations}
        onLocationToggle={handleLocationToggle}
        sortMetric={effectiveSortMetric}
        sortDirection={sortDirection}
        onSortMetricClick={handleSortMetricClick}
        onClearSort={handleClearSort}
      />

      <TripGrid days={visibleDays} isOrderedMode={isOrderedMode} />

      {isOrderedMode && visibleDays.length === 0 && (
        <div className="text-center text-neutral-400 text-sm py-16">
          {activeLocations.size === 0
            ? 'No locations selected'
            : 'No days match your filters.'}
        </div>
      )}
    </div>
  );
}
