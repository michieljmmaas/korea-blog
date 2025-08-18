import Image from 'next/image';
import kimbapIcon from "../../../../public/assets/blog/svg-icons/kimbap.svg";
import workIcon from "../../../../public/assets/blog/svg-icons/worked.svg";
import culturalIcon from "../../../../public/assets/blog/svg-icons/cultural.svg";
import stepsIcon from "../../../../public/assets/blog/svg-icons/steps.svg";

interface StatsGridProps {
    stats: {
        kimbap: number;
        cultural: number;
        commits: number;
        worked: number;
        steps: number;
    };
}

const StatsGrid = ({ stats }: StatsGridProps) => {
    return (
        <div className="w-full">
            <div className="grid grid-cols-4 gap-1 md:gap-2">
                <div className="text-center p-1 md:p-2 bg-surface-secondary rounded-lg flex items-center justify-center gap-1 kimbap-bg">
                    <div className="text-sm md:text-lg font-bold text-text-primary">{stats.kimbap}</div>
                    <Image 
                        src={kimbapIcon} 
                        alt="Kimbap icon" 
                        title="Kimbap Eaten"
                        className="w-10 h-10 object-contain" 
                    />
                </div>

                <div className="text-center p-1 md:p-2 bg-surface-secondary rounded-lg flex items-center justify-center gap-1 cultural-bg">
                    <div className="text-sm md:text-lg font-bold text-text-primary">{stats.cultural}</div>
                    <Image 
                        src={culturalIcon} 
                        alt="Cultural icon" 
                        title="Sights Seen"
                        className="w-10 h-10 object-contain" 
                    />
                </div>

                <div className="text-center p-1 md:p-2 bg-surface-secondary rounded-lg flex items-center justify-center gap-1 worked-bg">
                    <div className="text-sm md:text-lg font-bold text-text-primary">{stats.worked}</div>
                    <Image 
                        src={workIcon} 
                        alt="Programmer" 
                        title="Hours worked"
                        className="w-10 h-10 object-contain" 
                    />
                </div>

                <div className="text-center p-1 md:p-2 bg-surface-secondary rounded-lg flex items-center justify-center gap-1 steps-bg">
                    <div className="text-sm md:text-lg font-bold text-text-primary">{stats.steps.toLocaleString()}</div>
                    <Image 
                        src={stepsIcon} 
                        alt="Steps icon" 
                        title="Steps Walked"
                        className="w-10 h-10 object-contain" 
                    />
                </div>
            </div>
        </div>
    );
};

export default StatsGrid;