import { WeekDataService } from "@/lib/weekService";
import { DayFrontmatter, CityLocation, PostLinkInfo } from "../../types";
import ArrowButton from "../common/arrow-button"; // Adjust path as needed
import { LocationSticker } from "../common/location-sticker";
import StatsGrid from "./stats-grid"; // Adjust path as needed
import HeaderLink from "../layout/Link";

interface DayInfoTableProps {
    frontmatter: DayFrontmatter;
    previousPost: PostLinkInfo | null;
    nextPost: PostLinkInfo | null;
}

export default async function DayInfoTable(props: DayInfoTableProps) {
    const { location, date, stats } = props.frontmatter;
    const { previousPost, nextPost } = props;

    const week = await WeekDataService.getWeekForDay(props.frontmatter.day);

    const weekLink = week ? (
        <HeaderLink
            pathname={`/weeks/${week.slug}`}
            title={`Week ${week.week}`}
            currentPathName="foo"
            disabled={week.isDraft}
        />
    ) : null;

    return (
        <>
            {/* Desktop Layout */}
            <div className="hidden md:flex gap-6 py-6 items-center border border-border rounded-lg p-4 sticky top-2 bg-white z-10 scroll-p-2">
                {/* Previous Post Button */}
                <div className="flex items-center">
                    <ArrowButton
                        direction="left"
                        slug={previousPost?.slug}
                        disabled={!previousPost}
                    />
                </div>

                {/* Basic Info - Week, Date and Location */}
                <div className="flex items-center gap-6">
                    {weekLink}
                    <span className="text-text-primary font-mono text-base">{date}</span>
                    <LocationSticker location={location} />
                </div>

                {/* Stats Grid */}
                <div className="flex-1 flex items-center justify-end">
                    <div className="">
                        <StatsGrid stats={stats} location={props.frontmatter.location as CityLocation} />
                    </div>
                </div>

                {/* Next Post Button */}
                <div className="flex items-center">
                    <ArrowButton
                        direction="right"
                        slug={nextPost?.slug}
                        disabled={!nextPost}
                    />
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden py-4 space-y-4 border border-border rounded-lg p-4 top-0 bg-white z-10 shadow-sm">
                {/* Basic Info - Week, Date and Location */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {weekLink}
                        <span className="text-text-primary font-mono text-sm">{date}</span>
                    </div>
                    <LocationSticker location={location} />
                </div>

                {/* Stats Grid */}
                <StatsGrid stats={stats} location={props.frontmatter.location} />

                {/* Mobile Navigation */}
                <div className="flex justify-between gap-4 pt-4">
                    <div className="flex-1">
                        <ArrowButton
                            direction="left"
                            slug={previousPost?.slug}
                            disabled={!previousPost}
                        />
                    </div>
                    <div className="flex-1">
                        <ArrowButton
                            direction="right"
                            slug={nextPost?.slug}
                            disabled={!nextPost}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};