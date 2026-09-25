import { BlogPostFrontmatter, DayFrontmatter, WeekData } from "@/app/types";
import { getPhotoPath } from "./localPhotoPath";

export interface ImageMapping {
  [photoId: string]: {
    display: string;
    alt: string;
  };
}

/**
 * Creates an image mapping for a given day's photos
 */
export function createForDay(day: DayFrontmatter): ImageMapping {
  const mapping: ImageMapping = {};
  const basePath = `days/${day.date}`;

  day.photos.forEach(photoId => {
    mapping[photoId] = {
      display: getPhotoPath("display", basePath, photoId),
      alt: `Photo ${photoId} from ${day.date}`
    };
  });

  return mapping;
}

/**
 * Creates an image mapping for a given week's photos
 */
export function createForWeek(weekData: WeekData): ImageMapping {
  const mapping: ImageMapping = {};
  const basePath = `weeks/${weekData.index}`;

  weekData.photos.forEach(photoId => {
    mapping[photoId] = {
      display: getPhotoPath("display", basePath, photoId),
      alt: `Photo ${photoId} from ${weekData.title}`
    };
  });

  return mapping;
}

/**
 * Creates an image mapping for a given blog post's photos
 */
export function createForBlog(blog: BlogPostFrontmatter): ImageMapping {
  const mapping: ImageMapping = {};
  const basePath = `blogs/${blog.slug}`;

  blog.photos.forEach(photoId => {
    mapping[photoId] = {
      display: getPhotoPath("display", basePath, photoId),
      alt: `Photo ${photoId} from ${blog.slug}`
    };
  });

  return mapping;
}
