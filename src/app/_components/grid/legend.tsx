import { getLocationColor } from "../../../../utils/locationColors";
import workIcon from "../../../../public/assets/blog/svg-icons/work.svg";
import musicIcon from "../../../../public/assets/blog/svg-icons/music.svg";
import Image from 'next/image';


export default function Legend() {
    const legendItems = [
        { name: "The Netherlands" },
        { name: "Seoul" },
        { name: "Busan" },
        { name: "Tokyo" },
        { name: "Taiwan" },
        { name: "Hong Kong" },
    ];

    const iconItems = [
        { name: "Work day", icon: workIcon },
        { name: "K-pop", icon: musicIcon },
    ];

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 p-4 bg-card border border-border">
                {/* Left side - Location legend */}
                <div className="flex flex-wrap gap-3 sm:gap-4">
                    {legendItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className={`w-3 h-3 ${getLocationColor(item.name)}`}></div>
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
                            <Image
                                src={item.icon}
                                width={20}
                                height={20}
                                alt={item.name}
                            />
                            <span className="text-xs font-sans text-foreground font-mono uppercase">
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}