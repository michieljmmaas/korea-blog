"use client"

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  alt?: string;
}

const ImageModal = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
  alt = "Image"
}: ImageModalProps) => {

  // images are already local display-tier paths (public/photos/display/...)
  const slides = images.map((image, index) => ({
    src: image,
    alt: `${alt} ${index + 1}`,
  }));

  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      slides={slides}
      index={currentIndex}
      on={{
        view: ({ index }) => {
          // Notify parent component when the index changes
          if (onIndexChange) {
            onIndexChange(index);
          }
        },
      }}
      plugins={[Zoom]}
      zoom={{
        maxZoomPixelRatio: 3,
        scrollToZoom: true,
      }}
      animation={{
        fade: 300,
        swipe: 250,
      }}
      controller={{
        closeOnBackdropClick: true,
      }}
      carousel={{
        finite: images.length === 1,
        preload: 1,
      }}
      render={{
        buttonPrev: images.length <= 1 ? () => null : undefined,
        buttonNext: images.length <= 1 ? () => null : undefined,
      }}
      styles={{
        container: {
          backgroundColor: "rgba(0, 0, 0, 0.95)",
        },
      }}
    />
  );
};

export default ImageModal;
