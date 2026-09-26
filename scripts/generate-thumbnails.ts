import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { DayService } from '@/lib/dayService';
import { WeekDataService } from '@/lib/weekService';
import { BlogService } from '@/lib/blogService';
import { getPhotoPath } from '../utils/localPhotoPath';

// Entity-cover thumbnails (day grid, frontpage day cards, week banners, blog
// cards). Each is a fixed-size center crop of the entity's cover photo, cut
// from the local `display` tier (public/photos/display/, see
// scripts/process-images.ts) and committed under public/thumbnails/.
//
// Existing thumbnails are skipped, so this only does work for new entities.
// Pass --force to regenerate everything (e.g. after changing a cover photo).

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const THUMBNAILS_DIR = path.join(PUBLIC_DIR, 'thumbnails');

interface ThumbnailSpec {
  key: string;
  sourcePath: string;
  outDir: string;
  width: number;
  height: number;
}

const safeFilename = (key: string): string => key.replace(/[^a-zA-Z0-9-]/g, '-') + '.webp';

async function renderThumbnail(spec: ThumbnailSpec, force: boolean): Promise<string> {
  const filename = safeFilename(spec.key);
  const outPath = path.join(THUMBNAILS_DIR, spec.outDir, filename);
  const publicPath = `/thumbnails/${spec.outDir}/${filename}`;

  if (!force && fs.existsSync(outPath)) {
    console.log(`⏭️  Skipping ${spec.outDir}/${spec.key} (already exists)`);
    return publicPath;
  }

  const sourceFile = path.join(PUBLIC_DIR, spec.sourcePath);
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Source photo not found for ${spec.outDir}/${spec.key}: ${spec.sourcePath}`);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(sourceFile)
    .resize({ width: spec.width, height: spec.height, fit: 'cover' })
    .webp({ quality: 80 })
    .toFile(outPath);

  console.log(`✅ Generated ${spec.outDir}/${spec.key}`);
  return publicPath;
}

async function renderAll(specs: ThumbnailSpec[], force: boolean): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const spec of specs) {
    map[spec.key] = await renderThumbnail(spec, force);
  }
  return map;
}

async function generateThumbnails(): Promise<void> {
  const force = process.argv.includes('--force');

  const days = (await DayService.getBlogPosts()).filter((post) => post.frontmatter.draft === false);
  const weeks = (await WeekDataService.getAllWeeks()).filter((week) => week.draft !== true);
  const blogs = await BlogService.getAllRelevantBlogPosts();

  const daySource = (date: string, photoId: string) => getPhotoPath('display', `days/${date}`, photoId);

  const dailyMap = await renderAll(
    days.map((post) => ({
      key: post.frontmatter.date,
      sourcePath: daySource(post.frontmatter.date, post.frontmatter.thumbnail),
      outDir: 'days',
      width: 200,
      height: 150,
    })),
    force,
  );

  // Larger crop of the same cover photo for the frontpage day cards.
  await renderAll(
    days.map((post) => ({
      key: post.frontmatter.date,
      sourcePath: daySource(post.frontmatter.date, post.frontmatter.thumbnail),
      outDir: 'days-frontpage',
      width: 400,
      height: 300,
    })),
    force,
  );

  const weeklyMap = await renderAll(
    weeks.map((week) => ({
      key: week.index.toString(),
      sourcePath: getPhotoPath('display', `weeks/${week.index}`, week.thumb),
      outDir: 'weeks',
      width: 1200,
      height: 400,
    })),
    force,
  );

  const blogMap = await renderAll(
    blogs.map((post) => ({
      key: post.frontmatter.slug,
      sourcePath: getPhotoPath('display', `blogs/${post.frontmatter.slug}`, post.frontmatter.thumb),
      outDir: 'blogs',
      width: 400,
      height: 300,
    })),
    force,
  );

  fs.writeFileSync(path.join(THUMBNAILS_DIR, 'daily-thumbnail-map.json'), JSON.stringify(dailyMap, null, 2));
  fs.writeFileSync(path.join(THUMBNAILS_DIR, 'weekly-thumbnail-map.json'), JSON.stringify(weeklyMap, null, 2));
  fs.writeFileSync(path.join(THUMBNAILS_DIR, 'blog-thumbnail-map.json'), JSON.stringify(blogMap, null, 2));

  console.log(
    `\n🎉 ${Object.keys(dailyMap).length} day, ${Object.keys(weeklyMap).length} week, ` +
      `${Object.keys(blogMap).length} blog thumbnails up to date`,
  );
}

if (require.main === module) {
  generateThumbnails().catch((error) => {
    console.error('❌ Error generating thumbnails:', error);
    process.exit(1);
  });
}

export { generateThumbnails };
