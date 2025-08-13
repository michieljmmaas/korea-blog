import { getLocationColor } from "../../../utils/locationColors";
import { BlogPostFrontmatter, PostLinkInfo } from "../types";
import ArrowButton from "./arrow-button"; // Adjust path as needed
import StatsGrid from "./stats-grid"; // Adjust path as needed

interface DayInfoTableProps {
    frontmatter: BlogPostFrontmatter;
    previousPost: PostLinkInfo | null;
    nextPost: PostLinkInfo | null;
}

const DayInfoTable = (props: DayInfoTableProps) => {
    const { location, work, date, tags, stats } = props.frontmatter;
    const { previousPost, nextPost } = props;
    const locationColor = getLocationColor(location, work);

    return (
        <>
            {/* Desktop Layout */}
            <div className="hidden md:flex gap-6 py-6 items-stretch">
                {/* Previous Post Button */}
                <ArrowButton 
                    direction="left" 
                    post={previousPost} 
                    disabled={!previousPost} 
                />

                {/* Basic Info - 25% */}
                <div className="w-1/4 space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-text-secondary text-base font-medium">Date</span>
                        <span className="text-text-primary font-mono text-base">{date}</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-text-secondary text-base font-medium">Location</span>
                        <div className={`px-3 py-2 rounded-lg text-sm font-medium text-white ${locationColor}`}>
                            {location}
                        </div>
                    </div>

                    {tags.length > 0 && (
                        <div className="py-2">
                            <span className="text-text-secondary text-base font-medium block mb-2">Tags</span>
                            <div className="flex flex-wrap gap-1">
                                {tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-surface-secondary text-text-secondary text-sm rounded-full"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <StatsGrid stats={stats} />

                {/* Next Post Button */}
                <ArrowButton 
                    direction="right" 
                    post={nextPost} 
                    disabled={!nextPost} 
                />
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden py-4 space-y-4">
                {/* Basic Info */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-text-secondary text-sm font-medium">Date</span>
                        <span className="text-text-primary font-mono text-sm">{date}</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-text-secondary text-sm font-medium">Location</span>
                        <div className={`px-2 py-1 rounded-lg text-xs font-medium text-white ${locationColor}`}>
                            {location}
                        </div>
                    </div>

                    {tags.length > 0 && (
                        <div className="py-2">
                            <span className="text-text-secondary text-sm font-medium block mb-2">Tags</span>
                            <div className="flex flex-wrap gap-1">
                                {tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-surface-secondary text-text-secondary text-xs rounded-full"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <StatsGrid stats={stats} />

                {/* Mobile Navigation */}
                <div className="flex justify-between gap-4 pt-4">
                    <div className="flex-1">
                        <ArrowButton 
                            direction="left" 
                            post={previousPost} 
                            disabled={!previousPost} 
                        />
                    </div>
                    <div className="flex-1">
                        <ArrowButton 
                            direction="right" 
                            post={nextPost} 
                            disabled={!nextPost} 
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default DayInfoTable;