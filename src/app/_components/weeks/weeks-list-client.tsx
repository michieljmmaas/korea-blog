'use client';

import { WeekData } from '@/app/types';
import WeekCard from './week-card';
import { useReduxMode } from '../providers/redux-mode-provider';

interface WeeksListClientProps {
    weeks: WeekData[];
}

export default function WeeksListClient({ weeks }: WeeksListClientProps) {
    const { hasNotHappenedYet } = useReduxMode();

    return (
        <div className="flex flex-col gap-4 p-2 max-w-6xl mx-auto">
            {weeks.map((week, index) => (
                <div key={index}>
                    <WeekCard
                        week={week}
                        priorty={week.index === 0}
                        isDimmed={hasNotHappenedYet(week.days[0])}
                    />
                </div>
            ))}
        </div>
    );
}
