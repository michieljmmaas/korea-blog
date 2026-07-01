'use client';

import { useMemo, useState } from 'react';
import { TripDay, CityLocation } from '../../types';
import TripGrid from './trip-grid';
import { TripGridControlBar, SortMetric, SortDirection, ALL_LOCATIONS } from './trip-grid-control-bar';

interface ClientGridProps {
  days: TripDay[];
}

type SortMetricType = Exclude<SortMetric, null>;

function matchesSearch(day: TripDay, query: string): boolean {
  if (!query) return true;
  return day.frontmatter.description?.toLowerCase().includes(query.toLowerCase()) ?? false;
}

function passesFilters(
  day: TripDay,
  tags: Set<string>,
  locations: Set<CityLocation>,
  icons: Set<string>
): boolean {
  const fm = day.frontmatter;
  const passesTags = tags.size === 0 || fm.tags?.some((t) => tags.has(t));
  const passesLocation = locations.has(fm.location);
  const passesIcons =
    icons.size === 0 ||
    [...icons].some((i) => (i === 'work' ? fm.work : fm.icon === 'music'));
  // Combine filters with AND across categories, OR within each category
  return passesTags && passesLocation && passesIcons;
}

function getMetricValue(day: TripDay, metric: SortMetricType): number {
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
  }
}

function compareByMetric(metric: SortMetricType, direction: SortDirection) {
  return (a: TripDay, b: TripDay) => {
    const diff = getMetricValue(a, metric) - getMetricValue(b, metric);
    const primary = direction === 'desc' ? -diff : diff;
    return primary !== 0 ? primary : a.day - b.day;
  };
}

export default function ClientGrid({ days }: ClientGridProps) {
  // Convert string dates back to Date objects for client-side use
  const processedDays = days.map((day) => ({
    ...day,
    date: new Date(day.date as any),
  }));

  // Filter/sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [activeLocations, setActiveLocations] = useState<Set<CityLocation>>(
    new Set(ALL_LOCATIONS)
  );
  const [activeIcons, setActiveIcons] = useState<Set<'work' | 'music'>>(new Set());
  const [sortMetric, setSortMetric] = useState<SortMetric>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Derive all tags from the days
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    processedDays.forEach((day) => day.frontmatter.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [processedDays]);

  // Main filtering and sorting pipeline
  const { visibleDays, isOrderedMode } = useMemo(() => {
    const isOrdered = sortMetric !== null;
    const withPassFlag = processedDays.map((d) => ({
      day: d,
      passes:
        matchesSearch(d, searchQuery) &&
        passesFilters(d, activeTags, activeLocations, activeIcons),
    }));

    if (!isOrdered) {
      // Default mode: keep all days, mark non-matching as filtered
      return { visibleDays: withPassFlag, isOrderedMode: false };
    }

    // Ordered mode: filter out non-matching, then sort
    const filtered = withPassFlag.filter((x) => x.passes).map((x) => x.day);
    const sorted = [...filtered].sort(compareByMetric(sortMetric, sortDirection));
    return {
      visibleDays: sorted.map((day) => ({ day, passes: true })),
      isOrderedMode: true,
    };
  }, [processedDays, searchQuery, activeTags, activeLocations, activeIcons, sortMetric, sortDirection]);

  function handleLocationToggle(location: CityLocation) {
    setActiveLocations((prev) => {
      const next = new Set(prev);
      next.has(location) ? next.delete(location) : next.add(location);
      return next;
    });
  }

  function handleTagToggle(tag: string) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  }

  function handleIconToggle(icon: 'work' | 'music') {
    setActiveIcons((prev) => {
      const next = new Set(prev);
      next.has(icon) ? next.delete(icon) : next.add(icon);
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
        allTags={allTags}
        activeTags={activeTags}
        onTagToggle={handleTagToggle}
        activeLocations={activeLocations}
        onLocationToggle={handleLocationToggle}
        activeIcons={activeIcons}
        onIconToggle={handleIconToggle}
        sortMetric={sortMetric}
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
