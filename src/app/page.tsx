import { WeekDataService } from "@/lib/weekService";
import { getRandomBlogpost } from '@/lib/blogService';
import { getRandomDay } from '@/lib/dayService';
import { getNewRandomWeek, getNewRandomBlogpost, getNewRandomDay } from './actions/randomActions';
import HeaderLink from "./_components/layout/Link";
import RandomWeekSection from "./_components/frontpage/random-week-section";
import RandomDaySection from "./_components/frontpage/random-day-section";
import RandomBlogpostSection from "./_components/frontpage/random-blogpost-section";

export default async function Index() {
  const randomWeek = await WeekDataService.getRandomWeek(null);
  const randomBlogPost = await getRandomBlogpost(null);
  const randomDay = await getRandomDay(null);

  return (
    <div className="space-y-6">
      {/* Random Week - Full Width */}
      {randomWeek && (
        <RandomWeekSection
          initialWeek={randomWeek}
          fetchNewWeek={getNewRandomWeek}
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
            initialDay={randomDay}
            fetchNewDay={getNewRandomDay}
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
            initialPost={randomBlogPost}
            fetchNewPost={getNewRandomBlogpost}
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