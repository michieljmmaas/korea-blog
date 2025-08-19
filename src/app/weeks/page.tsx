import { WeekDataService } from '@/lib/weekPosts';
import { WeekData } from '../types';
import Link from 'next/link';
import Image from 'next/image';

export default async function Weeks() {
    const weekData = await WeekDataService.getAllWeeks();

    return (
        <div className="flex flex-col gap-4 p-6 max-w-4xl mx-auto">
            {weekData.map((week) => {
                // Get the first photo as thumbnail (assuming photos array contains photo IDs/names)
                const thumbnailId = week.photos[0];
                const isDraft = week.draft;
                
                const WeekCard = (
                    <div className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 ${
                        isDraft 
                            ? 'opacity-60 cursor-not-allowed' 
                            : 'hover:-translate-y-1 cursor-pointer'
                    }`}>
                        {/* Full width container with flex layout */}
                        <div className="flex">
                            {/* Thumbnail Image */}
                            <div className="relative w-48 h-32 bg-gray-200 flex-shrink-0">
                                {thumbnailId && (
                                    <Image
                                        src={`/images/weeks/${week.slug}/${thumbnailId}.jpg`} // Adjust path as needed
                                        alt={week.title}
                                        fill
                                        className="object-cover"
                                        sizes="192px"
                                    />
                                )}
                                
                                {/* Tags overlay */}
                                {week.tags.length > 0 && (
                                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                        {week.tags.slice(0, 2).map((tag) => (
                                            <span 
                                                key={tag}
                                                className="bg-black/70 text-white text-xs px-2 py-1 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {week.tags.length > 2 && (
                                            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                                +{week.tags.length - 2}
                                            </span>
                                        )}
                                    </div>
                                )}
                                
                                {/* Draft indicator */}
                                {isDraft && (
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <span className="bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded-full">
                                            DRAFT
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Content Section */}
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <h3 className={`font-bold text-xl mb-2 ${
                                        isDraft ? 'text-gray-500' : 'text-gray-900'
                                    }`}>
                                        {week.title}
                                        {isDraft && <span className="ml-2 text-sm text-yellow-600">(Draft)</span>}
                                    </h3>
                                    
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                        <span className="font-medium">
                                            Week {week.index}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span>
                                            {week.days.length} {week.days.length === 1 ? 'day' : 'days'}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span>
                                            {week.photos.length} photos
                                        </span>
                                    </div>
                                    
                                    {/* Content preview */}
                                    <p className={`text-sm line-clamp-2 ${
                                        isDraft ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        {week.content.substring(0, 150)}...
                                    </p>
                                </div>
                                
                                {/* Bottom info */}
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                    <div className="text-xs text-gray-500">
                                        {new Date(week.publishdate).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    
                                    {/* Days list */}
                                    <div className="flex flex-wrap gap-1">
                                        {week.days.slice(0, 3).map((day) => (
                                            <span 
                                                key={day}
                                                className={`text-xs px-2 py-1 rounded-full ${
                                                    isDraft 
                                                        ? 'bg-gray-100 text-gray-400' 
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}
                                            >
                                                {day}
                                            </span>
                                        ))}
                                        {week.days.length > 3 && (
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                isDraft 
                                                    ? 'bg-gray-100 text-gray-400' 
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                +{week.days.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
                
                // Wrap with Link only if not draft
                if (isDraft) {
                    return (
                        <div key={week.slug}>
                            {WeekCard}
                        </div>
                    );
                } else {
                    return (
                        <Link 
                            key={week.slug} 
                            href={`/weeks/${week.slug}`}
                            className="group block"
                        >
                            {WeekCard}
                        </Link>
                    );
                }
            })}
        </div>
    );
}