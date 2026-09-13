// app/actions/randomActions.ts
'use server';

import { WeekDataService } from "@/lib/weekService";
import { BlogService } from '@/lib/blogService';
import { DayService } from '@/lib/dayService';

export async function getNewRandomWeek(current: number | null) {
  return await WeekDataService.getRandomWeek(current);
}

export async function getNewRandomBlogpost(current: string | null) {
  return await BlogService.getRandomBlogpost(current);
}

export async function getNewRandomDay(current: number | null) {
  return await DayService.getRandomDay(current);
}