'use client'

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FoodItem } from './food-item';
import { Food } from '@/app/types';

interface FoodCategoryProps {
    category: string;
    foods: Food[];
    isLast?: boolean;
    initiallyExpanded?: boolean;
    alwaysExpanded?: boolean;
    showLocationBorder?: boolean;
}

export const FoodCategory = ({
    category,
    foods,
    isLast = false,
    initiallyExpanded = false,
    alwaysExpanded = false,
}: FoodCategoryProps) => {
    // Fix: was hardcoded to useState(false), ignoring the prop
    const [isOpen, setIsOpen] = useState(initiallyExpanded);
    const triedCount = foods.filter(food => food.tried).length;

    const collapsible = !alwaysExpanded;
    const open = alwaysExpanded ? true : isOpen;

    return (
        <div className={cn(!isLast && "border-b border-border")}>
            <div
                className={cn(
                    "p-4 transition-colors duration-200",
                    collapsible && "cursor-pointer hover:bg-muted/30"
                )}
                onClick={collapsible ? () => setIsOpen(!isOpen) : undefined}
            >
                <div className="flex items-center justify-between">
                    <div>
                        {category && (
                            <h3 className="text-md font-medium text-foreground mb-1">{category}</h3>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {triedCount} of {foods.length} tried
                        </p>
                    </div>
                    {collapsible && (
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                open && "transform rotate-180"
                            )}
                        />
                    )}
                </div>
            </div>

            <div
                className={cn(
                    "overflow-hidden transition-all duration-200 ease-in-out",
                    open ? "max-h-none opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="pb-4 px-4">
                    <div className="space-y-2">
                        {foods.map((food, foodIndex) => (
                            <FoodItem
                                food={food}
                                key={foodIndex}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};