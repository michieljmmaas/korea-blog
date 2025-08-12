import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TravelBlogHeader from "@/app/_components/travel-blog-header";
import ImageCarousel from "@/app/_components/image-carousel";
import { PostBody } from "@/app/_components/post-body";
import markdownToHtml from '@/lib/markdownToHtml';
import { WeekDataService } from '@/lib/weekPosts';
import { WeekData } from '@/app/types';

interface WeekPageProps {
  params: Promise<{
    weekId: string;
  }>;
}

// Generate static params for all weeks
export async function generateStaticParams() {
  const weekCount = await WeekDataService.getWeekCount();
  
  return Array.from({ length: weekCount }, (_, i) => ({
    weekId: i.toString(),
  }));
}

// Generate metadata
export async function generateMetadata({ params }: WeekPageProps): Promise<Metadata> {
  const { weekId: weekIdStr } = await params;
  const weekId = parseInt(weekIdStr, 10);
  const week = await WeekDataService.getWeekById(weekId);
  
  if (!week) {
    return {
      title: 'Week Not Found',
    };
  }
  
  return {
    title: week.title,
    description: `Travel blog week ${weekId} covering ${week.days.length} days`,
    openGraph: {
      title: week.title,
      description: `Travel blog week ${weekId} covering ${week.days.length} days`,
      type: 'article',
      publishedTime: week.publishdate,
      tags: week.tags,
    },
  };
}

// Week Info Table Component
function WeekInfoTable({ week }: { week: WeekData }) {
  const startDate = new Date(week.days[0]);
  const endDate = new Date(week.days[week.days.length - 1]);
  
  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-lg font-semibold mb-4">Week Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Duration</div>
          <div className="font-medium">
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Days</div>
          <div className="font-medium">{week.days.length} days</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="font-medium">
            {week.draft ? (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                Draft
              </span>
            ) : (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                Published
              </span>
            )}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Tags</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {week.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Days breakdown */}
      <div className="mt-4">
        <div className="text-sm text-muted-foreground mb-2">Days Covered</div>
        <div className="grid grid-cols-7 gap-1">
          {week.days.map((day, index) => {
            const date = new Date(day);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = date.getDate();
            
            return (
              <div
                key={day}
                className="text-center p-2 bg-muted rounded text-xs"
              >
                <div className="text-muted-foreground">{dayName}</div>
                <div className="font-semibold">{dayNum}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default async function WeekPage({ params }: WeekPageProps) {
  const { weekId: weekIdStr } = await params;
  const weekId = parseInt(weekIdStr, 10);
  
  if (isNaN(weekId) || weekId < 0) {
    notFound();
  }
  
  const week = await WeekDataService.getWeekById(weekId);
  
  if (!week) {
    notFound();
  }
  
  const content = await markdownToHtml(week.content || "");
  
  // Get adjacent weeks for navigation
  const previousWeek = weekId > 0 ? await WeekDataService.getWeekById(weekId - 1) : null;
  const nextWeek = await WeekDataService.getWeekById(weekId + 1);
  
  // Format previous/next for TravelBlogHeader
  const previousPost = previousWeek ? {
    slug: `week-${weekId - 1}`,
    frontmatter: {
      title: previousWeek.title,
      day: weekId - 1
    }
  } : null;
  
  const nextPost = nextWeek ? {
    slug: `week-${weekId + 1}`,
    frontmatter: {
      title: nextWeek.title,
      day: weekId + 1
    }
  } : null;
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* <TravelBlogHeader
        previousPost={previousPost}
        nextPost={nextPost}
      /> */}

      <main className="flex-1 flex flex-col min-h-0 px-6 pb-6">
        {/* Image Carousel */}
        <div className="py-6">
          <ImageCarousel
            images={week.photos}
            date={week.publishdate}
            alt={`Travel photos from ${week.title}`}
          />
        </div>

        {/* Week Info Table */}
        <WeekInfoTable week={week} />

        {/* Week Content */}
        <div className="flex-1 min-h-0 pt-6">
          <PostBody content={content} />
        </div>
      </main>
    </div>
  );
}