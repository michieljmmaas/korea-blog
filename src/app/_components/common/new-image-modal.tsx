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

  // Convert image paths to ImageKit URLs with transformations
  const getImageKitUrl = (path: string, width: number, quality: number) => {
    const baseUrl = "https://ik.imagekit.io/yyahqsrfe";
    // Ensure path starts with / for proper URL construction
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}?tr=w-${width},q-${quality},f-auto`;
  };

  // Prepare slides for YARL with progressive loading
  const slides = images.map((image, index) => ({
    src: getImageKitUrl(image, 1600, 90), // High quality for main view
    alt: `${alt} ${index + 1}`,
    // Provide smaller version for faster initial load
    srcSet: [
      {
        src: getImageKitUrl(image, 800, 75),
        width: 800,
        height: 600,
      },
      {
        src: getImageKitUrl(image, 1200, 80),
        width: 1200,
        height: 900,
      },
      {
        src: getImageKitUrl(image, 1600, 90),
        width: 1600,
        height: 1200,
      },
    ],
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