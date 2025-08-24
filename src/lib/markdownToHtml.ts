/**
 * Updated markdown processor with ImageKit integration
 */
import { WeekData } from "@/app/types";
import { remark } from "remark";
import html from "remark-html";
import { createImageMapping, ImageMapping } from "../../utils/createWeekImageMap";

function processCustomImages(markdown: string, imageMapping: ImageMapping): string {

  // Enhanced regex to support orientation specification
  // <Img 1 /> - defaults to landscape
  // <Img 1 portrait /> - uses portrait transformation
  // <Img 1 alt="Custom alt" /> - custom alt text
  // <Img 1 portrait alt="Custom alt" />
  const imgRegex = /<Img\s+(\d+)(?:\s+(portrait|landscape))?(?:\s+alt="([^"]*)")?\s*\/>/g;

  return markdown.replace(imgRegex, (match, photoIdStr, orientation, altText) => {
    const photoId = parseInt(photoIdStr, 10);
    const imageData = imageMapping[photoId];

    // Determine which URL to use
    const usePortrait = orientation === 'portrait';
    const imageUrl = usePortrait ? imageData.portrait : imageData.landscape;
    const alt = altText || imageData.alt;

    return `![${alt}](${imageUrl})`;
  });
}

export default async function markdownToHtml(markdown: string, imageMapping: ImageMapping) {
  // Process custom image tags with week context
  const processedMarkdown = processCustomImages(markdown, imageMapping);

  const result = await remark().use(html).process(processedMarkdown);
  return result.toString();
}