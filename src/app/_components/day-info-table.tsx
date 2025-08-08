import { getLocationColor } from "../../../utils/locationColors";
import { BlogPostFrontmatter } from "../types";



const locationConfig = {
    seoul: { name: "Seoul", color: "seoul" },
    busan: { name: "Busan", color: "busan" },
    japan: { name: "Japan", color: "japan" },
    taiwan: { name: "Taiwan", color: "taiwan" },
    "hong-kong": { name: "Hong Kong", color: "hong-kong" },
};

interface DayInfoTableProps {
    frontmatter: BlogPostFrontmatter
}


const DayInfoTable = (props: DayInfoTableProps) => {
    const { location, work, date, tags, stats } = props.frontmatter;

    const locationColor = getLocationColor(location, work);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            {/* Basic Info */}
            <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-text-secondary text-sm font-medium">Date</span>
                    <span className="text-text-primary font-mono text-sm">{date}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-text-secondary text-sm font-medium">Location</span>
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium text-white bg-${locationColor}`}
                    >
                        {location}
                    </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-text-secondary text-sm font-medium">Work Day</span>
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${work
                            ? "bg-destructive/10 text-destructive"
                            : "bg-green-500/10 text-green-600"
                            }`}
                    >
                        {work ? "Yes" : "No"}
                    </span>
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

            {/* Stats */}
            <div className="space-y-4">
                <h3 className="text-text-primary font-medium text-sm">Today's Stats</h3>

                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-surface-secondary rounded-lg">
                        <div className="text-lg font-bold text-text-primary">{stats.kimbap}</div>
                        <div className="text-xs text-text-secondary">Kimbap Eaten</div>
                    </div>

                    <div className="text-center p-3 bg-surface-secondary rounded-lg">
                        <div className="text-lg font-bold text-text-primary">{stats.cultural}</div>
                        <div className="text-xs text-text-secondary">Cultural sights seen</div>
                    </div>

                    <div className="text-center p-3 bg-surface-secondary rounded-lg">
                        <div className="text-lg font-bold text-text-primary">{stats.commits}</div>
                        <div className="text-xs text-text-secondary">Commits Pushed</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DayInfoTable;