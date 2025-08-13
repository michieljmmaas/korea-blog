import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TravelBlogHeader from "@/app/_components/travel-blog-header";
import ImageCarousel from "@/app/_components/image-carousel";
import { PostBody } from "@/app/_components/post-body";
import markdownToHtml from '@/lib/markdownToHtml';
import { WeekDataService } from '@/lib/weekPosts';
import WeekInfoTable from '@/app/_components/week-info-table';
import { BlogPostFrontmatter } from '@/app/types';
import Header from '@/app/_components/header';
import Container from '@/app/_components/container';

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

  const { getBlogPostsForDates } = await import('@/lib/blogPost');
  const dayPosts = await getBlogPostsForDates(week.days);



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

  const photos = week.photos.map((number: Number) => `/weeks/${week.index}/photos/${number}.heic`);
  photos.unshift(`/weeks/${week.index}/thumb.heic`);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col min-h-0 px-6 pb-6">
        {/* Image Carousel */}
        <div className="py-6">
          <ImageCarousel
            images={photos}
            alt={`Travel photos from ${week.title}`}
          />
        </div>

        {dayPosts &&

          <WeekInfoTable week={week} dayPosts={dayPosts} />
        }

        {/* Week Content */}
        <div className="flex-1 min-h-0 pt-6">
          <PostBody content={content} />
        </div>
      </main>
    </div>
  );
}