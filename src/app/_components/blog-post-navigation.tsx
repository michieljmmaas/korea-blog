import Link from 'next/link';
import { ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';

interface BlogPostNavigationProps {
  previousPost: { day: number; slug: string; title: string } | null;
  nextPost: { day: number; slug: string; title: string } | null;
}

export default function BlogPostNavigation({ previousPost, nextPost }: BlogPostNavigationProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        {/* Previous Post */}
        <div className="flex-1">
          {previousPost ? (
            <Link
              href={`/day/${previousPost.slug}`}
              className="group flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
              <div>
                <div className="text-sm text-gray-500">Previous Day</div>
                <div className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors duration-200 truncate">
                  Day {previousPost.day}
                </div>
              </div>
            </Link>
          ) : (
            <div className="p-4"></div>
          )}
        </div>

        {/* Back to Grid */}
        <div className="flex-shrink-0 mx-4">
          <Link
            href="/grid"
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <Grid3X3 className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Grid</span>
          </Link>
        </div>

        {/* Next Post */}
        <div className="flex-1 flex justify-end">
          {nextPost ? (
            <Link
              href={`/day/${nextPost.slug}`}
              className="group flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="text-right">
                <div className="text-sm text-gray-500">Next Day</div>
                <div className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors duration-200 truncate">
                  Day {nextPost.day}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
            </Link>
          ) : (
            <div className="p-4"></div>
          )}
        </div>
      </div>
    </div>
  );
}