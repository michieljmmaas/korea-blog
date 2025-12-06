import { WeekDataService } from "@/lib/weekService";
import WeekCard from "../_components/weeks/week-card";
import Legend from "../_components/grid/legend";

export default async function Weeks() {
  const weekData = await WeekDataService.getAllWeeks();

  return (
    <>
      <div className="sticky top-2 bg-white z-10">
        <Legend />
      </div>
      <div className="flex flex-col gap-4 p-2 max-w-6xl mx-auto">
        {weekData.map((week, index) => {
          return (
            <div key={index}>
              <WeekCard week={week} priorty={week.index === 0} />
            </div>
          );
        })}
      </div>
    </>
  );
}
