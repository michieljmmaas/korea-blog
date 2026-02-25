'use client'

import { cn } from '@/lib/utils';
import { CityLocation } from '@/app/types';
import { LayoutList, Tag, ArrowDownAZ, Star, TrendingDown } from 'lucide-react';
import { getLocationColor } from '../../../../utils/locationColors';

export type SortOption = 'alpha' | 'best' | 'worst';

export interface GroupOptions {
    byLocation: boolean;
    byType: boolean;
}

export const ALL_LOCATIONS: CityLocation[] = [
    'Macau',
    'Seoul',
    'Tokyo',
    'Taiwan',
    'Hong Kong',
];

const SORT_OPTIONS: { label: string; value: SortOption; icon: React.ReactNode }[] = [
    { label: 'A-Z', value: 'alpha', icon: <ArrowDownAZ className="w-3.5 h-3.5" /> },
    { label: 'Best first', value: 'best', icon: <Star className="w-3.5 h-3.5" /> },
    { label: 'Worst first', value: 'worst', icon: <TrendingDown className="w-3.5 h-3.5" /> },
];

interface FoodControlBarProps {
    activeLocations: Set<CityLocation>;
    groupOptions: GroupOptions;
    sortBy: SortOption;
    onLocationToggle: (location: CityLocation) => void;
    onGroupToggle: (key: keyof GroupOptions) => void;
    onSortChange: (value: SortOption) => void;
}

// Explicit black/white inversion so it's always visible regardless of theme variable setup
const ACTIVE = 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white';
const INACTIVE = 'bg-transparent text-neutral-400 border-neutral-200 hover:text-neutral-900 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-400 dark:hover:text-white';

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

export function FoodControlBar({
    activeLocations,
    groupOptions,
    sortBy,
    onLocationToggle,
    onGroupToggle,
    onSortChange,
}: FoodControlBarProps) {
    const { byLocation, byType } = groupOptions;

    return (
        <div className="flex flex-col gap-3 mb-6 p-4 bg-card border border-border">

            {/* Row 1: Location filter pills */}
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

            <div className="border-t border-border" />

            {/* Row 2: Group + Sort */}
            <div className="flex flex-wrap items-center justify-between gap-4">

                {/* Grouping — two independent toggles */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                        Group
                    </span>
                    <div className="flex items-center gap-1">
                        <ControlButton active={byLocation} onClick={() => onGroupToggle('byLocation')}>
                            <LayoutList className="w-3.5 h-3.5" />
                            Location
                        </ControlButton>
                        <ControlButton active={byType} onClick={() => onGroupToggle('byType')}>
                            <Tag className="w-3.5 h-3.5" />
                            Type
                        </ControlButton>
                    </div>
                </div>

                {/* Sort — radio style */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                        Sort
                    </span>
                    <div className="flex items-center gap-1">
                        {SORT_OPTIONS.map((opt) => (
                            <ControlButton
                                key={opt.value}
                                active={sortBy === opt.value}
                                onClick={() => onSortChange(opt.value)}
                            >
                                {opt.icon}
                                {opt.label}
                            </ControlButton>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}