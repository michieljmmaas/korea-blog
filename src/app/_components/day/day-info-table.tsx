import { getLocationColor } from "../../../../utils/locationColors";
import { BlogPostFrontmatter, PostLinkInfo } from "../../types";
import ArrowButton from "../common/arrow-button"; // Adjust path as needed
import StatsGrid from "./stats-grid"; // Adjust path as needed

interface DayInfoTableProps {
    frontmatter: BlogPostFrontmatter;
    previousPost: PostLinkInfo | null;
    nextPost: PostLinkInfo | null;
}

const DayInfoTable = (props: DayInfoTableProps) => {
    const { location, work, date, stats } = props.frontmatter;
    const { previousPost, nextPost } = props;
    const locationColor = getLocationColor(location, work);

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

                {/* Basic Info - Date and Location on same line */}
                <div className="flex items-center gap-6">
                    <span className="text-text-primary font-mono text-base">{date}</span>
                    <div className={`px-3 py-2 rounded-lg text-sm font-medium text-white ${locationColor}`}>
                        {location}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="flex-1 flex items-center justify-end">
                    <div className="">
                        <StatsGrid stats={stats} />
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
                {/* Basic Info - Date and Location on same line */}
                <div className="flex items-center justify-between">
                    <span className="text-text-primary font-mono text-sm">{date}</span>
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium text-white ${locationColor}`}>
                        {location}
                    </div>
                </div>

                {/* Stats Grid */}
                <StatsGrid stats={stats} />

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

export default DayInfoTable;