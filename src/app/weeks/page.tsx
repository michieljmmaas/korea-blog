import Link from 'next/link';
import { Home, Grid3X3 } from 'lucide-react';
import { WeekDataService } from '@/lib/weekPosts';

export default function Weeks() {
    const weeks = WeekDataService.getAllWeeks();

    






    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-6">
            <div className="text-center">
                <div className="text-8xl mb-8">📅</div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Day Not Found</h1>
                <p className="text-xl text-gray-600 mb-8">
                    Sorry, this blog post doesn't exist yet or the date is invalid.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link
                        href="/grid"
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                        <Grid3X3 className="w-5 h-5" />
                        Back to Grid
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                    >
                        <Home className="w-5 h-5" />
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
}