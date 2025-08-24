export interface ImageMapping {
  [photoId: number]: {
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
export function createImageMapping(weekData: WeekData): ImageMapping {
  const mapping: ImageMapping = {};
  
  weekData.photos.forEach(photoId => {
    const basePath = `/weeks/${weekData.index}/photos/${photoId}.heic`;
    
    mapping[photoId] = {
      // Portrait version - good for images taller than wide
      portrait: `${IMAGEKIT_CONFIG.endpoint}${basePath}?tr=n-${IMAGEKIT_CONFIG.transformations.portrait}`,
      // Landscape version - good for images wider than tall or full-width display
      landscape: `${IMAGEKIT_CONFIG.endpoint}${basePath}?tr=n-${IMAGEKIT_CONFIG.transformations.landscape}`,
      // Alt text using week context
      alt: `Photo ${photoId} from ${weekData.title}`
    };
  });
  
  return mapping;
}

/**
 * Enhanced version with more options
 */
interface ImageOptions {
  transformation?: 'portrait' | 'landscape' | 'thumbnail';
  customTransformation?: string;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}

export function getImageUrl(
  weekData: WeekData, 
  photoId: number, 
  options: ImageOptions = {}
): string | null {
  if (!weekData.photos.includes(photoId)) {
    console.warn(`Photo ${photoId} not found in week ${weekData.index}`);
    return null;
  }
  
  const basePath = `/weeks/${weekData.index}/photos/${photoId}.heic`;
  const transformation = options.customTransformation || 
                        IMAGEKIT_CONFIG.transformations[options.transformation || 'landscape'];
  
  let url = `${IMAGEKIT_CONFIG.endpoint}${basePath}?tr=n-${transformation}`;
  
  // Add format if specified
  if (options.format && options.format !== 'auto') {
    url += `,f-${options.format}`;
  }
  
  return url;
}

import { WeekData } from "@/app/types";
/**
 * Updated markdown processor with ImageKit integration
 */
import { remark } from "remark";
import html from "remark-html";

function processCustomImages(markdown: string, weekData: WeekData): string {
  const imageMapping = createImageMapping(weekData);
  
  // Enhanced regex to support orientation specification
  // <Img 1 /> - defaults to landscape
  // <Img 1 portrait /> - uses portrait transformation
  // <Img 1 alt="Custom alt" /> - custom alt text
  // <Img 1 portrait alt="Custom alt" />
  const imgRegex = /<Img\s+(\d+)(?:\s+(portrait|landscape))?(?:\s+alt="([^"]*)")?\s*\/>/g;
  
  return markdown.replace(imgRegex, (match, photoIdStr, orientation, altText) => {
    const photoId = parseInt(photoIdStr, 10);
    const imageData = imageMapping[photoId];
    
    if (!imageData) {
      console.warn(`Image ${photoId} not found for week ${weekData.index}`);
      return `<!-- Image ${photoId} not found -->`;
    }
    
    // Determine which URL to use
    const usePortrait = orientation === 'portrait';
    const imageUrl = usePortrait ? imageData.portrait : imageData.landscape;
    const alt = altText || imageData.alt;
    
    // Return HTML with centering instead of markdown
    return `<div class="image-container" style="text-align: center; margin: 2rem 0;">
  <img src="${imageUrl}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" loading="lazy" />
</div>`;
  });
}

export default async function markdownToHtml(markdown: string, weekData: WeekData) {
  // Process custom image tags with week context
  const processedMarkdown = processCustomImages(markdown, weekData);
  
  const result = await remark().use(html).process(processedMarkdown);
  return result.toString();
}