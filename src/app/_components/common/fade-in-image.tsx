import { useState } from "react";
import Image from "./app-image";

interface FadeInImageProps {
  src: string;
  width: number;
  height: number;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
}

const FadeInImage = ({
  src,
  width,
  height,
  alt,
  className,
  loading,
  priority,
}: FadeInImageProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt={alt}
      className={`${className} transition-opacity duration-500 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
      loading={loading}
      priority={priority}
      onLoad={() => setLoaded(true)}
    />
  );
};

export default FadeInImage;
