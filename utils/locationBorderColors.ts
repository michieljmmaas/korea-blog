import { CityLocation } from '@/app/types';

/**
 * Returns a Tailwind border-color class for a given location.
 * Designed to be faint - use border-l-2 or border for subtle location hinting.
 */
export function getLocationBorderColor(location: CityLocation | string): string {
    switch (location) {
        case 'Netherlands':
            return 'border-orange-400/40';
        case 'Macau':
            return 'border-emerald-500/40';
        case 'Seoul':
            return 'border-pink-400/40';
        case 'Tokyo':
            return 'border-red-400/40';
        case 'Taiwan':
            return 'border-blue-400/40';
        case 'Hong Kong':
            return 'border-purple-400/40';
        default:
            return 'border-border';
    }
}