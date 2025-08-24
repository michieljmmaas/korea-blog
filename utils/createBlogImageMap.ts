import { BlogPostFrontmatter } from "@/app/types";

export interface ImageMapping {
  [photoId: string]: {
    portrait: string;
    landscape: string;
    alt: string;
  };
}

// ImageKit configuration
const IMAGEKIT_CONFIG = {
  endpoint: 'https://ik.imagekit.io/yyahqsrfe',
  // Named transformations - you'll need to create these in your ImageKit dashboard
  transformations: {
    // Portrait: max width 700px, maintain aspect ratio, format optimization
    portrait: 'blog-portrait', // tr:n-blog-portrait
    // Landscape: max width 1200px, maintain aspect ratio, format optimization  
    landscape: 'blog-landscape', // tr:n-blog-landscape
    // You could also add thumbnail versions
    thumbnail: 'blog-thumb' // tr:n-blog-thumb
  }
};

/**
 * Creates an image mapping for a given week's photos
 */
export function createImageMapping(blog: BlogPostFrontmatter): ImageMapping {
  const mapping: ImageMapping = {};

  blog.photos.forEach(photoId => {
    const basePath = `/blogs/${blog.slug}/photos/${photoId}.heic`;

    mapping[photoId] = {
      // Portrait version - good for images taller than wide
      portrait: `${IMAGEKIT_CONFIG.endpoint}${basePath}?tr=n-${IMAGEKIT_CONFIG.transformations.portrait}`,
      // Landscape version - good for images wider than tall or full-width display
      landscape: `${IMAGEKIT_CONFIG.endpoint}${basePath}?tr=n-${IMAGEKIT_CONFIG.transformations.landscape}`,
      // Alt text using week context
      alt: `Photo ${photoId} from ${blog.slug}`
    };
  });

  return mapping;
}



