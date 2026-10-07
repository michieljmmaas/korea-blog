'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { getReduxState } from '../../../../utils/reduxMode';

interface RandomSectionProps<T, K> {
  title: string;
  items: T[];
  initialItem: T;
  getKey: (item: T) => K;
  renderItem: (item: T) => ReactNode;
  linkComponent: ReactNode;
  /** Given the full item list and today's trip-year date, return the redux-mode item to auto-load, if any. */
  getReduxItem?: (items: T[], tripDateString: string) => T | null;
  /** Tailwind height classes matching renderItem's image block, so the skeleton's image area lines up with the real one. */
  imageAreaClassName: string;
}

export default function RandomSection<T, K>({
  title,
  items,
  initialItem,
  getKey,
  renderItem,
  linkComponent,
  getReduxItem,
  imageAreaClassName,
}: RandomSectionProps<T, K>) {
  const [item, setItem] = useState(initialItem);
  const [isAnimating, setIsAnimating] = useState(false);
  // Stays false through the static HTML (both the build-time render and the client's
  // first pre-hydration render) and only flips once the real item has been picked.
  const [pickResolved, setPickResolved] = useState(false);
  // ...and this only flips once that item's own images (cover photo, stat icons, etc.)
  // have actually finished loading — otherwise revealing immediately on pick just
  // trades the old flash for the image visibly popping in a moment later.
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const ready = pickResolved && imagesLoaded;
  const containerRef = useRef<HTMLDivElement>(null);

  // initialItem is whatever was picked at build/request time, so it's the same for every
  // visitor until the next deploy. Re-pick client-side, before paint (useLayoutEffect, not
  // useEffect), so each visitor gets their own random item without a visible flash. A
  // redux-mode match (also visitor-date-dependent) takes priority.
  useLayoutEffect(() => {
    if (getReduxItem) {
      const redux = getReduxState();
      if (redux.active) {
        const match = getReduxItem(items, redux.tripDateString);
        if (match) {
          setItem(match);
          setPickResolved(true);
          return;
        }
      }
    }

    if (items.length > 0) {
      setItem(items[Math.floor(Math.random() * items.length)]);
    }
    setPickResolved(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Runs after every item change (including manual refreshes): the card for the new
  // item is already mounted (hidden behind the overlay below), so its <img>s are
  // already downloading — this just waits for them before lifting the overlay.
  useLayoutEffect(() => {
    setImagesLoaded(false);

    const el = containerRef.current;
    const imgs = el ? Array.from(el.querySelectorAll('img')) : [];
    if (imgs.length === 0) {
      setImagesLoaded(true);
      return;
    }

    let remaining = imgs.length;
    const markOneDone = () => {
      remaining -= 1;
      if (remaining <= 0) setImagesLoaded(true);
    };
    imgs.forEach((img) => {
      if (img.complete) {
        markOneDone();
      } else {
        img.addEventListener('load', markOneDone, { once: true });
        img.addEventListener('error', markOneDone, { once: true });
      }
    });

    // Safety net: never let a slow/broken image hide the card forever.
    const timeout = setTimeout(() => setImagesLoaded(true), 4000);

    return () => {
      clearTimeout(timeout);
      imgs.forEach((img) => {
        img.removeEventListener('load', markOneDone);
        img.removeEventListener('error', markOneDone);
      });
    };
  }, [item]);

  const handleRefresh = () => {
    if (items.length <= 1) return;

    setIsAnimating(true);
    const currentKey = getKey(item);
    let next = item;
    while (getKey(next) === currentKey) {
      next = items[Math.floor(Math.random() * items.length)];
    }
    setItem(next);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={handleRefresh}
          disabled={items.length <= 1}
          className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors group"
          aria-label={`Load new random ${title.toLowerCase()}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-500 ${
              isAnimating ? "rotate-360" : "group-hover:rotate-90"
            }`}
            style={{ transform: isAnimating ? "rotate(360deg)" : undefined }}
            onTransitionEnd={() => setIsAnimating(false)}
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
        </button>
      </div>
      <div ref={containerRef} className="flex-1 relative rounded-lg overflow-hidden">
        {renderItem(item)}
        {!ready && (
          <div className="absolute inset-0 flex flex-col">
            {/* Image area */}
            <div className={`skeleton-shimmer relative flex-shrink-0 overflow-hidden bg-gray-200 ${imageAreaClassName}`} />
            {/* Text area */}
            <div className="skeleton-shimmer relative flex-1 overflow-hidden border-t border-gray-300 bg-gray-200" />
          </div>
        )}
      </div>
      <div className="pt-4 mt-auto">{linkComponent}</div>
      <style jsx>{`
        .skeleton-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.55),
            transparent
          );
          animation: skeleton-shimmer 1.4s ease-in-out infinite;
        }
        @keyframes skeleton-shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
