import { getBlogForNumber } from "@/lib/dayService";
import { getBlogPost } from "@/lib/blogService";
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
 * Processes <Blog {slug} desc="Text for hyperlink"> references and converts them to links.
 * Each link carries a `data-blog-info` attribute (URL-encoded JSON) consumed by
 * BlogLinkWithTooltip to render a hover preview using the real BlogPostCard component.
 */
export async function processBlogReferences(
    content: string,
    basePath: string = "/blogs/"
): Promise<string> {
    const blogPattern = /<Blog\s+([^\s]+)\s+desc="([^"]+)">/g;
    const matches = Array.from(content.matchAll(blogPattern));

    if (matches.length === 0) {
        return content;
    }

    const replacements = await Promise.all(
        matches.map(async (match) => {
            const [original, slug, description] = match;

            try {
                const post = await getBlogPost(slug);

                if (!post) {
                    // Blog not found - still link, just no hover data
                    return {
                        original,
                        replacement: `<a href="${basePath}${slug}" class="dayLink">${description}</a>`,
                    };
                }

                const hoverInfo = encodeURIComponent(
                    JSON.stringify({
                        slug:        post.slug,
                        title:       post.frontmatter.title,
                        description: post.frontmatter.description,
                        publishdate: post.frontmatter.publishdate,
                        tags:        post.frontmatter.tags,
                        thumb:       post.frontmatter.thumb,
                    })
                );

                return {
                    original,
                    replacement: `<a href="${basePath}${slug}" class="dayLink" data-blog-info="${hoverInfo}">${description}</a>`,
                };

            } catch (error) {
                console.warn(`Failed to get blog post data for slug "${slug}":`, error);
                return {
                    original,
                    replacement: `<a href="${basePath}${slug}" class="dayLink">${description}</a>`,
                };
            }
        })
    );

    let result = content;
    for (const { original, replacement } of replacements) {
        result = result.replace(original, replacement);
    }

    return result;
}

/**
 * Extracts all day numbers from <Day X> references in the content
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
 */
export function extractBlogReferences(content: string): Array<{ slug: string; description: string }> {
    const blogPattern = /<Blog\s+([^\s]+)\s+desc="([^"]+)">/g;
    const blogRefs: Array<{ slug: string; description: string }> = [];
    let match;

    while ((match = blogPattern.exec(content)) !== null) {
        blogRefs.push({ slug: match[1], description: match[2] });
    }

    return blogRefs;
}

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
            return { original: match[0], replacement };
        })
    );

    let result = content;
    for (const { original, replacement } of replacements) {
        result = result.replace(original, replacement);
    }

    return result;
}

export function hasDayReferences(content: string): boolean {
    return /<Day\s+(\d+)>/.test(content);
}

export function hasBlogReferences(content: string): boolean {
    return /<Blog\s+([^\s]+)\s+desc="[^"]+">/.test(content);
}