import { getLocationColor } from "../../../../utils/locationColors";
import IconFactory, { CityLocation } from "../common/icon-factory";


export default function Legend() {
    const legendItems = [
        { name: "Netherlands" },
        { name: "Seoul" },
        { name: "Busan" },
        { name: "Tokyo" },
        { name: "Taiwan" },
        { name: "Hong Kong" },
    ];

    const iconItems = [
        { title: "Work day", name: "work" },
        { title: "K-pop", name: "music" },
    ];

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 p-4 bg-card border border-border">
                {/* Left side - Location legend */}
                <div className="flex flex-wrap gap-3 sm:gap-4">
                    {legendItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className={`w-3 h-3 ${getLocationColor(item.name as CityLocation)}`}></div>
                            <span className={`text-xs font-sans uppercase tracking-wide ${item.name === "Upcoming" ? "text-muted-foreground" : "text-foreground"
                                }`}>
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Right side - Icons */}
                <div className="flex gap-3">
                    {iconItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity">
                            <IconFactory
                                name={item.name}
                                size="sm"
                                titleMode="info"
                            />
                            <span className="text-xs font-sans text-foreground font-mono uppercase">
                                {item.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}