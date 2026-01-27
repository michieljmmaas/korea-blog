import IconFactory from '../common/icon-factory';
import { CityLocation } from '@/app/types';

interface StatsGridProps {
    stats: {
        kimbap: number;
        cultural: number;
        commits: number;
        worked: number;
        steps: number;
    };
    location: CityLocation;
}

const StatsGrid = ({ stats, location }: StatsGridProps) => {

    return (
        <div className="w-full">
            <div className="grid grid-cols-4 gap-1 md:gap-2">
                <div className="text-center p-1 md:p-2 bg-surface-secondary rounded-lg flex items-center justify-center gap-1 kimbap-bg">
                    <div className="text-xs md:text-lg font-bold text-text-primary">{stats.kimbap}</div>
                    {/* Mobile: sm size, Desktop: lg size */}
                    <div className="md:hidden">
                        <IconFactory
                            name="kimbap"
                            location={location}
                            size="sm"
                            titleMode="stat"
                        />
                    </div>
                    <div className="hidden md:block">
                        <IconFactory
                            name="kimbap"
                            location={location}
                            size="lg"
                            titleMode="stat"
                        />
                    </div>
                </div>

                <div className="text-center p-1 md:p-2 bg-surface-secondary rounded-lg flex items-center justify-center gap-1 cultural-bg">
                    <div className="text-xs md:text-lg font-bold text-text-primary">{stats.cultural}</div>
                    {/* Mobile: sm size, Desktop: lg size */}
                    <div className="md:hidden">
                        <IconFactory
                            name="cultural"
                            location={location}
                            size="sm"
                            titleMode="stat"
                        />
                    </div>
                    <div className="hidden md:block">
                        <IconFactory
                            name="cultural"
                            location={location}
                            size="lg"
                            titleMode="stat"
                        />
                    </div>
                </div>

                <div className="text-center p-1 md:p-2 bg-surface-secondary rounded-lg flex items-center justify-center gap-1 worked-bg">
                    <div className="text-xs md:text-lg font-bold text-text-primary">{stats.worked}</div>
                    {/* Mobile: sm size, Desktop: lg size */}
                    <div className="md:hidden">
                        <IconFactory
                            name="work"
                            location={location}
                            size="sm"
                            titleMode="stat"
                        />
                    </div>
                    <div className="hidden md:block">
                        <IconFactory
                            name="work"
                            location={location}
                            size="lg"
                            titleMode="stat"
                        />
                    </div>
                </div>

                <div className="text-center p-1 md:p-2 bg-surface-secondary rounded-lg flex items-center justify-center gap-1 steps-bg">
                    <div className="text-xs md:text-lg font-bold text-text-primary">{stats.steps.toLocaleString('en-US')}</div>
                    {/* Mobile: sm size, Desktop: lg size */}
                    <div className="md:hidden">
                        <IconFactory
                            name="steps"
                            location={location}
                            size="sm"
                            titleMode="stat"
                        />
                    </div>
                    <div className="hidden md:block">
                        <IconFactory
                            name="steps"
                            location={location}
                            size="lg"
                            titleMode="stat"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsGrid;