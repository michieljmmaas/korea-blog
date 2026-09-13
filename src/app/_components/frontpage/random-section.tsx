'use client';

import { useEffect, useState, type ReactNode } from 'react';
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
}

export default function RandomSection<T, K>({
  title,
  items,
  initialItem,
  getKey,
  renderItem,
  linkComponent,
  getReduxItem,
}: RandomSectionProps<T, K>) {
  const [item, setItem] = useState(initialItem);
  const [isAnimating, setIsAnimating] = useState(false);

  // initialItem is whatever was picked at build/request time, so it's the same for every
  // visitor until the next deploy. Re-pick client-side, after mount, so each visitor gets
  // their own random item. A redux-mode match (also visitor-date-dependent) takes priority.
  useEffect(() => {
    if (getReduxItem) {
      const redux = getReduxState();
      if (redux.active) {
        const match = getReduxItem(items, redux.tripDateString);
        if (match) {
          setItem(match);
          return;
        }
      }
    }

    if (items.length > 0) {
      setItem(items[Math.floor(Math.random() * items.length)]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="flex-1">{renderItem(item)}</div>
      <div className="pt-4 mt-auto">{linkComponent}</div>
    </div>
  );
}
