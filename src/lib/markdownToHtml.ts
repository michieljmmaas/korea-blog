/**
 * Updated markdown processor with ImageKit integration, modal support, and GFM tables
 */
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { ImageMapping } from "../../utils/createImageMap";

function processCustomImages(markdown: string, imageMapping: ImageMapping): string {
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
  let processedMarkdown = processCustomImages(markdown, imageMapping);

  const result = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)   // adds id="..." to all headings based on their text
    .use(rehypeStringify)
    .process(processedMarkdown);

  return result.toString();
}