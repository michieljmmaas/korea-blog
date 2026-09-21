// DayCard.tsx
import { DayFrontmatter, TripDay } from '@/app/types';
import Image from 'next/image';
import { LocationSticker } from '../common/location-sticker';
import IconFactory from '../common/icon-factory';
import StatsGrid from './stats-grid';
import ScoreBadge from './score-badge';
import BaseCard from '../common/cards/base-card';
import { CardContent } from '../common/cards/card-content';
import { CardImage } from '../common/cards/card-image';
import TagList from '../blog/tag-list';

// Drop the trailing ", 2025" — the whole trip is in one year, and it's what pushes the longest titles past the sticker.
const withoutYear = (title: string) => title.replace(/,\s*\d{4}$/, '');

interface DayCardProps {
    day: TripDay;
    dateAsTitle?: boolean;
}

// The text half of the card (no image); also used on its own by the trip grid's hover popover.
// `dateAsTitle` is for hover popovers, where the date is what you're scanning for; on-page cards keep the real title.
export function DayCardContent({ frontmatter, dateAsTitle = false }: { frontmatter: DayFrontmatter; dateAsTitle?: boolean }) {
    return (
        <CardContent>
            {/* Title with Icon and Location */}
            <div className="flex items-start justify-between gap-4 mb-3">
                {/* Single line, overflow hidden: the sticker keeps its position and long titles get clipped */}
                <h3
                    className="text-xl font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis min-w-0 flex-1"
                    title={frontmatter.title}
                >
                    {dateAsTitle ? frontmatter.date : withoutYear(frontmatter.title)}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <LocationSticker location={frontmatter.location} />
                </div>
            </div>

            {/* Description + score on one row; description is kept to a single line */}
            <div className="flex items-start justify-between gap-4 mb-4 flex-1">
                <p className="text-gray-600 text-sm leading-relaxed truncate min-w-0 flex-1">
                    {frontmatter.description}
                </p>
                <ScoreBadge score={frontmatter.score} rank={frontmatter.rank} />
            </div>

            <div className="mt-auto pb-5">
                <TagList tags={frontmatter.tags.slice(0, 3)} />
            </div>

            {/* Stats Grid at bottom */}
            <div className="mt-auto">
                <StatsGrid stats={frontmatter.stats} location={frontmatter.location} />
            </div>
        </CardContent>
    );
}

export default function DayCard({ day, dateAsTitle }: DayCardProps) {
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

            <DayCardContent frontmatter={frontmatter} dateAsTitle={dateAsTitle} />
        </BaseCard>
    );
}