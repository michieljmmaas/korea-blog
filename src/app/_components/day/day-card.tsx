// DayCard.tsx
import { TripDay } from '@/app/types';
import Image from 'next/image';
import { LocationSticker } from '../common/location-sticker';
import IconFactory from '../common/icon-factory';
import StatsGrid from './stats-grid';
import BaseCard from '../common/cards/base-card';
import { CardContent } from '../common/cards/card-content';
import { CardImage } from '../common/cards/card-image';

interface DayCardProps {
    day: TripDay;
}

export default function DayCard({ day }: DayCardProps) {
    const { frontmatter } = day;
    const link = "/day/" + day.formattedDate;

    return (
        <BaseCard href={link}>
            <CardImage>
               <Image
                    src={`/thumbnails/days-frontpage/${frontmatter.date}.webp`}
                    alt={frontmatter.date}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={false}
                />
            </CardImage>

            <CardContent>
                {/* Title with Icon and Location */}
                <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 flex-1">
                        {frontmatter.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <IconFactory name={frontmatter.icon} />
                        <LocationSticker location={frontmatter.location} />
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-1 mb-4 flex-1 ">
                    {frontmatter.description}
                </p>

                {/* Stats Grid at bottom */}
                <div className="mt-auto">
                    <StatsGrid stats={frontmatter.stats} location={frontmatter.location} />
                </div>
            </CardContent>
        </BaseCard>
    );
}