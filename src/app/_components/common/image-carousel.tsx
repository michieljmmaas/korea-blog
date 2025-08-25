"use client"

import { useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { ImageKitProvider, Image } from "@imagekit/next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ImageModal from "./image-modal";

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
    setCurrentModalIndex((prev) => prev === 0 ? images.length - 1 : prev - 1);
  };

  const goToNext = () => {
    setCurrentModalIndex((prev) => prev === images.length - 1 ? 0 : prev + 1);
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
          
          {/* Custom Navigation Buttons */}
          <div className="swiper-button-prev-custom absolute left-2 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm border border-white/20">
            <ChevronLeft className="w-5 h-5 text-white" />
          </div>
          <div className="swiper-button-next-custom absolute right-2 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm border border-white/20">
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
          
          {/* Custom Pagination */}
          <div className="swiper-pagination-custom absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-2"></div>
        </Swiper>

        {/* Modal */}
        <ImageModal
          images={images}
          currentIndex={currentModalIndex}
          isOpen={isModalOpen}
          onClose={closeModal}
          onNext={goToNext}
          onPrevious={goToPrevious}
          alt={alt}
        />

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