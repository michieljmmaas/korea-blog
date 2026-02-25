import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FoodItem } from './food-item';

export interface Food {
    nativeName: string;
    phoneticName: string;
    tried: boolean;
    description: string;
    rating: number;
    image: string;
    location: string;
    category: string;
    review: string;
}

interface FoodCategoryProps {
    category: string;
    foods: Food[];
    isLast?: boolean;
    initiallyExpanded?: boolean;
    showLocationBorder: boolean;
}

export const FoodCategory = ({ category, foods, isLast = false, initiallyExpanded = true }: FoodCategoryProps) => {
    const [isOpen, setIsOpen] = useState(initiallyExpanded);
    const triedCount = foods.filter(food => food.tried).length;

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className={cn(
            !isLast && "border-b border-border"
        )}>
            {/* Category Header */}
            <div
                className="p-4 cursor-pointer hover:bg-muted/30 transition-colors duration-200"
                onClick={toggleOpen}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-md font-medium text-foreground mb-1">{category}</h3>
                        <p className="text-xs text-muted-foreground">
                            {triedCount} of {foods.length} tried
                        </p>
                    </div>
                    <ChevronDown
                        className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                            isOpen && "transform rotate-180"
                        )}
                    />
                </div>
            </div>

            <div
                className={cn(
                    "overflow-hidden transition-all duration-200 ease-in-out",
                    isOpen ? "max-h-none opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="pb-4 px-4">
                    <div className="space-y-2">
                        {foods.map((food, foodIndex) => (
                            <FoodItem food={food} key={foodIndex} showLocationBorder/>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};