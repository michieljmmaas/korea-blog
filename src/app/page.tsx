import { WeekDataService } from "@/lib/weekService";
import { getMostRecentBlogPost } from '@/lib/blogService';
import { getLatestDay } from '@/lib/dayService';
import WeekCard from "./_components/weeks/week-card";
import BlogPostCard from "./_components/blog/blog-post-card";
import DayCard from "./_components/day/day-card";
import HeaderLink from "./_components/layout/Link";

export default async function Index() {

  const latestWeek = await WeekDataService.getLatestWeek();
  const latestBlogPost = await getMostRecentBlogPost();
  const latestDay = await getLatestDay();

  return (
    <div className="space-y-6">
      {/* Latest Week - Full Width */}
      {latestWeek && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Latest week</h2>
          <WeekCard week={latestWeek} priorty={true} />
          <div className="pt-4">
            <HeaderLink
              title="See more weeks --->"
              pathname="/weeks"
              currentPathName={""} />
          </div>
        </div>
      )}


      {/* Latest Day and Blog Post Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Latest Day - Left */}
        {latestDay && (
          <div className="border border-gray-200 rounded-lg p-4 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Latest day</h2>
            <div className="flex-1">
              <DayCard day={latestDay} />
            </div>
            <div className="pt-4 mt-auto">
              <HeaderLink
                title="See more days --->"
                pathname="/grid"
                currentPathName={""} />
            </div>
          </div>
        )}

        {/* Latest Blog Post - Right */}
        {latestBlogPost && (
          <div className="border border-gray-200 rounded-lg p-4 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Latest blog post</h2>
            <div className="flex-1">
              <BlogPostCard post={latestBlogPost} />
            </div>
            <div className="pt-4 mt-auto">
              <HeaderLink
                title="See more blogposts --->"
                pathname="/blogs"
                currentPathName={""} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}