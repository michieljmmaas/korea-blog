"use client";

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import type { BlogPost, BlogPostFrontmatter } from "@/app/types";
import BlogPostCard from "./blog-post-card";

const TOOLTIP_OFFSET = 14;

// Subset of BlogPost serialized into data-blog-info by processBlogReferences
export interface BlogHoverData {
    slug: string;
    title: string;
    description: string;
    publishdate: string;
    tags: string[];
    thumb: string;
}

function hoverDataToBlogPost(data: BlogHoverData): BlogPost {
    const frontmatter: BlogPostFrontmatter = {
        slug:        data.slug,
        title:       data.title,
        description: data.description,
        publishdate: data.publishdate,
        tags:        data.tags,
        thumb:       data.thumb,
        // safe defaults for fields BlogPostCard doesn't render
        draft:       false,
        photos:      [],
    };

    return {
        slug:      data.slug,
        fileName:  "",
        content:   "",
        frontmatter,
    };
}

interface BlogLinkWithTooltipProps {
    data: BlogHoverData;
    href: string;
    label: string;
}

export function BlogLinkWithTooltip({ data, href, label }: BlogLinkWithTooltipProps) {
    const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
    const [visible, setVisible] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const computePos = useCallback((mouseX: number, mouseY: number) => {
        const cardW = cardRef.current?.offsetWidth ?? 480;
        const cardH = cardRef.current?.offsetHeight ?? 280;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let x = mouseX + TOOLTIP_OFFSET;
        let y = mouseY + TOOLTIP_OFFSET;
        if (x + cardW > vw - 8) x = mouseX - cardW - TOOLTIP_OFFSET;
        if (y + cardH > vh - 8) y = mouseY - cardH - TOOLTIP_OFFSET;
        return { x, y };
    }, []);

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        showTimer.current = setTimeout(() => {
            setPos(computePos(e.clientX, e.clientY));
            setVisible(true);
        }, 100);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!visible) return;
        setPos(computePos(e.clientX, e.clientY));
    };

    const handleMouseLeave = () => {
        if (showTimer.current) clearTimeout(showTimer.current);
        hideTimer.current = setTimeout(() => {
            setVisible(false);
            setTimeout(() => setPos(null), 150);
        }, 60);
    };

    const tooltip = pos && createPortal(
        <div
            ref={cardRef}
            style={{
                position: "fixed",
                left: pos.x,
                top: pos.y,
                zIndex: 9999,
                pointerEvents: "none",
                width: 480,
                transition: "opacity 150ms ease, transform 150ms ease",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0) scale(1)" : "translateY(4px) scale(0.97)",
            }}
        >
            <BlogPostCard post={hoverDataToBlogPost(data)} />
        </div>,
        document.body
    );

    return (
        <>
            <a
                href={href}
                className="dayLink"
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {label}
            </a>
            {tooltip}
        </>
    );
}