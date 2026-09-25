'use client'

import { useState, useMemo } from 'react';
import { BlogPost } from '@/app/types';
import { createBlogSearch } from '@/lib/blogSearch';
import { BlogFilterBar } from './blog-filter-bar';
import BlogPostCard from './blog-post-card';
import { useReduxMode } from '../providers/redux-mode-provider';

interface BlogsClientPageProps {
    posts: BlogPost[];
}

export function BlogsClientPage({ posts }: BlogsClientPageProps) {
    const { hasNotHappenedYet } = useReduxMode();
    const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    // Posts that haven't happened yet (Redux Mode) are hidden entirely.
    const eligiblePosts = useMemo(
        () => posts.filter((post) => !hasNotHappenedYet(post.frontmatter.publishdate)),
        [posts, hasNotHappenedYet]
    );

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        eligiblePosts.forEach((post) => post.frontmatter.tags?.forEach((t) => tags.add(t)));
        return Array.from(tags).sort();
    }, [eligiblePosts]);

    // Full-text index over titles, descriptions, tags and post bodies
    const blogSearch = useMemo(() => createBlogSearch(eligiblePosts), [eligiblePosts]);
    const hasQuery = searchQuery.trim() !== '';
    const searchMatches = useMemo(() => blogSearch.search(searchQuery), [blogSearch, searchQuery]);

    const filteredPosts = useMemo(() => {
        return eligiblePosts.filter((post) => {
            const passesSearch = !hasQuery || searchMatches.has(post.slug);
            const passesTags = activeTags.size > 0
                ? post.frontmatter.tags?.some((t) => activeTags.has(t))
                : true;
            return passesSearch && passesTags;
        });
    }, [eligiblePosts, activeTags, hasQuery, searchMatches]);

    function handleTagToggle(tag: string) {
        setActiveTags((prev) => {
            const next = new Set(prev);
            next.has(tag) ? next.delete(tag) : next.add(tag);
            return next;
        });
    }

    const hasActiveFilters = searchQuery || activeTags.size > 0;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="max-w-7xl mx-auto px-8 py-12">
                <BlogFilterBar
                    allTags={allTags}
                    activeTags={activeTags}
                    searchQuery={searchQuery}
                    onTagToggle={handleTagToggle}
                    onSearchChange={setSearchQuery}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {filteredPosts.map((post) => (
                        <BlogPostCard key={post.slug} post={post} />
                    ))}
                </div>
                {filteredPosts.length === 0 && hasActiveFilters && (
                    <p className="text-center text-neutral-400 text-sm py-16">
                        No posts match your search.
                    </p>
                )}
            </div>
        </div>
    );
}