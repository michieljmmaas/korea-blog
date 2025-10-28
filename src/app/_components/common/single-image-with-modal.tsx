"use client"

import { useState } from "react";
import { ImageKitProvider } from "@imagekit/next";
import ImageModal from "./new-image-modal";

interface SingleImageWithModalProps {
  src: string;
  alt: string;
  orientation?: 'portrait' | 'landscape';
  description?: string;
}

const SingleImageWithModal = ({ 
  src, 
  alt, 
  orientation = 'landscape',
  description 
}: SingleImageWithModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract the path from full ImageKit URL
  const getImagePath = (url: string) => {
    // If it's a full ImageKit URL, extract just the path
    if (url.includes('ik.imagekit.io/yyahqsrfe')) {
      // Remove base URL and any transformations
      const path = url.replace('https://ik.imagekit.io/yyahqsrfe', '').split('?')[0];
      return path;
    }
    // If it's already just a path, return as-is
    return url.split('?')[0];
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const imagePath = getImagePath(src);

  return (
    <ImageKitProvider urlEndpoint="https://ik.imagekit.io/yyahqsrfe">
      <div className={`imageContainer ${orientation}`}>
        <div 
          className="cursor-pointer"
          onClick={openModal}
        >
          {/* Use regular img tag to preserve the exact transformation in the URL */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            style={{ cursor: 'pointer' }}
          />
        </div>

        {/* Description */}
        {description && (
          <div className="image-description">
            {description}
          </div>
        )}

        <ImageModal
          images={[imagePath]} // Pass just the path (e.g., /days/2025-10-25/pizza)
          currentIndex={0}
          isOpen={isModalOpen}
          onClose={closeModal}
          alt={alt}
        />
      </div>
    </ImageKitProvider>
  );
};

export default SingleImageWithModal;