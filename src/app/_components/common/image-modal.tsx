"use client"

import { useState, useEffect } from "react";
import { ImageKitProvider, Image } from "@imagekit/next";
import { X, ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  alt?: string;
}

const ResetControl = () => {
  const { resetTransform } = useControls();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        resetTransform();
      }}
      className="absolute top-16 right-2 sm:top-20 sm:right-4 z-50 h-10 w-10 sm:h-12 sm:w-12 bg-black/70 hover:bg-black/90 text-white rounded-full border border-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
      title="Reset Zoom"
    >
      <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  );
};

const ImageModal = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  alt = "Image"
}: ImageModalProps) => {
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);

  const hasMultipleImages = images.length > 1;
  const showNavigation = hasMultipleImages && onNext && onPrevious;

  useEffect(() => {
    if (isOpen) {
      setIsImageLoading(true);
      setShowLoadingIndicator(false);
      // Show loading indicator after 1 second delay
      const timer = setTimeout(() => {
        setShowLoadingIndicator(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && onPrevious) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious]);

  const handleImageLoad = () => {
    setIsImageLoading(false);
    setShowLoadingIndicator(false);
  };

  if (!isOpen) return null;

  return (
    <ImageKitProvider urlEndpoint="https://ik.imagekit.io/yyahqsrfe">
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="relative flex items-center justify-center w-full h-full">

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 h-10 w-10 sm:h-12 sm:w-12 bg-black/70 hover:bg-black/90 text-white rounded-full border border-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Left Arrow Button - Only show for multiple images */}
          {showNavigation && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevious!();
              }}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-40 h-10 w-10 sm:h-12 sm:w-12 bg-black/70 hover:bg-black/90 text-white rounded-full border border-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          {/* Right Arrow Button - Only show for multiple images */}
          {showNavigation && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext!();
              }}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-40 h-10 w-10 sm:h-12 sm:w-12 bg-black/70 hover:bg-black/90 text-white rounded-full border border-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            wheel={{
              step: 0.1,
              smoothStep: 0.01,
              wheelDisabled: false
            }}
            pinch={{ step: 5 }}
            doubleClick={{
              disabled: false,
              mode: "reset"
            }}
            limitToBounds={false}
            centerOnInit={false}
            centerZoomedOut={true}
            smooth={true}
            disabled={false}
            alignmentAnimation={{ disabled: true }}
            velocityAnimation={{ disabled: true }}
            onInit={() => {
              // Reset transform when image changes
            }}
          >
            {/* Zoom Controls */}
            <ResetControl />

            {/* Image Container */}
            <TransformComponent
              wrapperClass="!w-full !h-full flex items-center justify-center px-12 py-16 sm:px-16 sm:py-20 md:px-20 md:py-20"
              contentClass="!w-auto !h-auto flex items-center justify-center"
            >
              <div
                className="relative flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* High resolution image */}
                <div className="relative">
                  <Image
                    src={images[currentIndex]}
                    width={1200}
                    height={800}
                    alt={`${alt} ${hasMultipleImages ? currentIndex + 1 : ''} - Full size`}
                    className={`max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl transition-all duration-300 select-none ${isImageLoading ? 'blur-sm opacity-70' : 'blur-0 opacity-100'
                      }`}
                    style={{
                      maxWidth: '90vw',
                      maxHeight: '90vh',
                      width: 'auto',
                      height: 'auto',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
                    transformation={[
                      {
                        width: 1600,
                        quality: 90
                      }
                    ]}
                    onLoad={handleImageLoad}
                    draggable={false}
                  />

                  {/* Loading Spinner Overlay */}
                  {isImageLoading && showLoadingIndicator && (
                    <div className="absolute inset-0 flex items-center justify-center z-30 rounded-lg">
                      <div className="flex flex-col items-center gap-3 bg-black/40 px-4 py-3 rounded-lg backdrop-blur-sm">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                        <p className="text-white text-xs">Loading...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TransformComponent>
          </TransformWrapper>

          {/* Image Counter - Only show for multiple images */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-40 px-3 py-1 bg-black/70 text-white text-sm rounded-full border border-white/20 backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>
    </ImageKitProvider>
  );
};

export default ImageModal;