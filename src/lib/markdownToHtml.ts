/**
 * Updated markdown processor with HTML support
 */
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { ImageMapping } from "../../utils/createWeekImageMap";

function processCustomImages(markdown: string, imageMapping: ImageMapping): string {
  const imgRegex = /<Img\s+(\d+)(?:\s+(portrait|landscape))?(?:\s+alt="([^"]*)")?\s*\/>/g;

  return markdown.replace(imgRegex, (match, photoIdStr, orientation, altText) => {
    const photoId = parseInt(photoIdStr, 10);
    const imageData = imageMapping[photoId];

    if (!imageData) {
      console.warn(`Image ${photoId} not found in mapping`);
      return `<!-- Image ${photoId} not found -->`;
    }

    const usePortrait = orientation === 'portrait';
    const imageUrl = usePortrait ? imageData.portrait : imageData.landscape;
    const alt = altText || imageData.alt;
    const orientationClass = usePortrait ? 'portrait' : 'landscape';

    // Return HTML with CSS classes
    return `<div class="imageContainer ${orientationClass}">
  <img src="${imageUrl}" alt="${alt}" loading="lazy" />
</div>`;
  });
}

export default async function markdownToHtml(markdown: string, imageMapping: ImageMapping) {
  // Process custom image tags first
  const processedMarkdown = processCustomImages(markdown, imageMapping);

  // Process markdown with HTML support
  const result = await remark()
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw) // This allows HTML to pass through
    .use(rehypeStringify)
    .process(processedMarkdown);
    
  return result.toString();
}