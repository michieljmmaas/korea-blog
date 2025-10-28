"use client"

import { useState, useEffect, useRef } from "react";
import { ImageKitProvider, Image } from "@imagekit/next";
import { X, ChevronLeft, ChevronRight, Loader2, RotateCcw } from "lucide-react";
import { TransformWrapper, TransformComponent, useControls, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

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
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  const hasMultipleImages = images.length > 1;
  const showNavigation = hasMultipleImages && onNext && onPrevious;

  // Reset transform when image changes
  useEffect(() => {
    if (isOpen && transformRef.current) {
      transformRef.current.resetTransform();
    }
  }, [currentIndex, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsImageLoading(true);
      setHighResLoaded(false);
      setShowLoadingIndicator(false);
      // Show loading indicator after 500ms delay
      const timer = setTimeout(() => {
        setShowLoadingIndicator(true);
      }, 500);

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

  const handleMediumResLoad = () => {
    setIsImageLoading(false);
    setShowLoadingIndicator(false);
  };

  const handleHighResLoad = () => {
    setHighResLoaded(true);
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
            ref={transformRef}
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
            centerOnInit={true}
            centerZoomedOut={true}
            smooth={true}
            disabled={false}
            alignmentAnimation={{ disabled: false }}
            velocityAnimation={{ disabled: false }}
          >
            {/* Zoom Controls */}
            <ResetControl />

            {/* Image Container */}
            <TransformComponent
              wrapperClass="!w-full !h-full !flex !items-center !justify-center"
              contentClass="!flex !items-center !justify-center"
            >
              <div
                className="flex items-center justify-center p-4 sm:p-8"
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  maxWidth: '100vw',
                  maxHeight: '100vh'
                }}
              >
                {/* Loading Spinner - Shows while medium res loads */}
                {isImageLoading && showLoadingIndicator && (
                  <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                    <div className="flex flex-col items-center gap-3 bg-black/60 px-6 py-4 rounded-lg backdrop-blur-sm">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                      <p className="text-white text-sm">Loading...</p>
                    </div>
                  </div>
                )}

                {/* Single container for both images to maintain same dimensions */}
                <div className="relative inline-block">
                  {/* Medium resolution image - loads fast */}
                  <Image
                    src={images[currentIndex]}
                    width={1400}
                    height={1000}
                    alt={`${alt} ${hasMultipleImages ? currentIndex + 1 : ''}`}
                    className={`block select-none rounded-lg shadow-2xl transition-opacity duration-300 ${
                      isImageLoading ? 'opacity-50' : highResLoaded ? 'opacity-0' : 'opacity-100'
                    }`}
                    style={{
                      maxWidth: 'calc(90vw - 8rem)',
                      maxHeight: 'calc(85vh - 8rem)',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                      display: 'block'
                    }}
                    transformation={[
                      {
                        width: 800,
                        quality: 75,
                        format: 'auto'
                      }
                    ]}
                    loading="eager"
                    onLoad={handleMediumResLoad}
                    draggable={false}
                  />

                  {/* High resolution image - loads in background, positioned absolutely on top */}
                  {!isImageLoading && (
                    <Image
                      src={images[currentIndex]}
                      width={1400}
                      height={1000}
                      alt={`${alt} ${hasMultipleImages ? currentIndex + 1 : ''} - High res`}
                      className={`absolute top-0 left-0 block select-none rounded-lg shadow-2xl transition-opacity duration-700 ${
                        highResLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        maxWidth: 'calc(90vw - 8rem)',
                        maxHeight: 'calc(85vh - 8rem)',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        display: 'block',
                        pointerEvents: highResLoaded ? 'auto' : 'none'
                      }}
                      transformation={[
                        {
                          width: 1400,
                          quality: 85,
                          format: 'auto'
                        }
                      ]}
                      loading="eager"
                      onLoad={handleHighResLoad}
                      draggable={false}
                    />
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