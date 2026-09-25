import { DayService } from "@/lib/dayService";
import { BlogService } from "@/lib/blogService";
import { DayFrontmatter, WeekData } from "@/app/types";
import twemoji from "twemoji";
import { withBasePath } from "./basePath";

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
            tags:         day.tags,
            score:        day.score,
            rank:         day.rank,
        })
    );
}

function dayLink(href: string, label: string, hoverInfo: string): string {
    return `<a href="${href}" class="dayLink" data-day-info="${hoverInfo}">${label}</a>`;
}

// Byte ranges of fenced (```/~~~) and inline (`...`) code in the raw markdown,
// so a literal tag written as an example (e.g. `<Day 5>` in a post explaining
// this syntax) isn't mistaken for a real reference.
function getCodeRanges(content: string): Array<[number, number]> {
    const ranges: Array<[number, number]> = [];

    const fencedPattern = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1/gm;
    for (const match of content.matchAll(fencedPattern)) {
        const start = match.index ?? 0;
        ranges.push([start, start + match[0].length]);
    }

    const inlinePattern = /`[^`\n]+`/g;
    for (const match of content.matchAll(inlinePattern)) {
        const start = match.index ?? 0;
        ranges.push([start, start + match[0].length]);
    }

    return ranges;
}

function isInsideCode(ranges: Array<[number, number]>, index: number): boolean {
    return ranges.some(([start, end]) => index >= start && index < end);
}

// Finds every match of `pattern` in `content`, excluding ones that fall
// inside fenced or inline code.
function findTagMatches(content: string, pattern: RegExp): RegExpMatchArray[] {
    const codeRanges = getCodeRanges(content);
    return Array.from(content.matchAll(pattern)).filter(
        (match) => !isInsideCode(codeRanges, match.index ?? 0)
    );
}

// Resolves each match to its replacement (via `resolve`, which may need to
// look up day/blog data asynchronously) and substitutes them all into
// `content`. Shared tail end of every tag-processing function below.
async function applyReplacements(
    content: string,
    matches: RegExpMatchArray[],
    resolve: (match: RegExpMatchArray) => Promise<string>
): Promise<string> {
    if (matches.length === 0) return content;

    const replacements = await Promise.all(
        matches.map(async (match) => ({
            original: match[0],
            replacement: await resolve(match),
        }))
    );

    let result = content;
    for (const { original, replacement } of replacements) {
        result = result.replace(original, replacement);
    }
    return result;
}

// ─── <Fri>…<Thu> and <Fri link="...">…<Thu link="..."> weekday tags ──────────

const WEEK_TAG_PATTERN = /<(Fri|Sat|Sun|Mon|Tue|Wed|Thu)(?:\s+link="([^"]+)")?>/g;

const tagToIndex: Record<string, number> = {
    Fri: 0, Sat: 1, Sun: 2, Mon: 3, Tue: 4, Wed: 5, Thu: 6,
};
const tagToLabel: Record<string, string> = {
    Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday', Mon: 'Monday',
    Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday',
};

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
    const matches = findTagMatches(content, WEEK_TAG_PATTERN);
    if (matches.length === 0) return content;

    // Fetch all days upfront
    const dayPosts = await DayService.getBlogPostsForDates(week.days);
    const dayByDate = new Map<string, DayFrontmatter>(
        dayPosts.map((d) => [d.date, d])
    );

    return applyReplacements(content, matches, async (match) => {
        const [, tag, linkSlug] = match;
        const index = tagToIndex[tag];
        const label = tagToLabel[tag];
        const date  = week.days[index];
        const frontmatter = date ? dayByDate.get(date) : undefined;

        if (!frontmatter || !date) {
            return `<a href="${basePath}${date ?? ''}" class="dayLink">${label}</a>`;
        }

        const hoverInfo = serializeDayInfo(frontmatter);
        const baseHref  = `${basePath}${date}`;

        if (linkSlug) {
            return dayLink(`${baseHref}#${linkSlug}`, label, hoverInfo);
        }

        return dayLink(baseHref, label, hoverInfo);
    });
}

// ─── <Day X> and <Day X link="..."> references ───────────────────────────────

const DAY_PATTERN = /<Day\s+(\d+)(?:\s+link="([^"]+)")?>/g;

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
    const matches = findTagMatches(content, DAY_PATTERN);
    if (matches.length === 0) return content;

    const replaced = await applyReplacements(content, matches, async (match) => {
        const [, dayNumStr, linkSlug] = match;
        const dayNum = parseInt(dayNumStr, 10);

        try {
            const frontmatter = await DayService.getBlogForNumber(dayNum);

            const hoverInfo = serializeDayInfo(frontmatter);
            const baseHref  = `${basePath}${frontmatter.date}`;

            if (linkSlug) {
                // Anchor link — resolve heading text for the label
                const href = `${baseHref}#${linkSlug}`;
                return dayLink(href, frontmatter.date, hoverInfo);
            }

            // Plain day link
            return dayLink(baseHref, frontmatter.date, hoverInfo);
        } catch (error) {
            console.warn(`Failed to get blog data for day ${dayNum}:`, error);
            return `<span class="dayLink">Day ${dayNum}</span>`;
        }
    });

    return twemoji.parse(replaced, {
        folder: "svg",
        ext: ".svg",
        className: "emoji-flag",
    });
}

// ─── <Blog slug desc="…"> references ─────────────────────────────────────────

const BLOG_PATTERN = /<Blog\s+([^\s]+)\s+desc="([^"]+)">/g;

/**
 * Processes <Blog {slug} desc="…"> references and converts them to links with hover data.
 */
export async function processBlogReferences(
    content: string,
    basePath: string = "/blogs/"
): Promise<string> {
    const matches = findTagMatches(content, BLOG_PATTERN);
    if (matches.length === 0) return content;

    return applyReplacements(content, matches, async (match) => {
        const [, slug, description] = match;

        const href = withBasePath(`${basePath}${slug}`);

        try {
            const post = await BlogService.getBlogPost(slug);

            if (!post) {
                return `<a href="${href}" class="dayLink">${description}</a>`;
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

            return `<a href="${href}" class="dayLink" data-blog-info="${hoverInfo}">${description}</a>`;
        } catch (error) {
            console.warn(`Failed to get blog post data for slug "${slug}":`, error);
            return `<a href="${href}" class="dayLink">${description}</a>`;
        }
    });
}
