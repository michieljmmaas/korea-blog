'use server';

import { GeoDataService } from './../../lib/geoService';

export async function fetchLocations(date: string) {
  const locations = await GeoDataService.getLocationsByDate(date);
  
  // Serialize dates to strings for transport
  return locations.map(loc => ({
    ...loc,
    time: loc.time instanceof Date 
      ? loc.time.toISOString() 
      : loc.time,
  }));
}