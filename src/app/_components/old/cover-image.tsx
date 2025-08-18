"use client";

import Link from "next/link";
import { Image, ImageKitProvider } from '@imagekit/next';

type Props = {
  title: string;
  src: string;
  slug?: string;
};



const CoverImage = ({ title, slug }: Props) => {
  const image = (
    <ImageKitProvider urlEndpoint="https://ik.imagekit.io/yyahqsrfe">
      <Image
        src="/2025-09-26/art.heic"
        width={2000}
        height={1000}
        alt="Picture of the author"
        transformation={[{ width: 1000, height: 500 }]}
      />
    </ImageKitProvider>
  );
  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link href={`/posts/${slug}`} aria-label={title}>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  );
};

export default CoverImage;
