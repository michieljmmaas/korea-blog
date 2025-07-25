import { Calendar, MapPin, Tag, Camera, DollarSign, Cloud } from 'lucide-react';
import { BlogPostFrontmatter } from '../types';

interface BlogPostHeaderProps {
  frontmatter: BlogPostFrontmatter;
}

export default function BlogPostHeader({ frontmatter }: BlogPostHeaderProps) {
  const totalExpenses = Object.values(frontmatter.expenses).reduce((sum, expense) => sum + expense, 0);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-8 mb-8">
      <div className="max-w-4xl mx-auto">
        {/* Title and Day */}
        <div className="text-center mb-6">
          <div className="inline-block bg-white bg-opacity-20 rounded-full px-4 py-2 text-sm font-medium mb-4">
            Day {frontmatter.day}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {frontmatter.title}
          </h1>
          <div className="flex items-center justify-center gap-2 text-blue-100">
            <Calendar className="w-5 h-5" />
            <span className="text-lg">{frontmatter.dayOfWeek}</span>
          </div>
        </div>

        {/* Meta Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Location */}
          {frontmatter.location && (
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <MapPin className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm opacity-90">Location</div>
              <div className="font-semibold">{frontmatter.location}</div>
            </div>
          )}

          {/* Weather */}
          {frontmatter.weather && (
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <Cloud className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm opacity-90">Weather</div>
              <div className="font-semibold">{frontmatter.weather}</div>
            </div>
          )}

          {/* Mood */}
          {frontmatter.mood && (
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">😊</div>
              <div className="text-sm opacity-90">Mood</div>
              <div className="font-semibold">{frontmatter.mood}</div>
            </div>
          )}

          {/* Expenses */}
          {totalExpenses > 0 && (
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm opacity-90">Spent Today</div>
              <div className="font-semibold">${totalExpenses}</div>
            </div>
          )}
        </div>

        {/* Highlights */}
        {frontmatter.highlights.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-center">Today's Highlights</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {frontmatter.highlights.map((highlight, index) => (
                <span
                  key={index}
                  className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm"
                >
                  ✨ {highlight}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {Array.isArray(frontmatter.tags) && frontmatter.tags.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap justify-center gap-2">
              {frontmatter.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-white bg-opacity-15 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}