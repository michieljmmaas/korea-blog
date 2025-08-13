"use client";

import { useEffect, useState } from 'react';
import DaySquare from "@/app/_components/day-square";
import { BlogPostFrontmatter, TripDay, WeekData } from '@/app/types';

// Week Info Table Component
export default function WeekInfoTable({ week, dayPosts }: { week: WeekData; dayPosts: BlogPostFrontmatter[] }) {
  const [dateRange, setDateRange] = useState<string>('');
  
  useEffect(() => {
    const startDate = new Date(week.days[0]);
    const endDate = new Date(week.days[week.days.length - 1]);
    
    // Use consistent US locale formatting to avoid hydration mismatch
    const formattedRange = `${startDate.toLocaleDateString('en-US')} - ${endDate.toLocaleDateString('en-US')}`;
    setDateRange(formattedRange);
  }, [week.days]);
  
  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-lg font-semibold mb-4">Week Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Span</div>
          <div className="font-medium">
            <span className="text-text-primary font-mono text-base">{dateRange || 'Loading...'}</span>
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Aandere data</div>
          <div className="font-medium">Foo</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Tags</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {week.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Grafiek data</div>
          <div className="font-medium">linkje voor grafiek</div>
        </div>
      </div>
      
      {/* Days breakdown using DaySquare */}
      <div className="mt-4">
        <div className="text-sm text-muted-foreground mb-2">Days Covered</div>
        <div className="grid grid-cols-7 gap-1">
          {week.days.map((day) => {
            const dayPost = dayPosts.find(post => post?.date === day);
            return (
              <DaySquare
                key={day}
                dayInfo={dayPost || undefined}
                isEmpty={!dayPost}
                thumbnailSrc={dayPost ? `/thumbnails/${day}.webp` : undefined}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}