import { WeekDataService } from '@/lib/weekService';
import Link from 'next/link';
import WeekCard from '../_components/weeks/week-card';
import Legend from '../_components/grid/legend';

export default async function Weeks() {
    const weekData = await WeekDataService.getAllWeeks();


    return (
        <div>
            <div className='sticky top-2 bg-white z-10 scroll-p-2'>
                <Legend />
            </div>
            <div className="flex flex-col gap-4 p-4 max-w-6xl mx-auto">
                {weekData.map((week, index) => {
                    // Get the first photo as thumbnail (assuming photos array contains photo IDs/names)
                    const isDraft = week.draft;

                    // Wrap with Link only if not draft
                    if (isDraft) {
                        return (
                            <div key={week.slug}>
                                <WeekCard week={week} priorty={week.index === 0} />
                            </div>
                        );
                    } else {
                        return (
                            <Link
                                key={week.index}
                                href={`${week.index}`}
                                className="group block"
                            >
                                <WeekCard week={week} priorty={week.index === 0} />
                            </Link>
                        );
                    }
                })}
            </div>
        </div>
    );
}