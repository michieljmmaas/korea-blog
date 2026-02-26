'use client'

import { cn } from '@/lib/utils';
import { Tag, Search, X } from 'lucide-react';

interface BlogFilterBarProps {
    allTags: string[];
    activeTags: Set<string>;
    searchQuery: string;
    onTagToggle: (tag: string) => void;
    onSearchChange: (query: string) => void;
}

const ACTIVE =
    'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white';
const INACTIVE =
    'bg-transparent text-neutral-400 border-neutral-200 hover:text-neutral-900 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-400 dark:hover:text-white opacity-60 hover:opacity-100';

export function BlogFilterBar({
    allTags,
    activeTags,
    searchQuery,
    onTagToggle,
    onSearchChange,
}: BlogFilterBarProps) {
    return (
        <div className="flex flex-col gap-3 mb-8 p-4 bg-card border border-border">

            {/* Search */}
            <div className="relative flex items-center">
                <Search className="absolute left-3 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search posts..."
                    className={cn(
                        'w-full pl-8 pr-8 py-1.5 text-xs font-mono uppercase tracking-wide',
                        'bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-md',
                        'text-neutral-900 dark:text-white placeholder:text-neutral-400 placeholder:normal-case placeholder:tracking-normal',
                        'focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors'
                    )}
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute right-3 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            <div className="border-t border-border" />

            {/* Tag filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-neutral-400 shrink-0">
                    <Tag className="w-3.5 h-3.5" />
                    Filter
                </span>
                <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => {
                        const isActive = activeTags.has(tag);
                        return (
                            <button
                                key={tag}
                                onClick={() => onTagToggle(tag)}
                                className={cn(
                                    'flex items-center gap-1.5 px-2.5 py-1.5 border rounded-md text-xs font-mono uppercase tracking-wide transition-all',
                                    isActive ? ACTIVE : INACTIVE
                                )}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}