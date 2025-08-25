"use client"

import { useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { ImageKitProvider, Image } from "@imagekit/next";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface SwiperImageCarouselProps {
  images: string[];
  alt?: string;
}

const SwiperImageCarousel = ({ images, alt = "Travel photo" }: SwiperImageCarouselProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModalIndex, setCurrentModalIndex] = useState(0);
  const [isModalImageLoading, setIsModalImageLoading] = useState(false);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);

  const openModal = (index: number) => {
    setCurrentModalIndex(index);
    setIsModalOpen(true);
    setIsModalImageLoading(true);
    // Show loading indicator after 1 second delay
    setTimeout(() => {
      setShowLoadingIndicator(true);
    }, 1000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsModalImageLoading(false);
    setShowLoadingIndicator(false);
  };

  const goToPrevious = () => {
    setCurrentModalIndex((prev) => {
      setIsModalImageLoading(true);
      setShowLoadingIndicator(false);
      // Show loading indicator after 1 second delay
      setTimeout(() => {
        if (isModalImageLoading) {
          setShowLoadingIndicator(true);
        }
      }, 1000);
      return prev === 0 ? images.length - 1 : prev - 1;
    });
  };

  const goToNext = () => {
    setCurrentModalIndex((prev) => {
      setIsModalImageLoading(true);
      setShowLoadingIndicator(false);
      // Show loading indicator after 1 second delay
      setTimeout(() => {
        if (isModalImageLoading) {
          setShowLoadingIndicator(true);
        }
      }, 1000);
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  const handleModalImageLoad = () => {
    setIsModalImageLoading(false);
    setShowLoadingIndicator(false);
  };

  if (images.length === 0) {
    return (
      <div className="relative h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <ImageKitProvider urlEndpoint="https://ik.imagekit.io/yyahqsrfe">
      <div className="w-full mx-auto">
        {/* Main Carousel */}
        <Swiper
          spaceBetween={10}
          navigation={{
            enabled: true,
            prevEl: '.swiper-button-prev-custom',
            nextEl: '.swiper-button-next-custom',
          }}
          pagination={{
            clickable: true,
            el: '.swiper-pagination-custom',
          }}
          loop={true}
          modules={[Navigation, Pagination]}
          className="w-full h-64 sm:h-80 md:h-96 rounded-lg relative"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div 
                className="w-full h-full cursor-pointer"
                onClick={() => openModal(index)}
              >
                <Image
                  src={image}
                  width={800}
                  height={400}
                  alt={`${alt} ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                  transformation={[{
                    named: "carousel-optimized"
                  }]}
                  loading={index === 0 ? "eager" : "lazy"}
                  priority={index === 0}
                />
              </div>
            </SwiperSlide>
          ))}
          
          {/* Custom Navigation Buttons - More Prominent */}
          <div className="swiper-button-prev-custom absolute left-2 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm border border-white/20">
            <ChevronLeft className="w-5 h-5 text-white" />
          </div>
          <div className="swiper-button-next-custom absolute right-2 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm border border-white/20">
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
          
          {/* Custom Pagination - More Prominent */}
          <div className="swiper-pagination-custom absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-2"></div>
        </Swiper>

        {/* High-Res Modal */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={closeModal}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          >
            <div className="relative flex items-center justify-center w-full h-full max-w-[95vw] max-h-[95vh]">
              
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeModal();
                }}
                className="absolute top-4 right-4 z-50 h-12 w-12 bg-black/70 hover:bg-black/90 text-white rounded-full border border-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
              >
                <X className="h-6 w-6" />
              </button>
              
              {/* Left Arrow Button - Outside Image */}
              {images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 h-12 w-12 bg-black/70 hover:bg-black/90 text-white rounded-full border border-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}
              
              {/* Right Arrow Button - Outside Image */}
              {images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 h-12 w-12 bg-black/70 hover:bg-black/90 text-white rounded-full border border-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}

              {/* Image Container */}
              <div 
                className="relative flex items-center justify-center w-full h-full px-20 py-20"
                onClick={(e) => e.stopPropagation()}
              >
                {/* High resolution image */}
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <Image
                    src={images[currentModalIndex]}
                    width={900}
                    height={0}
                    alt={`${alt} ${currentModalIndex + 1} - Full size`}
                    className={`max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl transition-all duration-300 ${
                      isModalImageLoading ? 'blur-sm opacity-70' : 'blur-0 opacity-100'
                    }`}
                    transformation={[
                      { 
                        width: 1400,
                        quality: 90
                      }
                    ]}
                    onLoad={handleModalImageLoad}
                  />
                  
                  {/* Loading Spinner Overlay - Appears after 1 second delay */}
                  {isModalImageLoading && showLoadingIndicator && (
                    <div className="absolute inset-0 flex items-center justify-center z-30 rounded-lg">
                      <div className="flex flex-col items-center gap-3 bg-black/40 px-4 py-3 rounded-lg backdrop-blur-sm">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                        <p className="text-white text-xs">Loading...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 px-3 py-1 bg-black/70 text-white text-sm rounded-full border border-white/20 backdrop-blur-sm">
                  {currentModalIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </div>
        )}

        <style jsx global>{`
          /* Custom pagination styling */
          .swiper-pagination-custom .swiper-pagination-bullet {
            width: 12px !important;
            height: 12px !important;
            background: rgba(255, 255, 255, 0.4) !important;
            border: 2px solid rgba(255, 255, 255, 0.6) !important;
            opacity: 1 !important;
            margin: 0 6px !important;
            transition: all 0.3s ease !important;
          }
          
          .swiper-pagination-custom .swiper-pagination-bullet-active {
            background: white !important;
            border-color: white !important;
            transform: scale(1.2) !important;
          }
          
          /* Hide default navigation and pagination since we're using custom ones */
          .swiper-button-next,
          .swiper-button-prev,
          .swiper-pagination {
            display: none !important;
          }
        `}</style>
      </div>
    </ImageKitProvider>
  );
};

export default SwiperImageCarousel;