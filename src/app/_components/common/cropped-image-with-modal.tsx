"use client"

import { useState } from "react";
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

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="imageContainer landscape">
      <div
        className="cursor-pointer"
        onClick={openModal}
        style={{
          width: '100%',
          aspectRatio: `${cropWidth} / ${cropHeight}`,
          overflow: 'hidden',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          style={{
            cursor: 'pointer',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
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
        images={[src]}
        currentIndex={0}
        isOpen={isModalOpen}
        onClose={closeModal}
        alt={alt}
      />
    </div>
  );
};

export default CroppedImageWithModal;
