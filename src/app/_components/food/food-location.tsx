'use client'

import { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CityLocation, LocationCategoryGroupedFoods } from '@/app/types';
import { FoodCategory } from './food-category';
import { LocationSticker } from '../common/location-sticker';
import { GroupingMode } from './food-client-wrapper';

interface LocationProps {
    locationData: LocationCategoryGroupedFoods;
    mode: GroupingMode;
}

export const FoodLocation = ({ locationData, mode }: LocationProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const totalFoods = locationData.categories.reduce((total, cat) => total + cat.foods.length, 0);
    const triedFoods = locationData.categories.reduce((total, cat) =>
        total + cat.foods.filter(f => f.tried).length, 0
    );

    // location+type: categories are collapsible (chevron, starts closed)
    // location:      categories are always expanded (no chevron, no collapse)
    const categoryAlwaysExpanded = mode === 'location';

    return (
        <div className="border border-border rounded-lg bg-background mb-2">
            {/* Location header — always collapsible */}
            <div
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors duration-200 rounded-t-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <LocationSticker location={locationData.location as CityLocation} />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                            {triedFoods} of {totalFoods} foods tried
                        </span>
                        <ChevronDown
                            className={cn(
                                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                                isOpen && "transform rotate-180"
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div
                className={cn(
                    "overflow-hidden transition-all duration-200 ease-in-out",
                    isOpen ? "max-h-none opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="border-t border-border">
                    {locationData.categories.map((category, index) => (
                        <FoodCategory
                            key={index}
                            category={category.category}
                            foods={category.foods}
                            isLast={index === locationData.categories.length - 1}
                            initiallyExpanded={false}
                            alwaysExpanded={categoryAlwaysExpanded}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};