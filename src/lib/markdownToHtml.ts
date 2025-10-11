/**
 * Updated markdown processor with ImageKit integration, modal support, and GFM tables
 */
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { ImageMapping } from "../../utils/createImageMap";

function processCustomImages(markdown: string, imageMapping: ImageMapping): string {
  // Updated regex to capture desc attribute
  const imgRegex = /<Img\s+([\w-]+)(?:\s+(portrait|landscape))?(?:\s+alt="([^"]*)")?(?:\s+desc="([^"]*)")?\s*\/?>/g;

  return markdown.replace(imgRegex, (match, photoIdStr, orientation, altText, description) => {
    const photoId = photoIdStr;
    const imageData = imageMapping[photoId];

    if (!imageData) {
      console.warn(`Image ${photoId} not found in mapping`);
      return `<-- Image ${photoId} not found - Please tell me about it -->`;
    }

    const usePortrait = orientation === 'portrait';
    const imageUrl = usePortrait ? imageData.portrait : imageData.landscape;
    const alt = altText || imageData.alt;
    const orientationClass = usePortrait ? 'portrait' : 'landscape';

    // Generate a placeholder div with data attributes for React component replacement
    return `<div 
      class="modal-image-placeholder" 
      data-src="${imageUrl}" 
      data-alt="${alt}" 
      data-orientation="${orientationClass}"
      data-photo-id="${photoId}"
      data-description="${description || ''}"
    ></div>`;
  });
}

export default async function markdownToHtml(
  markdown: string,
  imageMapping: ImageMapping,
) {
  // Process custom image tags
  let processedMarkdown = processCustomImages(markdown, imageMapping);

  // Process markdown with HTML support and GFM features (tables, strikethrough, etc.)
  const result = await remark()
    .use(remarkGfm) // Add this for tables, strikethrough, task lists, etc.
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(processedMarkdown);

  return result.toString();
}