"use client";

import { useState } from "react";
import { ChevronDown, Star, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Food } from "@/app/types";
import CroppedImageWithModal from "../common/cropped-image-with-modal";

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
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(food.rating)}
                      <span className="text-sm text-muted-foreground">
                        ({food.rating}/5)
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {food.review}
                    </p>
                  </div>
                )}

                {food.image && (
                  <div className="relative overflow-hidden rounded-lg">
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        cursor: "pointer",
                      }}
                    >
                      <CroppedImageWithModal
                        src={
                          "https://ik.imagekit.io/yyahqsrfe/food/" + food.image
                        }
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
