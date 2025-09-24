"use client";

import { useState } from 'react';
import { ChevronDown, Star, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Food } from '@/app/types';
import SingleImageWithModal from '../common/single-image-with-modal';

export const FoodItem = ({ food }: { food: Food }) => {
  const [isOpen, setIsOpen] = useState(false);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        )}
      />
    ));
  };


  const toggleOpen = () => {
    if (food.review) {
      setIsOpen(!isOpen);
    }
  };


  return (
    <div className="transition-all duration-400 border border-border rounded-lg">
      <div className="p-4 cursor-pointer" onClick={toggleOpen}>
        <div className="flex items-center gap-3">
          {food.tried ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />

          ) : (
            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={cn(
                  "font-medium",
                  food.tried ? "text-green-600" : "text-foreground"
                )}
              >
                {food.nativeName}
              </h3>
              {food.phoneticName && (
                <span
                  className={cn(
                    "text-xs italic",
                    food.tried ? "text-green-600" : "text-muted-foreground"
                  )}
                >
                  ({food.phoneticName})
                </span>
              )}
            </div>
            {food.description && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {food.description}
              </p>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-400",
              isOpen && "transform rotate-180"
            )}
          />
        </div>

      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-400 ease-in-out",
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4">
          <div className="pt-4 border-t border-border">
            {food.image && (
              <div className="mb-4 rounded-lg overflow-hidden bg-muted">
                <img
                  src={food.image}
                  alt={food.nativeName}
                  className="w-full h-48 sm:h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="space-y-4">
              {food.review && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">My Review:</h4>
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(food.rating)}
                    <span className="text-sm text-muted-foreground">({food.rating}/5)</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {food.review}
                  </p>
                </div>
              )}

              {food.image && (
                <SingleImageWithModal
                  src={"https://ik.imagekit.io/yyahqsrfe/food/" + food.image}
                  alt={food.image}
                  orientation={'landscape'}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
