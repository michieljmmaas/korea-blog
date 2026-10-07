'use client';

import NextImage, { type ImageProps } from 'next/image';
import imageLoader from '../../../../utils/imageLoader';

// next.config.js's images.loaderFile wiring only takes effect under webpack (the
// production build), not Turbopack (`next dev --turbopack`), so every <Image> here
// passes the loader explicitly instead of relying on that config. This has to be a
// client component: passing a function prop into next/image from a server component
// would otherwise fail RSC serialization.
export default function AppImage(props: Omit<ImageProps, 'loader'>) {
  return <NextImage loader={imageLoader} {...props} />;
}
