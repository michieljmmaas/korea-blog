'use client'

import { cn } from '@/lib/utils';
import { Tag } from 'lucide-react';

interface BlogFilterBarProps {
    allTags: string[];
    activeTags: Set<string>;
    onTagToggle: (tag: string) => void;
}

const ACTIVE =
    'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white';
const INACTIVE =
    'bg-transparent text-neutral-400 border-neutral-200 hover:text-neutral-900 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-400 dark:hover:text-white opacity-60 hover:opacity-100';

export function BlogFilterBar({ allTags, activeTags, onTagToggle }: BlogFilterBarProps) {
    return (
        <div className="flex flex-col gap-3 mb-8 p-4 bg-card border border-border">
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