import { getLocationColor } from "../../../utils/locationColors";
import { BlogPostFrontmatter } from "../types";
import Image from 'next/image';
import kimbapIcon from "../../../public/assets/blog/svg-icons/kimbap.svg";
import gitIcon from "../../../public/assets/blog/svg-icons/git.svg";
import culturalIcon from "../../../public/assets/blog/svg-icons/cultural.svg";


interface DayInfoTableProps {
    frontmatter: BlogPostFrontmatter
}


const DayInfoTable = (props: DayInfoTableProps) => {
    const { location, work, date, tags, stats } = props.frontmatter;
    const locationColor = getLocationColor(location, work);

    return (
        <div className="flex gap-6 py-6 items-start">
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

            {/* Stats - 75% */}
            <div className="w-3/4">
                <div className="grid grid-cols-3 gap-4 items-stretch">
                    <div className="text-center p-4 bg-surface-secondary rounded-lg flex flex-col justify-between min-h-[120px]">
                        <div className="flex justify-center mb-3 flex-1">
                            <Image src={kimbapIcon} alt="Kimbap icon" className="w-full h-full max-w-32 max-h-32 object-contain" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-text-primary mb-1">{stats.kimbap}</div>
                            <div className="text-base text-text-secondary leading-tight">Kimbap Eaten</div>
                        </div>
                    </div>

                    <div className="text-center p-4 bg-surface-secondary rounded-lg flex flex-col justify-between min-h-[120px]">
                        <div className="flex justify-center mb-3 flex-1">
                            <Image src={culturalIcon} alt="Cultural icon" className="w-full h-full max-w-32 max-h-32 object-contain" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-text-primary mb-1">{stats.cultural}</div>
                            <div className="text-base text-text-secondary leading-tight">Sights Seen</div>
                        </div>
                    </div>

                    <div className="text-center p-4 bg-surface-secondary rounded-lg flex flex-col justify-between min-h-[120px]">
                        <div className="flex justify-center mb-3 flex-1">
                            <Image src={gitIcon} alt="Git icon" className="w-full h-full max-w-32 max-h-32 object-contain" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-text-primary mb-1">{stats.commits}</div>
                            <div className="text-base text-text-secondary leading-tight">Commits Pushed</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default DayInfoTable;