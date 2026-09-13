'use client'

import { useState, useMemo } from 'react';
import { BlogPost } from '@/app/types';
import { BlogFilterBar } from './blog-filter-bar';
import BlogPostCard from './blog-post-card';
import { useReduxMode } from '../providers/redux-mode-provider';

interface BlogsClientPageProps {
    posts: BlogPost[];
}

function matchesSearch(post: BlogPost, query: string): boolean {
    const q = query.toLowerCase();
    const { title, description, tags } = post.frontmatter;
    return (
        title?.toLowerCase().includes(q) ||
        description?.toLowerCase().includes(q) ||
        tags?.some((t) => t.toLowerCase().includes(q))
    );
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

    const filteredPosts = useMemo(() => {
        return eligiblePosts.filter((post) => {
            const passesSearch = searchQuery ? matchesSearch(post, searchQuery) : true;
            const passesTags = activeTags.size > 0
                ? post.frontmatter.tags?.some((t) => activeTags.has(t))
                : true;
            return passesSearch && passesTags;
        });
    }, [eligiblePosts, activeTags, searchQuery]);

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