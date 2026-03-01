import ImageCarousel from "@/app/_components/common/image-carousel";
import { PostBody } from "@/app/_components/common/post-body";
import markdownToHtml from '@/lib/markdownToHtml';
import { WeekDataService } from '@/lib/weekService';
import WeekInfoTable from '@/app/_components/week/week-info-table';
import { Draft } from '@/app/_components/common/draft';
import { getBlogPostsForDates } from '@/lib/dayService';
import { createForWeek } from '../../../../utils/createImageMap';
import RelatedPosts from "@/app/_components/blog/related-posts";
import { getBlogpostsForWeek } from "@/lib/blogService";
import { processBlogReferences, processDayReferences, processWeekDayTags } from "../../../../utils/updateDayReferences";

interface WeekPageProps {
  params: Promise<{
    weekId: string;
  }>;
}

export async function generateStaticParams() {
  const weekCount = await WeekDataService.getWeekCount();
  return Array.from({ length: weekCount }, (_, i) => ({
    weekId: i.toString(),
  }));
}

export default async function WeekPage({ params }: WeekPageProps) {
  const { weekId: weekIdStr } = await params;
  const weekId = parseInt(weekIdStr, 10);

  if (isNaN(weekId) || weekId < 0) {
    return (<Draft />);
  }

  const week = await WeekDataService.getWeekById(weekId);

  if (!week || week.draft === true) {
    return (<Draft />);
  }

  const imageMapping = createForWeek(week);

  const weekReplaced     = await processWeekDayTags(week.content || "", week);
  const processedContent = await processDayReferences(weekReplaced);
  const processedBlogs   = await processBlogReferences(processedContent);
  const content          = await markdownToHtml(processedBlogs || "", imageMapping);

  const dayPosts     = await getBlogPostsForDates(week.days);
  const relatedPosts = await getBlogpostsForWeek(week);
  const { previousPost, nextPost } = await WeekDataService.getAdjacentWeeks(weekId);

  const photos = week.photos.map((name: string) => `/weeks/${week.index}/${name}`);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col min-h-0 px-6 pb-6">
        <div className="py-6">
          <ImageCarousel
            images={photos}
            alt={`Travel photos from ${week.title}`}
          />
        </div>

        {dayPosts &&
          <WeekInfoTable week={week} dayPosts={dayPosts} nextPost={nextPost} previousPost={previousPost} />
        }

        <div className="flex-1 min-h-0 pt-6">
          <PostBody content={content} />
        </div>

        <div className="max-w-4xl mr-auto">
          <RelatedPosts posts={relatedPosts} />
        </div>
      </main>
    </div>
  );
}