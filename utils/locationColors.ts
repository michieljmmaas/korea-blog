import { CityLocation } from "@/app/types";

/**
 * Single source of truth for location → color token.
 * Change a color here and it updates everywhere.
 */
function getLocationColorToken(location: CityLocation | string): string {
    if (!location) return 'gray';

    const loc = location.toLowerCase().trim();

    if (loc.includes('japan') || loc.includes('tokyo') || loc.includes('osaka') || loc.includes('kyoto')) return 'purple';
    if (loc.includes('macau'))   return 'amber';
    if (loc.includes('seoul'))   return 'blue';
    if (loc.includes('busan'))   return 'red';
    if (loc.includes('taiwan') || loc.includes('taipei')) return 'green';
    if (loc.includes('hong kong')) return 'lime';
    if (loc.includes('nederland') || loc.includes('netherlands') || loc.includes('amsterdam') || loc.includes('rotterdam')) return 'orange';

    return 'gray';
}

/** Returns a Tailwind bg class, e.g. for legend dots. */
export function getLocationColor(location: CityLocation | string): string {
    const token = getLocationColorToken(location);
    const shade = token === 'amber' ? '400' : '600';
    return `bg-${token}-${shade}`;
}

/** Returns a Tailwind border class, e.g. for food item left border. */
export function getLocationBorderColor(location: CityLocation | string): string {
    const token = getLocationColorToken(location);
    const shade = token === 'amber' ? '400' : '500';
    return `border-${token}-${shade}/40`;
}