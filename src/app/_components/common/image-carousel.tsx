"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import { ImageKitProvider, Image } from "@imagekit/next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ImageModal from "./new-image-modal";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";

interface SwiperImageCarouselProps {
  images: string[];
  alt?: string;
}

const SwiperImageCarousel = ({
  images,
  alt = "Travel photo",
}: SwiperImageCarouselProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModalIndex, setCurrentModalIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);

  const openModal = (index: number) => {
    setCurrentModalIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleModalIndexChange = (index: number) => {
    setCurrentModalIndex(index);
    // Update the main swiper to match the modal
    if (mainSwiper && !mainSwiper.destroyed) {
      mainSwiper.slideToLoop(index);
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
      <div className="w-full mx-auto space-y-4">
        {/* Main Carousel */}
        <div className="relative">
          <Swiper
            spaceBetween={10}
            navigation={{
              enabled: true,
              prevEl: ".swiper-button-prev-custom",
              nextEl: ".swiper-button-next-custom",
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination-custom",
            }}
            loop={true}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            modules={[Navigation, Pagination, Thumbs]}
            onSwiper={setMainSwiper}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
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
                    transformation={[
                      {
                        named: "carousel-optimized",
                      },
                    ]}
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

            {/* Image Counter */}
            <div className="absolute top-4 right-4 z-10 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm border border-white/20">
              {activeIndex + 1} / {images.length}
            </div>
          </Swiper>
        </div>

        {/* Thumbnail Preview */}
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={4}
          breakpoints={{
            640: {
              slidesPerView: 5,
            },
            768: {
              slidesPerView: 6,
            },
            1024: {
              slidesPerView: 8,
            },
          }}
          watchSlidesProgress={true}
          modules={[Navigation, Thumbs]}
          className="w-full"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div
                className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                  activeIndex === index
                    ? "ring-2 ring-blue-500 ring-offset-2"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={image}
                  width={150}
                  height={100}
                  alt={`${alt} thumbnail ${index + 1}`}
                  className="w-full h-16 sm:h-20 object-cover"
                  transformation={[
                    {
                      height: "100",
                      width: "150",
                    },
                  ]}
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <ImageModal
          images={images}
          currentIndex={currentModalIndex}
          isOpen={isModalOpen}
          onClose={closeModal}
          onIndexChange={handleModalIndexChange}
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