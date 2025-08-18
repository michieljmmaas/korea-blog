import { getLocationColor } from "../../../../utils/locationColors";

export default function Legend() {
    const legendItems = [
        { name: "The Netherlands" },
        { name: "Seoul" },
        { name: "Busan" },
        { name: "Tokyo" },
        { name: "Taiwan", },
        { name: "Hong Kong" },
    ];

    return (
        <div>
            <div className="flex flex-wrap gap-4 mb-2 p-4 bg-card border border-border rounded-lg justify-end">
                {legendItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className={`w-3 h-3 ${getLocationColor(item.name)}`}></div>
                        <span className={`text-xs font-mono uppercase tracking-wide ${item.name === "Upcoming" ? "text-muted-foreground" : "text-foreground"
                            }`}>
                            {item.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}