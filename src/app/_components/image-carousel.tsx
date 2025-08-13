"use client"

import { useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { ImageKitProvider, Image } from "@imagekit/next";
import { X} from "lucide-react";

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

  const openModal = (index: number) => {
    setCurrentModalIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToPrevious = () => {
    setCurrentModalIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentModalIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
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
          navigation={true}
          pagination={{
            clickable: true,
          }}
          loop={true}
          modules={[Navigation, Pagination]}
          className="w-full h-64 sm:h-80 md:h-96 rounded-lg"
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
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* High-Res Modal */}
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeModal();
                }}
                className="absolute -top-2 -right-2 z-50 h-10 w-10 bg-black/70 hover:bg-black/90 text-white rounded-full border border-white/20 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              {/* High resolution image */}
              <Image
                src={images[currentModalIndex]}
                width={1600}
                height={1600}
                alt={`${alt} ${currentModalIndex + 1} - Full size`}
                className="w-auto h-auto max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
                transformation={[
                  { named: "modal-full-aspect" }
                ]}
              />
              
              {/* Navigation in modal */}
              {images.length > 1 && (
                <>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevious();
                    }}
                    className="absolute left-0 top-0 w-1/3 h-full cursor-pointer flex items-center justify-start pl-4 z-20"
                  >
                  </div>
                  
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNext();
                    }}
                    className="absolute right-0 top-0 w-1/3 h-full cursor-pointer flex items-center justify-end pr-4 z-20"
                  >
                  </div>
                </>
              )}
            </div>
          </div>
        )}

<style jsx global>{`
          .swiper-button-next,
          .swiper-button-prev {
            color: white !important;
            background: none !important;
            width: 40px !important;
            height: 40px !important;
            margin-top: -20px !important;
            border-radius: 0 !important;
          }
          
          .swiper-button-next::before,
          .swiper-button-prev::before {
            display: none !important;
          }
          
          .swiper-button-next:after,
          .swiper-button-prev:after {
            font-size: 20px !important;
            font-weight: bold !important;
            background: none !important;
          }
          
          .swiper-pagination-bullet {
            background: rgba(255, 255, 255, 0.5) !important;
          }
          
          .swiper-pagination-bullet-active {
            background: white !important;
          }
        `}</style>
      </div>
    </ImageKitProvider>
  );
};

export default SwiperImageCarousel;