"use client";

import cn from "classnames";
import Link from "next/link";
import Image from "next/image";
import dynamic from 'next/dynamic';

type Props = {
  title: string;
  src: string;
  slug?: string;
};


const CldImage = dynamic(
  () => import('next-cloudinary').then(mod => mod.CldImage),
  { 
    ssr: false,
    loading: () => <div className="w-[1500px] h-[500px] bg-gray-200 animate-pulse" />
  }
);

const CoverImage = ({ title, src, slug }: Props) => {
  const image = (
   <CldImage
      src={src} // Use this sample image or upload your own via the Media Explorer
      width="1500" // Transform the image: auto-crop to square aspect_ratio
      height="500"
      priority={true}
      crop={{
        type: 'auto',
        source: true
      }} alt={'alt'}    />
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
