import { getLocationColor } from "../../../utils/locationColors";
import { BlogPostFrontmatter, PostLinkInfo } from "../types";
import ArrowButton from "./arrow-button";
import StatsGrid from "./stats-grid";


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
        <div className="flex gap-6 py-6 items-start">
            {/* Previous Post Button */}
            <div className="flex items-center">
                <ArrowButton 
                    direction="left" 
                    post={previousPost} 
                    disabled={!previousPost} 
                />
            </div>

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
            
            <StatsGrid stats={stats} />

            {/* Next Post Button */}
            <div className="flex items-center">
                <ArrowButton 
                    direction="right" 
                    post={nextPost} 
                    disabled={!nextPost} 
                />
            </div>
        </div>
    );
};

export default DayInfoTable;