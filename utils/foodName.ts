import { CityLocation } from "@/app/types";

export const getFoodName = (location: CityLocation): string => {
    if (location === "Tokyo") {
        return "Sushi";
    } else if (location === "Hong Kong") {
        return "Dim Sum";
    } else if (location === "Taiwan") {
        return "Xiaolongbao";
    }

    return 'Kimbap';
};