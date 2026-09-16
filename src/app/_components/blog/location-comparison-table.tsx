import { CityLocation } from "@/app/types";
import { getLocationColor, getLocationBorderColor } from "../../../../utils/locationColors";

interface LocationColumn {
    location: CityLocation;
    label: string;
}

interface ComparisonEntry {
    location: CityLocation;
    text: string;
}

const COLUMNS: LocationColumn[] = [
    { location: "Seoul", label: "Korea" },
    { location: "Tokyo", label: "Japan" },
    { location: "Taiwan", label: "Taiwan" },
    { location: "Hong Kong", label: "Hong Kong" },
];

/**
 * One entry per `type`, keyed to match the `type="..."` attribute used in
 * `<CompareTable type="..."/>` tags in blog markdown (see comparing-the-locations.md).
 * Add a new key here, then reference it from the post.
 */
const CATEGORIES: Record<string, ComparisonEntry[]> = {
    "convenience-stores": [
        { location: "Seoul", text: "There are a lot of places everywhere. Kimbap, instant noodles, and a seat to eat them at, though usually solo." },
        { location: "Tokyo", text: "Mostly pre-packaged food, including some genuinely good baked goods, but no real seating to eat there." },
        { location: "Taiwan", text: "Hot dogs and eggs on the counter, more familiar to a Western eye, and actually meant to be eaten on the spot." },
        { location: "Hong Kong", text: "Smaller and fewer stores overall. They sold things like tripe, but no real place to sit and eat it." },
    ],
    "nature": [
        { location: "Seoul", text: "Hiking Bukhansan was great, but having CheongeChon running right through the middle of Seoul was just as nice to have close by." },
        { location: "Tokyo", text: "I didn't get to see much of it this time around; mostly city." },
        { location: "Taiwan", text: "Alishan was amazing. One of the best hikes of the whole trip." },
        { location: "Hong Kong", text: "The hike itself was cool, but the nature around it wasn't all that interesting compared to the others." },
    ],
    "legal-tender": [
        { location: "Seoul", text: "Barely needed cash at all. Everything runs on card or KakaoPay, to the point where the coins I did get felt like relics." },
        { location: "Tokyo", text: "I ended up using a lot more cash than I expected. The coins with holes in the middle are a fun novelty, but I still prefer paying by card." },
        { location: "Taiwan", text: "A nice middle ground — the EasyCard covered almost everything, cash only for the smaller stalls. The bills are covered in beautiful, very deliberate nation-branding." },
        { location: "Hong Kong", text: "Probably the best of the bunch. The Hong Kong Dollar has genuinely nice artwork, distinct coins for everything, and an easy ~10-to-1 exchange rate with the euro." },
    ],
    "public-transit": [
        { location: "Seoul", text: "Impressive. Buses are abundant, the metro runs on time, and connections are fast. My only real complaint is that the stations are massive, so transfers can eat up more time than you'd expect." },
        { location: "Tokyo", text: "Busy, but cheap and incredibly reliable." },
        { location: "Taiwan", text: "The metro in Taipei and Kaohsiung was great. The buses, on the other hand, I wouldn't recommend." },
        { location: "Hong Kong", text: "The metro was nice but noticeably pricier than the others, and some stops felt a bit further from where you'd actually want to be." },
    ],
    "people-culture": [
        { location: "Seoul", text: "English has really grown here over the past few years, even outside of Seoul." },
        { location: "Tokyo", text: "Friendly and respectful, though you can clearly see the strain tourism is putting on daily life." },
        { location: "Taiwan", text: "Not a lot of English spoken, but genuinely friendly, and people were always happy to see you try." },
        { location: "Hong Kong", text: "Less English than I expected, honestly, for a former British colony." },
    ],
    "museums": [
        { location: "Seoul", text: "Large, clear, well translated, and often free." },
        { location: "Tokyo", text: "A bit underwhelming overall, though I loved the Hokusai Museum specifically." },
        { location: "Taiwan", text: "Genuinely impressive, especially their modern art scene." },
        { location: "Hong Kong", text: "Strange. You can feel a certain political touch in how the history is presented." },
    ],
    "street-food": [
        { location: "Seoul", text: "Amazing. Cheap and plentiful enough to just graze your way through a market. Both Gwangjang and the Seoul Flea Market delivered." },
        { location: "Tokyo", text: "Harder to find than I expected outside of dedicated food streets, but what I did find was excellent." },
        { location: "Taiwan", text: "I worked my way through a lot of it — plenty of offal, and of course stinky tofu. More of an adventure than the others." },
        { location: "Hong Kong", text: "Not that impressive. Mostly stalls selling goods, not so much actual food." },
    ],
    "accommodation": [
        { location: "Seoul", text: "Mangrove was nice, if a bit simple." },
        { location: "Tokyo", text: "The capsule hotel was, famously, not recommended." },
        { location: "Taiwan", text: "A mix of regular hotels and a small lodge near Alishan for the sunrise hike — simple, but it got the job done." },
        { location: "Hong Kong", text: "Fancy, and priced accordingly, but with fewer amenities than the price tag would suggest. A real lesson in how expensive real estate there actually is." },
    ],
};

interface CompareTableProps {
    type: string;
}

const CompareTable = ({ type }: CompareTableProps) => {
    const entries = CATEGORIES[type];

    if (!entries) {
        return (
            <div className="w-full my-4 px-4 py-3 text-sm text-destructive border border-dashed border-destructive/40 rounded-lg">
                No comparison data found for type=&quot;{type}&quot;. Known types: {Object.keys(CATEGORIES).join(", ")}
            </div>
        );
    }

    return (
        <div className="w-full my-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {entries.map((entry) => {
                const col = COLUMNS.find((c) => c.location === entry.location);
                return (
                    <div
                        key={entry.location}
                        className={`rounded-lg border border-border bg-muted/20 px-4 py-3 border-l-4 ${getLocationBorderColor(entry.location)}`}
                    >
                        <span className={`inline-block ${getLocationColor(entry.location)} text-white text-xs font-medium px-2 py-1 rounded mb-2`}>
                            {col?.label ?? entry.location}
                        </span>
                        <p className="text-sm text-muted-foreground">{entry.text}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default CompareTable;
