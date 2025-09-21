// utils/locationColors.ts

import { CityLocation } from "@/app/types";

export const getLocationColor = (location: CityLocation): string => {
  if (!location) return 'bg-gray-600'; // default

  const loc = location.toLowerCase().trim();

  if (loc.includes('japan') || loc.includes('tokyo') || loc.includes('osaka') || loc.includes('kyoto')) {
    return 'bg-purple-600';
  }
  if (loc.includes('macau')) {
    return 'bg-amber-400';
  }
  if (loc.includes('seoul')) {
    return 'bg-blue-600';
  }
  if (loc.includes('busan')) {
    return 'bg-red-600';
  }
  if (loc.includes('taiwan') || loc.includes('taipei')) {
    return 'bg-green-600';
  }
  if (loc.includes('hong kong')) {
    return 'bg-emerald-600';
  }
  if (loc.includes('nederland') || loc.includes('netherlands') || loc.includes('amsterdam') || loc.includes('rotterdam')) {
    return 'bg-orange-600';
  }

  // Default color if location doesn't match any of the above
  return 'bg-gray-600';
};