'use client'

import { useMemo, useState } from 'react';
import { Food, LocationCategoryGroupedFoods } from '@/app/types';
import { FoodLocation } from './food-location';
import { FoodCategory } from './food-category';
import {
    FoodControlBar,
    SortOption,
    GroupOptions,
    ALL_LOCATIONS,
} from './food-control-bar';
import { CityLocation } from '@/app/types';

interface FoodClientWrapperProps {
    foods: Food[];
}

// ── Sorting ──────────────────────────────────────────────────────────────────

function applySort(foods: Food[], sortBy: SortOption): Food[] {
    return [...foods].sort((a, b) => {
        if (sortBy === 'best') return b.rating - a.rating;
        if (sortBy === 'worst') return a.rating - b.rating;
        // alpha
        return a.nativeName.localeCompare(b.nativeName);
    });
}

// ── Grouping ─────────────────────────────────────────────────────────────────

/**
 * Returns a nested structure depending on which grouping flags are active.
 *
 * byLocation + byType → location > category > foods
 * byLocation only     → location > foods (single "all" category per location)
 * byType only         → category > foods
 * neither             → one flat list
 */
type NestedGroup =
    | { mode: 'location+type'; data: LocationCategoryGroupedFoods[] }
    | { mode: 'location'; data: { location: string; foods: Food[] }[] }
    | { mode: 'type'; data: { category: string; foods: Food[] }[] }
    | { mode: 'flat'; data: Food[] };

function applyGrouping(foods: Food[], groupOptions: GroupOptions): NestedGroup {
    const { byLocation, byType } = groupOptions;

    if (byLocation && byType) {
        const grouped: Record<string, Record<string, Food[]>> = {};
        for (const food of foods) {
            if (!grouped[food.location]) grouped[food.location] = {};
            if (!grouped[food.location][food.category]) grouped[food.location][food.category] = [];
            grouped[food.location][food.category].push(food);
        }
        return {
            mode: 'location+type',
            data: Object.entries(grouped).map(([location, cats]) => ({
                location,
                categories: Object.entries(cats).map(([category, foods]) => ({ category, foods })),
            })),
        };
    }

    if (byLocation) {
        const grouped: Record<string, Food[]> = {};
        for (const food of foods) {
            if (!grouped[food.location]) grouped[food.location] = [];
            grouped[food.location].push(food);
        }
        return {
            mode: 'location',
            data: Object.entries(grouped).map(([location, foods]) => ({ location, foods })),
        };
    }

    if (byType) {
        const grouped: Record<string, Food[]> = {};
        for (const food of foods) {
            if (!grouped[food.category]) grouped[food.category] = [];
            grouped[food.category].push(food);
        }
        return {
            mode: 'type',
            data: Object.entries(grouped).map(([category, foods]) => ({ category, foods })),
        };
    }

    return { mode: 'flat', data: foods };
}


export function FoodClientWrapper({ foods }: FoodClientWrapperProps) {
    const [activeLocations, setActiveLocations] = useState<Set<CityLocation>>(
        new Set(ALL_LOCATIONS)
    );
    const [groupOptions, setGroupOptions] = useState<GroupOptions>({
        byLocation: true,
        byType: false,
    });
    const [sortBy, setSortBy] = useState<SortOption>('alpha');

    function handleLocationToggle(location: CityLocation) {
        setActiveLocations((prev) => {
            const next = new Set(prev);
            next.has(location) ? next.delete(location) : next.add(location);
            return next;
        });
    }

    function handleGroupToggle(key: keyof GroupOptions) {
        setGroupOptions((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    const nested = useMemo(() => {
        const filtered = foods.filter((f) =>
            activeLocations.has(f.location as CityLocation)
        );
        const sorted = applySort(filtered, sortBy);
        return applyGrouping(sorted, groupOptions);
    }, [foods, activeLocations, sortBy, groupOptions]);

    // Whether to show a location-coloured border on individual food cards.
    // Only meaningful when not grouping by location (location is already obvious from the header).
    const showLocationBorder = !groupOptions.byLocation;

    return (
        <div>
            <FoodControlBar
                activeLocations={activeLocations}
                groupOptions={groupOptions}
                sortBy={sortBy}
                onLocationToggle={handleLocationToggle}
                onGroupToggle={handleGroupToggle}
                onSortChange={setSortBy}
            />

            {nested.mode === 'location+type' && (
                nested.data.map((loc) => (
                    <FoodLocation key={loc.location} locationData={loc} showLocationBorder/>
                ))
            )}

            {nested.mode === 'location' && (
                nested.data.map((loc) => (
                    <FoodLocation
                        key={loc.location}
                        locationData={{
                            location: loc.location,
                            categories: [{ category: '', foods: loc.foods }],
                        }}
                        showLocationBorder
                    />
                ))
            )}

            {nested.mode === 'type' && (
                nested.data.map((cat, i) => (
                    <FoodCategory
                        key={cat.category}
                        category={cat.category}
                        foods={cat.foods}
                        isLast={i === nested.data.length - 1}
                        initiallyExpanded
                        showLocationBorder={showLocationBorder}
                    />
                ))
            )}

            {nested.mode === 'flat' && (
                <FoodCategory
                    category=""
                    foods={nested.data}
                    isLast
                    initiallyExpanded
                    showLocationBorder={showLocationBorder}
                />
            )}
        </div>
    );
}