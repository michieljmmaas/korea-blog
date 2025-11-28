import { CityLocation } from "@/app/types";

export const getFoodName = (location: CityLocation): string => {
    if (location === "Tokyo") {
        return "Sushi";
    } else if (location === "Hong Kong") {
        return "Wonton";
    } else if (location === "Taiwan") {
        return "Xiaolongbao";
    } else if (location === "Netherlands") {
        return "Frikandelbroodje";
    } else if (location === "Macau") {
        return "Snacks";
    }

    return 'Kimbap';
};