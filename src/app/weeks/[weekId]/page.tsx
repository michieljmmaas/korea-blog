import ImageCarousel from "@/app/_components/common/image-carousel";
import { PostBody } from "@/app/_components/common/post-body";
import markdownToHtml from '@/lib/markdownToHtml';
import { WeekDataService } from '@/lib/weekService';
import WeekInfoTable from '@/app/_components/week/week-info-table';
import { Draft } from '@/app/_components/common/draft';
import { getBlogPostsForDates } from '@/lib/dayService';
import { createForWeek } from '../../../../utils/createImageMap';
import { WeekData } from "@/app/types";



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

export default async function WeekPage({ params }: WeekPageProps) {
  const { weekId: weekIdStr } = await params;
  const weekId = parseInt(weekIdStr, 10);



  if (isNaN(weekId) || weekId < 0) {
    return (<Draft />)
  }

  const week = await WeekDataService.getWeekById(weekId);

  if (!week || week.draft === true) {
    return (<Draft />)
  }

  const imageMapping = createForWeek(week);

  function simpleReplace(markdown: string, week: WeekData): string {
    return markdown
      .replaceAll('<Fri>', `<a href="${"../day/" + week.days[0]}" class="dayLink">Friday</a>`)
      .replaceAll('<Sat>', `<a href="${"../day/" + week.days[1]}" class="dayLink">Saterday</a>`)
      .replaceAll('<Sun>', `<a href="${"../day/" + week.days[2]}" class="dayLink">Sunday</a>`)
      .replaceAll('<Mon>', `<a href="${"../day/" + week.days[3]}" class="dayLink">Monday</a>`)
      .replaceAll('<Tue>', `<a href="${"../day/" + week.days[4]}" class="dayLink">Tuesday</a>`)
      .replaceAll('<Wed>', `<a href="${"../day/" + week.days[5]}" class="dayLink">Wednesday</a>`)
      .replaceAll('<Thu>', `<a href="${"../day/" + week.days[6]}" class="dayLink">Thursday</a>`)
  }

  const processedContent = simpleReplace(week.content || "", week);


  const content = await markdownToHtml(processedContent || "", imageMapping);
  const dayPosts = await getBlogPostsForDates(week.days);

  const { previousPost, nextPost } = await WeekDataService.getAdjacentWeeks(weekId);

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
          <WeekInfoTable week={week} dayPosts={dayPosts} nextPost={nextPost} previousPost={previousPost} />
        }

        {/* Week Content */}
        <div className="flex-1 min-h-0 pt-6">
          <PostBody content={content} />
        </div>
      </main>
    </div>
  );
}