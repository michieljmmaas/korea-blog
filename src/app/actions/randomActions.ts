// app/actions/randomActions.ts
'use server';

import { WeekDataService } from "@/lib/weekService";
import { getRandomBlogpost } from '@/lib/blogService';
import { getRandomDay } from '@/lib/dayService';

export async function getNewRandomWeek(current: number | null) {
  return await WeekDataService.getRandomWeek(current);
}

export async function getNewRandomBlogpost(current: string | null) {
  return await getRandomBlogpost(current);
}

export async function getNewRandomDay(current: number | null) {
  return await getRandomDay(current);
}