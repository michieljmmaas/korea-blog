import { WeekDataService } from "@/lib/weekService";
import { BlogService } from '@/lib/blogService';
import { DayService } from '@/lib/dayService';
import HeaderLink from "./_components/layout/Link";
import RandomWeekSection from "./_components/frontpage/random-week-section";
import RandomDaySection from "./_components/frontpage/random-day-section";
import RandomBlogpostSection from "./_components/frontpage/random-blogpost-section";

// Picked once at build/request time as an SSR placeholder; RandomSection re-picks
// client-side on mount so each visitor gets their own random item.
function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export default async function Index() {
  const weeks = (await WeekDataService.getAllWeeks()).filter((week) => !week.draft);
  const days = (await DayService.getBlogPosts()).filter((day) => day.frontmatter.draft === false);
  const blogPosts = await BlogService.getAllRelevantBlogPosts();

  const randomWeek = weeks.length > 0 ? pickRandom(weeks) : null;
  const randomDay = days.length > 0 ? pickRandom(days) : null;
  const randomBlogPost = blogPosts.length > 0 ? pickRandom(blogPosts) : null;

  return (
    <div className="space-y-6">
      {/* Random Week - Full Width */}
      {randomWeek && (
        <RandomWeekSection
          weeks={weeks}
          initialWeek={randomWeek}
          linkComponent={
            <HeaderLink
              title="See more weeks --->"
              pathname="/weeks"
              currentPathName={""}
            />
          }
        />
      )}

      {/* Random Day and Blog Post Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Random Day - Left */}
        {randomDay && (
          <RandomDaySection
            days={days}
            initialDay={randomDay}
            linkComponent={
              <HeaderLink
                title="See more days --->"
                pathname="/grid"
                currentPathName={""}
              />
            }
          />
        )}

        {/* Random Blog Post - Right */}
        {randomBlogPost && (
          <RandomBlogpostSection
            posts={blogPosts}
            initialPost={randomBlogPost}
            linkComponent={
              <HeaderLink
                title="See more blogposts --->"
                pathname="/blogs"
                currentPathName={""}
              />
            }
          />
        )}
      </div>
    </div>
  );
}
