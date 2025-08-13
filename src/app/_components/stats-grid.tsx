import Image from 'next/image';
import kimbapIcon from "../../../public/assets/blog/svg-icons/kimbap.svg";
import gitIcon from "../../../public/assets/blog/svg-icons/git.svg";
import culturalIcon from "../../../public/assets/blog/svg-icons/cultural.svg";
import stepsIcon from "../../../public/assets/blog/svg-icons/steps.svg"; // You'll need to add this icon

interface StatsGridProps {
    stats: {
        kimbap: number;
        cultural: number;
        commits: number;
        steps: number; // Add this to your BlogPostFrontmatter type
    };
}

const StatsGrid = ({ stats }: StatsGridProps) => {
    return (
        <div className="w-full md:w-3/4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 items-stretch">
                <div className="text-center p-2 md:p-4 bg-surface-secondary rounded-lg flex flex-col justify-between min-h-[80px] md:min-h-[120px]">
                    <div className="flex justify-center mb-1 md:mb-3 flex-1">
                        <Image 
                            src={kimbapIcon} 
                            alt="Kimbap icon" 
                            className="w-full h-full max-w-16 max-h-16 md:max-w-32 md:max-h-32 object-contain" 
                        />
                    </div>
                    <div>
                        <div className="text-lg md:text-2xl font-bold text-text-primary mb-0 md:mb-1">{stats.kimbap}</div>
                        <div className="text-xs md:text-base text-text-secondary leading-tight hidden sm:block">Kimbap Eaten</div>
                    </div>
                </div>

                <div className="text-center p-2 md:p-4 bg-surface-secondary rounded-lg flex flex-col justify-between min-h-[80px] md:min-h-[120px]">
                    <div className="flex justify-center mb-1 md:mb-3 flex-1">
                        <Image 
                            src={culturalIcon} 
                            alt="Cultural icon" 
                            className="w-full h-full max-w-16 max-h-16 md:max-w-32 md:max-h-32 object-contain" 
                        />
                    </div>
                    <div>
                        <div className="text-lg md:text-2xl font-bold text-text-primary mb-0 md:mb-1">{stats.cultural}</div>
                        <div className="text-xs md:text-base text-text-secondary leading-tight hidden sm:block">Sights Seen</div>
                    </div>
                </div>

                <div className="text-center p-2 md:p-4 bg-surface-secondary rounded-lg flex flex-col justify-between min-h-[80px] md:min-h-[120px]">
                    <div className="flex justify-center mb-1 md:mb-3 flex-1">
                        <Image 
                            src={gitIcon} 
                            alt="Git icon" 
                            className="w-full h-full max-w-16 max-h-16 md:max-w-32 md:max-h-32 object-contain" 
                        />
                    </div>
                    <div>
                        <div className="text-lg md:text-2xl font-bold text-text-primary mb-0 md:mb-1">{stats.commits}</div>
                        <div className="text-xs md:text-base text-text-secondary leading-tight hidden sm:block">Commits Pushed</div>
                    </div>
                </div>

                <div className="text-center p-2 md:p-4 bg-surface-secondary rounded-lg flex flex-col justify-between min-h-[80px] md:min-h-[120px]">
                    <div className="flex justify-center mb-1 md:mb-3 flex-1">
                        <Image 
                            src={stepsIcon} 
                            alt="Steps icon" 
                            className="w-full h-full max-w-16 max-h-16 md:max-w-32 md:max-h-32 object-contain" 
                        />
                    </div>
                    <div>
                        <div className="text-lg md:text-2xl font-bold text-text-primary mb-0 md:mb-1">{stats.steps.toLocaleString()}</div>
                        <div className="text-xs md:text-base text-text-secondary leading-tight hidden sm:block">Steps Walked</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsGrid;