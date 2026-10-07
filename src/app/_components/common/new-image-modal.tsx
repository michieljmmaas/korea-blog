"use client"

import Lightbox, { IconButton, NextIcon, useController, useLightboxState } from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { withBasePath } from "../../../../utils/basePath";

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  alt?: string;
}

const NextButton = ({ onClose }: { onClose: () => void }) => {
  const { currentIndex, slides } = useLightboxState();
  const { next } = useController();
  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <IconButton
      label="Next"
      icon={NextIcon}
      onClick={isLastSlide ? onClose : () => next()}
    />
  );
};

const ImageModal = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
  alt = "Image"
}: ImageModalProps) => {

  // images are local display-tier paths (public/photos/display/...); the
  // lightbox renders plain <img> internally, so basePath isn't automatic here.
  const slides = images.map((image, index) => ({
    src: withBasePath(image),
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
        finite: true,
        preload: 1,
      }}
      render={{
        buttonPrev: images.length <= 1 ? () => null : undefined,
        buttonNext: images.length <= 1 ? () => null : () => <NextButton onClose={onClose} />,
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
