import { Image } from "@imagekit/next";

interface Props {
    source: string;
    width?: number;
    height?: number;
    alt: string;
    priority?: boolean;
    sizes?: string;
    className?: string;
    fill?: boolean; // Add this for container-filling behavior
}

// Relies on the <ImageKitProvider> mounted once in the root layout.
export function ImageKitImage({
    source,
    width,
    height,
    alt,
    priority,
    sizes,
    className,
    fill = false
}: Props) {
    return (
        <Image
            src={source}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            fill={fill}
            alt={alt}
            priority={priority}
            sizes={sizes}
            className={className}
        />
    )
}