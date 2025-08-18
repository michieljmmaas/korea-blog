"use client";

import { useEffect, useState } from 'react';
import DaySquare from "@/app/_components/grid/day-square";
import { BlogPostFrontmatter, WeekData, WeekLinkInfo } from '@/app/types';
import Tags from '../common/tags';
import ArrowButton from '../common/arrow-button';
import VacationStatsChart from './chart/chart';

interface WeekInfoProps {
  week: WeekData;
  dayPosts: BlogPostFrontmatter[];
  previousPost: WeekLinkInfo | null;
  nextPost: WeekLinkInfo | null;
}

// Week Info Table Component
export default function WeekInfoTable({ week, dayPosts, previousPost, nextPost }: WeekInfoProps) {
  const [dateRange, setDateRange] = useState<string>('');
  const [isChartExpanded, setIsChartExpanded] = useState<boolean>(false);

  useEffect(() => {
    const startDate = new Date(week.days[0]);
    const endDate = new Date(week.days[week.days.length - 1]);

    // Use consistent US locale formatting to avoid hydration mismatch
    const formattedRange = `${startDate.toLocaleDateString('en-US')} - ${endDate.toLocaleDateString('en-US')}`;
    setDateRange(formattedRange);
  }, [week.days]);

  const toggleChart = (): void => {
    setIsChartExpanded(!isChartExpanded);
  };

  return (
    <div className="bg-card rounded-lg border transition-all duration-300 ease-in-out">
      {/* Desktop Layout */}
      <div className="hidden md:flex md:items-center p-6">
        {/* Left Arrow Button */}
        <ArrowButton
          direction="left"
          slug={previousPost?.slug}
          disabled={previousPost?.isDraft}
        />

        {/* Main Widget Content */}
        <div className="flex-1 mx-6">
          <h2 className="text-lg font-semibold mb-4">Week {week.index + 1}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Span</div>
              <div className="font-medium">
                <span className="text-text-primary font-mono text-base">{dateRange || 'Loading...'}</span>
              </div>
            </div>
            <Tags tags={week.tags} />
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

          <div className="mt-5">
            <button
              onClick={toggleChart}
              className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 text-left flex items-center gap-2"
            >
              <span>{isChartExpanded ? 'Hide Chart' : 'Show Statistics'}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isChartExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Expandable Chart Section */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${isChartExpanded ? 'max-h-[800px] opacity-100 mt-6' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="border-t border-gray-200 pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Statistics Dashboard
                </h3>
                <p className="text-sm text-gray-600">
                  Week {week.index + 1} vacation progress overview
                </p>
              </div>

              {/* Chart Component */}
              {isChartExpanded && (
                <div className="animate-in fade-in-50 duration-300">
                  <VacationStatsChart weekNumber={week.index + 1} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Arrow Button */}
        <ArrowButton
          direction="right"
          slug={nextPost?.slug}
          disabled={nextPost?.isDraft}
        />
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden p-4">
        {/* Main Content */}
        <h2 className="text-lg font-semibold mb-4 text-center">Week {week.index + 1}</h2>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Span</div>
            <div className="font-medium">
              <span className="text-text-primary font-mono text-sm">{dateRange || 'Loading...'}</span>
            </div>
          </div>

          <div>
            <Tags tags={week.tags} />
          </div>
        </div>

        {/* Days breakdown using DaySquare - Mobile optimized */}
        <div className="mt-6">
          <div className="text-sm text-muted-foreground mb-3">Days Covered</div>
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

        {/* Mobile Stats Button and Cards */}
        <div className="mt-5">
          <button
            onClick={toggleChart}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 text-left flex items-center gap-2"
          >
            <span>{isChartExpanded ? 'Hide Stats' : 'Show Statistics'}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isChartExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Expandable Stats Cards Section - Mobile Only */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${isChartExpanded ? 'max-h-[400px] opacity-100 mt-6' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="border-t border-gray-200 pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Statistics Summary
              </h3>
              <p className="text-sm text-gray-600">
                Week {week.index + 1} vacation progress overview
              </p>
            </div>

            {/* Stats Cards Component - Mobile */}
            {isChartExpanded && (
              <div className="animate-in fade-in-50 duration-300">
                <VacationStatsChart weekNumber={week.index + 1} />
              </div>
            )}
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="flex justify-between items-center mt-4">
          <ArrowButton
            direction="left"
            slug={previousPost?.slug}
            disabled={previousPost?.isDraft}
          />
          <ArrowButton
            direction="right"
            slug={nextPost?.slug}
            disabled={nextPost?.isDraft}
          />
        </div>
      </div>
    </div>
  );
}