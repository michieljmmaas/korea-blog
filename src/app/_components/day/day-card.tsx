import Link from 'next/link';
import { TripDay } from '@/app/types';
import { ImageKitImage } from '../common/image-kit-image';
import { LocationSticker } from '../common/location-sticker';
import IconFactory from '../common/icon-factory';
import StatsGrid from './stats-grid';

interface DayCardProps {
    day: TripDay;
}

export default function DayCard({ day }: DayCardProps) {
    const { frontmatter } = day;

    const imageSource = "/" + day.formattedDate + "/thumb.heic";

    const link = "/day/" + day.formattedDate;

    return (
        <Link href={link} className="group block h-max">
            <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
                {/* Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden">
                    <ImageKitImage
                        source={imageSource}
                        alt={frontmatter.title}
                        fill={true}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                        priority={false}
                    />
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                        {frontmatter.title}
                    </h3>

                    {/* Description, Icon, and Location on same line */}
                    <div className="flex items-start justify-between gap-4">
                        {/* Description (left aligned) */}
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
                            {frontmatter.description}
                        </p>

                        {/* Icon and Location (right aligned) */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <IconFactory name={frontmatter.icon} />
                            <LocationSticker location={frontmatter.location} />
                        </div>
                    </div>

                    {/* Description, Icon, and Location on same line */}
                    <div className="flex items-start justify-between pt-2">
                        <StatsGrid stats={frontmatter.stats} location={frontmatter.location} />
                    </div>
                </div>
            </article>
        </Link>
    );
}