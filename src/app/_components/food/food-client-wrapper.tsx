'use client'

import { useMemo, useState } from 'react';
import { Food, LocationCategoryGroupedFoods } from '@/app/types';
import { FoodLocation } from './food-location';
import { FoodCategory } from './food-category';
import { FoodControlBar, SortOption, GroupOptions, ALL_LOCATIONS } from './food-control-bar';
import { CityLocation } from '@/app/types';

export type GroupingMode = 'location+type' | 'location' | 'type' | 'flat';

interface FoodClientWrapperProps {
    foods: Food[];
}

function applySort(foods: Food[], sortBy: SortOption): Food[] {
    return [...foods].sort((a, b) => {
        if (sortBy === 'best') return b.rating - a.rating;
        if (sortBy === 'worst') return a.rating - b.rating;
        return a.phoneticName.localeCompare(b.phoneticName);
    });
}

type NestedGroup =
    | { mode: 'location+type'; data: LocationCategoryGroupedFoods[] }
    | { mode: 'location';      data: { location: string; foods: Food[] }[] }
    | { mode: 'type';          data: { category: string; foods: Food[] }[] }
    | { mode: 'flat';          data: Food[] };

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
    const [activeLocations, setActiveLocations] = useState<Set<CityLocation>>(new Set(ALL_LOCATIONS));
    const [groupOptions, setGroupOptions] = useState<GroupOptions>({ byLocation: true, byType: true });
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
        const filtered = foods.filter((f) => activeLocations.has(f.location as CityLocation));
        const sorted = applySort(filtered, sortBy);
        return applyGrouping(sorted, groupOptions);
    }, [foods, activeLocations, sortBy, groupOptions]);

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

            {/* location+type: FoodLocation renders FoodCategory as collapsible (initiallyExpanded=false, alwaysExpanded=false) */}
            {nested.mode === 'location+type' && nested.data.map((loc) => (
                <FoodLocation key={loc.location} locationData={loc} mode="location+type" />
            ))}

            {/* location: FoodLocation renders FoodCategory as alwaysExpanded */}
            {nested.mode === 'location' && nested.data.map((loc) => (
                <FoodLocation
                    key={loc.location}
                    locationData={{ location: loc.location, categories: [{ category: '', foods: loc.foods }] }}
                    mode="location"
                />
            ))}

            {/* type: FoodCategory is alwaysExpanded (no chevron, shows tried count) */}
            {nested.mode === 'type' && nested.data.map((cat, i) => (
                <FoodCategory
                    key={cat.category}
                    category={cat.category}
                    foods={cat.foods}
                    isLast={i === nested.data.length - 1}
                    initiallyExpanded={false}
                    alwaysExpanded={false}
                />
            ))}

            {/* flat: single alwaysExpanded FoodCategory, no header title */}
            {nested.mode === 'flat' && (
                <FoodCategory
                    category=""
                    foods={nested.data}
                    isLast
                    alwaysExpanded
                />
            )}
        </div>
    );
}