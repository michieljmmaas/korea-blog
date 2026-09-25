import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { DayService } from '@/lib/dayService';
import { WeekDataService } from '@/lib/weekService';
import { BlogService } from '@/lib/blogService';
import { FoodService } from '@/lib/foodService';
import { IMAGEKIT_URL_ENDPOINT } from '../utils/imagekit';

// One-off / occasional bulk migration: pulls the untransformed original for
// every photo referenced from content/ down into public/photos/originals/,
// mirroring the days/{date}, weeks/{index}, blogs/{slug}, food path convention.
// Run scripts/process-images.ts afterwards to derive the thumb/display tiers
// actually served by the site.

interface PhotoRef {
  basePath: string;
  photoId: string;
}

class DownloadError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'DownloadError';
  }
}

// Thrown when ImageKit returns 200 but the body isn't actually image bytes —
// e.g. a video asset hit through the image endpoint returns a short text
// status message ("The asset is currently being prepared") instead of 4xx.
class NotAnImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotAnImageError';
  }
}

const ORIGINALS_DIR = path.join(process.cwd(), 'public', 'photos', 'originals');

function extensionForContentType(contentType: string | undefined): string {
  switch ((contentType || '').split(';')[0].trim()) {
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    case 'image/avif':
      return '.avif';
    case 'image/jpeg':
    default:
      return '.jpg';
  }
}

function findExistingOriginal(basePath: string, photoId: string): string | null {
  const dir = path.join(ORIGINALS_DIR, basePath);
  if (!fs.existsSync(dir)) return null;
  const match = fs.readdirSync(dir).find((file) => path.parse(file).name === photoId);
  return match ? path.join(dir, match) : null;
}

function downloadOriginal(ref: PhotoRef, force: boolean, progress: string): Promise<void> {
  const { basePath, photoId } = ref;
  const existing = findExistingOriginal(basePath, photoId);

  if (!force && existing) {
    console.log(`⏭️  ${progress} ${basePath}/${photoId} (already have an original)`);
    return Promise.resolve();
  }

  // Cap resolution instead of requesting the true original: some source photos
  // exceed ImageKit's 25MP real-time processing limit (ik-error: ELIMIT) even
  // on a plain pass-through request. 3000x3000 (fit-inside, no crop) is still
  // comfortably above the 1920px display tier we derive locally, so this loses
  // nothing for our purposes while sidestepping the limit and downloading less.
  const url = `${IMAGEKIT_URL_ENDPOINT}/${basePath}/${photoId}?tr=w-3000,h-3000,c-at_max`;
  const dir = path.join(ORIGINALS_DIR, basePath);
  fs.mkdirSync(dir, { recursive: true });

  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          response.resume();
          reject(new DownloadError(`Failed to download ${url}: ${response.statusCode}`, response.statusCode));
          return;
        }

        const contentType = response.headers['content-type'] || '';
        if (!contentType.startsWith('image/')) {
          // Not image bytes — read the (short) body so the reason is visible
          // immediately instead of failing opaquely later in sharp.
          let body = '';
          response.on('data', (chunk) => {
            if (body.length < 200) body += chunk.toString('utf8');
          });
          response.on('end', () => {
            reject(new NotAnImageError(`Not an image (content-type: ${contentType || 'unknown'}): ${body.trim().slice(0, 150)}`));
          });
          return;
        }

        const ext = extensionForContentType(contentType);
        const filePath = path.join(dir, `${photoId}${ext}`);
        const file = fs.createWriteStream(filePath);

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log(`✅ ${progress} Downloaded ${basePath}/${photoId}`);
          resolve();
        });

        file.on('error', (err) => {
          fs.unlink(filePath, () => {});
          reject(err);
        });
      })
      .on('error', reject);
  });
}

async function enumeratePhotos(): Promise<PhotoRef[]> {
  const refs: PhotoRef[] = [];

  // Frontmatter `photos` arrays are typed as string[], but unquoted numeric
  // ids in YAML (e.g. `photos: [1,2,3]`) parse as actual JS numbers — normalize
  // to string here so every downstream comparison/path is consistent.
  const days = await DayService.getBlogPosts();
  for (const post of days) {
    if (post.frontmatter.draft !== false) continue;
    const basePath = `days/${post.frontmatter.date}`;
    for (const photoId of post.frontmatter.photos) refs.push({ basePath, photoId: String(photoId) });
    if (post.frontmatter.thumbnail) refs.push({ basePath, photoId: String(post.frontmatter.thumbnail) });
  }

  const weeks = await WeekDataService.getAllWeeks();
  for (const week of weeks) {
    if (week.draft) continue;
    const basePath = `weeks/${week.index}`;
    for (const photoId of week.photos) refs.push({ basePath, photoId: String(photoId) });
    if (week.thumb) refs.push({ basePath, photoId: String(week.thumb) });
  }

  const blogs = await BlogService.getAllRelevantBlogPosts();
  for (const post of blogs) {
    const basePath = `blogs/${post.frontmatter.slug}`;
    for (const photoId of post.frontmatter.photos) refs.push({ basePath, photoId: String(photoId) });
    if (post.frontmatter.thumb) refs.push({ basePath, photoId: String(post.frontmatter.thumb) });
  }

  const foods = await FoodService.getAllFoods();
  for (const food of foods) {
    if (food.image) refs.push({ basePath: 'food', photoId: String(food.image) });
  }

  const seen = new Set<string>();
  return refs.filter((ref) => {
    const key = `${ref.basePath}/${ref.photoId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main(): Promise<void> {
  const force = process.argv.includes('--force');
  const refs = await enumeratePhotos();
  console.log(`Found ${refs.length} photos referenced in content.`);

  const notFound: PhotoRef[] = [];
  const notAnImage: { ref: PhotoRef; message: string }[] = [];
  const otherFailures: { ref: PhotoRef; message: string }[] = [];

  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    const progress = `[${i + 1}/${refs.length}]`;
    try {
      await downloadOriginal(ref, force, progress);
      // Small delay to be nice to ImageKit
      await new Promise((resolve) => setTimeout(resolve, 80));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ ${progress} Failed to download ${ref.basePath}/${ref.photoId}: ${message}`);

      if (error instanceof DownloadError && error.statusCode === 404) {
        notFound.push(ref);
      } else if (error instanceof NotAnImageError) {
        notAnImage.push({ ref, message });
      } else {
        otherFailures.push({ ref, message });
      }
    }
  }

  const failures = notFound.length + notAnImage.length + otherFailures.length;
  console.log(`\n🎉 Done. ${refs.length - failures}/${refs.length} originals available in public/photos/originals/.`);

  if (notFound.length > 0) {
    console.log(`\n⚠️  ${notFound.length} photo(s) returned 404 — likely missing or misconfigured on ImageKit, trace these back in content/:`);
    notFound.forEach((ref) => console.log(`  ${ref.basePath}/${ref.photoId}`));
  }

  if (notAnImage.length > 0) {
    console.log(`\n⚠️  ${notAnImage.length} photo(s) exist on ImageKit but aren't image files (e.g. a video) — trace these back in content/:`);
    notAnImage.forEach(({ ref, message }) => console.log(`  ${ref.basePath}/${ref.photoId}: ${message}`));
  }

  if (otherFailures.length > 0) {
    console.log(`\n❌ ${otherFailures.length} photo(s) failed for other reasons (network/etc — safe to retry):`);
    otherFailures.forEach(({ ref, message }) => console.log(`  ${ref.basePath}/${ref.photoId}: ${message}`));
  }

  console.log('\nNext: run "npm run process-images" to generate the thumb/display tiers.');

  if (failures > 0) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

export { enumeratePhotos };
