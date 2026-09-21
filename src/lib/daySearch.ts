import MiniSearch, { SearchOptions } from 'minisearch';
import { TripDay } from '@/app/types';

// Pure, client-safe search over trip days (no `fs`), so it works in a static export.

export interface TextSegment {
  text: string;
  hit: boolean;
}

export interface DaySearchHit {
  score: number;
  /** Highlighted description. */
  description: TextSegment[];
  /** Highlighted excerpt from the body, or null when the body didn't match. */
  snippet: TextSegment[] | null;
}

export interface DaySearch {
  /** Results keyed by `frontmatter.date`. Empty for a blank query. */
  search(query: string): Map<string, DaySearchHit>;
}

interface SearchDoc {
  id: string;
  title: string;
  description: string;
  location: string;
  tags: string;
  body: string;
}

const FIELD_BOOST = { title: 2, description: 3, tags: 3, location: 2, body: 1 };

/** Shared with the blog search so both behave identically. */
export const SEARCH_OPTIONS: SearchOptions = {
  boost: FIELD_BOOST,
  prefix: true, // "galb" finds "galbi" while typing
  // Typo tolerance only for longer words; short ones would match too much noise.
  fuzzy: (term) => (term.length <= 4 ? false : term.length <= 7 ? 1 : 2),
  combineWith: 'AND', // every word must match somewhere
};

// Complement of MiniSearch's default tokenizer separators, so the token offsets we
// compute for highlighting line up with the terms it reports.
const TOKEN = /[^\n\r\p{Z}\p{P}]+/gu;

const SNIPPET_BEFORE = 60;
const SNIPPET_AFTER = 110;

/** Lowercase and strip accents, used for both indexing and matching highlights. */
export function normalizeTerm(term: string): string {
  return term.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** Markdown body -> searchable prose: drops custom tags, keeps caption text. */
export function toPlainText(markdown: string): string {
  return markdown
    .replace(/<(?:Img|Blog)\s[^>]*?desc="([^"]*)"[^>]*>/g, ' $1 ') // keep captions / link text
    .replace(/<Day\s+(\d+)[^>]*>/g, 'Day $1')
    .replace(/<[^>]+>/g, ' ') // any other tag, including <Img id> without a caption
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // markdown links/images -> label
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`~>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function highlight(text: string, terms: Set<string>): TextSegment[] {
  const segments: TextSegment[] = [];
  let cursor = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (!terms.has(normalizeTerm(m[0]))) continue;
    if (m.index > cursor) segments.push({ text: text.slice(cursor, m.index), hit: false });
    segments.push({ text: m[0], hit: true });
    cursor = m.index + m[0].length;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), hit: false });
  return segments;
}

/** Excerpt around the first body match. */
function buildSnippet(body: string, terms: Set<string>): TextSegment[] | null {
  for (const m of body.matchAll(TOKEN)) {
    if (!terms.has(normalizeTerm(m[0]))) continue;

    let start = Math.max(0, m.index - SNIPPET_BEFORE);
    let end = Math.min(body.length, m.index + m[0].length + SNIPPET_AFTER);
    // Snap to word boundaries so we don't cut mid-word.
    if (start > 0) {
      const space = body.indexOf(' ', start);
      if (space !== -1 && space < m.index) start = space + 1;
    }
    if (end < body.length) {
      const space = body.lastIndexOf(' ', end);
      if (space > m.index) end = space;
    }

    const segments = highlight(body.slice(start, end), terms);
    if (start > 0) segments.unshift({ text: '… ', hit: false });
    if (end < body.length) segments.push({ text: ' …', hit: false });
    return segments;
  }
  return null;
}

export function createDaySearch(days: TripDay[]): DaySearch {
  const bodies = new Map<string, string>();
  const docs: SearchDoc[] = days.map((day) => {
    const fm = day.frontmatter;
    const body = toPlainText(day.content ?? '');
    bodies.set(fm.date, body);
    return {
      id: fm.date,
      title: fm.title ?? '',
      description: fm.description ?? '',
      location: fm.location ?? '',
      tags: (fm.tags ?? []).join(' '),
      body,
    };
  });

  const index = new MiniSearch<SearchDoc>({
    fields: ['title', 'description', 'location', 'tags', 'body'],
    processTerm: normalizeTerm,
    searchOptions: SEARCH_OPTIONS,
  });
  index.addAll(docs);

  const descriptions = new Map(docs.map((d) => [d.id, d.description]));

  return {
    search(query) {
      const hits = new Map<string, DaySearchHit>();
      if (!query.trim()) return hits;

      for (const result of index.search(query)) {
        const terms = new Set<string>(result.terms);
        hits.set(result.id, {
          score: result.score,
          description: highlight(descriptions.get(result.id) ?? '', terms),
          snippet: buildSnippet(bodies.get(result.id) ?? '', terms),
        });
      }
      return hits;
    },
  };
}
