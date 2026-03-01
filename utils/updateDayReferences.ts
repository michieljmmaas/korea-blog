import { getBlogForNumber, getBlogPostsForDates } from "@/lib/dayService";
import { getBlogPost } from "@/lib/blogService";
import { DayFrontmatter, WeekData } from "@/app/types";
import twemoji from "twemoji";

// ─── Heading utilities ────────────────────────────────────────────────────────

/**
 * Converts a heading string to the same slug format rehype-slug uses
 * (matches github-slugger: lowercase, strip non-word chars, spaces → hyphens)
 */
function slugifyHeading(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

/**
 * Given raw markdown content and an anchor slug, returns the matching ## heading
 * text, or null if no match is found. Only searches ## (h2) headings.
 */
function headingTextForSlug(content: string, slug: string): string | null {
    const headingRegex = /^##\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
        const headingText = match[1].trim();
        if (slugifyHeading(headingText) === slug) {
            return headingText;
        }
    }
    return null;
}

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
    { tag: 'Fri', label: 'Friday',    index: 0 },
    { tag: 'Sat', label: 'Saturday',  index: 1 },
    { tag: 'Sun', label: 'Sunday',    index: 2 },
    { tag: 'Mon', label: 'Monday',    index: 3 },
    { tag: 'Tue', label: 'Tuesday',   index: 4 },
    { tag: 'Wed', label: 'Wednesday', index: 5 },
    { tag: 'Thu', label: 'Thursday',  index: 6 },
] as const;

/**
 * Replaces <Fri>…<Thu> and <Fri link="slug">…<Thu link="slug"> tags with day
 * links that include hover tooltip data. When a link slug is present the label
 * becomes the matching ## heading text from that day's markdown.
 */
export async function processWeekDayTags(
    content: string,
    week: WeekData,
    basePath: string = "../day/"
): Promise<string> {
    // Single pattern that matches all weekday tags with an optional link attribute
    // e.g. <Fri>, <Sat link="some-heading">, <Thu link="morning-hike">
    const weekTagPattern = /<(Fri|Sat|Sun|Mon|Tue|Wed|Thu)(?:\s+link="([^"]+)")?>/g;
    const matches = Array.from(content.matchAll(weekTagPattern));

    if (matches.length === 0) return content;

    // Fetch all days upfront
    const dayPosts = await getBlogPostsForDates(week.days);
    const dayByDate = new Map<string, DayFrontmatter>(
        dayPosts.map((d) => [d.date, d])
    );

    const tagToIndex: Record<string, number> = {
        Fri: 0, Sat: 1, Sun: 2, Mon: 3, Tue: 4, Wed: 5, Thu: 6,
    };
    const tagToLabel: Record<string, string> = {
        Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday', Mon: 'Monday',
        Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday',
    };

    const replacements = await Promise.all(
        matches.map(async (match) => {
            const [original, tag, linkSlug] = match;
            const index = tagToIndex[tag];
            const label = tagToLabel[tag];
            const date  = week.days[index];
            const frontmatter = date ? dayByDate.get(date) : undefined;

            if (!frontmatter || !date) {
                return {
                    original,
                    replacement: `<a href="${basePath}${date ?? ''}" class="dayLink">${label}</a>`,
                };
            }

            const hoverInfo = serializeDayInfo(frontmatter);
            const baseHref  = `${basePath}${date}`;

            if (linkSlug) {
                return {
                    original,
                    replacement: dayLink(`${baseHref}#${linkSlug}`, label, hoverInfo),
                };
            }

            return { original, replacement: dayLink(baseHref, label, hoverInfo) };
        })
    );

    let result = content;
    for (const { original, replacement } of replacements) {
        result = result.replace(original, replacement);
    }
    return result;
}

// ─── <Day X> and <Day X link="..."> references ───────────────────────────────

/**
 * Processes <Day X> and <Day X link="anchor-slug"> references.
 *
 * Without link:  renders as the day's date, links to the day page.
 * With link:     renders as the matching ## heading text (e.g. "Evening walk"),
 *                links to the day page scrolled to that section (#anchor-slug).
 *                Falls back to the date if the heading slug isn't found.
 */
export async function processDayReferences(
    content: string,
    basePath: string = "../day/"
): Promise<string> {
    // Matches both <Day 12> and <Day 12 link="some-section">
    const dayPattern = /<Day\s+(\d+)(?:\s+link="([^"]+)")?>/g;
    const matches = Array.from(content.matchAll(dayPattern));

    if (matches.length === 0) {
        return content;
    }

    const replacements = await Promise.all(
        matches.map(async (match) => {
            const [original, dayNumStr, linkSlug] = match;
            const dayNum = parseInt(dayNumStr, 10);

            try {
                const frontmatter = await getBlogForNumber(dayNum);

                const hoverInfo = serializeDayInfo(frontmatter);
                const baseHref  = `${basePath}${frontmatter.date}`;

                if (linkSlug) {
                    // Anchor link — resolve heading text for the label
                    const href  = `${baseHref}#${linkSlug}`;
                    return { original, replacement: dayLink(href, frontmatter.date, hoverInfo) };
                } else {
                    // Plain day link
                    return { original, replacement: dayLink(baseHref, frontmatter.date, hoverInfo) };
                }

            } catch (error) {
                console.warn(`Failed to get blog data for day ${dayNum}:`, error);
                return {
                    original,
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
    const dayPattern = /<Day\s+(\d+)(?:\s+link="[^"]+")?>/g;
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
    const dayPattern = /<Day\s+(\d+)(?:\s+link="[^"]+")?>/g;
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
    return /<Day\s+\d+(?:\s+link="[^"]+")?>/. test(content);
}

export function hasBlogReferences(content: string): boolean {
    return /<Blog\s+([^\s]+)\s+desc="[^"]+">/.test(content);
}