import { WeekData } from '@/app/types';
import { CameraOff } from 'lucide-react';
import Image from 'next/image';
import IconFactory, { IconName } from '../common/icon-factory';
import { LocationSticker } from '../common/location-sticker';
import Link from 'next/link';

interface WeekCardProps {
    week: WeekData;
    priorty: boolean;
}

export default function WeekCard({ week, priorty }: WeekCardProps) {
    const isDraft = week.draft;

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

    let description = week.title;

    const WeekCard = (
        <Link
            key={week.index}
            href={isDraft ? '#' : `/weeks/${week.index}`}
            className="group block"
        >
            <div className={`bg-white rounded-md shadow-lg overflow-hidden transition-transform duration-300 ${isDraft
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
                            priority={priorty}
                        />
                    )}

                    {/* Draft indicator */}
                    {isDraft && (
                        <div className="h-full bg-gray-200 rounded-t-sm flex items-center justify-center">
                            <CameraOff fill="black" opacity="60" />
                        </div>
                    )}
                </div>

                {/* Bottom bar */}
                <div className="p-2 md:p-4 bg-white flex items-center justify-between">
                    {/* Description - left aligned */}
                    <div className={`font-semibold text-base md:text-lg ${isDraft ? 'text-gray-500' : 'text-gray-900'
                        }`}>
                        {description}
                    </div>

                    {/* Right side: Icons and Location */}
                    <div className="flex items-center gap-2">
                        {/* Icons using IconFactory */}
                        {week.icons && week.icons.map((iconName, iconIndex) => (
                            <IconFactory
                                key={iconIndex}
                                name={iconName as IconName}
                                location={week.location}
                                size="sm"
                                titleMode="stat" // Use "stat" for activity counts, "info" for general description
                            />
                        ))}
                        <LocationSticker location={week.location} />
                    </div>
                </div>
            </div>
        </Link>
    );





    return WeekCard;
}