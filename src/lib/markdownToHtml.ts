/**
 * Updated markdown processor with ImageKit integration and day links
 */
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { ImageMapping } from "../../utils/createWeekImageMap";

// Interface for day link mapping
export interface DayLinkMapping {
  [dayAbbrev: string]: {
    fullName: string;
    url: string;
  };
}

// Day abbreviation to full name mapping
const dayNames: { [key: string]: string } = {
  'Mon': 'Monday',
  'Tue': 'Tuesday',
  'Wed': 'Wednesday',
  'Thu': 'Thursday',
  'Fri': 'Friday',
  'Sat': 'Saturday',
  'Sun': 'Sunday'
};

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

    return `<div class="imageContainer ${orientationClass}">
  <img src="${imageUrl}" alt="${alt}" loading="lazy" />
</div>`;
  });
}

function processCustomDayLinks(markdown: string, dayLinkMapping: DayLinkMapping): string {
  // Regex to match <Mon >, <Tue >, etc. (note the space before >)
  const dayRegex = /<(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*>/g;

  return markdown.replace(dayRegex, (match, dayAbbrev) => {
    // Check if we have a mapping for this day
    if (dayLinkMapping[dayAbbrev]) {
      const { fullName, url } = dayLinkMapping[dayAbbrev];
      return `<a href="${url}" class="dayLink">${fullName}</a>`;
    }

    // Fallback: use default full name without link if no mapping provided
    const fullName = dayNames[dayAbbrev] || dayAbbrev;
    return `<span class="dayLink">${fullName}</span>`;
  });
}

export default async function markdownToHtml(
  markdown: string,
  imageMapping: ImageMapping,
) {

  // Then process custom image tags
  let processedMarkdown = processCustomImages(markdown, imageMapping);

  // Process markdown with HTML support
  const result = await remark()
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(processedMarkdown);

  return result.toString();
}