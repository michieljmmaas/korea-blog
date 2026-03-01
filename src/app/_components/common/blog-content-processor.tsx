"use client"

import { useEffect, useRef, useCallback } from 'react';
import { createRoot, Root } from 'react-dom/client';
import SingleImageWithModal from './single-image-with-modal';
import { DayHoverData, DayLinkWithTooltip } from '../day/day-link-with-tooltip';

interface BlogContentProcessorProps {
    htmlContent: string;
    className?: string;
}

const BlogContentProcessor = ({ htmlContent, className }: BlogContentProcessorProps) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const mountedComponentsRef = useRef<Array<{ element: HTMLElement; root: Root }>>([]);
    const isUnmountingRef = useRef(false);

    const cleanupComponents = useCallback(() => {
        if (isUnmountingRef.current) return;
        isUnmountingRef.current = true;
        setTimeout(() => {
            mountedComponentsRef.current.forEach(({ root }) => {
                try {
                    root.unmount();
                } catch (error) {
                    console.warn('Error during component unmount:', error);
                }
            });
            mountedComponentsRef.current = [];
            isUnmountingRef.current = false;
        }, 0);
    }, []);

    useEffect(() => {
        if (!contentRef.current) return;

        cleanupComponents();

        const timeoutId = setTimeout(() => {
            if (!contentRef.current) return;

            contentRef.current.innerHTML = htmlContent;

            // ── Images ────────────────────────────────────────────────────────
            const imagePlaceholders = contentRef.current.querySelectorAll('.modal-image-placeholder');

            imagePlaceholders.forEach((placeholder) => {
                const src = placeholder.getAttribute('data-src');
                const alt = placeholder.getAttribute('data-alt');
                const orientation = placeholder.getAttribute('data-orientation') as 'portrait' | 'landscape';
                const description = placeholder.getAttribute('data-description');

                if (src && alt) {
                    const container = document.createElement('div');
                    placeholder.parentNode?.replaceChild(container, placeholder);

                    const root = createRoot(container);
                    root.render(
                        <SingleImageWithModal
                            src={src}
                            alt={alt}
                            orientation={orientation || 'landscape'}
                            description={description || undefined}
                        />
                    );
                    mountedComponentsRef.current.push({ element: container, root });
                }
            });

            // ── Day links ─────────────────────────────────────────────────────
            const dayLinks = contentRef.current.querySelectorAll<HTMLElement>(
                'a.dayLink[data-day-info], span.dayLink[data-day-info]'
            );

            dayLinks.forEach((el) => {
                const raw = el.getAttribute('data-day-info');
                if (!raw) return;

                let data: DayHoverData;
                try {
                    data = JSON.parse(decodeURIComponent(raw));
                } catch {
                    return;
                }

                const href = el.tagName === 'A'
                    ? (el as HTMLAnchorElement).getAttribute('href') ?? undefined
                    : undefined;
                const label = el.textContent ?? data.date;

                const container = document.createElement('span');
                el.parentNode?.replaceChild(container, el);

                const root = createRoot(container);
                root.render(
                    <DayLinkWithTooltip data={data} href={href} label={label} />
                );
                mountedComponentsRef.current.push({ element: container, root });
            });

        }, 10);

        return () => {
            clearTimeout(timeoutId);
            cleanupComponents();
        };
    }, [htmlContent, cleanupComponents]);

    useEffect(() => {
        return () => {
            cleanupComponents();
        };
    }, [cleanupComponents]);

    return (
        <div
            ref={contentRef}
            className={className}
        />
    );
};

export default BlogContentProcessor;