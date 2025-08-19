import { WeekData } from '@/app/types';
import { CameraOff } from 'lucide-react';
import Image from 'next/image';
import { getLocationColor } from '../../../../utils/locationColors';


interface WeekCardProps {
    week: WeekData;
}

export default function WeekCard({ week }: WeekCardProps) {

    const isDraft = week.draft;
    const index = week.index;

    // Helper function to format date range
    const formatDateRange = (days: string[]): string => {
        if (days.length === 0) return '';

        const firstDay = new Date(days[0]);
        const lastDay = new Date(days[days.length - 1]);

        const formatDate = (date: Date) => {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit'
            });
        };

        return `${formatDate(firstDay)} - ${formatDate(lastDay)}`;
    };

    const locationColor = getLocationColor(week.location);


    const WeekCard = (
        <div className={`bg-white rounded-sm shadow-lg overflow-hidden transition-transform duration-300 ${isDraft
            ? 'opacity-60 cursor-not-allowed'
            : 'hover:-translate-y-1 cursor-pointer'
            }`}>
            {/* Full width thumbnail */}
            <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 bg-gray-200">
                {!isDraft && (
                    <Image
                        src={`/thumbnails/weeks/${week.index}.webp`}
                        alt={week.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1200px"
                        priority={index === 0}
                    />
                )}

                {/* Draft indicator */}
                {isDraft && (
                    <div className="h-full bg-gray-200 rounded-t-sm flex items-center justify-center">
                        <CameraOff fill="black" opacity="60"/>
                    </div>
                )}
            </div>

            {/* Bottom bar */}
            <div className={`p-2 md:p-2 ${locationColor} `}>
                <div className={`font-semibold text-base md:text-lg text-white ${isDraft ? 'text-gray-500' : 'text-gray-900'
                    }`}>
                    Week {week.index}: {formatDateRange(week.days)}
                </div>
            </div>
        </div>
    );

    return WeekCard;
}