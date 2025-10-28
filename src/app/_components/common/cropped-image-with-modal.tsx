"use client"

import { useState } from "react";
import { ImageKitProvider } from "@imagekit/next";
import ImageModal from "./new-image-modal";

interface CroppedImageWithModalProps {
  src: string;
  alt: string;
  description?: string;
  cropHeight?: number;
  cropWidth?: number;
}

const CroppedImageWithModal = ({ 
  src, 
  alt, 
  description,
  cropHeight = 300,
  cropWidth = 600
}: CroppedImageWithModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract base URL without transformation for modal
  const getBaseImageUrl = (url: string) => {
    return url.split('?tr=')[0]; // Remove the ?tr=... part
  };

  // Add ImageKit transformations for cropping
  const getCroppedImageUrl = (url: string) => {
    const baseUrl = getBaseImageUrl(url);
    // Use ImageKit's crop transformation with focus on center
    // h = height, w = width, c = crop mode, fo = focus
    return `${baseUrl}?tr=h-${cropHeight},w-${cropWidth},c-maintain_ratio,fo-center`;
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const baseImageUrl = getBaseImageUrl(src);
  const croppedImageUrl = getCroppedImageUrl(src);

  return (
    <ImageKitProvider urlEndpoint="https://ik.imagekit.io/yyahqsrfe">
      <div className="imageContainer landscape">
        <div 
          className="cursor-pointer"
          onClick={openModal}
        >
          <img
            src={croppedImageUrl}
            alt={alt}
            loading="lazy"
            style={{ 
              cursor: 'pointer',
              width: '100%',
              height: 'auto',
              display: 'block'
            }}
          />
        </div>

        {/* Description */}
        {description && (
          <div className="image-description">
            {description}
          </div>
        )}

        <ImageModal
          images={[baseImageUrl]}
          currentIndex={0}
          isOpen={isModalOpen}
          onClose={closeModal}
          alt={alt}
        />
      </div>
    </ImageKitProvider>
  );
};

export default CroppedImageWithModal;