'use client';

import { useState } from "react";
import { DayFrontmatter, CityLocation, PostLinkInfo } from "../../types";
import ArrowButton from "../common/arrow-button";
import { LocationSticker } from "../common/location-sticker";
import StatsGrid from "./stats-grid";
import HeaderLink from "../layout/Link";
import { MapIcon } from "lucide-react";
import MapWithData from "../map/map-with-data";

interface DayInfoTableProps {
    frontmatter: DayFrontmatter;
    previousPost: PostLinkInfo | null;
    nextPost: PostLinkInfo | null;
    week: any;
}

export default function DayInfoTable({
    frontmatter,
    previousPost,
    nextPost,
    week
}: DayInfoTableProps) {
    const [isMapOpen, setIsMapOpen] = useState(false);
    const { location, date, stats } = frontmatter;
    const hasLocations = frontmatter.day > 55;


    const weekLink = week ? (
        <HeaderLink
            pathname={`/weeks/${week.slug}`}
            title={`Week ${week.week}`}
            currentPathName="foo"
            disabled={week.isDraft}
        />
    ) : null;

    return (
        /* The main container should NOT have grid-rows-[0fr] */
        <div className="flex flex-col border border-border rounded-lg bg-white sticky top-2 z-10 shadow-sm">

            {/* 1. VISIBLE INFO AREA (Always visible) */}
            <div className="w-full">
                {/* Desktop Layout */}
                <div className="hidden md:flex gap-6 py-4 items-center px-4">
                    <ArrowButton direction="left" slug={previousPost?.slug} disabled={!previousPost} />
                    <div className="flex items-center gap-6">
                        {weekLink}
                        <span className="text-text-primary font-mono text-base">{date}</span>
                        <LocationSticker location={location} />
                    </div>

                    {hasLocations && (
                        <button
                            onClick={() => setIsMapOpen(!isMapOpen)}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all text-sm font-medium ${isMapOpen ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                }`}
                        >
                            <MapIcon size={16} />
                            {isMapOpen ? "Hide Map" : "Show Map"}
                        </button>
                    )}

                    <div className="flex-1 flex items-center justify-end">
                        <StatsGrid stats={stats} location={frontmatter.location as CityLocation} />
                    </div>
                    <ArrowButton direction="right" slug={nextPost?.slug} disabled={!nextPost} />
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {weekLink}
                            <span className="text-text-primary font-mono text-sm">{date}</span>
                        </div>
                        <LocationSticker location={location} />
                    </div>
                    {hasLocations && (
                        <button
                            onClick={() => setIsMapOpen(!isMapOpen)}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-slate-100 text-sm font-medium"
                        >
                            <MapIcon size={16} />
                            {isMapOpen ? "Close Map" : "View Map"}
                        </button>
                    )}
                    <StatsGrid stats={stats} location={frontmatter.location} />
                    <div className="flex justify-between gap-4 pt-2">
                        <ArrowButton direction="left" slug={previousPost?.slug} disabled={!previousPost} />
                        <ArrowButton direction="right" slug={nextPost?.slug} disabled={!nextPost} />
                    </div>
                </div>
            </div>

            {/* 2. COLLAPSIBLE MAP AREA (Only this part slides) */}
            <div
                className={`grid transition-all duration-500 ease-in-out ${isMapOpen ? "grid-rows-[1fr] opacity-100 border-t" : "grid-rows-[0fr] opacity-0"
                    }`}
            >
                <div className="overflow-hidden">
                    <div className="p-4 bg-slate-50 h-[400px] md:h-[650px]">
                        {/* Only mount the MapWrapper when open to save memory, 
                            or keep it mounted if you want instant toggling */}
                        {isMapOpen && hasLocations && <MapWithData date={frontmatter.date} />}
                    </div>
                </div>
            </div>
        </div>
    );
}