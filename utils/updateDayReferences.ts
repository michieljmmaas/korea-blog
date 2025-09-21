import { getBlogForNumber } from "@/lib/dayService";
import twemoji from "twemoji";

/**
 * Processes <Day X> references in markdown/HTML content and converts them to links
 * 
 * @param content - The markdown or HTML string to process
 * @param basePath - Optional base path for the links (defaults to "../day/")
 * @returns The processed content with Day references converted to links
 */
export async function processDayReferences(
    content: string,
    basePath: string = "../day/"
): Promise<string> {
    // Regular expression to match <Day X> where X is one or more digits
    const dayPattern = /<Day\s+(\d+)>/g;

    // Find all matches first
    const matches = Array.from(content.matchAll(dayPattern));

    if (matches.length === 0) {
        return content;
    }

    // Process all matches asynchronously
    const replacements = await Promise.all(
        matches.map(async (match) => {
            const dayNum = parseInt(match[1], 10);

            try {
                const dayData = await getBlogForNumber(dayNum);

                if (!dayData) {
                    // Day not found - show as non-clickable
                    return {
                        original: match[0],
                        replacement: `<span class="dayLink">Day ${dayNum}</span>`
                    };
                }

                if (dayData.draft === false) {
                    // Published day - clickable link
                    return {
                        original: match[0],
                        replacement: `<a href="${basePath}${dayData.date}" class="dayLink">${dayData.date}</a>`
                    };
                } else {
                    // Draft day - non-clickable span
                    return {
                        original: match[0],
                        replacement: `<span class="dayLink">${dayData.date}</span>`
                    };
                }
            } catch (error) {
                console.warn(`Failed to get blog data for day ${dayNum}:`, error);
                // Fallback to non-clickable span if database call fails
                return {
                    original: match[0],
                    replacement: `<span class="dayLink">Day ${dayNum}</span>`
                };
            }
        })
    );

    // Apply all replacements
    let result = content;
    for (const { original, replacement } of replacements) {
        result = result.replace(original, replacement);
    }

    const withFlags = twemoji.parse(result, {
        folder: "svg",
        ext: ".svg",
        className: "emoji-flag"
    });


    return withFlags;
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