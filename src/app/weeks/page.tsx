import { WeekDataService } from "@/lib/weekService";
import WeekCard from "../_components/weeks/week-card";
import { getLocationColor } from "../../../utils/locationColors";
import { CityLocation } from "@/app/types";
import workIcon from "../../../public/assets/blog/svg-icons/work.svg";
import musicIcon from "../../../public/assets/blog/svg-icons/music.svg";
import Image from "next/image";

export default async function Weeks() {
  const weekData = await WeekDataService.getAllWeeks();

  const legendItems: { name: CityLocation }[] = [
    { name: "Netherlands" },
    { name: "Macau" },
    { name: "Seoul" },
    { name: "Tokyo" },
    { name: "Taiwan" },
    { name: "Hong Kong" },
  ];

  const iconItems = [
    { title: "Work day", name: "work", src: workIcon },
    { title: "K-pop", name: "music", src: musicIcon },
  ];

  return (
    <>
      <div className="sticky top-2 bg-white z-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 p-4 bg-card border border-border">
          {/* Left side - Location legend */}
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-3 h-3 ${getLocationColor(item.name)}`}></div>
                <span className="text-xs font-sans uppercase tracking-wide text-foreground">
                  {item.name}
                </span>
              </div>
            ))}
          </div>

          {/* Right side - Icons */}
          <div className="flex gap-3">
            {iconItems.map((item, index) => (
              <div key={index} className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity">
                <Image
                  src={item.src}
                  alt={item.title}
                  width={16}
                  height={16}
                  className="w-4 h-4 object-contain"
                />
                <span className="text-xs font-sans text-foreground font-mono uppercase">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
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
