import { getLocationColor } from "../../../../utils/locationColors";
import { CityLocation } from "./icon-factory";

type Props = {
    location: CityLocation;
};

export function LocationSticker({ location }: Props) {
    const locationColor = getLocationColor(location);

    return (
        <div className={`${locationColor} px-2 py-1 rounded text-white text-sm font-medium`}>
            {location}
        </div>
    );
}
