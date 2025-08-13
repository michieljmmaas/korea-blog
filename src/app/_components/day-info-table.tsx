"use client"

import { useEffect, useState, useRef } from 'react';
import { getLocationColor } from "../../../utils/locationColors";
import { BlogPostFrontmatter, PostLinkInfo } from "../types";
import ArrowButton from "./arrow-button"; // Adjust path as needed
import StatsGrid from "./stats-grid"; // Adjust path as needed
import Image from 'next/image';
import kimbapIcon from "../../../public/assets/blog/svg-icons/kimbap.svg";
import gitIcon from "../../../public/assets/blog/svg-icons/git.svg";
import culturalIcon from "../../../public/assets/blog/svg-icons/cultural.svg";
import stepsIcon from "../../../public/assets/blog/svg-icons/steps.svg";

interface DayInfoTableProps {
    frontmatter: BlogPostFrontmatter;
    previousPost: PostLinkInfo | null;
    nextPost: PostLinkInfo | null;
}

const DayInfoTable = (props: DayInfoTableProps) => {
    const { location, work, date, tags, stats } = props.frontmatter;
    const { previousPost, nextPost } = props;
    const locationColor = getLocationColor(location, work);
    
    const [isCompact, setIsCompact] = useState(false);
    const tableRef = useRef<HTMLDivElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (tableRef.current && stickyRef.current) {
                const mainContainer = document.querySelector('main');
                if (!mainContainer) return;
                
                const tableRect = tableRef.current.getBoundingClientRect();
                const mainRect = mainContainer.getBoundingClientRect();
                
                // Show compact header when original table scrolls out of view
                const shouldShowCompact = tableRect.bottom < mainRect.top + 60;
                setIsCompact(shouldShowCompact);
            }
        };

        const mainContainer = document.querySelector('main');
        if (mainContainer) {
            mainContainer.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll(); // Initial check
            return () => mainContainer.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const CompactHeader = () => (
        <div 
            ref={stickyRef}
            className={`sticky top-0 bg-surface border-b border-border z-50 transition-all duration-300 shadow-sm ${
                isCompact ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
            }`}
        >
            <div className="container mx-auto px-2">
                <div className="flex items-center justify-between py-3 gap-4">
                    {/* Date and Location */}
                    <div className="flex items-center gap-4 min-w-0">
                        <span className="text-text-primary font-mono text-sm whitespace-nowrap">{date}</span>
                        <div className={`px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap ${locationColor}`}>
                            {location}
                        </div>
                    </div>

                    {/* Stats - Hidden on very small screens */}
                    <div className="hidden sm:flex items-center gap-4 overflow-hidden">
                        {/* Kimbap */}
                        <div className="flex items-center gap-1">
                            <Image src={kimbapIcon} alt="Kimbap" className="w-4 h-4 flex-shrink-0" />
                            <span className="text-text-primary font-bold text-sm">{stats.kimbap}</span>
                        </div>

                        {/* Cultural */}
                        <div className="flex items-center gap-1">
                            <Image src={culturalIcon} alt="Sights" className="w-4 h-4 flex-shrink-0" />
                            <span className="text-text-primary font-bold text-sm">{stats.cultural}</span>
                        </div>

                        {/* Commits */}
                        <div className="flex items-center gap-1">
                            <Image src={gitIcon} alt="Commits" className="w-4 h-4 flex-shrink-0" />
                            <span className="text-text-primary font-bold text-sm">{stats.commits}</span>
                        </div>

                        {/* Steps */}
                        <div className="flex items-center gap-1">
                            <Image src={stepsIcon} alt="Steps" className="w-4 h-4 flex-shrink-0" />
                            <span className="text-text-primary font-bold text-sm">{stats.steps.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Mobile stats - only show 2 most important */}
                    <div className="flex sm:hidden items-center gap-3">
                        <div className="flex items-center gap-1">
                            <Image src={kimbapIcon} alt="Kimbap" className="w-4 h-4" />
                            <span className="text-text-primary font-bold text-sm">{stats.kimbap}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Image src={stepsIcon} alt="Steps" className="w-4 h-4" />
                            <span className="text-text-primary font-bold text-sm">{stats.steps.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Compact Sticky Header */}
            <CompactHeader />
            
            <div ref={tableRef}>
                {/* Desktop Layout */}
                <div className="hidden md:flex gap-6 py-6 items-stretch">
                    {/* Previous Post Button */}
                    <ArrowButton 
                        direction="left" 
                        post={previousPost} 
                        disabled={!previousPost} 
                    />

                    {/* Basic Info - 25% */}
                    <div className="w-1/4 space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-border">
                            <span className="text-text-secondary text-base font-medium">Date</span>
                            <span className="text-text-primary font-mono text-base">{date}</span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border">
                            <span className="text-text-secondary text-base font-medium">Location</span>
                            <div className={`px-3 py-2 rounded-lg text-sm font-medium text-white ${locationColor}`}>
                                {location}
                            </div>
                        </div>

                        {tags.length > 0 && (
                            <div className="py-2">
                                <span className="text-text-secondary text-base font-medium block mb-2">Tags</span>
                                <div className="flex flex-wrap gap-1">
                                    {tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-surface-secondary text-text-secondary text-sm rounded-full"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <StatsGrid stats={stats} />

                    {/* Next Post Button */}
                    <ArrowButton 
                        direction="right" 
                        post={nextPost} 
                        disabled={!nextPost} 
                    />
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden py-4 space-y-4">
                    {/* Basic Info */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-border">
                            <span className="text-text-secondary text-sm font-medium">Date</span>
                            <span className="text-text-primary font-mono text-sm">{date}</span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border">
                            <span className="text-text-secondary text-sm font-medium">Location</span>
                            <div className={`px-2 py-1 rounded-lg text-xs font-medium text-white ${locationColor}`}>
                                {location}
                            </div>
                        </div>

                        {tags.length > 0 && (
                            <div className="py-2">
                                <span className="text-text-secondary text-sm font-medium block mb-2">Tags</span>
                                <div className="flex flex-wrap gap-1">
                                    {tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-surface-secondary text-text-secondary text-xs rounded-full"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <StatsGrid stats={stats} />

                    {/* Mobile Navigation */}
                    <div className="flex justify-between gap-4 pt-4">
                        <div className="flex-1">
                            <ArrowButton 
                                direction="left" 
                                post={previousPost} 
                                disabled={!previousPost} 
                            />
                        </div>
                        <div className="flex-1">
                            <ArrowButton 
                                direction="right" 
                                post={nextPost} 
                                disabled={!nextPost} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DayInfoTable;