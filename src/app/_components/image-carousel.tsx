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

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle escape key to close modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    }
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
        <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg bg-surface-secondary">
          <Image
            src={`/${date}/photos/${images[currentIndex]}.heic`}
            width={800}
            height={400}
            alt={`${alt} ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-all duration-300"
            transformation={[{ width: 800, height: 400, crop: "maintain_ratio" }]}
          />
          
          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-overlay/20 hover:bg-overlay/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-overlay/20 hover:bg-overlay/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {/* Expand button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={openModal}
            className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-overlay/20 hover:bg-overlay/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div 
            className="relative max-w-7xl max-h-[95vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={closeModal}
              className="absolute -top-2 -right-2 z-10 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Full size image */}
            <Image
              src={`/${date}/photos/${images[currentIndex]}.heic`}
              width={1920}
              height={1080}
              alt={`${alt} ${currentIndex + 1} - Full size`}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              transformation={[{ width: 1920, height: 1080, crop: "maintain_ratio" }]}
            />
            
            {/* Modal navigation arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </ImageKitProvider>
  );
};

export default ImageCarousel;