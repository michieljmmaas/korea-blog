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
    if (loc === 'trip-wide') return 'orange';

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

/**
 * Hex equivalents of the Tailwind color tokens above, for contexts that can't
 * use Tailwind classes (SVG `fill`/`stroke` attributes in D3 charts). Kept in
 * lockstep with `getLocationColorToken` so there is still one source of truth
 * per location.
 */
const TOKEN_HEX: Record<string, string> = {
    purple: '#9333ea',
    amber: '#fbbf24',
    blue: '#2563eb',
    red: '#dc2626',
    green: '#16a34a',
    lime: '#65a30d',
    orange: '#ea580c',
    gray: '#4b5563',
};

/** Returns a hex color for use as an SVG fill/stroke, e.g. in D3 charts. */
export function getLocationColorHex(location: CityLocation | string): string {
    const token = getLocationColorToken(location);
    return TOKEN_HEX[token];
}