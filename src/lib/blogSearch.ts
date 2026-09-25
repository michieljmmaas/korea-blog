import MiniSearch from 'minisearch';
import { BlogPost } from '@/app/types';
import { normalizeTerm, SEARCH_OPTIONS, toPlainText } from './daySearch';

// Pure, client-safe full-text search over blog posts (no `fs`), so it works in a static export.

export interface BlogSearch {
  /** Slugs of matching posts. Empty for a blank query. */
  search(query: string): Set<string>;
}

interface SearchDoc {
  id: string;
  title: string;
  description: string;
  tags: string;
  body: string;
}

export function createBlogSearch(posts: BlogPost[]): BlogSearch {
  const index = new MiniSearch<SearchDoc>({
    fields: ['title', 'description', 'tags', 'body'],
    processTerm: normalizeTerm,
    searchOptions: SEARCH_OPTIONS,
  });

  index.addAll(
    posts.map((post) => ({
      id: post.slug,
      title: post.frontmatter.title ?? '',
      description: post.frontmatter.description ?? '',
      tags: (post.frontmatter.tags ?? []).join(' '),
      body: toPlainText(post.content ?? ''),
    }))
  );

  return {
    search(query) {
      if (!query.trim()) return new Set();
      return new Set(index.search(query).map((result) => String(result.id)));
    },
  };
}
