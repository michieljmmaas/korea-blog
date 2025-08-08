"use client"

import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { ImageKitProvider, Image } from "@imagekit/next";
import { Button } from "./ui/button";

interface ImageCarouselProps {
  images: number[];
  date: string; // Format: "2025-09-29"
  alt?: string;
}

const ImageCarousel = ({ images, date, alt = "Travel photo" }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({});

  const goToPrevious = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle escape key and arrow keys
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  const handleImageLoad = (imageIndex: number) => {
    setImageLoading(prev => ({ ...prev, [imageIndex]: false }));
  };

  const handleImageLoadStart = (imageIndex: number) => {
    setImageLoading(prev => ({ ...prev, [imageIndex]: true }));
  };

  if (images.length === 0) {
    return (
      <div className="relative h-64 bg-surface-secondary rounded-lg flex items-center justify-center">
        <p className="text-text-secondary">No images available</p>
      </div>
    );
  }

  return (
    <ImageKitProvider urlEndpoint="https://ik.imagekit.io/yyahqsrfe">
      <div className="relative group">
        <div 
          className="relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg bg-surface-secondary cursor-pointer"
          onClick={openModal}
        >
          {/* Loading indicator */}
          {imageLoading[currentIndex] && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-secondary z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-primary"></div>
            </div>
          )}
          
          <Image
            src={`/${date}/photos/${images[currentIndex]}.heic`}
            width={800}
            height={400}
            alt={`${alt} ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-all duration-300"
            transformation={[{ 
              named: "carousel-optimized" // Using named transformation - see suggestion below
            }]}
            onLoad={() => handleImageLoad(currentIndex)}
            onLoadStart={() => handleImageLoadStart(currentIndex)}
            priority={currentIndex === 0} // LCP optimization for first image
          />
          
          {/* Larger navigation areas - invisible clickable zones */}
          {images.length > 1 && (
            <>
              <div
                onClick={goToPrevious}
                className="absolute left-0 top-0 w-1/3 h-full z-20 cursor-pointer"
              />
              
              <div
                onClick={goToNext}
                className="absolute right-0 top-0 w-1/3 h-full z-20 cursor-pointer"
              />
            </>
          )}
          
          {/* Navigation arrows - visual indicators only */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-overlay/20 hover:bg-overlay/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 pointer-events-none"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-overlay/20 hover:bg-overlay/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 pointer-events-none"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {/* Expand button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openModal();
            }}
            className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-overlay/20 hover:bg-overlay/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30"
          >
            <Expand className="h-4 w-4" />
          </Button>
        </div>
      
        {/* Image indicators */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? "bg-text-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Custom Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div 
            className="relative max-w-[95vw] max-h-[95vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={closeModal}
              className="absolute -top-2 -right-2 z-10 h-10 w-10 p-0 bg-black/70 hover:bg-black/90 text-white rounded-full border border-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
            
            {/* Modal loading indicator */}
            {imageLoading[currentIndex] && (
              <div className="absolute inset-0 flex items-center justify-center z-5">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
            
            {/* Full size image - preserving aspect ratio */}
            <Image
              src={`/${date}/photos/${images[currentIndex]}.heic`}
              width={1600} // Max dimension for largest side
              height={1600} // Same max for both orientations
              alt={`${alt} ${currentIndex + 1} - Full size`}
              className="w-auto h-auto max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              transformation={[
                { named: "modal-full-aspect" } // Using named transformation - see suggestion below
              ]}
              onLoad={() => handleImageLoad(currentIndex)}
              onLoadStart={() => handleImageLoadStart(currentIndex)}
            />
            
            {/* Large navigation areas in modal */}
            {images.length > 1 && (
              <>
                <div
                  onClick={goToPrevious}
                  className="absolute left-0 top-0 w-1/3 h-full cursor-pointer flex items-center justify-start pl-4 z-20"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-12 w-12 p-0 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm opacity-60 hover:opacity-100 transition-opacity pointer-events-none"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                </div>
                
                <div
                  onClick={goToNext}
                  className="absolute right-0 top-0 w-1/3 h-full cursor-pointer flex items-center justify-end pr-4 z-20"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-12 w-12 p-0 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm opacity-60 hover:opacity-100 transition-opacity pointer-events-none"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </ImageKitProvider>
  );
};

export default ImageCarousel;