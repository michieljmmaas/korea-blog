'use client';

import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DayFrontmatter } from '../../types';
import { DaySearchHit, TextSegment } from '@/lib/daySearch';
import { DayCardContent } from '../day/day-card';

const CARD_WIDTH = 384;
const ANCHOR_GAP = 8;
const VIEWPORT_MARGIN = 8;
const SHOW_DELAY_MS = 100;

function Highlighted({ segments }: { segments: TextSegment[] }) {
  return (
    <>
      {segments.map((s, i) =>
        s.hit ? (
          <mark key={i} className="bg-yellow-300 text-gray-900 rounded-sm px-px">{s.text}</mark>
        ) : (
          <span key={i}>{s.text}</span>
        )
      )}
    </>
  );
}

interface DayHoverCardProps {
  frontmatter: DayFrontmatter;
  anchorRef: RefObject<HTMLElement | null>;
  searchHit?: DaySearchHit;
}

// Portalled to document.body so neighbouring grid cells (each its own transformed stacking context) can't paint over it.
export default function DayHoverCard({ frontmatter, anchorRef, searchHit }: DayHoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [delayElapsed, setDelayElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDelayElapsed(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useLayoutEffect(() => {
    const place = () => {
      const anchor = anchorRef.current;
      const card = cardRef.current;
      if (!anchor || !card) return;

      const rect = anchor.getBoundingClientRect();
      const { offsetWidth: w, offsetHeight: h } = card;
      const vw = window.innerWidth;

      // Centered above the square; flip below when there's no room.
      let top = rect.top - h - ANCHOR_GAP;
      if (top < VIEWPORT_MARGIN) top = rect.bottom + ANCHOR_GAP;

      const left = Math.min(
        Math.max(rect.left + rect.width / 2 - w / 2, VIEWPORT_MARGIN),
        Math.max(vw - w - VIEWPORT_MARGIN, VIEWPORT_MARGIN)
      );

      setPos({ left, top });
    };

    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [anchorRef]);

  const descriptionHit = searchHit?.description.some((s) => s.hit) ? searchHit.description : null;
  const snippet = searchHit?.snippet ?? null;
  const visible = pos !== null && delayElapsed;

  return createPortal(
    <div
      ref={cardRef}
      style={{
        position: 'fixed',
        left: pos?.left ?? 0,
        top: pos?.top ?? 0,
        zIndex: 9999,
        pointerEvents: 'none',
        width: `min(${CARD_WIDTH}px, calc(100vw - ${VIEWPORT_MARGIN * 2}px))`,
        transition: 'opacity 150ms ease, transform 150ms ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(4px) scale(0.97)',
      }}
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        <DayCardContent frontmatter={frontmatter} dateAsTitle />

        {(descriptionHit || snippet) && (
          <div className="border-t border-border bg-gray-50 px-6 py-3 text-sm text-gray-600 space-y-2">
            {descriptionHit && (
              <p className="leading-relaxed">
                <Highlighted segments={descriptionHit} />
              </p>
            )}
            {snippet && (
              <p className="text-xs text-gray-500 leading-relaxed">
                <Highlighted segments={snippet} />
              </p>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
