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

  // Extract just the path from ImageKit URL (remove domain and transformations)
  const getImagePath = (url: string) => {
    // Remove transformations first
    const withoutTransforms = url.split('?tr=')[0];
    // Remove the ImageKit domain to get just the path
    const path = withoutTransforms.replace('https://ik.imagekit.io/yyahqsrfe/', '');
    return path.startsWith('/') ? path : `/${path}`;
  };

  // Add ImageKit transformations for cropping
  const getCroppedImageUrl = (url: string) => {
    const baseUrl = url.split('?tr=')[0]; // Remove existing transforms
    return `${baseUrl}?tr=h-${cropHeight},w-${cropWidth},c-maintain_ratio,fo-center`;
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const imagePath = getImagePath(src);
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
          images={[imagePath]} // Pass just the path: "/food/hotdog"
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