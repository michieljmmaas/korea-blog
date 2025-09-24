'use client'

import { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CityLocation, LocationCategoryGroupedFoods } from '@/app/types';
import { FoodCategory } from './food-category';
import { LocationSticker } from '../common/location-sticker';

interface LocationProps {
  locationData: LocationCategoryGroupedFoods;
  initiallyCollapsed?: boolean;
}

export const FoodLocation = ({ locationData, initiallyCollapsed = false }: LocationProps) => {
  const [isOpen, setIsOpen] = useState(!initiallyCollapsed);

  const toggleOpen = () => setIsOpen(!isOpen);

  const totalFoods = locationData.categories.reduce((total, category) => total + category.foods.length, 0);
  const triedFoods = locationData.categories.reduce((total, category) =>
    total + category.foods.filter(food => food.tried).length, 0
  );

  return (
    <div className="border border-border rounded-lg bg-background mb-2">
      {/* Location Header */}
      <div
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors duration-200 rounded-t-lg"
        onClick={toggleOpen}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <LocationSticker location={locationData.location as CityLocation} />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {triedFoods} of {totalFoods} foods tried
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                isOpen && "transform rotate-180"
              )}
            />
          </div>
        </div>
      </div>

      {/* Categories Content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          isOpen ? "max-h-none opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="border-t border-border">
          {locationData.categories.map((category, index) => (
            <FoodCategory
              category={category.category}
              key={index}
              foods={category.foods}
              isLast={index === locationData.categories.length - 1}
              initiallyExpanded={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};