"use client";

import { useState } from "react";
import { ChevronDown, Star, Trophy, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Food, CityLocation } from "@/app/types";
import CroppedImageWithModal from "../common/cropped-image-with-modal";
import { getLocationBorderColor } from "../../../../utils/locationColors";

const isBest = (rating: number) => rating >= 6;
const isWorst = (rating: number) => rating === 0;

/** Extracts the first grapheme (handles multi-codepoint emoji like 🍜) */
function firstGrapheme(str: string): string {
  return [...(new Intl.Segmenter().segment(str))][0]?.segment ?? '';
}

export const FoodItem = ({
  food,
  showLocationBorder = true,
}: {
  food: Food;
  showLocationBorder?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const best = isBest(food.rating);
  const worst = isWorst(food.rating);

  const categoryEmoji = firstGrapheme(food.category);

  const renderStars = (rating: number) => {
    const clampedRating = Math.min(rating, 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3.5 w-3.5",
          i < clampedRating
            ? best
              ? "text-amber-400 fill-amber-400"
              : "text-yellow-400 fill-yellow-400"
            : "text-gray-300"
        )}
      />
    ));
  };

  const toggleOpen = () => {
    if (food.review) setIsOpen(!isOpen);
  };

  return (
    <div
      className={cn(
        "transition-all duration-400 rounded-lg overflow-hidden border",
        showLocationBorder
          ? cn("border-l-4", getLocationBorderColor(food.location as CityLocation))
          : "border-border",
        best && "ring-1 ring-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.15)]",
        worst && "opacity-75"
      )}
    >
      <div
        className={cn(
          "p-4 cursor-pointer",
          best && "bg-amber-50/40 dark:bg-amber-950/20",
          worst && "bg-neutral-50/60 dark:bg-neutral-900/40"
        )}
        onClick={toggleOpen}
      >
        <div className="flex items-center gap-3">
          {/* Category emoji replacing the checked/unchecked circle */}
          <span className="text-xl leading-none flex-shrink-0" title={food.category}>
            {categoryEmoji}
          </span>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {best && <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
              {worst && <ThumbsDown className="h-3.5 w-3.5 text-neutral-400 shrink-0" />}
              <h3
                className={cn(
                  "font-medium text-foreground",
                  best && "text-amber-700 dark:text-amber-400",
                  worst && "text-neutral-400"
                )}
              >
                {food.nativeName}
              </h3>
              {food.phoneticName && (
                <span
                  className={cn(
                    "text-xs italic text-muted-foreground",
                    best && "text-amber-600 dark:text-amber-500",
                    worst && "text-neutral-400"
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

          {/* Stars in header */}
          {food.tried && (
            <div className="flex items-center gap-0.5 shrink-0">
              {renderStars(food.rating)}
            </div>
          )}

          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-400 shrink-0",
              isOpen && "transform rotate-180"
            )}
          />
        </div>
      </div>

      <div
        className={cn(
          "grid transition-all duration-400 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">
            <div className="pt-4 border-t border-border">
              <div className="space-y-4">
                {food.review && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      My Review:
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {food.review}
                    </p>
                  </div>
                )}

                {food.image && (
                  <div className="relative overflow-hidden rounded-lg">
                    <div style={{ width: "100%", height: "100%", cursor: "pointer" }}>
                      <CroppedImageWithModal
                        src={"https://ik.imagekit.io/yyahqsrfe/food/" + food.image}
                        alt={food.image}
                      />
                    </div>
                    <style jsx>{`
                      div img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        object-position: center center;
                      }
                    `}</style>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};