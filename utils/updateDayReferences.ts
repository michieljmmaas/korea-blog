import { getBlogForNumber } from "@/lib/dayService";
import twemoji from "twemoji";

/**
 * Processes <Day X> references in markdown/HTML content and converts them to links.
 * Each element carries a `data-day-info` attribute (URL-encoded JSON) consumed by
 * DayLinkWithTooltip to render a hover preview using the real DayCard component.
 */
export async function processDayReferences(
    content: string,
    basePath: string = "../day/"
): Promise<string> {
    const dayPattern = /<Day\s+(\d+)>/g;
    const matches = Array.from(content.matchAll(dayPattern));

    if (matches.length === 0) {
        return content;
    }

    const replacements = await Promise.all(
        matches.map(async (match) => {
            const dayNum = parseInt(match[1], 10);

            try {
                const dayData = await getBlogForNumber(dayNum);

                if (!dayData) {
                    return {
                        original: match[0],
                        replacement: `<span class="dayLink">Day ${dayNum}</span>`,
                    };
                }

                const hoverInfo = encodeURIComponent(
                    JSON.stringify({
                        date:          dayData.date,
                        formattedDate: dayData.date,
                        day:           dayData.day,
                        title:         dayData.title,
                        description:   dayData.description,
                        icon:          dayData.icon,
                        location:      dayData.location,
                        stats:         dayData.stats,
                    })
                );

                return {
                    original: match[0],
                    replacement: `<a href="${basePath}${dayData.date}" class="dayLink" data-day-info="${hoverInfo}">${dayData.date}</a>`,
                };

            } catch (error) {
                console.warn(`Failed to get blog data for day ${dayNum}:`, error);
                return {
                    original: match[0],
                    replacement: `<span class="dayLink">Day ${dayNum}</span>`,
                };
            }
        })
    );

    let result = content;
    for (const { original, replacement } of replacements) {
        result = result.replace(original, replacement);
    }

    const withFlags = twemoji.parse(result, {
        folder: "svg",
        ext: ".svg",
        className: "emoji-flag",
    });

    return withFlags;
}

/**
 * Processes <Blog {slug} desc="Text for hyperlink"> references and converts them to links
 * 
 * @param content - The markdown or HTML string to process
 * @param basePath - Optional base path for the links (defaults to "/blogs/")
 * @returns The processed content with Blog references converted to links
 */
export function processBlogReferences(
    content: string,
    basePath: string = "/blogs/"
): string {
    // Regular expression to match <Blog {slug} desc="description text">
    const blogPattern = /<Blog\s+([^\s]+)\s+desc="([^"]+)">/g;

    const result = content.replace(blogPattern, (match, slug, description) => {
        return `<a href="${basePath}${slug}" class="dayLink">${description}</a>`;
    });

    return result;
}

/**
 * Extracts all day numbers from <Day X> references in the content
 * Useful for batch processing or validation
 * 
 * @param content - The content to scan for day references
 * @returns Array of unique day numbers found
 */
export function extractDayNumbers(content: string): number[] {
    const dayPattern = /<Day\s+(\d+)>/g;
    const dayNumbers: Set<number> = new Set();
    let match;

    while ((match = dayPattern.exec(content)) !== null) {
        dayNumbers.add(parseInt(match[1], 10));
    }

    return Array.from(dayNumbers).sort((a, b) => a - b);
}

/**
 * Extracts all blog references from the content
 * 
 * @param content - The content to scan for blog references
 * @returns Array of objects containing slug and description
 */
export function extractBlogReferences(content: string): Array<{ slug: string; description: string }> {
    const blogPattern = /<Blog\s+([^\s]+)\s+desc="([^"]+)">/g;
    const blogRefs: Array<{ slug: string; description: string }> = [];
    let match;

    while ((match = blogPattern.exec(content)) !== null) {
        blogRefs.push({
            slug: match[1],
            description: match[2]
        });
    }

    return blogRefs;
}

/**
 * Advanced processor that allows custom replacement logic for each day reference
 * 
 * @param content - The content to process
 * @param replaceFn - Custom async function that takes a day number and returns the replacement string
 * @returns The processed content
 */
export async function processDayReferencesWithCallback(
    content: string,
    replaceFn: (dayNumber: number) => Promise<string>
): Promise<string> {
    const dayPattern = /<Day\s+(\d+)>/g;
    const matches = Array.from(content.matchAll(dayPattern));

    if (matches.length === 0) {
        return content;
    }

    const replacements = await Promise.all(
        matches.map(async (match) => {
            const dayNum = parseInt(match[1], 10);
            const replacement = await replaceFn(dayNum);
            return {
                original: match[0],
                replacement
            };
        })
    );

    let result = content;
    for (const { original, replacement } of replacements) {
        result = result.replace(original, replacement);
    }

    return result;
}

/**
 * Validates if day references exist in the content
 * 
 * @param content - The content to check
 * @returns Boolean indicating if any day references were found
 */
export function hasDayReferences(content: string): boolean {
    const dayPattern = /<Day\s+(\d+)>/;
    return dayPattern.test(content);
}

/**
 * Validates if blog references exist in the content
 * 
 * @param content - The content to check
 * @returns Boolean indicating if any blog references were found
 */
export function hasBlogReferences(content: string): boolean {
    const blogPattern = /<Blog\s+([^\s]+)\s+desc="[^"]+">/;
    return blogPattern.test(content);
}