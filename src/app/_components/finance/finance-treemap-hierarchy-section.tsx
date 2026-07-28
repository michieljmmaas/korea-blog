"use client"

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { FinanceTreemapHierarchyData } from './types';
import FinanceTreemapByLocation from './finance-treemap-by-location';
import FinanceTreemapByCategory from './finance-treemap-by-category';
import { getLocationColorHex } from '../../../../utils/locationColors';
import { getCategoryColorHex } from '../../../../utils/financeCategoryColors';

interface FinanceTreemapHierarchySectionProps {
    data: FinanceTreemapHierarchyData;
    totalSpent: number;
}

type GroupBy = 'location' | 'category';

const ACTIVE =
    'bg-white text-neutral-900 border-neutral-900 dark:bg-neutral-900 dark:text-white dark:border-white';
const INACTIVE =
    'bg-transparent text-neutral-400 border-neutral-200 hover:text-neutral-900 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-400 dark:hover:text-white opacity-60 hover:opacity-100';

const FinanceTreemapHierarchySection = ({ data, totalSpent }: FinanceTreemapHierarchySectionProps) => {
    const [groupBy, setGroupBy] = useState<GroupBy>('location');
    const [selectedLocations, setSelectedLocations] = useState<Set<string>>(() => new Set(data.locations));
    // Salary is filtered out to start — it's income, not spending.
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
        () => new Set(data.categories.filter((c) => c !== 'Salary'))
    );

    const filteredEntries = useMemo(
        () => data.entries.filter((e) => selectedLocations.has(e.location) && selectedCategories.has(e.category)),
        [data.entries, selectedLocations, selectedCategories]
    );

    const toggleLocation = (name: string) => {
        setSelectedLocations((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const toggleCategory = (name: string) => {
        setSelectedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    return (
        <div className="space-y-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                    Spending breakdown
                </h3>
                <div
                    role="group"
                    aria-label="Group top-level tiles by"
                    className="inline-flex items-center rounded-md border border-gray-200 dark:border-gray-700 p-0.5 text-sm"
                >
                    {(['location', 'category'] as const).map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setGroupBy(option)}
                            aria-pressed={groupBy === option}
                            className={
                                groupBy === option
                                    ? 'px-2.5 py-1 rounded bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900'
                                    : 'px-2.5 py-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                        >
                            {option === 'location' ? 'By location' : 'By category'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 shrink-0">Locations</span>
                    {data.locations.map((name) => {
                        const isActive = selectedLocations.has(name);
                        return (
                            <button
                                key={name}
                                type="button"
                                onClick={() => toggleLocation(name)}
                                aria-pressed={isActive}
                                className={cn(
                                    'flex items-center gap-1.5 px-2.5 py-1.5 border rounded-md text-xs font-mono uppercase tracking-wide transition-all',
                                    isActive ? ACTIVE : INACTIVE
                                )}
                            >
                                <span
                                    className="inline-block w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: getLocationColorHex(name) }}
                                />
                                {name}
                            </button>
                        );
                    })}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 shrink-0">Categories</span>
                    {data.categories.map((name) => {
                        const isActive = selectedCategories.has(name);
                        return (
                            <button
                                key={name}
                                type="button"
                                onClick={() => toggleCategory(name)}
                                aria-pressed={isActive}
                                className={cn(
                                    'flex items-center gap-1.5 px-2.5 py-1.5 border rounded-md text-xs font-mono uppercase tracking-wide transition-all',
                                    isActive ? ACTIVE : INACTIVE
                                )}
                            >
                                <span
                                    className="inline-block w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: getCategoryColorHex(name) }}
                                />
                                {name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {groupBy === 'location' ? (
                <FinanceTreemapByLocation entries={filteredEntries} title="By location" />
            ) : (
                <FinanceTreemapByCategory entries={filteredEntries} title="By category" />
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total spent</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">
                    €{totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            </div>
        </div>
    );
};

export default FinanceTreemapHierarchySection;
