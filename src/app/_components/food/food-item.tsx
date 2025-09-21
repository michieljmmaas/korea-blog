"use client"

import { useState } from 'react';
import { ChevronDown, Star, MapPin, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Food {
  name: string;
  tried: boolean;
  description: string;
  rating: number;
  location: string;
}

export const FoodItem = ({ food }: { food: Food }) => {
  const [isOpen, setIsOpen] = useState(false);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "fill-accent text-accent" : "text-muted-foreground"
        )}
      />
    ));
  };

  const toggleOpen = () => setIsOpen(!isOpen);

  if (!food.tried) {
    return (
      <div className="transition-all duration-200 hover:shadow-md border border-border rounded-lg">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-foreground">{food.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {food.location}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transition-all duration-200 hover:shadow-md border border-border rounded-lg">
      <div className="p-4 cursor-pointer" onClick={toggleOpen}>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground">{food.name}</h3>
              <span className="px-2 py-1 text-xs rounded-md bg-success/10 text-success border border-success/20">
                Tried
              </span>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {food.location}
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
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4">
          <div className="pt-4 border-t border-border">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Rating:</span>
                <div className="flex items-center gap-1">
                  {renderStars(food.rating)}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({food.rating}/5)
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">My Review:</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {food.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};