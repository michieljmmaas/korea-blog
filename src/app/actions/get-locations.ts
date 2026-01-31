'use server';

import { GeoDataService } from './../../lib/geoService';

export async function fetchLocations(date: string) {
    const locations = await GeoDataService.getLocationsByDate(date);
    return locations;
}