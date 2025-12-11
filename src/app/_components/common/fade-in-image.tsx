import { useState } from "react";
import { Image } from "@imagekit/next";

interface FadeInImageProps {
  src: string;
  width: number;
  height: number;
  alt: string;
  className?: string;
  transformation?: any;
  loading?: "lazy" | "eager";
  priority?: boolean;
}

const FadeInImage = ({
  src,
  width,
  height,
  alt,
  className,
  transformation,
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
      transformation={transformation}
      loading={loading}
      priority={priority}
      onLoad={() => setLoaded(true)}
    />
  );
};

export default FadeInImage;