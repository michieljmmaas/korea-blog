'use client'

import { useState, useMemo } from 'react';
import { BlogPost } from '@/app/types';
import { BlogFilterBar } from './blog-filter-bar';
import BlogPostCard from './blog-post-card';

interface BlogsClientPageProps {
    posts: BlogPost[];
}

export function BlogsClientPage({ posts }: BlogsClientPageProps) {
    const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        posts.forEach((post) => post.frontmatter.tags?.forEach((t) => tags.add(t)));
        return Array.from(tags).sort();
    }, [posts]);

    const filteredPosts = useMemo(() => {
        if (activeTags.size === 0) return posts;
        return posts.filter((post) =>
            post.frontmatter.tags?.some((t) => activeTags.has(t))
        );
    }, [posts, activeTags]);

    function handleTagToggle(tag: string) {
        setActiveTags((prev) => {
            const next = new Set(prev);
            next.has(tag) ? next.delete(tag) : next.add(tag);
            return next;
        });
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="max-w-7xl mx-auto px-8 py-12">
                <BlogFilterBar
                    allTags={allTags}
                    activeTags={activeTags}
                    onTagToggle={handleTagToggle}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {filteredPosts.map((post) => (
                        <BlogPostCard key={post.slug} post={post} />
                    ))}
                </div>
                {filteredPosts.length === 0 && (
                    <p className="text-center text-neutral-400 text-sm font-mono py-16">
                        No posts match the selected tags.
                    </p>
                )}
            </div>
        </div>
    );
}