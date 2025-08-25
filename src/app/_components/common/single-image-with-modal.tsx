"use client"

import { useState } from "react";
import { ImageKitProvider } from "@imagekit/next";
import ImageModal from "./image-modal";

interface SingleImageWithModalProps {
  src: string;
  alt: string;
  orientation?: 'portrait' | 'landscape';
}

const SingleImageWithModal = ({ 
  src, 
  alt, 
  orientation = 'landscape' 
}: SingleImageWithModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract base URL without transformation for modal
  const getBaseImageUrl = (url: string) => {
    return url.split('?tr=')[0]; // Remove the ?tr=... part
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const baseImageUrl = getBaseImageUrl(src);

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

        <ImageModal
          images={[baseImageUrl]} // Pass base URL without named transformation
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