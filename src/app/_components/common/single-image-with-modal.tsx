"use client"

import { useState } from "react";
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

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={`imageContainer ${orientation}`}>
      <div
        className="cursor-pointer"
        onClick={openModal}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
        images={[src]}
        currentIndex={0}
        isOpen={isModalOpen}
        onClose={closeModal}
        alt={alt}
      />
    </div>
  );
};

export default SingleImageWithModal;
