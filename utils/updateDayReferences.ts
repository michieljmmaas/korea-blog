import { getBlogForNumber, getBlogPostsForDates } from "@/lib/dayService";
import { getBlogPost } from "@/lib/blogService";
import { DayFrontmatter, WeekData } from "@/app/types";
import twemoji from "twemoji";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function serializeDayInfo(day: DayFrontmatter): string {
    return encodeURIComponent(
        JSON.stringify({
            date:          day.date,
            formattedDate: day.date,
            day:           day.day,
            title:         day.title,
            description:   day.description,
            icon:          day.icon,
            location:      day.location,
            stats:         day.stats,
        })
    );
}

function dayLink(href: string, label: string, hoverInfo: string): string {
    return `<a href="${href}" class="dayLink" data-day-info="${hoverInfo}">${label}</a>`;
}

// ─── Week day tags (<Fri>, <Sat>, …) ─────────────────────────────────────────

const WEEK_DAY_TAGS = [
    { tag: '<Fri>', label: 'Friday',    index: 0 },
    { tag: '<Sat>', label: 'Saturday',  index: 1 },
    { tag: '<Sun>', label: 'Sunday',    index: 2 },
    { tag: '<Mon>', label: 'Monday',    index: 3 },
    { tag: '<Tue>', label: 'Tuesday',   index: 4 },
    { tag: '<Wed>', label: 'Wednesday', index: 5 },
    { tag: '<Thu>', label: 'Thursday',  index: 6 },
] as const;

/**
 * Replaces <Fri>…<Thu> tags with day links that include hover tooltip data.
 * Drop-in async replacement for the inline `simpleReplace` function in the week page.
 */
export async function processWeekDayTags(
    content: string,
    week: WeekData,
    basePath: string = "../day/"
): Promise<string> {
    // Fetch all days for the week in one call
    const dayPosts = await getBlogPostsForDates(week.days);

    // Build a date → TripDay lookup
    const dayByDate = new Map<string, DayFrontmatter>(
        dayPosts.map((d) => [d.date, d])
    );

    let result = content;

    for (const { tag, label, index } of WEEK_DAY_TAGS) {
        if (!result.includes(tag)) continue;

        const date = week.days[index];
        const day  = date ? dayByDate.get(date) : undefined;

        const replacement = day
            ? dayLink(`${basePath}${date}`, label, serializeDayInfo(day))
            : `<a href="${basePath}${date ?? ""}" class="dayLink">${label}</a>`;

        result = result.replaceAll(tag, replacement);
    }

    return result;
}

// ─── <Day X> references ───────────────────────────────────────────────────────

/**
 * Processes <Day X> references and converts them to links with hover data.
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

// ─── <Blog slug desc="…"> references ─────────────────────────────────────────

/**
 * Processes <Blog {slug} desc="…"> references and converts them to links with hover data.
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

// ─── Utilities ────────────────────────────────────────────────────────────────

export function extractDayNumbers(content: string): number[] {
    const dayPattern = /<Day\s+(\d+)>/g;
    const dayNumbers = new Set<number>();
    let match;
    while ((match = dayPattern.exec(content)) !== null) {
        dayNumbers.add(parseInt(match[1], 10));
    }
    return Array.from(dayNumbers).sort((a, b) => a - b);
}

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
    if (matches.length === 0) return content;

    const replacements = await Promise.all(
        matches.map(async (match) => ({
            original:    match[0],
            replacement: await replaceFn(parseInt(match[1], 10)),
        }))
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